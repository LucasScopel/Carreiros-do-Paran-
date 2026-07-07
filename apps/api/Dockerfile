FROM node:22-alpine AS base
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"

RUN apk add --no-cache openssl 
RUN corepack enable pnpm

FROM base AS builder
WORKDIR /app
# Copia todo o monorepo para o estágio de build
COPY . .
# Instala todas as dependências (incluindo as devDependencies que contêm o ts-node/tsx)
RUN pnpm install --frozen-lockfile

# Gera o Prisma Client
RUN pnpm --filter database exec prisma generate

FROM base AS runner
WORKDIR /app

COPY --from=builder /app /app

EXPOSE 4000
ENV PORT=4000
ENV NODE_ENV=production

# Executa o deploy das migrations, configura o Martin e inicia o servidor usando o script do workspace da API
CMD ["sh", "-c", "pnpm --filter database exec prisma migrate deploy && pnpm exec node scripts/setup-martin.js && pnpm --filter api start"]
