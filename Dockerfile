FROM node:18

WORKDIR /app

COPY vscode/backend/package*.json ./
RUN npm install

COPY vscode/backend/ .         

EXPOSE 3000

CMD ["npm", "start"]
