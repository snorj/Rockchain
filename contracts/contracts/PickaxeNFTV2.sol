// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./GoldToken.sol";

/**
 * @title PickaxeNFTV2
 * @notice ERC-721 NFTs representing mining pickaxes with updated pricing for per-minute economy
 * @dev Each pickaxe has a tier (Wooden to Adamantite) that determines mining speed and ore access
 */
contract PickaxeNFTV2 is ERC721, Ownable {
    // Pickaxe tiers (0-4)
    enum Tier { Wooden, Iron, Steel, Mythril, Adamantite }
    
    struct Pickaxe {
        Tier tier;
        uint256 durability;
        uint256 maxDurability;
        uint256 mintedAt;
    }
    
    GoldToken public goldToken;
    address public gameContract; // GameV3.sol can call useDurability
    uint256 private _nextTokenId = 1;
    
    mapping(uint256 => Pickaxe) public pickaxes;
    mapping(address => uint256) public playerPickaxe; // One active pickaxe per player
    
    // Updated tier costs for per-minute pricing economy
    uint256[5] public tierCosts;
    
    // Base durability for each tier
    uint256[5] public tierDurability;
    
    event PickaxeMinted(address indexed player, uint256 tokenId, Tier tier);
    event PickaxeRepaired(uint256 indexed tokenId, uint256 newDurability);
    event PickaxeUpgraded(address indexed player, uint256 oldTokenId, uint256 newTokenId, Tier newTier);
    event DurabilityUsed(uint256 indexed tokenId, uint256 remainingDurability);
    
    constructor(address _goldToken) ERC721("Rockchain Pickaxe", "PICK") Ownable(msg.sender) {
        require(_goldToken != address(0), "Invalid token address");
        goldToken = GoldToken(_goldToken);
        
        // Set tier costs for balanced progression
        tierCosts[0] = 0;                  // Wooden: Free
        tierCosts[1] = 750 * 1e18;         // Iron: 750 GLD (starter upgrade)
        tierCosts[2] = 7000 * 1e18;        // Steel: 7000 GLD
        tierCosts[3] = 52000 * 1e18;       // Mythril: 52000 GLD
        tierCosts[4] = 380000 * 1e18;      // Adamantite: 380000 GLD
        
        // Set tier durability
        tierDurability[0] = 100;   // Wooden: 100 uses
        tierDurability[1] = 150;   // Iron: 150 uses
        tierDurability[2] = 200;   // Steel: 200 uses
        tierDurability[3] = 250;   // Mythril: 250 uses
        tierDurability[4] = 300;   // Adamantite: 300 uses
    }
    
    /**
     * @notice Set game contract address (only callable by owner)
     * @param _gameContract Address of GameV3.sol
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid game contract");
        gameContract = _gameContract;
    }
    
    /**
     * @notice Mint starter pickaxe (free, one per player)
     */
    function mintStarter() external {
        require(playerPickaxe[msg.sender] == 0, "Already has pickaxe");
        _mintPickaxe(msg.sender, Tier.Wooden);
    }
    
    /**
     * @notice Buy new pickaxe tier
     * @param tier Tier to purchase (1-4, cannot buy Wooden)
     */
    function buyPickaxe(Tier tier) external {
        require(tier > Tier.Wooden, "Use mintStarter for wooden");
        require(uint(tier) < tierCosts.length, "Invalid tier");
        
        uint256 cost = tierCosts[uint(tier)];
        require(goldToken.balanceOf(msg.sender) >= cost, "Insufficient GLD");
        
        // Transfer GLD from player to contract
        require(goldToken.transferFrom(msg.sender, address(this), cost), "Transfer failed");
        
        // Mint new pickaxe
        _mintPickaxe(msg.sender, tier);
    }
    
    /**
     * @notice Repair pickaxe (10% of tier cost)
     * @param tokenId Token ID to repair
     */
    function repair(uint256 tokenId) external {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        Pickaxe storage pickaxe = pickaxes[tokenId];
        
        uint256 repairCost = tierCosts[uint(pickaxe.tier)] / 10;
        require(goldToken.balanceOf(msg.sender) >= repairCost, "Insufficient GLD");
        
        require(goldToken.transferFrom(msg.sender, address(this), repairCost), "Transfer failed");
        pickaxe.durability = pickaxe.maxDurability;
        
        emit PickaxeRepaired(tokenId, pickaxe.maxDurability);
    }
    
    /**
     * @notice Reduce durability (called by GameV3.sol after mining)
     * @param tokenId Token ID to reduce durability for
     */
    function useDurability(uint256 tokenId) external {
        require(msg.sender == gameContract, "Only Game contract");
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        
        if (pickaxes[tokenId].durability > 0) {
            pickaxes[tokenId].durability--;
            emit DurabilityUsed(tokenId, pickaxes[tokenId].durability);
        }
    }
    
    /**
     * @notice Get player's active pickaxe stats
     * @param player Player address
     * @return tokenId Token ID of pickaxe
     * @return tier Pickaxe tier
     * @return durability Current durability
     * @return maxDurability Maximum durability
     */
    function getPlayerPickaxe(address player) external view returns (
        uint256 tokenId,
        Tier tier,
        uint256 durability,
        uint256 maxDurability
    ) {
        tokenId = playerPickaxe[player];
        require(tokenId != 0, "No pickaxe");
        Pickaxe memory p = pickaxes[tokenId];
        return (tokenId, p.tier, p.durability, p.maxDurability);
    }
    
    /**
     * @notice Check if player has a pickaxe
     * @param player Player address
     * @return bool True if player has a pickaxe
     */
    function hasPickaxe(address player) external view returns (bool) {
        return playerPickaxe[player] != 0;
    }
    
    /**
     * @notice Get speed multiplier for a pickaxe
     * @param tokenId Token ID
     * @return multiplier Speed multiplier (100 = 1.0x, 80 = 0.8x, etc)
     */
    function getSpeedMultiplier(uint256 tokenId) external view returns (uint256 multiplier) {
        Pickaxe memory p = pickaxes[tokenId];
        
        // Speed multipliers: Wooden=100, Iron=80, Steel=65, Mythril=50, Adamantite=35
        if (p.tier == Tier.Wooden) return 100;
        if (p.tier == Tier.Iron) return 80;
        if (p.tier == Tier.Steel) return 65;
        if (p.tier == Tier.Mythril) return 50;
        if (p.tier == Tier.Adamantite) return 35;
        
        return 100; // Default
    }
    
    /**
     * @notice Get tier cost
     * @param tier Tier enum value
     * @return cost Cost in wei
     */
    function getTierCost(Tier tier) external view returns (uint256 cost) {
        require(uint(tier) < tierCosts.length, "Invalid tier");
        return tierCosts[uint(tier)];
    }
    
    /**
     * @notice Get tier name as string
     * @param tier Tier enum value
     * @return name Tier name
     */
    function getTierName(Tier tier) external pure returns (string memory name) {
        if (tier == Tier.Wooden) return "Wooden";
        if (tier == Tier.Iron) return "Iron";
        if (tier == Tier.Steel) return "Steel";
        if (tier == Tier.Mythril) return "Mythril";
        if (tier == Tier.Adamantite) return "Adamantite";
        return "Unknown";
    }
    
    /**
     * @notice Internal mint helper
     * @param to Address to mint to
     * @param tier Pickaxe tier
     */
    function _mintPickaxe(address to, Tier tier) private {
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        uint256 durability = tierDurability[uint(tier)];
        pickaxes[tokenId] = Pickaxe({
            tier: tier,
            durability: durability,
            maxDurability: durability,
            mintedAt: block.timestamp
        });
        
        // Set as player's active pickaxe
        playerPickaxe[to] = tokenId;
        emit PickaxeMinted(to, tokenId, tier);
    }
    
    /**
     * @notice Override _update to update playerPickaxe mapping on transfer
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Remove from old owner's active pickaxe
        if (from != address(0) && playerPickaxe[from] == tokenId) {
            playerPickaxe[from] = 0;
        }
        
        // Set as new owner's active pickaxe if they don't have one
        if (to != address(0) && playerPickaxe[to] == 0) {
            playerPickaxe[to] = tokenId;
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Withdraw collected GLD (only owner)
     */
    function withdrawGLD() external onlyOwner {
        uint256 balance = goldToken.balanceOf(address(this));
        require(balance > 0, "No GLD to withdraw");
        require(goldToken.transfer(owner(), balance), "Transfer failed");
    }
}

