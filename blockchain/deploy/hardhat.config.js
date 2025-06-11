require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

module.exports = {
  solidity: "0.8.20",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY],
      // NOTE: タイムアウトする場合があるため、タイムアウトを60秒に設定
      timeout: 60000,
    },
  },
};
