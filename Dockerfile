FROM node:8
COPY . .
EXPOSE 5000
RUN yarn

ENV NODE_ENV=production

CMD node -r dotenv/config src/app.js
