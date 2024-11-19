FROM node:20-slim AS build

WORKDIR /app

COPY ./package.json ./package-lock.json ./

RUN npm ci

COPY . .

# Temporary disable type checking
RUN npm run build-only

FROM nginxinc/nginx-unprivileged:1.27-alpine AS prod

COPY nginx.conf /etc/nginx/nginx.conf

COPY --from=build /app/dist /usr/share/nginx/html/

ENV APP_ENV_PREFIX=VITE_RDA_
ENV APP_DIST_DIR=/code

# startup script to set env vars then run nginx
CMD [ "/docker-entrypoint.d/entrypoint.sh" ]
