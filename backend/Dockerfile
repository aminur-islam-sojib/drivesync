FROM node:20-alpine AS base

WORKDIR /app

COPY package*.json ./
COPY prisma ./prisma
COPY prisma.config.ts ./

RUN npm ci

RUN npx prisma generate

COPY tsconfig.json ./
COPY src ./src

RUN npm run build

EXPOSE 4000

CMD ["sh", "-c", "npm run db:migrate:deploy && npm run seed:google-config:docker && node dist/server.js"]
