FROM node:24-alpine

WORKDIR /app

# Update npm to the latest secure version
RUN npm install -g npm@latest

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

ENV NODE_ENV=production

EXPOSE 8080

CMD ["npm", "start"]