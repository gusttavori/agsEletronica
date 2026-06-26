FROM node:20-alpine

WORKDIR /app

COPY package*.json ./

RUN npm install --legacy-peer-deps

COPY . .

RUN npx prisma generate --schema=src/prisma/schema.prisma

RUN mkdir -p uploads

EXPOSE 3001

CMD ["npm","run","dev"]