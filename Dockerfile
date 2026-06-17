# Multi-stage build of the git-pull-request-dashboard SPA and its small OAuth
# runtime. The Node runtime serves the Vite bundle, handles GitHub OAuth
# callbacks, stores per-user sessions in HttpOnly cookies, and proxies GitHub API
# requests on :8080.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:22-alpine
WORKDIR /app
COPY --from=build /app/dist /usr/share/nginx/html
COPY server ./server
ENV DIST_DIR=/usr/share/nginx/html
ENV NODE_ENV=production
USER 1000:1000
EXPOSE 8080
CMD ["node", "server/index.mjs"]
