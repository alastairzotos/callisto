FROM node:16-slim as builder

WORKDIR /app

ARG NEXT_PUBLIC_CALLISTO_HOST
ENV NEXT_PUBLIC_CALLISTO_HOST $NEXT_PUBLIC_CALLISTO_HOST

COPY . .

RUN npx turbo prune --scope=callisto-web && \
    cd out && \
    yarn install && \
    yarn turbo run build --filter=callisto-web && \
    yarn install --prod && \
    rm -rf node_modules/.cache .yarn/cache applications/application-a/.next/cache

FROM node:16-slim as app

ENV NODE_ENV=production
WORKDIR /app
COPY --chown=node:node --from=builder /app/out .

RUN npm install -g turbo

EXPOSE 3000

CMD ["yarn", "start"]