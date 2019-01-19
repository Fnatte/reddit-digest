FROM node:8
COPY . .
RUN yarn
EXPOSE 8888
CMD ["node", "src/app.js"]
