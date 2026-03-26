FROM node:20-slim

WORKDIR /app

COPY package*.json ./
RUN npm ci --prefer-offline --no-audit --no-fund

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["node", "server.unified.js"]
