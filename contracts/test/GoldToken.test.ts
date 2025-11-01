import { expect } from "chai";
import { ethers } from "hardhat";
import { GoldToken } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("GoldToken", function () {
  let goldToken: GoldToken;
  let owner: SignerWithAddress;
  let minter: SignerWithAddress;
  let user: SignerWithAddress;

  beforeEach(async function () {
    [owner, minter, user] = await ethers.getSigners();

    const GoldToken = await ethers.getContractFactory("GoldToken");
    goldToken = await GoldToken.deploy();
    await goldToken.waitForDeployment();
  });

  describe("Deployment", function () {
    it("Should deploy with correct name and symbol", async function () {
      expect(await goldToken.name()).to.equal("Rockchain Gold");
      expect(await goldToken.symbol()).to.equal("GLD");
      expect(await goldToken.decimals()).to.equal(18);
    });

    it("Should grant DEFAULT_ADMIN_ROLE to deployer", async function () {
      const adminRole = await goldToken.DEFAULT_ADMIN_ROLE();
      expect(await goldToken.hasRole(adminRole, owner.address)).to.be.true;
    });

    it("Should have zero initial supply", async function () {
      expect(await goldToken.totalSupply()).to.equal(0);
    });
  });

  describe("Access Control", function () {
    it("Should allow admin to set minter", async function () {
      await goldToken.setMinter(minter.address);
      const minterRole = await goldToken.MINTER_ROLE();
      expect(await goldToken.hasRole(minterRole, minter.address)).to.be.true;
    });

    it("Should prevent non-admin from setting minter", async function () {
      await expect(
        goldToken.connect(user).setMinter(minter.address)
      ).to.be.reverted;
    });

    it("Should prevent minting without MINTER_ROLE", async function () {
      await expect(
        goldToken.connect(user).mint(user.address, ethers.parseEther("100"))
      ).to.be.reverted;
    });
  });

  describe("Minting", function () {
    beforeEach(async function () {
      await goldToken.setMinter(minter.address);
    });

    it("Should allow minting with MINTER_ROLE", async function () {
      const amount = ethers.parseEther("100");
      await goldToken.connect(minter).mint(user.address, amount);
      
      expect(await goldToken.balanceOf(user.address)).to.equal(amount);
      expect(await goldToken.totalSupply()).to.equal(amount);
    });

    it("Should emit TokensMinted event", async function () {
      const amount = ethers.parseEther("50");
      
      await expect(goldToken.connect(minter).mint(user.address, amount))
        .to.emit(goldToken, "TokensMinted")
        .withArgs(user.address, amount);
    });

    it("Should mint to multiple users correctly", async function () {
      await goldToken.connect(minter).mint(user.address, ethers.parseEther("100"));
      await goldToken.connect(minter).mint(owner.address, ethers.parseEther("50"));
      
      expect(await goldToken.balanceOf(user.address)).to.equal(ethers.parseEther("100"));
      expect(await goldToken.balanceOf(owner.address)).to.equal(ethers.parseEther("50"));
      expect(await goldToken.totalSupply()).to.equal(ethers.parseEther("150"));
    });
  });

  describe("Helper Functions", function () {
    beforeEach(async function () {
      await goldToken.setMinter(minter.address);
      await goldToken.connect(minter).mint(user.address, ethers.parseEther("123"));
    });

    it("Should return correct balance in GLD (not wei)", async function () {
      expect(await goldToken.balanceOfGLD(user.address)).to.equal(123);
    });

    it("Should handle fractional balances correctly", async function () {
      await goldToken.connect(minter).mint(owner.address, ethers.parseEther("0.5"));
      expect(await goldToken.balanceOfGLD(owner.address)).to.equal(0); // Truncates decimals
    });
  });
});

