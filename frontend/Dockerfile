# build
FROM node:25-alpine3.22 as build

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace=frontend

COPY frontend/ frontend/
RUN npm run build --workspace=frontend

# run
FROM nginx:1.29.5-alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80