# Rockchain - Documentation Index

**Project:** Rockchain  
**Author:** Peter Lonergan (University of Sydney)  
**Purpose:** Demonstrate Privy Smart Wallets (ERC-4337) and gasless blockchain gaming  
**Last Updated:** November 1, 2025

---

## 📚 Documentation Overview

This folder contains all design documents, requirements, and guides for building Rockchain - a browser-based mining game with seamless blockchain integration.

---

## 🗂️ Document Structure

### **Core Design Documents**

| Document | Purpose | Audience |
|----------|---------|----------|
| [Rockchain Design Document (MVP).md](Rockchain%20Design%20Document%20(MVP).md) | High-level technical architecture and game design | All team members |
| [Rockchain Product Requirements Document (MVP).md](Rockchain%20Product%20Requirements%20Document%20(MVP).md) | Detailed feature specifications and acceptance criteria | All team members |

### **Development PRDs (Parallel Sprints)**

| Document | Sprint | Purpose | Team |
|----------|--------|---------|------|
| [PRD-1-Game-Development.md](PRD-1-Game-Development.md) | Day 1 | Complete game loop, Phaser.js, UI components | Frontend/Game |
| [PRD-2-Blockchain-Integration.md](PRD-2-Blockchain-Integration.md) | Day 2 | Smart contracts, Privy, transactions, leaderboard | Web3/Blockchain |

### **Integration & Setup**

| Document | Purpose |
|----------|---------|
| [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md) | Step-by-step guide to merge game + blockchain layers |
| [ATTRIBUTION.md](ATTRIBUTION.md) | Asset pack license and credits |
| [UPDATE_SUMMARY.md](UPDATE_SUMMARY.md) | Change log for documentation updates |

---

## 🚀 Quick Start Guide

### For Game Developers (Day 1)

1. Read: [PRD-1-Game-Development.md](PRD-1-Game-Development.md)
2. Focus: Build complete game loop with mock blockchain calls
3. Deliverables:
   - Working Phaser.js game
   - Ore spawning + mining
   - Inventory management
   - Mock "Sell" button

**Tech Stack:** React + Vite + Phaser.js + Zustand

### For Blockchain Developers (Day 2)

1. Read: [PRD-2-Blockchain-Integration.md](PRD-2-Blockchain-Integration.md)
2. Focus: Smart contracts + Privy integration
3. Deliverables:
   - GoldToken + Game contracts deployed
   - Privy wallet integration
   - Transaction handling
   - Leaderboard queries

**Tech Stack:** Solidity + Hardhat + Privy + viem

### For Integration (Day 3)

1. Read: [INTEGRATION_GUIDE.md](INTEGRATION_GUIDE.md)
2. Follow step-by-step integration checklist
3. Test end-to-end flow
4. Deploy to Vercel

---

## 🎯 Project Goals

### Primary Goal
Demonstrate **gasless on-chain UX** using Privy Smart Wallets where players:
- Login without MetaMask
- Play a satisfying mining game
- Earn on-chain tokens ($0 gas cost)
- Compete on global leaderboard

### Technical Goals
- ✅ Account Abstraction (ERC-4337)
- ✅ Gas sponsorship (Paymaster)
- ✅ Seamless web3 UX
- ✅ Clean separation of concerns (game vs blockchain)

### Non-Goals (MVP)
- ❌ Complex game mechanics
- ❌ Persistent sessions
- ❌ Multiple ore types (just 3)
- ❌ On-chain upgrades
- ❌ NFTs or advanced tokenomics

---

## 📋 MVP Feature Summary

### Game Features
- **Ore Spawning:** 3-5 ores appear randomly (Coal, Iron, Diamond)
- **Mining:** Click ore → 6-8 frame animation → collect
- **Inventory:** Track local ore counts
- **Sell:** Convert ores to on-chain GLD tokens

### Blockchain Features
- **Smart Wallets:** Auto-created via Privy (email/social login)
- **GLD Token:** ERC-20 token minted from mining
- **Game Contract:** Converts ores → GLD at fixed rates
- **Leaderboard:** On-chain rankings by GLD balance

### UX Features
- **Gasless:** All transactions sponsored (Paymaster)
- **No MetaMask:** Embedded wallets via Privy
- **Instant Login:** Email or social auth
- **Real-time Updates:** Inventory, balance, leaderboard

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         ROCKCHAIN                            │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────────────────────┐      ┌──────────────────────┐    │
│  │    GAME LAYER        │      │   BLOCKCHAIN LAYER   │    │
│  │                      │      │                      │    │
│  │  • Phaser.js Engine  │◄────►│  • Privy Wallets     │    │
│  │  • Ore Spawning      │      │  • Smart Contracts   │    │
│  │  • Mining Animations │      │  • Transactions      │    │
│  │  • UI Components     │      │  • Leaderboard       │    │
│  │  • Zustand Store     │      │  • viem/ethers       │    │
│  │                      │      │                      │    │
│  └──────────────────────┘      └──────────────────────┘    │
│            │                              │                 │
│            └──────────────────────────────┘                 │
│                        │                                    │
│                  Integration Points:                        │
│                  • Game Store Interface                     │
│                  • Sell Button Hook                         │
│                  • Leaderboard Data                         │
│                                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
              ┌─────────────────────────┐
              │   ETHEREUM SEPOLIA      │
              │                         │
              │  • GoldToken (ERC-20)   │
              │  • Game Contract        │
              │  • Privy Paymaster      │
              └─────────────────────────┘
```

---

## 🔄 Development Workflow

### Phase 1: Parallel Development (Days 1-2)

**Game Team:**
```bash
git checkout -b feature/game-layer
# Implement PRD-1
# Commit when complete
```

**Blockchain Team:**
```bash
git checkout -b feature/blockchain-layer
# Implement PRD-2
# Commit when complete
```

### Phase 2: Integration (Day 3)

```bash
git checkout main
git merge feature/game-layer
git merge feature/blockchain-layer
# Follow INTEGRATION_GUIDE.md
# Test end-to-end
# Deploy
```

---

## 📦 Expected Deliverables

### By End of Day 1
- [ ] Working game in browser (`localhost:5173`)
- [ ] All game mechanics functional
- [ ] Mock sell button works
- [ ] Clean console (no errors)

### By End of Day 2
- [ ] Smart contracts deployed to Sepolia
- [ ] Privy integration complete
- [ ] Real transactions working
- [ ] Leaderboard queries blockchain

### By End of Day 3
- [ ] Integrated application deployed
- [ ] All features working end-to-end
- [ ] Documentation complete
- [ ] Demo ready

---

## 🧪 Testing Strategy

### Game Layer Testing (Day 1)
- Manual gameplay testing
- Inventory tracking verification
- Animation playback checks
- Performance monitoring (60 FPS)

### Blockchain Layer Testing (Day 2)
- Smart contract unit tests (Hardhat)
- Privy authentication flow
- Transaction sending/confirmation
- Leaderboard data accuracy

### Integration Testing (Day 3)
- End-to-end user flow
- Cross-browser testing
- Mobile responsiveness (optional)
- Gas sponsorship verification

---

## 🔧 Technology Stack

### Frontend
- **Framework:** React 18 + TypeScript
- **Build Tool:** Vite
- **Game Engine:** Phaser.js 3
- **State Management:** Zustand
- **Styling:** Tailwind CSS + CSS Modules
- **Web3:** viem + @privy-io/react-auth

### Blockchain
- **Smart Contracts:** Solidity 0.8.20+
- **Development:** Hardhat
- **Testing:** Hardhat + Chai
- **Network:** Ethereum Sepolia
- **Wallet SDK:** Privy (ERC-4337)
- **Gas Sponsorship:** Privy Paymaster

### Visual Assets
- **Pack:** Hana Caraka - Dungeon & Mining by Otterisk
- **Style:** Pixel art (16x16, 32x32 tiles)
- **License:** Commercial use permitted

---

## 📚 Additional Resources

### External Links
- [Privy Documentation](https://docs.privy.io/)
- [Phaser.js Docs](https://photonstorm.github.io/phaser3-docs/)
- [Hardhat Guide](https://hardhat.org/)
- [Viem Documentation](https://viem.sh/)
- [Sepolia Faucet](https://sepoliafaucet.com/)

### Asset Credits
- **Hana Caraka Pack:** [Otterisk on itch.io](https://otterisk.itch.io/)
- **Attribution:** See [ATTRIBUTION.md](ATTRIBUTION.md)

---

## 🎓 Learning Objectives

By completing this project, you'll learn:

1. **Account Abstraction (ERC-4337)**
   - How smart wallets work
   - Gasless transaction patterns
   - Paymaster integration

2. **Game Development**
   - Phaser.js game engine
   - Sprite animations
   - State management

3. **Smart Contract Design**
   - ERC-20 token standards
   - Access control patterns
   - Gas optimization

4. **Integration Patterns**
   - Separating concerns
   - Clear interfaces
   - Parallel development

---

## 🚨 Important Notes

### Timeline
- **MVP Timeline:** 3 days (focused development)
- **Sprint 1 (Game):** 8-9 hours
- **Sprint 2 (Blockchain):** 8 hours
- **Sprint 3 (Integration):** 6 hours

### Scope Management
- Keep features minimal (only what's in PRDs)
- No feature creep during MVP
- Document "nice-to-have" for v2
- Focus on Privy integration quality

### Common Pitfalls
- ⚠️ Don't build complex game mechanics first
- ⚠️ Don't skip integration testing
- ⚠️ Don't forget environment variables
- ⚠️ Don't deploy without verifying contracts

---

## ✅ Success Criteria

Project is successful when:

- [ ] User can login without MetaMask
- [ ] User can mine ores (satisfying gameplay)
- [ ] User can sell ores (gasless transaction)
- [ ] User earns on-chain GLD tokens
- [ ] User appears on global leaderboard
- [ ] All interactions cost $0 gas
- [ ] Application is deployed and accessible
- [ ] Code is documented and maintainable

---

## 📞 Support & Questions

If you need clarification:

1. Check the relevant PRD first
2. Review integration guide
3. Check external documentation
4. Consult with team lead

---

## 🎉 Post-MVP

After completing the MVP, consider:

- **V2 Features:** More ore types, on-chain upgrades, NFTs
- **Polish:** Sound effects, better animations, particles
- **Expansion:** Multi-player features, guilds, quests
- **Mobile:** Responsive design, touch controls
- **Marketing:** Demo video, social media, showcase

---

**Good luck building Rockchain! ⛏️💎**

*Last updated: November 1, 2025*

