const hre = require("hardhat");

async function main() {
  const MyContract = await hre.ethers.getContractFactory("MyContract");
  const contract = await MyContract.deploy("Hello, Sepolia!");

  await contract.waitForDeployment();

  console.log("Contract deployed to:", await contract.getAddress(), " <- これがSepoliaネットワーク上にデプロイされたコントラクトのアドレス！！");
  console.log("アドレスを正しいものにして、アクセスしてみよう！\nhttps://sepolia.etherscan.io/address/0x........");

}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
