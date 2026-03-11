FROM node:25-alpine3.22 as build

WORKDIR /app

COPY package*.json ./
COPY backend/package*.json backend/
RUN npm ci --workspace=backend --omit=dev

COPY backend/ backend/

EXPOSE 3001

CMD ["node", "backend/server.js"]