FROM node:8

COPY . .

EXPOSE 5000

RUN yarn
RUN yarn build

ENV NODE_ENV=production

CMD node src/app.js
