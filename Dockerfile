# Multi-stage build of the git-pull-request-dashboard SPA — a client-side
# Vite/React app (the GitHub PAT is entered in the browser at runtime; there is
# no server-side config or secret). Built from this repo's own source and served
# by a rootless nginx on :8080.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM ghcr.io/nginxinc/nginx-unprivileged:1.27-alpine
# SPA routing (try_files -> index.html); listens on 8080 as the non-root user.
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
# The base image already runs as the unprivileged `nginx` user (uid 101);
# restate it so image scanners can see the container never runs as root.
USER 101
EXPOSE 8080
