# Install dependencies only when needed
FROM node:22-slim AS deps
RUN corepack enable
RUN corepack prepare yarn@4.6.0 --activate

COPY --from=core . /app/packages/core
WORKDIR /app/packages/core
RUN yarn config set nodeLinker node-modules
RUN yarn install
RUN yarn build

COPY . /app/packages/client
WORKDIR /app/packages/client
RUN yarn config set nodeLinker node-modules
RUN cp ./package.dist.json ./package.json
RUN yarn install
RUN yarn add @cooprog/core@file:/app/packages/core
RUN node -e "const fs=require('fs');const p='./tsconfig.json';const j=JSON.parse(fs.readFileSync(p,'utf8'));if(j.compilerOptions?.paths?.['@cooprog/core']){delete j.compilerOptions.paths['@cooprog/core'];}fs.writeFileSync(p,JSON.stringify(j,null,2));"
RUN yarn add sharp

FROM node:22-slim AS builder

ENV NEXT_TELEMETRY_DISABLED 1
RUN corepack enable
RUN corepack prepare yarn@4.6.0 --activate
COPY --from=deps /app /app
COPY --from=core . /app/packages/core
WORKDIR /app/packages/client
RUN test -d /app/packages/core/src
RUN yarn build

FROM node:22-slim AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir -p /nonexistent
RUN yarn add sharp

COPY --from=builder --chown=nextjs:nodejs /app/packages/client/next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/client/next-i18next.config.js ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/client/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/packages/client/package.json ./package.json

COPY --from=builder --chown=nextjs:nodejs /app/packages/client/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/packages/client/.next/static ./.next/static

RUN mkdir -p /app/public/uploads
RUN chown -R nextjs:nodejs /app/public/uploads

USER nextjs

EXPOSE 3000

ENV PORT 3000

CMD ["node", "server.js"]