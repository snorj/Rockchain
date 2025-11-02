// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GoldToken.sol";
import "./PickaxeNFT.sol";
import "./GemNFT.sol";

/**
 * @title Game
 * @notice Core Rockchain game logic - converts mined ores into GLD tokens
 * @dev Expanded to support 17 ore types, pickaxe tier requirements, and gem drops
 */
contract Game {
    GoldToken public immutable goldToken;
    PickaxeNFT public immutable pickaxeNFT;
    GemNFT public immutable gemNFT;
    
    // Ore type names (0-16)
    string[17] public oreNames = [
        "stone", "coal", "copper", "tin",           // Common (0-3)
        "iron", "lead", "silver",                    // Uncommon (4-6)
        "gold", "titanium", "cobalt",                // Rare (7-9)
        "mythril", "orichalcum", "platinum",        // Epic (10-12)
        "adamantite", "palladium", "meteorite",     // Legendary (13-15)
        "tungsten"                                    // Extra (16)
    ];
    
    // Resource values in GLD (divided by 2 for balance, actual values in frontend)
    uint256[17] public oreValues = [
        1,   // stone: 0.5 GLD (stored as 1, divided by 2 in calculation)
        1,   // coal: 1 GLD
        2,   // copper: 2 GLD
        2,   // tin: 2 GLD
        5,   // iron: 5 GLD
        4,   // lead: 4 GLD
        8,   // silver: 8 GLD
        15,  // gold: 15 GLD
        20,  // titanium: 20 GLD
        18,  // cobalt: 18 GLD
        50,  // mythril: 50 GLD
        60,  // orichalcum: 60 GLD
        55,  // platinum: 55 GLD
        150, // adamantite: 150 GLD
        140, // palladium: 140 GLD
        200, // meteorite: 200 GLD
        25   // tungsten: 25 GLD
    ];
    
    // Pickaxe tier requirements for each ore (0 = Wooden, 4 = Adamantite)
    PickaxeNFT.Tier[17] public oreRequirements = [
        PickaxeNFT.Tier.Wooden,      // stone
        PickaxeNFT.Tier.Wooden,      // coal
        PickaxeNFT.Tier.Wooden,      // copper
        PickaxeNFT.Tier.Wooden,      // tin
        PickaxeNFT.Tier.Iron,        // iron
        PickaxeNFT.Tier.Iron,        // lead
        PickaxeNFT.Tier.Iron,        // silver
        PickaxeNFT.Tier.Steel,       // gold
        PickaxeNFT.Tier.Steel,       // titanium
        PickaxeNFT.Tier.Steel,       // cobalt
        PickaxeNFT.Tier.Mythril,     // mythril
        PickaxeNFT.Tier.Mythril,     // orichalcum
        PickaxeNFT.Tier.Mythril,     // platinum
        PickaxeNFT.Tier.Adamantite,  // adamantite
        PickaxeNFT.Tier.Adamantite,  // palladium
        PickaxeNFT.Tier.Adamantite,  // meteorite
        PickaxeNFT.Tier.Steel        // tungsten
    ];
    
    // Statistics
    uint256 public totalSales;
    mapping(address => uint256) public playerSales;
    mapping(address => mapping(uint256 => uint256)) public playerOresMined; // player => oreId => count
    
    event Sold(
        address indexed player,
        uint256[] oreIds,
        uint256[] amounts,
        uint256 goldEarned,
        uint256 timestamp
    );
    
    event OreMined(
        address indexed player,
        uint256 indexed oreId,
        string oreName,
        bool gemDropped
    );
    
    constructor(address _goldToken, address _pickaxeNFT, address _gemNFT) {
        require(_goldToken != address(0), "Invalid token address");
        require(_pickaxeNFT != address(0), "Invalid pickaxe address");
        require(_gemNFT != address(0), "Invalid gem address");
        
        goldToken = GoldToken(_goldToken);
        pickaxeNFT = PickaxeNFT(_pickaxeNFT);
        gemNFT = GemNFT(_gemNFT);
    }
    
    /**
     * @notice Record mining action and check for gem drop
     * @param oreId Ore type ID (0-16)
     * @param randomSeed Random seed from frontend for gem drop RNG
     * @dev Called by frontend after player mines an ore
     */
    function recordMining(uint256 oreId, uint256 randomSeed) external {
        require(oreId < oreNames.length, "Invalid ore ID");
        require(pickaxeNFT.hasPickaxe(msg.sender), "No pickaxe");
        
        // Get player's pickaxe
        (uint256 pickaxeId, PickaxeNFT.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(msg.sender);
        
        // Check if pickaxe tier is sufficient
        require(tier >= oreRequirements[oreId], "Pickaxe tier too low");
        
        // Reduce pickaxe durability
        pickaxeNFT.useDurability(pickaxeId);
        
        // Track mining stats
        playerOresMined[msg.sender][oreId]++;
        
        // Check for gem drop (only on legendary ores: adamantite, palladium, meteorite)
        bool gemDropped = false;
        if (oreId >= 13 && oreId <= 15) {
            // 0.5% chance = 5/1000
            // Use randomSeed + block data for pseudo-randomness
            uint256 random = uint256(keccak256(abi.encodePacked(
                randomSeed,
                block.timestamp,
                block.prevrandao,
                msg.sender,
                oreId
            ))) % 1000;
            
            if (random < 5) { // 5/1000 = 0.5%
                // Random gem type (0-7)
                GemNFT.GemType gemType = GemNFT.GemType(random % 8);
                gemNFT.mintGem(msg.sender, gemType, oreNames[oreId]);
                gemDropped = true;
            }
        }
        
        emit OreMined(msg.sender, oreId, oreNames[oreId], gemDropped);
    }
    
    /**
     * @notice Sell mined resources for GLD tokens
     * @param oreIds Array of ore type IDs
     * @param amounts Array of amounts for each ore type
     * @dev Mints GLD tokens to caller based on resource values
     */
    function sellResources(
        uint256[] calldata oreIds,
        uint256[] calldata amounts
    ) external {
        require(oreIds.length == amounts.length, "Array length mismatch");
        require(oreIds.length > 0, "Must sell at least one resource");
        
        uint256 totalGoldAmount = 0;
        
        // Calculate total GLD value
        for (uint256 i = 0; i < oreIds.length; i++) {
            require(oreIds[i] < oreValues.length, "Invalid ore ID");
            require(amounts[i] > 0, "Amount must be positive");
            
            // Special handling for stone (0.5 GLD)
            if (oreIds[i] == 0) {
                totalGoldAmount += (amounts[i] * oreValues[0]) / 2;
            } else {
                totalGoldAmount += amounts[i] * oreValues[oreIds[i]];
            }
        }
        
        require(totalGoldAmount > 0, "Total value must be positive");
        
        // Convert to wei (18 decimals)
        uint256 goldAmountWei = totalGoldAmount * 1e18;
        
        // Mint GLD tokens to player
        goldToken.mint(msg.sender, goldAmountWei);
        
        // Update statistics
        totalSales += goldAmountWei;
        playerSales[msg.sender] += goldAmountWei;
        
        emit Sold(
            msg.sender,
            oreIds,
            amounts,
            totalGoldAmount,
            block.timestamp
        );
    }
    
    /**
     * @notice Check if player can mine specific ore type
     * @param player Player address
     * @param oreId Ore type ID
     * @return bool True if player's pickaxe tier is sufficient
     */
    function canMineOre(address player, uint256 oreId) external view returns (bool) {
        if (!pickaxeNFT.hasPickaxe(player)) return false;
        if (oreId >= oreNames.length) return false;
        
        (, PickaxeNFT.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(player);
        return tier >= oreRequirements[oreId];
    }
    
    /**
     * @notice Get player's total GLD earned
     * @param player Player address
     * @return Total GLD earned (in GLD, not wei)
     */
    function getPlayerEarnings(address player) external view returns (uint256) {
        return playerSales[player] / 1e18;
    }
    
    /**
     * @notice Get player's mining statistics
     * @param player Player address
     * @param oreId Ore type ID
     * @return count Number of times this ore was mined
     */
    function getPlayerOreMined(address player, uint256 oreId) external view returns (uint256) {
        return playerOresMined[player][oreId];
    }
    
    /**
     * @notice Preview GLD value before selling
     * @param oreIds Array of ore type IDs
     * @param amounts Array of amounts for each ore type
     * @return goldAmount GLD tokens that would be earned
     */
    function previewSale(
        uint256[] calldata oreIds,
        uint256[] calldata amounts
    ) external view returns (uint256 goldAmount) {
        require(oreIds.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < oreIds.length; i++) {
            if (oreIds[i] >= oreValues.length) continue;
            
            // Special handling for stone (0.5 GLD)
            if (oreIds[i] == 0) {
                goldAmount += (amounts[i] * oreValues[0]) / 2;
            } else {
                goldAmount += amounts[i] * oreValues[oreIds[i]];
            }
        }
    }
    
    /**
     * @notice Get ore name by ID
     * @param oreId Ore type ID
     * @return name Ore name
     */
    function getOreName(uint256 oreId) external view returns (string memory) {
        require(oreId < oreNames.length, "Invalid ore ID");
        return oreNames[oreId];
    }
    
    /**
     * @notice Get ore value by ID
     * @param oreId Ore type ID
     * @return value GLD value (note: stone returns 1 but is actually 0.5)
     */
    function getOreValue(uint256 oreId) external view returns (uint256) {
        require(oreId < oreValues.length, "Invalid ore ID");
        return oreValues[oreId];
    }
    
    /**
     * @notice Get all ore names
     * @return names Array of all ore names
     */
    function getAllOreNames() external view returns (string[17] memory) {
        return oreNames;
    }
}
