FROM node:18

WORKDIR /app

COPY . .

RUN npm install dotenv @nomicfoundation/hardhat-toolbox --save-dev

CMD ["npx", "hardhat", "run", "scripts/deploy.js", "--network", "sepolia"]
