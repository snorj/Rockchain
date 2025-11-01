// Game configuration constants

export const ORE_CONFIG = {
  SPAWN_COUNT: { min: 3, max: 5 },
  SPAWN_AREA: { x: 50, y: 50, width: 700, height: 500 },
  RARITY_WEIGHTS: {
    coal: 0.70,    // 70%
    iron: 0.25,    // 25%
    diamond: 0.05  // 5%
  },
  MINING_TIMES: {
    coal: 2000,    // 2 seconds
    iron: 4000,    // 4 seconds
    diamond: 6000  // 6 seconds
  },
  GLD_VALUES: {
    coal: 1,
    iron: 3,
    diamond: 10
  }
} as const;

export type OreType = keyof typeof ORE_CONFIG.RARITY_WEIGHTS;

export const GAME_CONFIG = {
  WIDTH: 800,
  HEIGHT: 600,
  PIXEL_ART: true,
  FPS: 60
} as const;

export const ANIMATION_CONFIG = {
  TORCH_FLICKER_SPEED: 500, // milliseconds per frame
  ORE_FRAME_COUNT: 8
} as const;

