FROM node:22-slim

WORKDIR /app

COPY . .

RUN npm install dotenv @nomicfoundation/hardhat-toolbox --save-dev

CMD ["npx", "hardhat", "run", "scripts/deploy.js", "--network", "sepolia"]
