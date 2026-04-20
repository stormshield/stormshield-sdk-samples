FROM node:22-alpine AS build
WORKDIR /app
COPY examples/base/package.json stormshield-sdk/sdsdk.tgz .
RUN npm i 
COPY examples/base/ .
RUN npm run build

FROM node:22-alpine AS runtime
WORKDIR /app
COPY --from=build /app/package.json .
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY examples/base/public-key/ ./public-key/
COPY examples/base/fixtures/ ./fixtures/
ENV NODE_NO_WARNING=1
ENV NPM_CONFIG_UPDATE_NOTIFIER=false
ENTRYPOINT ["npm", "run"]