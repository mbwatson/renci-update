# build
FROM node:25-alpine3.22 as build

WORKDIR /app

COPY package*.json ./
COPY frontend/package*.json ./frontend/
RUN npm ci --workspace=frontend

COPY frontend/ frontend/

# Declare build args and pass to Vite as env vars
ARG VITE_AD_CLIENT_ID
ARG VITE_AD_AUTHORITY
ENV VITE_AD_CLIENT_ID=$VITE_AD_CLIENT_ID
ENV VITE_AD_AUTHORITY=$VITE_AD_AUTHORITY

RUN npm run build --workspace=frontend

# run
FROM nginx:1.29.5-alpine

COPY --from=build /app/frontend/dist /usr/share/nginx/html
COPY frontend/nginx.conf /etc/nginx/conf.d/default.conf

EXPOSE 80