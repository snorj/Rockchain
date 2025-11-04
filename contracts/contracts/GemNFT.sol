// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title GemNFT
 * @notice ERC-721 NFTs representing rare gem collectibles
 * @dev Minted by GameV3.sol when players mine legendary ores (0.5% drop chance)
 */
contract GemNFT is ERC721, Ownable {
    enum GemType { Ruby, Sapphire, Emerald, Diamond, Topaz, Amethyst, Aquamarine, Peridot }
    
    struct Gem {
        GemType gemType;
        uint256 mintedAt;
        string oreSource; // Which ore it dropped from (e.g., "adamantite")
    }
    
    address public gameContract; // Only GameV3.sol can mint
    uint256 private _nextTokenId = 1;
    
    mapping(uint256 => Gem) public gems;
    mapping(address => uint256[]) public playerGems; // Track gems owned by player
    
    event GemMinted(address indexed player, uint256 tokenId, GemType gemType, string oreSource);
    
    constructor() ERC721("Rockchain Gem", "GEM") Ownable(msg.sender) {}
    
    /**
     * @notice Set game contract address (only callable by owner)
     * @param _gameContract Address of GameV3.sol
     */
    function setGameContract(address _gameContract) external onlyOwner {
        require(_gameContract != address(0), "Invalid game contract");
        gameContract = _gameContract;
    }
    
    /**
     * @notice Mint gem (called by GameV3.sol on rare drop)
     * @param to Player who mined the ore
     * @param gemType Type of gem to mint
     * @param oreSource Which legendary ore it dropped from
     */
    function mintGem(address to, GemType gemType, string memory oreSource) external {
        require(msg.sender == gameContract, "Only Game contract");
        require(to != address(0), "Invalid recipient");
        
        uint256 tokenId = _nextTokenId++;
        _safeMint(to, tokenId);
        
        gems[tokenId] = Gem({
            gemType: gemType,
            mintedAt: block.timestamp,
            oreSource: oreSource
        });
        
        playerGems[to].push(tokenId);
        
        emit GemMinted(to, tokenId, gemType, oreSource);
    }
    
    /**
     * @notice Get gem details
     * @param tokenId Token ID
     * @return gemType Type of gem
     * @return mintedAt Timestamp when minted
     * @return oreSource Ore that dropped this gem
     */
    function getGem(uint256 tokenId) external view returns (
        GemType gemType,
        uint256 mintedAt,
        string memory oreSource
    ) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        Gem memory g = gems[tokenId];
        return (g.gemType, g.mintedAt, g.oreSource);
    }
    
    /**
     * @notice Get all gems owned by a player
     * @param player Player address
     * @return tokenIds Array of token IDs owned
     */
    function getPlayerGems(address player) external view returns (uint256[] memory) {
        return playerGems[player];
    }
    
    /**
     * @notice Get gem type name as string
     * @param gemType Gem type enum value
     * @return name Gem type name
     */
    function getGemName(GemType gemType) external pure returns (string memory name) {
        if (gemType == GemType.Ruby) return "Ruby";
        if (gemType == GemType.Sapphire) return "Sapphire";
        if (gemType == GemType.Emerald) return "Emerald";
        if (gemType == GemType.Diamond) return "Diamond";
        if (gemType == GemType.Topaz) return "Topaz";
        if (gemType == GemType.Amethyst) return "Amethyst";
        if (gemType == GemType.Aquamarine) return "Aquamarine";
        if (gemType == GemType.Peridot) return "Peridot";
        return "Unknown";
    }
    
    /**
     * @notice Override _update to update playerGems mapping on transfer
     */
    function _update(address to, uint256 tokenId, address auth) internal virtual override returns (address) {
        address from = _ownerOf(tokenId);
        
        // Remove from old owner's array
        if (from != address(0)) {
            uint256[] storage fromGems = playerGems[from];
            for (uint256 i = 0; i < fromGems.length; i++) {
                if (fromGems[i] == tokenId) {
                    fromGems[i] = fromGems[fromGems.length - 1];
                    fromGems.pop();
                    break;
                }
            }
        }
        
        // Add to new owner's array
        if (to != address(0)) {
            playerGems[to].push(tokenId);
        }
        
        return super._update(to, tokenId, auth);
    }
    
    /**
     * @notice Get base URI for metadata
     */
    function _baseURI() internal pure override returns (string memory) {
        return "https://rockchain.game/api/gems/";
    }
    
    /**
     * @notice Get total gems minted
     */
    function totalSupply() external view returns (uint256) {
        return _nextTokenId - 1;
    }
}

