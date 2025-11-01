### Version

**v0.1 – MVP (3-Day Build)**

### Author

**Peter Lonergan**  
University of Sydney  
Built to explore **Privy Smart Wallets (ERC-4337)** and **gasless on-chain gameplay**

---

## 🧭 Project Overview

**Rockchain** is a browser-based pixel-art mining game where players:

- Log in with **Privy Smart Wallets** (no MetaMask required)
    
- Click ores that spawn randomly in a dungeon scene
    
- Mine them over time to collect resources
    
- **Sell** them on-chain to earn **Gold Tokens (GLD)**
    
- Compete globally via an **on-chain leaderboard**
    

The MVP is scoped for a **3-day build**, prioritizing the **core gameplay loop** and **smart wallet integration** over polish or persistence.

---

## 🎯 Goals & Non-Goals

### Goals

- Demonstrate seamless on-chain interaction via **Privy Smart Wallets** and **Paymaster gas sponsorship**
    
- Build a minimal but satisfying **mining game loop**
    
- Display an **on-chain leaderboard** using player GLD balances
    
- Ensure users can play end-to-end **without holding ETH**
    

### Non-Goals (for MVP)

- Persistent inventories or sessions
    
- On-chain pickaxe upgrades
    
- Complex animations, particle effects, or sounds
    
- Real economy or tokenomics beyond basic ERC-20 GLD
    

---

## 🧩 Feature Overview

|Feature|Description|Priority|
|---|---|---|
|**Privy Login**|Email/social login → automatic embedded smart wallet creation|🔥 Must-have|
|**Ore Spawning**|3–5 ore nodes spawn randomly with rarity-based logic|🔥 Must-have|
|**Mining Progress**|Clicking an ore starts a progress bar (time = ore × pickaxe)|🔥 Must-have|
|**Inventory System**|Track local counts of `coal`, `iron`, `diamond`|🔥 Must-have|
|**Sell Action (On-Chain)**|Converts local resources → GLD via Privy smart wallet|🔥 Must-have|
|**GoldToken (ERC-20)**|GLD token minted via Game.sol; used for leaderboard|🔥 Must-have|
|**Leaderboard**|Display top 10 wallets by GLD balance (on-chain data)|🔥 Must-have|
|**Pickaxe Tiers (Local)**|Basic pickaxe upgrades reduce mining time|⚙️ Nice-to-have|
|**Visual Polish**|Pixel dungeon layout, pickaxe cursor, simple UI|⚙️ Nice-to-have|

---

## 🧱 Functional Requirements

### 1. Login & Wallet Creation

**Description:**  
When a new user visits the site, they can log in using email or social login.  
Privy automatically creates an embedded smart wallet for them (ERC-4337 compatible).

**Acceptance Criteria:**

- User can log in without MetaMask or ETH.
    
- Smart wallet address is accessible via `window.privy`.
    
- Gas fees are sponsored (no user ETH balance required).
    

---

### 2. Ore Spawning & Mining

**Description:**  
At all times, 3–5 ores appear on the mining area.  
Each ore has a rarity and mining time. Clicking initiates mining (6-8 frame sprite animation + progress bar).  
Upon completion, the ore is added to the user's **local inventory** and respawns elsewhere.

**Acceptance Criteria:**

- Ores spawn with weighted rarity distribution:
    
    - Coal 70%, Iron 25%, Diamond 5%.
        
- Clicking an ore triggers:
    
    - 6-8 frame sprite animation showing ore cracking/degrading
    - Progress bar overlay proportional to ore difficulty × pickaxe multiplier
        
- Mining completion increments local inventory.
    
- New ore spawns instantly when one is mined at a random location.
    
- Ore sprites use Hana Caraka asset pack frames (coal.png, iron.png, diamond.png).
    

---

### 3. Sell Resources (On-Chain)

**Description:**  
User clicks “Sell” → frontend calls `Game.sellResources(coal, iron, diamond)`  
Smart contract calculates total GLD and mints tokens to the user’s smart wallet.

**Acceptance Criteria:**

- Sell button disabled if inventory = 0.
    
- On sell, game sends transaction through Privy smart wallet (gas sponsored).
    
- Upon success, local inventory resets to 0.
    
- GLD balance updates in wallet and leaderboard.
    
- Emits `Sold(address player, uint256 amount)` event.
    

---

### 4. GoldToken (ERC-20)

**Description:**  
A basic ERC-20 token (GLD) deployed on Ethereum Sepolia.  
Only `Game.sol` can mint GLD via sales.

**Acceptance Criteria:**

- Contract implements ERC-20 standard.
    
- Mint restricted to Game.sol.
    
- `balanceOf(address)` returns player balances correctly.
    
- Token visible in Sepolia explorers.
    

---

### 5. Leaderboard

**Description:**  
Global leaderboard showing top 10 wallet addresses ranked by total GLD balance.  
Refreshed periodically by querying on-chain balances.

**Acceptance Criteria:**

- Leaderboard updates every 30 seconds (polling or event subscription).
    
- Displays top 10 balances (shortened wallet addresses).
    
- Highlights current user if present in leaderboard.
    
- Data read directly from contract (no off-chain DB).
    

---

### 6. Game UI

**Description:**  
Single-screen layout featuring dungeon backdrop, mining area, inventory counters, Sell button, and leaderboard sidebar.

**Acceptance Criteria:**

- Hana Caraka cave wall and ground tilesets used as background atmosphere.
    
- Ores (coal, iron, diamond) displayed as animated sprites in random positions.
    
- Pickaxe cursor appears on hover (optional polish).
    
- 6-8 frame sprite animation plays when mining, with progress bar overlay.
    
- Simple text-based inventory counter showing coal/iron/diamond count.
    
- Leaderboard sidebar displays top 10 wallets with GLD balances.
    
- Optional: Animated torches for ambient atmosphere.
    

---

## 🧠 User Stories

|ID|User Story|Priority|
|---|---|---|
|**US1**|As a player, I want to log in with email or social so I can play without a crypto wallet.|🔥|
|**US2**|As a player, I want ore nodes to appear randomly so I can mine different materials.|🔥|
|**US3**|As a player, I want mining to take time so that higher-tier ores feel rewarding.|🔥|
|**US4**|As a player, I want to sell my ores for GLD tokens so I can see my progress on-chain.|🔥|
|**US5**|As a player, I want to see a leaderboard so I can compare my performance with others.|🔥|
|**US6**|As a player, I want a simple UI so I can focus on the gameplay loop.|⚙️|
|**US7**|As a player, I want to upgrade my pickaxe to mine faster and unlock better ores.|⚙️|

---

## 🔧 Technical Requirements

|Component|Tech Stack|
|---|---|
|**Frontend**|React + Vite + Privy React SDK + Phaser.js 3|
|**State Management**|Zustand or Context|
|**Contracts**|Solidity + Hardhat|
|**Chain**|Ethereum Sepolia|
|**Wallet Infra**|Privy embedded smart wallets (ERC-4337)|
|**Bundler/Paymaster**|Privy gas sponsorship|
|**Leaderboard**|On-chain query of `GoldToken.balanceOf()`|
|**Hosting**|Vercel (static frontend deployment)|
|**Visual Assets**|Hana Caraka - Dungeon & Mining by Otterisk|

**Phaser.js Rationale:**
- Chosen over Pixi.js for superior sprite animation handling
- Built-in support for frame-based animations (essential for mining feedback)
- Easier integration with sprite sheets
- Mounts cleanly in React component
- Maintains focus on Privy integration (browser-native, no game engine complexity)

---

## 🧪 Testing Criteria

|Area|Tests|
|---|---|
|**Login**|Verify wallet creation, session persistence, and gasless flow|
|**Mining**|Verify progress timing accuracy, resource increments, and respawn logic|
|**Selling**|Verify correct conversion rates and on-chain minting|
|**Leaderboard**|Verify live updates, sorting accuracy, and proper wallet formatting|
|**Smart Contracts**|Unit tests for minting, selling, and access control|

---

## 🗓️ Implementation Timeline (3 Days)

|Day|Focus|Deliverables|
|---|---|---|
|**Day 1**|Game loop setup|Ore spawning, mining progress bar, local inventory|
|**Day 2**|Blockchain integration|Privy login, Game.sol + GoldToken.sol deploy, sell flow|
|**Day 3**|Leaderboard + polish|Leaderboard polling, basic UI styling, Vercel deploy|

---

## 🚀 Success Metrics

|Metric|Target|
|---|---|
|End-to-end playability|100% (mine → sell → leaderboard works)|
|Privy wallet creation rate|90% success rate|
|Gasless UX|100% transactions sponsored|
|Leaderboard visibility|Top 10 updates within 30s of sale|
|Smart contract test coverage|≥80%|

---

## 📦 Deliverables

- `/frontend/` — React + Vite + Phaser.js + Privy SDK game
    
- `/contracts/` — `Game.sol` + `GoldToken.sol` (Hardhat project)
    
- `/scripts/deploy/` — Sepolia deploy scripts
    
- `/assets/` — Selected Hana Caraka sprites (coal, iron, diamond, tilesets)
    
- `/docs/DESIGN.md` — design document
    
- `/docs/PRD.md` — this document
    
- `/docs/ATTRIBUTION.md` — Asset pack license and credits (Otterisk)
    

---

## 🧠 Future Considerations (Post-MVP)

- On-chain pickaxe upgrades & inventory
    
- Sound effects and mining animations
    
- Off-chain session persistence via IndexedDB
    
- “Guild” mining (shared wallet pooling)
    
- Mobile-optimized layout
    
