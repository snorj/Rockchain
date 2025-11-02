// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GoldToken.sol";
import "./PickaxeNFT.sol";
import "./GemNFT.sol";

/**
 * @title GameV2
 * @notice Core Rockchain game logic with level access system
 * @dev Expanded to support 5 mining levels with timed access
 */
contract GameV2 {
    GoldToken public immutable goldToken;
    PickaxeNFT public immutable pickaxeNFT;
    GemNFT public immutable gemNFT;
    
    // Ore type names (expanded to include all materials)
    string[] public materialNames = [
        "stone", "copper", "tin", "coal",                    // Tier 1 (0-3)
        "iron", "lead", "cobalt",                             // Tier 2 (4-6)
        "silver", "gold", "platinum", "titanium", "tungsten", // Tier 3 (7-11)
        "palladium", "orichalcum",                            // Tier 4 (12-13)
        "mythril", "adamantite", "meteorite",                 // Tier 5 (14-16)
        "emerald",                                             // Tier 3 gem (17)
        "topaz", "aquamarine", "peridot", "ruby", "sapphire", // Tier 4 gems (18-22)
        "diamond", "amethyst"                                  // Tier 5 gems (23-24)
    ];
    
    // Material values in GLD
    uint256[] public materialValues = [
        1, 3, 3, 5,                      // Tier 1
        10, 8, 12,                       // Tier 2
        25, 50, 60, 55, 55,              // Tier 3 ores
        100, 110,                        // Tier 4 ores
        300, 350, 320,                   // Tier 5 ores
        100,                             // Tier 3 gem (emerald)
        120, 120, 110, 150, 150,         // Tier 4 gems
        500, 400                         // Tier 5 gems
    ];
    
    // Level configuration
    struct LevelConfig {
        string name;
        uint256 accessCost;        // Cost in GLD (0 = free)
        uint256 duration;          // Duration in seconds (0 = unlimited)
        PickaxeNFT.Tier requiredTier;
    }
    
    LevelConfig[5] public levels;
    
    // Level access tracking
    mapping(address => mapping(uint8 => uint256)) public levelAccess; // player => level => expiry timestamp
    
    // Statistics
    uint256 public totalSales;
    mapping(address => uint256) public playerSales;
    mapping(address => mapping(uint256 => uint256)) public playerMaterialsMined;
    
    event Sold(
        address indexed player,
        uint256[] materialIds,
        uint256[] amounts,
        uint256 goldEarned,
        uint256 timestamp
    );
    
    event LevelAccessPurchased(
        address indexed player,
        uint8 indexed level,
        uint256 cost,
        uint256 expiresAt
    );
    
    event MaterialMined(
        address indexed player,
        uint256 indexed materialId,
        string materialName
    );
    
    constructor(address _goldToken, address _pickaxeNFT, address _gemNFT) {
        require(_goldToken != address(0), "Invalid token address");
        require(_pickaxeNFT != address(0), "Invalid pickaxe address");
        require(_gemNFT != address(0), "Invalid gem address");
        
        goldToken = GoldToken(_goldToken);
        pickaxeNFT = PickaxeNFT(_pickaxeNFT);
        gemNFT = GemNFT(_gemNFT);
        
        // Initialize level configurations
        levels[0] = LevelConfig({
            name: "Beginner Mine",
            accessCost: 0,
            duration: 0,  // Unlimited
            requiredTier: PickaxeNFT.Tier.Wooden
        });
        
        levels[1] = LevelConfig({
            name: "Iron Mine",
            accessCost: 50,
            duration: 120,  // 2 minutes
            requiredTier: PickaxeNFT.Tier.Iron
        });
        
        levels[2] = LevelConfig({
            name: "Precious Mine",
            accessCost: 200,
            duration: 120,
            requiredTier: PickaxeNFT.Tier.Steel
        });
        
        levels[3] = LevelConfig({
            name: "Gem Cavern",
            accessCost: 500,
            duration: 120,
            requiredTier: PickaxeNFT.Tier.Mythril
        });
        
        levels[4] = LevelConfig({
            name: "Mythic Depths",
            accessCost: 1500,
            duration: 120,
            requiredTier: PickaxeNFT.Tier.Adamantite
        });
    }
    
    /**
     * @notice Purchase access to a mining level
     * @param level Level ID (1-4, level 0 is always free)
     */
    function purchaseLevelAccess(uint8 level) external {
        require(level > 0 && level < 5, "Invalid level");
        require(pickaxeNFT.hasPickaxe(msg.sender), "No pickaxe");
        
        LevelConfig memory config = levels[level];
        
        // Check pickaxe tier requirement
        (, PickaxeNFT.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(msg.sender);
        require(tier >= config.requiredTier, "Pickaxe tier too low");
        
        // Check and transfer gold (locked in contract = effectively burned)
        uint256 costWei = config.accessCost * 1e18;
        require(goldToken.balanceOf(msg.sender) >= costWei, "Insufficient GLD");
        require(goldToken.transferFrom(msg.sender, address(this), costWei), "Transfer failed");
        
        // Set expiry time
        uint256 expiresAt = block.timestamp + config.duration;
        levelAccess[msg.sender][level] = expiresAt;
        
        emit LevelAccessPurchased(msg.sender, level, config.accessCost, expiresAt);
    }
    
    /**
     * @notice Check if player has access to a level
     * @param player Player address
     * @param level Level ID
     * @return hasAccess True if player can access this level
     * @return expiresAt Expiry timestamp (0 if unlimited)
     */
    function checkLevelAccess(address player, uint8 level) external view returns (bool hasAccess, uint256 expiresAt) {
        require(level < 5, "Invalid level");
        
        // Level 0 is always free
        if (level == 0) {
            return (true, 0);
        }
        
        // Check if player has pickaxe
        if (!pickaxeNFT.hasPickaxe(player)) {
            return (false, 0);
        }
        
        // Check pickaxe tier
        (, PickaxeNFT.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(player);
        if (tier < levels[level].requiredTier) {
            return (false, 0);
        }
        
        // Check if access has expired
        uint256 expiry = levelAccess[player][level];
        if (expiry > 0 && block.timestamp < expiry) {
            return (true, expiry);
        }
        
        return (false, expiry);
    }
    
    /**
     * @notice Record mining action (simplified - no gem drops handled here)
     * @param materialId Material type ID
     */
    function recordMining(uint256 materialId) external {
        require(materialId < materialNames.length, "Invalid material ID");
        require(pickaxeNFT.hasPickaxe(msg.sender), "No pickaxe");
        
        // Track mining stats
        playerMaterialsMined[msg.sender][materialId]++;
        
        emit MaterialMined(msg.sender, materialId, materialNames[materialId]);
    }
    
    /**
     * @notice Sell mined resources for GLD tokens
     * @param materialIds Array of material type IDs
     * @param amounts Array of amounts for each material type
     */
    function sellResources(
        uint256[] calldata materialIds,
        uint256[] calldata amounts
    ) external {
        require(materialIds.length == amounts.length, "Array length mismatch");
        require(materialIds.length > 0, "Must sell at least one resource");
        
        uint256 totalGoldAmount = 0;
        
        // Calculate total GLD value
        for (uint256 i = 0; i < materialIds.length; i++) {
            require(materialIds[i] < materialValues.length, "Invalid material ID");
            require(amounts[i] > 0, "Amount must be positive");
            
            totalGoldAmount += amounts[i] * materialValues[materialIds[i]];
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
            materialIds,
            amounts,
            totalGoldAmount,
            block.timestamp
        );
    }
    
    /**
     * @notice Preview GLD value before selling
     * @param materialIds Array of material type IDs
     * @param amounts Array of amounts for each material type
     * @return goldAmount GLD tokens that would be earned
     */
    function previewSale(
        uint256[] calldata materialIds,
        uint256[] calldata amounts
    ) external view returns (uint256 goldAmount) {
        require(materialIds.length == amounts.length, "Array length mismatch");
        
        for (uint256 i = 0; i < materialIds.length; i++) {
            if (materialIds[i] >= materialValues.length) continue;
            goldAmount += amounts[i] * materialValues[materialIds[i]];
        }
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
     * @notice Get material name by ID
     * @param materialId Material type ID
     * @return name Material name
     */
    function getMaterialName(uint256 materialId) external view returns (string memory) {
        require(materialId < materialNames.length, "Invalid material ID");
        return materialNames[materialId];
    }
    
    /**
     * @notice Get material value by ID
     * @param materialId Material type ID
     * @return value GLD value
     */
    function getMaterialValue(uint256 materialId) external view returns (uint256) {
        require(materialId < materialValues.length, "Invalid material ID");
        return materialValues[materialId];
    }
    
    /**
     * @notice Get level configuration
     * @param level Level ID
     * @return config Level configuration
     */
    function getLevelConfig(uint8 level) external view returns (LevelConfig memory) {
        require(level < 5, "Invalid level");
        return levels[level];
    }
}

