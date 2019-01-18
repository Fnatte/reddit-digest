FROM node:8
COPY . .
EXPOSE 8888
CMD ["node", "src/app.js"]
