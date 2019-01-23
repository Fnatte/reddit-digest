FROM node:8
COPY . .
EXPOSE 5000
RUN yarn
CMD ["node", "-r dotenv/config", "src/app.js"]
