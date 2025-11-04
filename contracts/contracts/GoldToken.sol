// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title GoldToken
 * @notice ERC-20 token representing gold earned in Rockchain
 * @dev Only the GameV3 contract can mint tokens
 */
contract GoldToken is ERC20, AccessControl {
    bytes32 public constant MINTER_ROLE = keccak256("MINTER_ROLE");
    
    event TokensMinted(address indexed player, uint256 amount);
    
    constructor() ERC20("Rockchain Gold", "GLD") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @notice Grant minter role to Game contract
     * @param minter Address of GameV3.sol
     */
    function setMinter(address minter) external onlyRole(DEFAULT_ADMIN_ROLE) {
        _grantRole(MINTER_ROLE, minter);
    }
    
    /**
     * @notice Mint GLD tokens to player
     * @param to Player's wallet address
     * @param amount Amount of GLD to mint (in wei)
     */
    function mint(address to, uint256 amount) external onlyRole(MINTER_ROLE) {
        _mint(to, amount);
        emit TokensMinted(to, amount);
    }
    
    /**
     * @notice Get human-readable balance (with 18 decimals)
     * @param account Address to check
     * @return Balance in GLD (not wei)
     */
    function balanceOfGLD(address account) external view returns (uint256) {
        return balanceOf(account) / 1e18;
    }
}

