# DriveSync Fullstack Guide (Legacy Fullstack Rewrite Notes)

> [!NOTE]
> The backend for this project is already fully implemented as an Express 5 + Prisma + MySQL API in `backend/` running on port 4000.
> For active backend endpoint contracts and schemas, see `docs/API_REFERENCE.md`.
> For active frontend implementation guidelines, see `docs/FRONTEND.md`.

Read with `FRONTEND.md` and `DESIGN_SYSTEM.md`. Source of facts about the legacy system: `PROJECT_AUDIT.md`.

---

## 1. Answers to the audit's open questions (decisions to build against)

| # | Question | Decision | Why |
|---|---|---|---|
| 1 | Hosting | **Docker container on a VPS** with `output: "standalone"`, behind Caddy or Nginx | Large uploads, long streams and background work do not fit serverless limits (timeouts, 4.5 MB bodies) |
| 2 | Upload path | **Direct-to-cloud is the target; build the proxied path first** behind one `Transport` interface; switch with a feature flag after a spike proves direct uploads | Direct removes server bandwidth and memory pressure. The proxy is proven and is needed anyway for the public API |
| 3 | Auth | **Keep custom auth, simplify to opaque session cookies** (random token, hash in `user_sessions`). No JWT, no refresh endpoint | One mechanism, revocable, no tokens in JS. Auth.js would still leave you writing the multi-account Drive connect flow yourself |
| 4 | Public `writer` permission | **Remove it.** Files stay private. Public sharing goes through your own token route (`/public/files/[token]`). Optional "Google link" is explicit and `reader` only | Anyone-with-link write access on every uploaded file is a data-loss and abuse risk |
| 5 | Starred, Archived, Recent | **Build Starred and Recent for real. Drop Archived for v1** | Starred and Recents appear in the target design. Archived adds little over Trash |
| 6 | Workspace sharing | **Defer real multi-user access.** Hide the invite UI in v1, or label it "coming soon". Add `canAccess(user, resource)` to the DAL now so it can be implemented later without touching routes | Invites currently grant nothing, which misleads users |
| 7 | Database | **MySQL 8.4 only.** Delete SQLite backup/restore routes. Backups via a scheduled `mysqldump` container | Matches production, removes dead and broken code |

Also decided:
- `/system/update` (git pull and shell commands from the app) is **deleted**. Updates go through CI/CD.
- Duplicate `GET /auth/google/callback` is **deleted**; one callback only.
- Background folder sync moves to a **worker** (section 9).

---

## 2. Target architecture

```
Browser
  |  RSC payloads, Server Actions, streams
  v
Next.js (Node runtime, standalone)
  |-- app/            pages, layouts (Server Components)
  |-- actions/        Server Actions: validated mutations
  |-- app/api/        Route Handlers: streaming (download, upload chunks, zip, thumbs), OAuth callback, public API
  |-- server/         server-only code: db, session, dal, providers (google, s3), crypto, audit
  v
MySQL 8.4 (Prisma)        Redis (BullMQ)          Google Drive API / S3
                               ^
                               |
                         worker container (same repo, same image, different command)
```

Single repository, single `package.json`. Move `backend/prisma/` to `prisma/` at the root.

```
src/server/
  db.ts            # Prisma singleton
  env.ts           # zod-validated environment
  session.ts       # create / read / destroy session cookie
  dal.ts           # data access layer: every read that touches user data goes through here
  crypto.ts        # AES-256-GCM for provider tokens (reuse existing algorithm)
  audit.ts
  providers/
    google.ts      # authed client, quota sync, list/create/delete, resumable init, open stream
    s3.ts
    index.ts       # openFileStream(file, opts), deleteProviderFile(file), pickUploadTarget(user)
  dto.ts           # Prisma -> plain objects (BigInt and Date safe)
src/actions/       # auth.ts files.ts folders.ts storage.ts api-keys.ts invites.ts
src/app/api/       # see section 5 and 6
src/worker/        # index.ts, jobs/sync-drive.ts, jobs/quota.ts
```

Every file in `src/server/` starts with `import "server-only";`.

---

## 3. Environment, database client, DTOs

```ts
// server/env.ts
import "server-only";
import { z } from "zod";

const schema = z.object({
  DATABASE_URL: z.string().min(1),
  APP_URL: z.url(),                              // e.g. https://drive.example.com
  TOKEN_ENCRYPTION_KEY: z.string().min(32),
  GOOGLE_CLIENT_ID: z.string().optional(),
  GOOGLE_CLIENT_SECRET: z.string().optional(),
  GOOGLE_REDIRECT_URI: z.url().optional(),       // `${APP_URL}/api/auth/google/callback`
  REDIS_URL: z.string().optional(),
  RECAPTCHA_SECRET: z.string().optional(),
  NODE_ENV: z.enum(["development", "test", "production"]).default("development"),
});
export const env = schema.parse(process.env);   // fail fast at boot
```

```ts
// server/db.ts
import "server-only";
import { PrismaClient } from "@prisma/client";

const g = globalThis as unknown as { prisma?: PrismaClient };
export const prisma = g.prisma ?? new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });
if (process.env.NODE_ENV !== "production") g.prisma = prisma;
```

```ts
// server/dto.ts   (BigInt and Date cannot cross the server/client boundary)
import type { File as DbFile } from "@prisma/client";

export type FileDTO = {
  id: string; name: string; mimeType: string; sizeBytes: number; folderId: string | null;
  accountId: string; createdAt: string; updatedAt: string;
};
export const toFileDTO = (f: DbFile): FileDTO => ({
  id: f.id, name: f.name, mimeType: f.mimeType, sizeBytes: Number(f.sizeBytes), folderId: f.folderId,
  accountId: f.connectedAccountId, createdAt: f.createdAt.toISOString(), updatedAt: f.updatedAt.toISOString(),
});
```
`Number(bigint)` is exact up to about 9 PB, which is far above any per-file or per-account value here.

### Prisma and MySQL improvements (one migration)
- Indexes for the hot paths:
  - `File`: `@@index([userId, folderId, deletedAt, createdAt])`, `@@index([userId, deletedAt, updatedAt])`, `@@index([connectedAccountId])`
  - `Folder`: `@@index([userId, parentId, deletedAt])`
  - `AuditLog`: `@@index([userId, createdAt])`
- Rename `UserSession.refreshTokenHash` to `tokenHash` (it now stores the session token hash).
- New tables: `FileStar (userId, fileId, createdAt, @@id([userId, fileId]))`; add `File.lastAccessedAt DateTime?` for Recent.
- Normalize `Folder.color` to tone keys (see DESIGN_SYSTEM.md).
- Use **keyset pagination** (`WHERE (createdAt, id) < (?, ?) ORDER BY createdAt DESC, id DESC LIMIT n`) for files, activity and trash. No `skip/take` on big tables.
- Use `select` to fetch only needed columns. Never load token columns into list queries.
- Updating quotas uses atomic increments (section 6.4), never read-modify-write.

---

## 4. Authentication and sessions

### 4.1 Session cookie

```ts
// server/session.ts
import "server-only";
import { cache } from "react";
import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { prisma } from "./db";

const COOKIE = "ds_session";
const TTL_MS = 30 * 24 * 60 * 60 * 1000;
const sha256 = (v: string) => createHash("sha256").update(v).digest("hex");

export async function createSession(userId: string) {
  const token = randomBytes(32).toString("base64url");
  const h = await headers();
  await prisma.userSession.create({
    data: {
      userId,
      tokenHash: sha256(token),
      userAgent: h.get("user-agent"),
      ipAddress: h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      expiresAt: new Date(Date.now() + TTL_MS),
    },
  });
  (await cookies()).set(COOKIE, token, {
    httpOnly: true, secure: process.env.NODE_ENV === "production",
    sameSite: "lax", path: "/", maxAge: TTL_MS / 1000,
  });
}

export const getSession = cache(async () => {
  const token = (await cookies()).get(COOKIE)?.value;
  if (!token) return null;
  const s = await prisma.userSession.findFirst({
    where: { tokenHash: sha256(token), revokedAt: null, expiresAt: { gt: new Date() } },
    select: { id: true, user: { select: { id: true, name: true, email: true, status: true } } },
  });
  if (!s || s.user.status !== "active") return null;
  return { sessionId: s.id, user: s.user };
});

export async function requireUser() {            // for pages and layouts
  const s = await getSession();
  if (!s) redirect("/login");
  return s.user;
}

export async function destroySession() {
  const token = (await cookies()).get(COOKIE)?.value;
  if (token) await prisma.userSession.updateMany({ where: { tokenHash: sha256(token) }, data: { revokedAt: new Date() } });
  (await cookies()).delete(COOKIE);
}
```

Middleware (`middleware.ts`, or `proxy.ts` on newer Next versions) does **only** a cheap redirect when the cookie is missing on dashboard paths. Real validation happens in `getSession()` (Data Access Layer). Never rely on middleware alone for authorization.

Google sign-in: keep the existing state table. In the callback Route Handler, after upserting the user and connected account, call `createSession(user.id)` and `redirect("/all-files")`. The `AuthHandoff` table and the exchange endpoint are no longer needed (same origin, cookie is set directly). Remove them in the migration.

Password hashing: keep argon2. Add `serverExternalPackages: ["argon2"]` and make sure the Docker image builds its native module for Alpine (musl).

Rate limit login, register and API-key auth (for example 10 attempts per 10 minutes per IP and per email). Use Redis if available, an in-memory LRU for a single instance.

### 4.2 Authorization rules
- **Every Server Action is a public HTTP endpoint.** Each one starts with `const user = await getUserForAction()` and checks ownership of every ID it touches.
- Ownership check is always in the query: `where: { id, userId: user.id }`. Never fetch by `id` alone and compare later.
- Route Handlers do the same. Return 401 or 404, never 403, for resources the user does not own (do not reveal existence).
- Centralize in `dal.ts`: `getOwnedFile(userId, id)`, `getOwnedFolder`, `listFiles(userId, filters)`. Add `canAccess()` there when sharing is implemented.

### 4.3 Action result type and wrapper

```ts
// actions/result.ts
export type ActionResult<T = void> =
  | { ok: true; data: T }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> };

export const ok = <T,>(data: T): ActionResult<T> => ({ ok: true, data });
export const fail = (error: string, fieldErrors?: Record<string, string[]>): ActionResult<never> =>
  ({ ok: false, error, fieldErrors });
```

```ts
// actions/files.ts
"use server";
import { z } from "zod";
import { revalidatePath, revalidateTag } from "next/cache";
import { getSession } from "@/server/session";
import { prisma } from "@/server/db";
import { audit } from "@/server/audit";
import { ok, fail, type ActionResult } from "./result";

const moveSchema = z.object({
  fileIds: z.array(z.uuid()).min(1).max(500),
  folderId: z.uuid().nullable(),
});

export async function moveFiles(input: unknown): Promise<ActionResult<{ moved: number }>> {
  const session = await getSession();
  if (!session) return fail("Your session expired. Sign in again.");
  const userId = session.user.id;

  const parsed = moveSchema.safeParse(input);
  if (!parsed.success) return fail("Invalid request", parsed.error.flatten().fieldErrors);
  const { fileIds, folderId } = parsed.data;

  if (folderId) {
    const folder = await prisma.folder.findFirst({ where: { id: folderId, userId, deletedAt: null }, select: { id: true } });
    if (!folder) return fail("That folder no longer exists.");
  }

  const res = await prisma.file.updateMany({
    where: { id: { in: fileIds }, userId, deletedAt: null },   // ownership inside the query
    data: { folderId },
  });

  await audit(userId, "file.move", "file", null, { count: res.count, folderId });
  revalidateTag(`files:${userId}`);
  revalidatePath("/all-files");
  return ok({ moved: res.count });
}
```
Use this shape for every mutation: session, zod, ownership in the query, write, audit, revalidate, `ActionResult`.

Never upload file bodies through Server Actions (default body limit is 1 MB). Uploads use Route Handlers.

---

## 5. Reads: Data Access Layer and caching

```ts
// server/dal.ts
import "server-only";
import { cache } from "react";
import { prisma } from "./db";
import { toFileDTO } from "./dto";

export const getFolderContents = cache(async (userId: string, folderId: string | null, q?: string) => {
  const [folders, files] = await Promise.all([
    prisma.folder.findMany({
      where: { userId, parentId: folderId, deletedAt: null },
      orderBy: { name: "asc" },
      select: { id: true, name: true, color: true, _count: { select: { files: { where: { deletedAt: null } } } } },
    }),
    prisma.file.findMany({
      where: { userId, folderId, deletedAt: null, ...(q ? { name: { contains: q } } : {}) },
      orderBy: [{ createdAt: "desc" }, { id: "desc" }],
      take: 200,
    }),
  ]);
  return { folders, files: files.map(toFileDTO) };
});
```
(Adjust the relation name `files` to the real Prisma schema. Per-folder size totals come from one grouped query, not one query per folder.)

Page usage:

```tsx
// app/(dashboard)/all-files/page.tsx
export default async function Page({ searchParams }: { searchParams: Promise<{ folderId?: string; q?: string }> }) {
  const user = await requireUser();
  const { folderId, q } = await searchParams;
  return (
    <>
      <Toolbar folderId={folderId ?? null} />
      <Suspense fallback={<FilesSkeleton />}>
        <FolderContents userId={user.id} folderId={folderId ?? null} q={q} />
      </Suspense>
    </>
  );
}
```

Caching guidance:
- Per-request dedupe: React `cache()` (above).
- Aggregates (storage summary, per-type breakdown, folder counts): cache per user with a tag (`storage:${userId}`, `files:${userId}`), invalidate in actions with `revalidateTag`. Use `"use cache"` + `cacheTag` if your Next version enables it, otherwise `unstable_cache`.
- Never cache anything keyed by something other than the user's id and the query. Authenticated data must not leak across users.
- Search: `LIKE '%q%'` is fine at small scale. Add a MySQL `FULLTEXT` index on `files.name` when a user has more than about 50k files.

---

## 6. Files: streaming, uploads, ZIP, thumbnails

All of these are Route Handlers with `export const runtime = "nodejs"` and `export const dynamic = "force-dynamic"`.

### 6.1 Provider abstraction
`server/providers/index.ts` exposes the only functions routes may call:

```ts
export type OpenedStream = { status: number; headers: Headers; body: ReadableStream<Uint8Array> | null };
openFileStream(file: DbFileWithAccount, opts: { range?: string; signal?: AbortSignal }): Promise<OpenedStream>
deleteProviderFiles(files: DbFileWithAccount[]): Promise<{ ok: string[]; failed: { id: string; error: string }[] }>
pickUploadTarget(userId: string, sizeBytes: number, forcedAccountId?: string): Promise<TargetAccount>
```
Google implementation of `openFileStream`:

```ts
const token = await getFreshAccessToken(account);                        // refresh if < 60 s left
const res = await fetch(`https://www.googleapis.com/drive/v3/files/${file.providerFileId}?alt=media`, {
  headers: { Authorization: `Bearer ${token}`, ...(opts.range ? { Range: opts.range } : {}) },
  signal: opts.signal,
});
return { status: res.status, headers: res.headers, body: res.body };       // web stream, never buffered
```
S3 implementation: `GetObjectCommand({ Bucket, Key, Range })` and `Body.transformToWebStream()`.

### 6.2 Download and preview (Range supported)

```ts
// app/api/files/[id]/download/route.ts
import { getSession } from "@/server/session";
import { getOwnedFile } from "@/server/dal";
import { openFileStream } from "@/server/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const dispo = (type: "attachment" | "inline", name: string) =>
  `${type}; filename*=UTF-8''${encodeURIComponent(name).replace(/['()]/g, escape)}`;

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });
  const file = await getOwnedFile(session.user.id, id);
  if (!file) return new Response("Not found", { status: 404 });

  const up = await openFileStream(file, { range: req.headers.get("range") ?? undefined, signal: req.signal });

  const headers = new Headers({
    "Content-Type": file.mimeType,
    "Content-Disposition": dispo("attachment", file.name),
    "Accept-Ranges": "bytes",
    "Cache-Control": "private, no-cache",
  });
  for (const h of ["content-length", "content-range", "etag", "last-modified"]) {
    const v = up.headers.get(h);
    if (v) headers.set(h, v);
  }
  return new Response(up.body, { status: up.status, headers });
}
```
`req.signal` cancels the upstream fetch when the browser disconnects, which stops wasted bandwidth. Preview uses the same handler with `inline` and a short-lived `FilePreviewToken` for iframes and the video element (tokens avoid putting the session cookie into third-party viewers such as Office Online).

### 6.3 Uploads

**Common flow (both transports):**
1. `initUpload` (Server Action): validate name, size, folder; `pickUploadTarget()`; create the provider resumable session; create `UploadSession` row; return `{ uploadId, chunkSize, sessionUri? }`.
2. Client sends chunks (8 MiB, a multiple of 256 KiB).
3. On the last chunk the file exists at the provider. The server records it with `finalizeUpload()`.

**ProxyTransport route (build first):**

```ts
// app/api/uploads/resumable/[id]/route.ts
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session) return new Response("Unauthorized", { status: 401 });

  const upload = await prisma.uploadSession.findFirst({
    where: { id, userId: session.user.id, status: "uploading" },
  });
  if (!upload?.googleSessionUri) return Response.json({ error: "Upload not found" }, { status: 404 });

  const contentRange = req.headers.get("content-range");
  const contentLength = req.headers.get("content-length");
  if (!contentRange || !contentLength) return Response.json({ error: "Missing range" }, { status: 400 });

  const res = await fetch(upload.googleSessionUri, {
    method: "PUT",
    headers: { "Content-Length": contentLength, "Content-Range": contentRange },
    body: req.body,
    // @ts-expect-error: required by Node's fetch when the body is a stream
    duplex: "half",
    signal: req.signal,
  });

  if (res.status === 308) {                       // chunk accepted, upload incomplete
    const range = res.headers.get("range");       // "bytes=0-8388607"
    const offset = range ? Number(range.split("-")[1]) + 1 : 0;
    return Response.json({ status: "uploading", offset });
  }
  if (res.ok) {
    const meta = await res.json();                // { id, name, mimeType, size, md5Checksum }
    const file = await finalizeUpload(upload, meta);
    return Response.json({ status: "completed", file: toFileDTO(file) });
  }
  return Response.json({ error: "Provider rejected the chunk" }, { status: 502 });
}
```
Also: `GET /api/uploads/resumable/[id]` returns the current offset (queries the provider with `Content-Range: bytes */total`).

**DirectTransport (after a spike):**
- `initUpload` calls `POST https://www.googleapis.com/upload/drive/v3/files?uploadType=resumable&fields=id,name,mimeType,size,md5Checksum` with headers `X-Upload-Content-Type`, `X-Upload-Content-Length` and **`Origin: <APP_URL>`** (needed so the session URI answers browser CORS requests), and returns the `Location` header as `sessionUri`.
- The browser PUTs chunks to `sessionUri` with `XMLHttpRequest` (see FRONTEND.md 4.4).
- After the final chunk the browser calls `completeUpload({ uploadId, providerFileId })`. The server **verifies** by calling `drive.files.get` for that ID (owner is the connected account, size matches), then runs `finalizeUpload()`. Never trust the client's claim.
- Spike checklist before enabling: CORS works from your origin, resume after a dropped connection works, 5 GB file completes, browsers (Chrome, Firefox, Safari) all pass.

**finalizeUpload** (shared):
```ts
await prisma.$transaction([
  prisma.file.create({ data: { userId, connectedAccountId, folderId, provider, providerFileId, name, mimeType, sizeBytes: BigInt(size), checksum } }),
  prisma.uploadSession.update({ where: { id: upload.id }, data: { status: "completed", completedAt: new Date() } }),
  // atomic: no read-modify-write, so parallel uploads cannot lose updates
  prisma.storageAccount.update({
    where: { connectedAccountId },
    data: { usedBytes: { increment: BigInt(size) }, availableBytes: { decrement: BigInt(size) } },
  }),
]);
revalidateTag(`files:${userId}`); revalidateTag(`storage:${userId}`);
```
Do not call `permissions.create({ type: "anyone" })`.

**Public API upload** (`POST /api/v1/uploads`, API key auth): keep the proxied streaming implementation. Stream the multipart body with `busboy` (convert with `Readable.fromWeb(req.body)`) straight to the provider with `@aws-sdk/lib-storage` `Upload` for S3 or the Drive resumable endpoint for Google. Never `await req.formData()` for large files (it buffers).

### 6.4 Batch operations (fixes the audit's N+1 findings)

```ts
import pLimit from "p-limit";
const limit = pLimit(5);                                  // respect provider rate limits

const results = await Promise.allSettled(files.map((f) => limit(() => deleteProviderFile(f))));
```
- Group by connected account, authenticate each account once, then run the deletes with limited concurrency.
- Quota sync across accounts: `Promise.allSettled(accounts.map((a) => limit(() => syncQuota(a))))`.
- Use `createMany` / `updateMany` for DB writes. No `create` in a loop.
- Return `{ deleted, failed: [{ id, error }] }` so the UI can show partial success.

### 6.5 ZIP download (streamed)

```ts
// app/api/files/batch-download/route.ts   (POST { fileIds })
import archiver from "archiver";
import { Readable } from "node:stream";

const archive = archiver("zip", { zlib: { level: 0 } });   // store only: media is already compressed, so this is faster
(async () => {
  for (const f of files) {
    const up = await openFileStream(f, { signal: req.signal });
    if (!up.body) continue;
    archive.append(Readable.fromWeb(up.body as never), { name: uniqueName(f.name) });
    await new Promise((r) => archive.once("entry", r));    // one file at a time keeps memory flat
  }
  await archive.finalize();
})().catch((e) => archive.destroy(e));

return new Response(Readable.toWeb(archive) as ReadableStream, {
  headers: { "Content-Type": "application/zip", "Content-Disposition": `attachment; filename*=UTF-8''drivesync.zip` },
});
```
Limit to 500 files per request.

### 6.6 Thumbnails
`GET /api/files/[id]/thumb`: for Google use the file's `thumbnailLink` (request `thumbnailLink` in sync and refresh when it expires), fetch with the account token, and respond with `Cache-Control: private, max-age=86400, stale-while-revalidate=604800` plus the upstream `ETag`. For images stored in S3, resize with `sharp` to 480 px wide WebP, cache the result on disk or in S3 under a `.thumbs/` prefix. Return 204 for types without thumbnails so the client shows the type glyph.

---

## 7. Google OAuth in one place

- Route Handler `app/api/auth/google/start` (flow `login` or `connect`): create `OauthState` (sha256 of a random state, 10 minute expiry), redirect to Google with `access_type=offline`, `prompt=consent`, `include_granted_scopes=true`.
- Route Handler `app/api/auth/google/callback`: verify state, exchange the code, fetch userinfo.
  - `login`: upsert user and connected account, sync quota, `createSession`, redirect to `/all-files`.
  - `connect`: upsert connected account for the current user, sync quota, enqueue the folder sync job, then redirect to `/google-connected` which does `window.opener.postMessage({ type: "GOOGLE_CONNECTED" }, window.location.origin)` (always pass an explicit target origin) and closes the popup.
- Update the authorized redirect URI in Google Cloud Console to `${APP_URL}/api/auth/google/callback` before the first test. Keep the old one until cutover.
- Token storage stays AES-256-GCM. Prefix the ciphertext with a key id (`v1:`) so keys can be rotated later.
- Request the narrowest scope that still works. `drive` is broad: if you only manage files the app creates, `drive.file` is safer, but it cannot see files created elsewhere. Keep `drive` only if "sync existing folders" is a requirement, and say so on the consent screen copy.

---

## 8. API keys
- Format `9d_live_<random>`; store only a sha256 hash and a visible prefix. Show the secret once.
- Compare hashes with `crypto.timingSafeEqual`.
- Scopes array (`files:upload`), `lastUsedAt` updated at most once per minute per key (avoid a write per request).
- Rate limit per key.

---

## 9. Background work (worker container)

Run the same image with `node dist/worker.js`. Use BullMQ with Redis.

Jobs:
- `sync-drive` (per connected account): list the app folder with pagination, upsert folders and files in batches of 500 with `createMany` / transactions. Idempotent.
- `refresh-quota` (repeatable every 30 minutes per account).
- `purge-trash` (daily): permanently delete items older than 30 days.
- `cleanup-sessions` (daily): delete expired sessions, oauth states and upload sessions.

The web app only enqueues jobs and reads status. Nothing long-running happens inside a request.

---

## 10. Security checklist
- [ ] Every action and handler: session, zod, ownership in query, audit
- [ ] No `any`-typed request bodies. Parse everything with zod
- [ ] Secrets only in env; `env.ts` validates on boot
- [ ] Cookies: `httpOnly`, `secure`, `sameSite=lax`
- [ ] Security headers (see FRONTEND.md next.config) plus a Content-Security-Policy for the app and a separate relaxed one for `/public/files/*/embed`
- [ ] Rate limits on login, register, API keys, public file token lookups
- [ ] Preview and share tokens: random 32 bytes, hashed in DB, expiry, revocable
- [ ] No provider tokens or session URIs in logs or error messages
- [ ] File names sanitized in `Content-Disposition`; MIME types from the DB, not from the URL
- [ ] `dangerouslySetInnerHTML` only for the theme script
- [ ] `npm audit` and Dependabot in CI

---

## 11. Docker and deployment

```dockerfile
# Dockerfile
FROM node:22-alpine AS base
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

FROM base AS deps
COPY package.json package-lock.json ./
RUN npm ci

FROM base AS build
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npx prisma generate && npm run build

FROM base AS run
ENV NODE_ENV=production PORT=3000 HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app
COPY --from=build /app/public ./public
COPY --from=build --chown=app:app /app/.next/standalone ./
COPY --from=build --chown=app:app /app/.next/static ./.next/static
COPY --from=build /app/prisma ./prisma
USER app
EXPOSE 3000
CMD ["node", "server.js"]
```
Verify that the standalone output includes the Prisma query engine for Alpine and the `argon2` native binary. If not, set `outputFileTracingIncludes` for them.

`docker-compose.yml` services: `web` (this image), `worker` (same image, command override), `mysql:8.4` with a volume, `redis:7`, `migrate` (one-shot: `npx prisma migrate deploy`, run before `web`), `backup` (cron `mysqldump` to a mounted volume).

CI (GitHub Actions): install, `tsc --noEmit`, lint, unit tests, `prisma migrate diff` check, build, Playwright smoke test, then build and push the image. Deploy by pulling the new image on the VPS (Watchtower or an SSH step).

---

## 12. Migration phases (maps to the audit's section 10.5)

Each phase ends with a working app and a green CI.

**Phase 0: Scaffold**
- [ ] `create-next-app` (TypeScript, Tailwind, App Router, ESLint, `src/`), add the dependencies listed in FRONTEND.md section 1
- [ ] Move `prisma/` to root, run `prisma generate`, add `server/db.ts`, `server/env.ts`
- [ ] Tokens and fonts from DESIGN_SYSTEM.md; shadcn init; app shell with static sidebar

**Phase 1: Auth and session**
- [ ] `session.ts`, middleware redirect, login, register (reCAPTCHA optional), logout
- [ ] Google OAuth start and callback; connect-Drive popup flow
- [ ] Migration: rename token hash column, drop `AuthHandoff`

**Phase 2: Read paths**
- [ ] Dashboard layout (session, storage summary, prefs cookie)
- [ ] `/all-files` with folder grid, file table and grid, search, Suspense, skeletons, empty states
- [ ] `/quota`, `/trash`, `/activity`, `/recent`, `/starred`, `/settings`, `/api-keys` read views
- [ ] Info panel, folder tree

**Phase 3: Mutations**
- [ ] Folder create, rename, recolor, move, delete
- [ ] File rename, move, batch move, soft delete, restore, permanent delete (concurrent, partial-failure aware)
- [ ] Selection store, dialog store and host, context menus, drag and drop with optimistic updates
- [ ] Stars

**Phase 4: Files**
- [ ] Download and preview with Range, preview tokens, intercepted preview route, Plyr from npm
- [ ] Upload: `initUpload`, proxied chunk route, upload store, tray, refresher
- [ ] Batch ZIP, thumbnails, public share page with OpenGraph, public API upload
- [ ] Spike and (if green) enable DirectTransport

**Phase 5: Worker and hardening**
- [ ] BullMQ worker: sync, quota, purge, cleanup
- [ ] Rate limits, CSP, audit coverage review
- [ ] Remove SQLite routes, `/system/update`, mock pages and dead assets
- [ ] Playwright E2E, axe checks, Lighthouse budgets, bundle analysis

**Phase 6: Cutover**
- [ ] Update Google redirect URI, migrate existing sessions (force re-login is acceptable), deploy, monitor
- [ ] Archive `backend/` and `frontend/` folders in a tag, delete from `main`

---

## 13. Risks and mitigations (from the audit)

| Risk | Mitigation |
|---|---|
| Large file streaming through Next | Node runtime route handlers, pass `req.body` as a stream with `duplex: "half"`, never `formData()`, test with a 5 GB file and a memory graph |
| OAuth origin or port mismatch | Single origin, `APP_URL` env, update Google Console first, keep old URI during cutover |
| Quota race conditions | Atomic `increment` / `decrement`; periodic reconciliation job from provider quota |
| Serverless-style freezing of background work | No background promises in requests. Worker container with a queue |
| BigInt/Date serialization errors | DTO layer (`dto.ts`), lint rule or review check that components never receive Prisma models |
| Direct upload CORS or resume surprises | Feature-flagged, spike with the checklist in 6.3 before enabling |
