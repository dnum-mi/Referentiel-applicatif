FROM node:20-slim AS build

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY . .

# Temporary disable type checking
RUN npm run build-only

FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod

USER 0

COPY --chown=1001:0 --chmod=644 nginx.conf /etc/nginx/nginx.conf
COPY --chown=1001:0 --chmod=775 --from=build /app/dist /usr/share/nginx/html/

COPY --chown=1001:0 --chmod=775 entrypoint.sh /docker-entrypoint.d/entrypoint.sh

USER 1001

ENV APP_ENV_PREFIX=VITE_RDA_
ENV APP_DIST_DIR=/usr/share/nginx/html

# startup script to set env vars then run nginx
CMD [ "/docker-entrypoint.d/entrypoint.sh" ]
