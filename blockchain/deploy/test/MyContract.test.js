const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("MyContract", function () {
  let myContract;
  let owner;
  let addr1;

  beforeEach(async function () {
    [owner, addr1] = await ethers.getSigners();
    
    const MyContract = await ethers.getContractFactory("MyContract");
    myContract = await MyContract.deploy("Hello, World!");
    await myContract.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should set the right initial message", async function () {
      expect(await myContract.message()).to.equal("Hello, World!");
    });
  });

  describe("Message updates", function () {
    it("Should update the message", async function () {
      const newMessage = "Hello, Blockchain!";
      await myContract.updateMessage(newMessage);
      expect(await myContract.message()).to.equal(newMessage);
    });

    it("Should emit an event when message is updated", async function () {
      const oldMessage = await myContract.message();
      const newMessage = "Hello, Events!";
      
      await expect(myContract.updateMessage(newMessage))
        .to.emit(myContract, "MessageUpdated")
        .withArgs(oldMessage, newMessage, owner.address);
    });

    it("Should allow anyone to update the message", async function () {
      const newMessage = "Updated by addr1";
      await myContract.connect(addr1).updateMessage(newMessage);
      expect(await myContract.message()).to.equal(newMessage);
    });
  });
});
