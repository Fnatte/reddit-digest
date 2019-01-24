FROM node:8

WORKDIR /app

COPY . .

EXPOSE 5000

RUN yarn
RUN yarn build

ENV NODE_ENV=production

CMD node src/app.js
