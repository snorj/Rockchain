### Version

**v0.1 – MVP (3-Day Build)**

### Author

**Peter Lonergan**  
University of Sydney  
Built to explore **Privy Smart Wallets (ERC-4337)** and **gasless on-chain UX**

---

## 🎯 Overview

**Rockchain** is a lightweight pixel-art mining game inspired by RuneScape's mining mechanic.  
Players click on ore nodes that **spawn randomly** in a dungeon scene.  
They **mine** ores over time (with progress bars), **sell** them to earn on-chain **Gold Tokens (GLD)**, and climb the **global leaderboard** — all powered by **Privy Smart Wallets** with gas sponsorship.

The project demonstrates how **account abstraction** can power a frictionless, web-native blockchain game where players interact without needing wallets, gas, or crypto setup.

---

## 🧩 Core Gameplay Loop

|Phase|Description|
|---|---|
|**1. Spawn**|3–5 ore nodes appear randomly on screen at any time. Each ore has a rarity (Coal, Iron, Diamond) determining spawn rate and value.|
|**2. Mine**|Player clicks an ore → mining starts with a 6-8 frame sprite animation showing ore cracking + progress bar overlay. Mining speed = function of ore type × pickaxe tier.|
|**3. Collect**|When mining completes, ore disappears and adds to local inventory (`coal`, `iron`, `diamond`).|
|**4. Sell**|Player clicks **Sell** → all mined ores are converted into on-chain **GLD** via Privy smart wallet.|
|**5. Upgrade (Optional)**|Player may upgrade pickaxe (off-chain or on-chain) to reduce mining time and unlock higher-tier ores.|
|**6. Leaderboard**|Global leaderboard displays wallet addresses ranked by total **GLD** balance (polled from the ERC-20 contract).|

---

## 🪙 Economy

### Resources

|Type|Rarity|Spawn Weight|Mining Time|Value (GLD)|
|---|---|---|---|---|
|Coal|Common|70%|2 s|1|
|Iron|Uncommon|25%|4 s|3|
|Diamond|Rare|5%|6 s|10|

### Pickaxes

|Name|Unlock Condition|Mining Speed Modifier|Unlocks|
|---|---|---|---|
|Wooden|Default|×1.0|Coal|
|Iron|100 GLD|×0.7|Iron|
|Diamond|500 GLD|×0.5|Diamond|

> Note: Pickaxes can be stored off-chain for MVP; only mining logic needs to respect the multiplier.

---

## ⚙️ Game Flow

```mermaid
flowchart TD
    A[User logs in via Privy] --> B[Smart Wallet auto-created]
    B --> C[Ore nodes spawn randomly]
    C --> D[Click ore → Mining progress bar starts]
    D --> E[Mining complete → +Ore in inventory]
    E --> F[Player clicks "Sell"]
    F --> G[Game.sol -> mints GLD tokens]
    G --> H[Player balance updated on-chain]
    H --> I[Leaderboard refresh → show rank]
    I --> C
```

---

## 🏗️ Technical Architecture

### Frontend

|Component|Technology|Purpose|
|---|---|---|
|Framework|**React + Vite**|SPA for gameplay|
|Wallet SDK|**Privy React SDK**|Smart wallet login & Paymaster gas sponsorship|
|Game Engine|**Phaser.js 3**|Render dungeon scene, sprite animations & ore nodes|
|State Mgmt|**Zustand / Context**|Track inventory, mining timers|
|Blockchain|**ethers.js / viem**|Interact with contracts (sell, leaderboard)|
|Leaderboard|**Contract polling**|Pull `GoldToken.balanceOf()` every 30s|

**Rendering Choice Rationale:**
- **Phaser.js** chosen over Pixi.js for simpler sprite animation handling
- Built-in support for sprite sheets and frame-based animations
- Easier integration of mining progress animations (6-8 frames per ore)
- Native tweening for smooth progress bars
- Mounts as canvas element in React component

---

### Smart Contracts

#### 1. `GoldToken.sol`

- ERC-20 token (“Gold”, symbol “GLD”)
    
- Mintable only by `Game.sol`
    
- Used for leaderboards and upgrades
    

```solidity
// Simplified interface
function mint(address to, uint256 amount) external;
function balanceOf(address account) external view returns (uint256);
```

#### 2. `Game.sol`

Handles conversion logic when player sells ores.

```solidity
function sellResources(uint256 coal, uint256 iron, uint256 diamond) external {
    uint256 gold = coal*1 + iron*3 + diamond*10;
    GoldToken(GOLD).mint(msg.sender, gold);
    emit Sold(msg.sender, gold);
}
```

---

### Network + Infra

|Layer|Technology|Description|
|---|---|---|
|**Chain**|Ethereum Sepolia|Testnet deployment|
|**Wallet Infra**|Privy Smart Wallets (ERC-4337)|Seamless, gas-sponsored interactions|
|**Bundler/Paymaster**|Privy native|Gas sponsorship|
|**RPC Provider**|Alchemy / Infura|RPC endpoint|
|**Hosting**|Vercel / Netlify|Static frontend deployment|

---

## 🖥️ UI Design (MVP)

### Layout

```
┌──────────────────────────────┐
│ Rockchain                    │
├──────────────┬───────────────┤
│  Mining Area │  Leaderboard  │
│  (Dungeon)   │  Top 10 Wallets│
│               │  GLD Balances  │
├──────────────┴───────────────┤
│ [Sell Resources] [Upgrade]   │
└──────────────────────────────┘
```

### Visual Details

- Background: Hana Caraka cave tileset
    
- Ore nodes: 3–5 visible (coal, iron, diamond sprites)
    
- Cursor: pickaxe icon
    
- Mining: 6-8 frame sprite animation showing ore degradation + progress bar overlay
    
- HUD: small resource counters at top-left
    

---

## 🎨 Visual Assets

**Asset Pack:** [Hana Caraka - Dungeon & Mining](https://otterisk.itch.io/) by Otterisk  
**License:** Commercial use permitted with attribution appreciated

### Assets Used in MVP

|Asset Category|Files|Usage|
|---|---|---|
|**Ore Sprites**|`coal.png`, `iron.png`, `diamond.png`|Each contains 6-8 animation frames showing mining progression|
|**Background**|`Wall - cave.png`|Cave wall tileset for dungeon atmosphere|
|**Ground**|`Ground - normal.png`|Floor tiles for mining area|
|**Props (Optional)**|`torch 1.png`, `torch 2.png`|Ambient torch animation (2 frames)|
|**Props (Optional)**|`chest - basic 1.png`|Visual for "Sell" button or inventory UI|

### Sprite Animation Details

Each ore sprite contains **6-8 frames** in a horizontal sprite sheet:
- **Frame 1:** Intact ore (100% health)
- **Frames 2-6:** Progressive cracking/damage
- **Frame 7-8:** Nearly depleted/shattered

**Implementation:** Phaser.js will play these frames sequentially as the player mines, providing visual feedback before the ore disappears.

### Color Palette

The Hana Caraka pack uses a cohesive dungeon color palette (included as `color palette.png`):
- Earth tones for ground and walls
- Distinct colors for each ore type (gray coal, orange iron, cyan diamond)
- Dark atmospheric background tones

---

## 📊 Leaderboard Logic

- Leaderboard queries `GoldToken.balanceOf(address)` for all players who have sold resources.
    
- Frontend stores a temporary list of addresses seen via `Sold()` events.
    
- Every 30 s → poll balances → sort and display top 10.
    
- Optional: show user’s own rank.
    

---

## 🔐 Privy Integration Flow

1. **Login:**
    
    - Player logs in with email or social (Google, etc.)
        
    - Privy automatically creates embedded smart wallet.
        
2. **Smart Wallet:**
    
    - Contract wallet deployed (ERC-4337 compatible).
        
    - All blockchain interactions go through it (no MetaMask needed).
        
3. **Gas Sponsorship:**
    
    - All transactions use Privy Paymaster → no ETH required.
        
4. **On-Chain Actions:**
    
    - Only one: `sellResources()`
        
    - Upgrades can be local/off-chain.
        

---

## 🧠 Game State Summary

|Variable|Scope|Persistence|Description|
|---|---|---|---|
|`coal`, `iron`, `diamond`|Client|Local only|Incremented as player mines|
|`gold`|On-chain|Persistent|Token balance (GLD)|
|`pickaxeTier`|Client|Local|Multiplier for mining speed|
|`oreNodes[]`|Client|Local|Randomly generated nodes each spawn cycle|

---

## 🔄 Session Flow

1. User logs in → smart wallet created.
    
2. 3–5 ore nodes spawn with randomized types.
    
3. Player clicks ore → progress bar fills → ore added to inventory.
    
4. Player mines more ores, inventory fills.
    
5. Player clicks **Sell** → `sellResources()` called → on-chain GLD minted.
    
6. Leaderboard updates on next poll.
    
7. Repeat infinite mining loop.
    

---

## 🧱 Development Milestones

|Day|Goal|Deliverable|
|---|---|---|
|**Day 1**|Core game loop|Random ore spawning + mining progress + inventory tracking|
|**Day 2**|Smart wallet + blockchain integration|Privy login, sell transaction, GLD token + Game.sol deployment|
|**Day 3**|Leaderboard + polish|On-chain leaderboard, basic UI polish, deploy to Vercel|

---

## 🚀 Stretch Goals (Post-MVP)

- On-chain pickaxe upgrades
    
- Sound effects + simple mining animation
    
- Cosmetic NFTs (rare finds)
    
- Session persistence via IndexedDB
    
- Multi-player chat overlay or guild system
    

---

## 📦 Deliverables

- `frontend/` – React + Vite + Phaser.js + Privy SDK game
    
- `contracts/` – Solidity source for Game + GoldToken
    
- `scripts/deploy/` – Hardhat deploy scripts for Sepolia
    
- `assets/` – Selected sprites from Hana Caraka asset pack (coal, iron, diamond, tilesets)
    
- `docs/DESIGN.md` – this document
    
- `docs/PRD.md` – feature requirements and user stories
    
- `docs/ATTRIBUTION.md` – Asset pack license and credits
    
