# syntax=docker/dockerfile:1

FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm install

COPY tsconfig.json tsconfig.build.json nest-cli.json ./
COPY src ./src

RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist

EXPOSE 3000

CMD ["sh", "-c", "npm run seed:prod && node dist/main.js"]
