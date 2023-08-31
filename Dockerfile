FROM node:alpine
ENV NODE_ENV=production

WORKDIR /app

COPY ["package.json", "package-lock.json*", "./"]

RUN npm ci --prefer-offline --no-audit --fetch-retry-maxtimeout 6000000 --fetch-retry-mintimeout 1000000

COPY . .

CMD ["node", "index.js"]
