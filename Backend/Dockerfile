FROM node:24-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

# npm is only needed during image construction.
# Remove it from the production runtime image.
RUN rm -rf /usr/local/lib/node_modules/npm \
    /usr/local/bin/npm \
    /usr/local/bin/npx

ENV NODE_ENV=production

EXPOSE 8080

CMD ["node", "server.js"]