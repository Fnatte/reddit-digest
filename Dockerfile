FROM node:8
COPY . .
RUN yarn
CMD ["node", "src/app.js"]
