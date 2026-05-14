FROM node:22-slim AS deps
RUN corepack enable

WORKDIR /app
COPY ./dist/server/src /app
COPY package.json /app/package.json
RUN sed -i '/@cooprog\/core/d' ./package.json
RUN yarn install --production
COPY --from=core . /app/node_modules/@cooprog/core
COPY ./migrations /app/migrations
COPY ./migrate-mongo-config.js /app/migrate-mongo-config.js

FROM node:22-slim AS runner
WORKDIR /app

COPY --from=deps /app /app

EXPOSE 3000
ENV PORT 3000

CMD ["node", "app.js"]