FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm ci

CMD ["npx", "hardhat", "run", "scripts/deploy.js", "--network", "sepolia"]
