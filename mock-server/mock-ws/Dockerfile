FROM node:18-alpine
WORKDIR /app
COPY package.json ./
RUN npm install ws
COPY mock-ws.js ./
CMD ["node", "mock-ws.js"]
