// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "./GoldToken.sol";

/**
 * @title Game
 * @notice Core Rockchain game logic - converts mined ores into GLD tokens
 */
contract Game {
    GoldToken public immutable goldToken;
    
    // Resource values in GLD
    uint256 public constant COAL_VALUE = 1;
    uint256 public constant IRON_VALUE = 3;
    uint256 public constant DIAMOND_VALUE = 10;
    
    // Statistics
    uint256 public totalSales;
    mapping(address => uint256) public playerSales;
    
    event Sold(
        address indexed player,
        uint256 coal,
        uint256 iron,
        uint256 diamond,
        uint256 goldEarned,
        uint256 timestamp
    );
    
    constructor(address _goldToken) {
        require(_goldToken != address(0), "Invalid token address");
        goldToken = GoldToken(_goldToken);
    }
    
    /**
     * @notice Sell mined resources for GLD tokens
     * @param coal Number of coal ores
     * @param iron Number of iron ores
     * @param diamond Number of diamond ores
     * @dev Mints GLD tokens to caller based on resource values
     */
    function sellResources(
        uint256 coal,
        uint256 iron,
        uint256 diamond
    ) external {
        require(
            coal > 0 || iron > 0 || diamond > 0,
            "Must sell at least one resource"
        );
        
        // Calculate total GLD value
        uint256 goldAmount = 
            (coal * COAL_VALUE) +
            (iron * IRON_VALUE) +
            (diamond * DIAMOND_VALUE);
        
        // Convert to wei (18 decimals)
        uint256 goldAmountWei = goldAmount * 1e18;
        
        // Mint GLD tokens to player
        goldToken.mint(msg.sender, goldAmountWei);
        
        // Update statistics
        totalSales += goldAmountWei;
        playerSales[msg.sender] += goldAmountWei;
        
        emit Sold(
            msg.sender,
            coal,
            iron,
            diamond,
            goldAmount,
            block.timestamp
        );
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
     * @notice Preview GLD value before selling
     * @param coal Number of coal ores
     * @param iron Number of iron ores
     * @param diamond Number of diamond ores
     * @return goldAmount GLD tokens that would be earned
     */
    function previewSale(
        uint256 coal,
        uint256 iron,
        uint256 diamond
    ) external pure returns (uint256 goldAmount) {
        goldAmount = 
            (coal * COAL_VALUE) +
            (iron * IRON_VALUE) +
            (diamond * DIAMOND_VALUE);
    }
}

