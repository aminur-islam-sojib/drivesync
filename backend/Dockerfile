FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

ENV DATABASE_URL="postgresql://postgres:postgres@localhost:5432/drivesync"
RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npm run db:push && npm run seed:google-config:docker && node dist/server.js"]
