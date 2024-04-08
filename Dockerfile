FROM node:18 AS builder

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

FROM node:18-alpine

WORKDIR /app

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/build ./build

RUN npm install --production

EXPOSE 3000

CMD ["node", "build/mainServer/server/server.js"]
