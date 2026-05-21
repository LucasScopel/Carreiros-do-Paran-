ARG NODE_VERSION=26-bookworm-slim

FROM node:${NODE_VERSION}

WORKDIR /app

COPY . .

RUN apt-get update -y && apt-get install -y openssl
RUN npm install -g corepack
RUN corepack enable

RUN pnpm install --frozen-lockfile
RUN pnpm prisma generate

EXPOSE 4000

CMD ["sh", "-c", "pnpm prisma migrate deploy && pnpm --filter api start"]