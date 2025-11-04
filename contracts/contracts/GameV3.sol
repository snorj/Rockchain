// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GoldToken.sol";
import "./PickaxeNFTV2.sol";
import "./GemNFT.sol";

/**
 * @title GameV3
 * @notice Core Rockchain game logic with per-second level pricing
 * @dev Implements session-based mining with flexible second-based purchases
 */
contract GameV3 {
    GoldToken public immutable goldToken;
    PickaxeNFTV2 public immutable pickaxeNFT;
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
        uint256 costPerSecond;     // Cost per second in GLD (0 = free)
        PickaxeNFTV2.Tier requiredTier;
    }
    
    // Mining session
    struct MiningSession {
        uint8 levelId;
        uint256 startTime;
        uint256 endTime;
        bool active;
    }
    
    LevelConfig[5] public levels;
    
    // Active mining sessions
    mapping(address => MiningSession) public activeSessions;
    
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
    
    event SessionStarted(
        address indexed player,
        uint8 indexed levelId,
        uint16 numSeconds,
        uint256 cost,
        uint256 startTime,
        uint256 endTime
    );
    
    event SessionEnded(
        address indexed player,
        uint8 indexed levelId,
        uint256 endTime
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
        pickaxeNFT = PickaxeNFTV2(_pickaxeNFT);
        gemNFT = GemNFT(_gemNFT);
        
        // Initialize level configurations with per-second pricing
        levels[0] = LevelConfig({
            name: "Beginner Mine",
            costPerSecond: 0,  // FREE
            requiredTier: PickaxeNFTV2.Tier.Wooden
        });
        
        levels[1] = LevelConfig({
            name: "Iron Mine",
            costPerSecond: 7,  // 7 gold/sec (420/min)
            requiredTier: PickaxeNFTV2.Tier.Iron
        });
        
        levels[2] = LevelConfig({
            name: "Precious Mine",
            costPerSecond: 40,  // 40 gold/sec (2400/min)
            requiredTier: PickaxeNFTV2.Tier.Steel
        });
        
        levels[3] = LevelConfig({
            name: "Gem Cavern",
            costPerSecond: 115,  // 115 gold/sec (6900/min)
            requiredTier: PickaxeNFTV2.Tier.Mythril
        });
        
        levels[4] = LevelConfig({
            name: "Mythic Depths",
            costPerSecond: 300,  // 300 gold/sec (18000/min)
            requiredTier: PickaxeNFTV2.Tier.Adamantite
        });
    }
    
    /**
     * @notice Start a mining session with flexible second-based purchases
     * @param levelId Level ID (1-4, level 0 is always free and doesn't need sessions)
     * @param numSeconds Number of seconds to purchase (15-3600, i.e., 15 seconds to 60 minutes)
     */
    function startMiningSession(uint8 levelId, uint16 numSeconds) external {
        require(levelId > 0 && levelId < 5, "Invalid level");
        require(numSeconds >= 15 && numSeconds <= 3600, "Seconds must be 15-3600");
        require(pickaxeNFT.hasPickaxe(msg.sender), "No pickaxe");
        
        // Check if there's an active session that hasn't expired
        MiningSession storage currentSession = activeSessions[msg.sender];
        require(!currentSession.active || block.timestamp >= currentSession.endTime, "Session already active");
        
        // If old session exists and is expired, mark it as inactive
        if (currentSession.active && block.timestamp >= currentSession.endTime) {
            currentSession.active = false;
        }
        
        LevelConfig memory config = levels[levelId];
        
        // Check pickaxe tier requirement
        (, PickaxeNFTV2.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(msg.sender);
        require(tier >= config.requiredTier, "Pickaxe tier too low");
        
        // Calculate cost (per second)
        uint256 totalCost = config.costPerSecond * numSeconds;
        uint256 costWei = totalCost * 1e18;
        
        // Burn gold from player
        require(goldToken.balanceOf(msg.sender) >= costWei, "Insufficient GLD");
        require(goldToken.transferFrom(msg.sender, address(this), costWei), "Transfer failed");
        
        // Create session
        uint256 startTime = block.timestamp;
        uint256 endTime = startTime + numSeconds;
        
        activeSessions[msg.sender] = MiningSession({
            levelId: levelId,
            startTime: startTime,
            endTime: endTime,
            active: true
        });
        
        emit SessionStarted(msg.sender, levelId, numSeconds, totalCost, startTime, endTime);
    }
    
    /**
     * @notice End the current mining session (returns player to Level 1)
     */
    function endMiningSession() external {
        MiningSession storage session = activeSessions[msg.sender];
        require(session.active, "No active session");
        
        // Emit event and deactivate
        emit SessionEnded(msg.sender, session.levelId, block.timestamp);
        
        session.active = false;
    }
    
    /**
     * @notice Get active session info for a player
     * @param player Player address
     * @return levelId Current level (0 if no session)
     * @return startTime Session start timestamp
     * @return endTime Session end timestamp
     * @return active Whether session is active
     */
    function getActiveSession(address player) external view returns (
        uint8 levelId,
        uint256 startTime,
        uint256 endTime,
        bool active
    ) {
        MiningSession memory session = activeSessions[player];
        
        // Check if session has expired
        bool isActive = session.active && block.timestamp < session.endTime;
        
        return (
            session.levelId,
            session.startTime,
            session.endTime,
            isActive
        );
    }
    
    /**
     * @notice Get cost per second for a level
     * @param levelId Level ID (0-4)
     * @return Cost in GLD per second
     */
    function getLevelCostPerSecond(uint8 levelId) public view returns (uint256) {
        require(levelId < 5, "Invalid level");
        return levels[levelId].costPerSecond;
    }
    
    /**
     * @notice Calculate total cost for a mining session
     * @param levelId Level ID
     * @param numSeconds Number of seconds
     * @return Total cost in GLD
     */
    function calculateSessionCost(uint8 levelId, uint16 numSeconds) external view returns (uint256) {
        require(levelId < 5, "Invalid level");
        require(numSeconds > 0, "Seconds must be positive");
        return levels[levelId].costPerSecond * numSeconds;
    }
    
    /**
     * @notice Check if player can access a level (has pickaxe tier and session if needed)
     * @param player Player address
     * @param levelId Level ID
     * @return canAccess True if player can mine at this level
     */
    function canAccessLevel(address player, uint8 levelId) external view returns (bool canAccess) {
        require(levelId < 5, "Invalid level");
        
        // Level 0 is always free (no session needed)
        if (levelId == 0) {
            return pickaxeNFT.hasPickaxe(player);
        }
        
        // Check if player has pickaxe
        if (!pickaxeNFT.hasPickaxe(player)) {
            return false;
        }
        
        // Check pickaxe tier
        (, PickaxeNFTV2.Tier tier,,) = pickaxeNFT.getPlayerPickaxe(player);
        if (tier < levels[levelId].requiredTier) {
            return false;
        }
        
        // Check if session is active and not expired
        MiningSession memory session = activeSessions[player];
        if (!session.active || session.levelId != levelId) {
            return false;
        }
        
        if (block.timestamp >= session.endTime) {
            return false;
        }
        
        return true;
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
     * @param levelId Level ID
     * @return config Level configuration
     */
    function getLevelConfig(uint8 levelId) external view returns (LevelConfig memory) {
        require(levelId < 5, "Invalid level");
        return levels[levelId];
    }
}

