FROM node:16-slim as builder

WORKDIR /app

COPY . .

RUN --mount=type=cache,target=/app/.yarn/cache \
    npx turbo prune --scope=callisto-server && \
    # cp -R .yarn out/ && \
    cd out && \
    yarn install && \
    yarn turbo run build --filter=callisto-server && \
    yarn install --prod && \
    rm -rf node_modules/.cache .yarn/cache applications/application-a/.next/cache

FROM node:16-slim as app

ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=builder /app/out .
RUN npm install -g turbo

EXPOSE 8080

CMD ["yarn", "start"]