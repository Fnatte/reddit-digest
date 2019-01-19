FROM node:8
COPY . .
EXPOSE 5000
RUN yarn
CMD ["node", "src/app.js"]
