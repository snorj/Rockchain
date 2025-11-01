import { expect } from "chai";
import { ethers } from "hardhat";
import { GoldToken, Game } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";

describe("Game", function () {
  let goldToken: GoldToken;
  let game: Game;
  let owner: SignerWithAddress;
  let player1: SignerWithAddress;
  let player2: SignerWithAddress;

  beforeEach(async function () {
    [owner, player1, player2] = await ethers.getSigners();

    // Deploy GoldToken
    const GoldToken = await ethers.getContractFactory("GoldToken");
    goldToken = await GoldToken.deploy();
    await goldToken.waitForDeployment();

    // Deploy Game
    const Game = await ethers.getContractFactory("Game");
    game = await Game.deploy(await goldToken.getAddress());
    await game.waitForDeployment();

    // Grant minter role to Game contract
    await goldToken.setMinter(await game.getAddress());
  });

  describe("Deployment", function () {
    it("Should set correct GoldToken reference", async function () {
      expect(await game.goldToken()).to.equal(await goldToken.getAddress());
    });

    it("Should set correct resource values", async function () {
      expect(await game.COAL_VALUE()).to.equal(1);
      expect(await game.IRON_VALUE()).to.equal(3);
      expect(await game.DIAMOND_VALUE()).to.equal(10);
    });

    it("Should revert if deployed with zero address", async function () {
      const Game = await ethers.getContractFactory("Game");
      await expect(
        Game.deploy(ethers.ZeroAddress)
      ).to.be.revertedWith("Invalid token address");
    });
  });

  describe("Selling Resources", function () {
    it("Should sell resources and mint correct GLD", async function () {
      // Sell: 5 coal, 2 iron, 1 diamond
      // Expected: (5 * 1) + (2 * 3) + (1 * 10) = 21 GLD
      await game.connect(player1).sellResources(5, 2, 1);
      
      const balance = await goldToken.balanceOf(player1.address);
      expect(balance).to.equal(ethers.parseEther("21"));
    });

    it("Should reject sale with 0 resources", async function () {
      await expect(
        game.connect(player1).sellResources(0, 0, 0)
      ).to.be.revertedWith("Must sell at least one resource");
    });

    it("Should emit Sold event with correct data", async function () {
      const coal = 3;
      const iron = 1;
      const diamond = 0;
      const expectedGold = (coal * 1) + (iron * 3);

      const tx = await game.connect(player1).sellResources(coal, iron, diamond);
      const receipt = await tx.wait();
      const block = await ethers.provider.getBlock(receipt!.blockNumber);

      await expect(tx)
        .to.emit(game, "Sold")
        .withArgs(
          player1.address,
          coal,
          iron,
          diamond,
          expectedGold,
          block!.timestamp
        );
    });

    it("Should track player sales statistics", async function () {
      await game.connect(player1).sellResources(10, 0, 0);
      expect(await game.playerSales(player1.address)).to.equal(ethers.parseEther("10"));
      
      await game.connect(player1).sellResources(5, 0, 0);
      expect(await game.playerSales(player1.address)).to.equal(ethers.parseEther("15"));
    });

    it("Should track total sales across all players", async function () {
      await game.connect(player1).sellResources(10, 0, 0);
      await game.connect(player2).sellResources(5, 0, 0);
      
      expect(await game.totalSales()).to.equal(ethers.parseEther("15"));
    });

    it("Should handle large resource amounts", async function () {
      const coal = 1000;
      const iron = 500;
      const diamond = 100;
      const expectedGold = (coal * 1) + (iron * 3) + (diamond * 10);

      await game.connect(player1).sellResources(coal, iron, diamond);
      
      const balance = await goldToken.balanceOf(player1.address);
      expect(balance).to.equal(ethers.parseEther(expectedGold.toString()));
    });

    it("Should allow selling only coal", async function () {
      await game.connect(player1).sellResources(7, 0, 0);
      expect(await goldToken.balanceOf(player1.address)).to.equal(ethers.parseEther("7"));
    });

    it("Should allow selling only iron", async function () {
      await game.connect(player1).sellResources(0, 4, 0);
      expect(await goldToken.balanceOf(player1.address)).to.equal(ethers.parseEther("12"));
    });

    it("Should allow selling only diamond", async function () {
      await game.connect(player1).sellResources(0, 0, 3);
      expect(await goldToken.balanceOf(player1.address)).to.equal(ethers.parseEther("30"));
    });
  });

  describe("Preview Sale", function () {
    it("Should preview sale correctly", async function () {
      const preview = await game.previewSale(5, 2, 1);
      expect(preview).to.equal(21);
    });

    it("Should preview with zero values", async function () {
      const preview = await game.previewSale(0, 0, 0);
      expect(preview).to.equal(0);
    });

    it("Should preview large amounts", async function () {
      const preview = await game.previewSale(1000, 500, 100);
      expect(preview).to.equal(3500);
    });
  });

  describe("Get Player Earnings", function () {
    it("Should return correct player earnings", async function () {
      await game.connect(player1).sellResources(10, 5, 2);
      // (10 * 1) + (5 * 3) + (2 * 10) = 45 GLD
      
      const earnings = await game.getPlayerEarnings(player1.address);
      expect(earnings).to.equal(45);
    });

    it("Should return zero for player with no sales", async function () {
      const earnings = await game.getPlayerEarnings(player2.address);
      expect(earnings).to.equal(0);
    });

    it("Should track multiple sales correctly", async function () {
      await game.connect(player1).sellResources(5, 0, 0);
      await game.connect(player1).sellResources(0, 3, 0);
      await game.connect(player1).sellResources(0, 0, 1);
      // (5 * 1) + (3 * 3) + (1 * 10) = 24 GLD
      
      const earnings = await game.getPlayerEarnings(player1.address);
      expect(earnings).to.equal(24);
    });
  });

  describe("Integration: Full Flow", function () {
    it("Should complete full mining -> selling -> leaderboard flow", async function () {
      // Player 1 sells resources
      await game.connect(player1).sellResources(10, 5, 2);
      
      // Player 2 sells resources
      await game.connect(player2).sellResources(5, 3, 1);
      
      // Check balances
      const player1Balance = await goldToken.balanceOf(player1.address);
      const player2Balance = await goldToken.balanceOf(player2.address);
      
      // Player 1: (10 * 1) + (5 * 3) + (2 * 10) = 45 GLD
      expect(player1Balance).to.equal(ethers.parseEther("45"));
      
      // Player 2: (5 * 1) + (3 * 3) + (1 * 10) = 24 GLD
      expect(player2Balance).to.equal(ethers.parseEther("24"));
      
      // Check total sales
      expect(await game.totalSales()).to.equal(ethers.parseEther("69"));
      
      // Verify leaderboard data (readable balances)
      expect(await goldToken.balanceOfGLD(player1.address)).to.equal(45);
      expect(await goldToken.balanceOfGLD(player2.address)).to.equal(24);
    });
  });
});

