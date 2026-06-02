/**
 * Emutation Rarity levels - determines the rarity of a monster
 */
export enum EmutationRarity {
  STINKY = 0,
  POOR = 1,
  COMMON = 2,
  UNCOMMON = 3,
  CUTY = 4,
  STRANGE = 5,
  EPIC = 6,
  MIND_BLOWING = 7,
  LEGENDARY = 8,
  NONEXISTING = 9,
}

/**
 * Emutation Quality levels - determines the quality of a monster
 */
export enum EmutationQuality {
  HAUNTED = 0,
  BOUGHT = 1,
  INTERESTING = 2,
  GOLDEN = 3,
  BRILLIANT = 4,
  PERFECT = 5,
}

/**
 * Body parts that make up a monster
 */
export interface EmutationBodyparts {
  hat?: string;
  head?: string;
  body?: string;
  leftHand?: string;
  rightHand?: string;
  leftLeg?: string;
  rightLeg?: string;
  /** @internal - Used during generation to store head name */
  _headName?: string;
}

/**
 * Complete monster data structure
 */
export interface EmutationMonster {
  gen: string;
  rarity: EmutationRarity;
  quality: EmutationQuality;
  baseName: string;
  bodyparts: EmutationBodyparts;
}

/**
 * Weighted emoji entry for random selection
 */
export interface WeightedEmoji {
  emoji: string;
  weight: number;
  name?: string; // Optional name for head emojis
}

/**
 * Rarity display information
 */
export interface RarityInfo {
  name: string;
  color: string;
}

/**
 * Quality display information
 */
export interface QualityInfo {
  name: string;
}