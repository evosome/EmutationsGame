import type { EmutationBodyparts, EmutationMonster, EmutationRarity, EmutationQuality } from './types';
import { EmutationRarity as Rarity, EmutationQuality as Quality } from './types';
import { getMonsterFromPool, initializeMonsterPool, getPoolStats } from './monster-pool';
import {
  playerSession,
  getGenerationCount as getSessionGenerationCount,
  getLuckMultiplier as getSessionLuckMultiplier,
  incrementGeneration as sessionIncrementGeneration,
  resetGeneration as sessionResetGeneration,
} from './session-store';
import {
  HEAD_EMOJIS,
  getEmojiPool,
  ROLL_ORDER,
} from './emoji-pools';

/**
 * Luck system: increases with each generation, making rare emojis more likely.
 * Uses the Svelte session store for reactive state management.
 */

/**
 * Increment the luck/generation count
 */
export function incrementLuck(): void {
  sessionIncrementGeneration();
}

/**
 * Reset the luck/generation count
 */
export function resetLuck(): void {
  sessionResetGeneration();
}

/**
 * Get the current generation count
 */
export function getGenerationCount(): number {
  return getSessionGenerationCount();
}

/**
 * Get the current luck multiplier (0 to ~0.9).
 * Reaches ~0.55 after 100 generations, ~0.8 after 200.
 * Tuned for ~20 minutes of play (~150-200 gens with animation).
 */
export function getLuckMultiplier(): number {
  return getSessionLuckMultiplier();
}

/**
 * Get the player session store for Svelte reactivity
 * Components can subscribe to this store to get reactive updates
 */
export { playerSession };

/**
 * Get the current generation count (for Svelte reactivity in $derived)
 * Returns the current generation count which triggers re-evaluation when changed
 */
export function getSessionVersion(): number {
  return getSessionGenerationCount();
}

/**
 * Simple seeded random number generator (Mulberry32)
 */
function mulberry32(seed: number) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Convert a string seed to a numeric hash
 */
function hashSeed(seed: string): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    const char = seed.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return Math.abs(hash);
}

/**
 * Format a seed string to XXX-XXX-XXX-XXX format
 */
export function formatSeed(seed: string): string {
  const cleaned = seed.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
  const parts: string[] = [];
  for (let i = 0; i < cleaned.length; i += 3) {
    parts.push(cleaned.substring(i, i + 3));
  }
  return parts.join('-').substring(0, 15); // Max 15 chars (XXX-XXX-XXX-XXX)
}

/**
 * Generate a random seed
 */
export function generateRandomSeed(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let seed = '';
  for (let i = 0; i < 12; i++) {
    seed += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return formatSeed(seed);
}

/**
 * Generates a seed biased by current luck using the pre-generated monster pool.
 * This is much more efficient than brute-force as it uses a pool of pre-generated monsters
 * with rarity-weighted distribution.
 */
export function generateRandomSeedWithLuck(): string {
  const luck = getLuckMultiplier(); // 0 to ~0.9

  // Use the pool-based approach - O(1) instead of brute-force
  const result = getMonsterFromPool(luck);
  
  if (result) {
    const { seed, monster } = result;
    console.log(`Luck = ${luck.toFixed(2)}. Seed = ${seed}. Pool pick: ${monster.bodyparts.head} with rarity ${monster.rarity}, price $${calculatePrice(monster.bodyparts).toFixed(2)}`);
    return formatSeed(seed);
  }

  // Fallback if pool fails (shouldn't happen)
  console.warn('Monster pool failed, falling back to random seed');
  return generateRandomSeed();
}

/**
 * Initialize the monster pool at game startup.
 * Call this once when the game starts to pre-generate monsters.
 */
export function initMonsterPool(): void {
  initializeMonsterPool();
  const stats = getPoolStats();
  console.log(`Monster pool initialized with ${stats.total} monsters`);
}

/**
 * Select a random emoji from a weighted pool using seeded RNG.
 */
function selectWeightedEmoji(
  pool: { emoji: string; weight: number }[],
  rng: () => number
): string {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

  const rnd = rng() + 0.25;
  let random = rnd * totalWeight;

  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return item.emoji;
    }
  }

  return pool[pool.length - 1].emoji;
}

/**
 * Select a random emoji with name from a weighted pool using seeded RNG.
 */
function selectWeightedEmojiWithName(
  pool: { emoji: string; weight: number; name?: string }[],
  rng: () => number
): { emoji: string; name?: string } {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);

  const rnd = rng() + 0.25;
  let random = rnd * totalWeight;

  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      // @ts-ignore
      return { emoji: item.emoji, name: item.name };
    }
  }

  return {
    emoji: pool[pool.length - 1].emoji,
    // @ts-ignore
    name: pool[pool.length - 1].name,
  };
}

/**
 * Generate bodyparts for a monster using a seeded RNG.
 * Fully deterministic: the same seed always produces the same monster.
 */
export function generateBodyparts(seed: string): EmutationBodyparts {
  const rng = mulberry32(hashSeed(seed));
  const bodyparts: EmutationBodyparts = {};

  for (const part of ROLL_ORDER) {
    const pool = getEmojiPool(part);
    if (part === 'head') {
      const result = selectWeightedEmojiWithName(HEAD_EMOJIS, rng);
      bodyparts.head = result.emoji;
      bodyparts._headName = result.name;
    } else {
      bodyparts[part] = selectWeightedEmoji(pool, rng);
    }
  }

  return bodyparts;
}

/**
 * Calculate the minimum and maximum possible prices for a monster.
 * Min = all parts have highest weight (most common), Max = all parts have lowest weight (rarest).
 */
function getPriceBounds(): { min: number; max: number } {
  const minBodyparts: EmutationBodyparts = {};
  const maxBodyparts: EmutationBodyparts = {};

  for (const part of ROLL_ORDER) {
    const pool = getEmojiPool(part);
    if (pool.length === 0) continue;

    const maxWeightItem = pool.reduce((max, item) => (item.weight > max.weight ? item : max), pool[0]);
    const minWeightItem = pool.reduce((min, item) => (item.weight < min.weight ? item : min), pool[0]);

    (minBodyparts as any)[part] = maxWeightItem.emoji;
    (maxBodyparts as any)[part] = minWeightItem.emoji;
  }

  return {
    min: calculatePrice(minBodyparts),
    max: calculatePrice(maxBodyparts),
  };
}

/**
 * Calculate rarity based on the total price of all bodyparts.
 * The price range [min, max] is divided into equal tiers matching rarity levels.
 * Higher price = rarer monster.
 */
export function calculateRarity(bodyparts: EmutationBodyparts): EmutationRarity {
  const price = calculatePrice(bodyparts);
  let { min, max } = getPriceBounds();

  // Avoid division by zero
  if (max <= min) return Rarity.COMMON;

  // Normalize price to 0-1 range and map to 10 rarity tiers
  const normalized = (price - min) / (max - min);
  const tier = Math.floor(normalized * 10);

  // Clamp to valid rarity range [0, 9]
  const clampedTier = Math.max(0, Math.min(9, tier));

  return clampedTier as EmutationRarity;
}

/**
 * Calculate quality based on monster rarity with a random shift.
 * Higher rarity gives better base quality, but luck can shift it up or down.
 */
export function calculateQuality(bodyparts: EmutationBodyparts, seed: string): EmutationQuality {
  const rng = mulberry32(hashSeed(seed) + 12345);

  // Base quality on rarity with a random shift
  const rarity = calculateRarity(bodyparts);
  const rarityValue = rarity; // 0–9

  // Normalize rarity (0–9) to quality range (0–5)
  const baseQualityScore = (rarityValue / 9) * 5;

  // Add random shift: +/- 1.5 tiers
  const randomShift = (rng() - 0.5) * 3.0; // -1.5 to +1.5

  const finalScore = Math.max(0, Math.min(5, baseQualityScore + randomShift));

  if (finalScore >= 5) return Quality.PERFECT;
  if (finalScore >= 4) return Quality.BRILLIANT;
  if (finalScore >= 3) return Quality.GOLDEN;
  if (finalScore >= 2) return Quality.INTERESTING;
  if (finalScore >= 1) return Quality.BOUGHT;
  return Quality.HAUNTED;
}

/**
 * Get rarity display information
 */
export function getRarityInfo(rarity: EmutationRarity): { name: string; color: string } {
  const rarityInfo: Record<number, { name: string; color: string }> = {
    [Rarity.STINKY]: { name: 'вонючий', color: '#8B7355' },
    [Rarity.POOR]: { name: 'дешевый', color: '#9E9E9E' },
    [Rarity.COMMON]: { name: 'непримечательный', color: '#757575' },
    [Rarity.UNCOMMON]: { name: 'необычный', color: '#98cc9a' },
    [Rarity.CUTY]: { name: 'милый', color: '#FF69B4' },
    [Rarity.STRANGE]: { name: 'странный', color: '#fc5dfc' },
    [Rarity.EPIC]: { name: 'невероятный', color: '#ad21c0' },
    [Rarity.MIND_BLOWING]: { name: 'умопомрачительный', color: '#E91E63' },
    [Rarity.LEGENDARY]: { name: 'легендарнейший', color: '#e4c40f' },
    [Rarity.NONEXISTING]: { name: 'невообразимый', color: '#ffe261' },
  };

  return rarityInfo[rarity] || rarityInfo[Rarity.COMMON];
}

/**
 * Get quality display information
 */
export function getQualityInfo(quality: EmutationQuality): { name: string } {
  const qualityInfo: Record<number, { name: string }> = {
    [Quality.HAUNTED]: { name: 'без ценности' },
    [Quality.BOUGHT]: { name: 'из магазина' },
    [Quality.INTERESTING]: { name: 'с особенностями' },
    [Quality.GOLDEN]: { name: 'с позолотой' },
    [Quality.BRILLIANT]: { name: 'из драгоценностей' },
    [Quality.PERFECT]: { name: 'высшей пробы' },
  };

  return qualityInfo[quality] || qualityInfo[Quality.INTERESTING];
}

/**
 * Generate a complete monster from a seed
 */
export function generateMonster(seed: string): EmutationMonster {
  const bodyparts = generateBodyparts(seed);
  const rarity = calculateRarity(bodyparts);
  const quality = calculateQuality(bodyparts, seed);

  // Get base name from head emoji
  const headName = (bodyparts as any)._headName || 'неизвестно';

  // Clean up internal property
  delete (bodyparts as any)._headName;

  return {
    gen: seed,
    rarity,
    quality,
    baseName: headName,
    bodyparts,
  };
}

/**
 * Calculate the drop chance for a monster by multiplying individual emoji probabilities.
 * Returns the probability as a decimal (0-1).
 */
export function calculateDropChance(bodyparts: EmutationBodyparts): number {
  const parts = Object.entries(bodyparts).filter(([key]) => key !== '_headName');
  
  let probability = 1;
  
  for (const [part, emoji] of parts) {
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji === emoji);
    if (item) {
      const poolTotalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      probability *= item.weight / poolTotalWeight;
    }
  }
  
  return probability;
}

/**
 * Format drop chance as a readable string with percentage.
 */
export function formatDropChance(chance: number): string {
  const percentage = chance * 100;
  if (percentage >= 1) {
    return `${percentage.toFixed(2)}%`;
  } else if (percentage >= 0.01) {
    return `${percentage.toFixed(4)}%`;
  } else if (percentage >= 0.0001) {
    return `${percentage.toFixed(6)}%`;
  } else {
    return `~0.00000${(percentage * 100).toFixed(2).replace('0.', '')}%`;
  }
}

/**
 * Calculate the price of a monster by summing individual emoji prices.
 * Each emoji's price is based on its rarity (inverse of weight).
 * Rarer emojis are more expensive.
 */
export function calculatePrice(bodyparts: EmutationBodyparts): number {
  const parts = Object.entries(bodyparts).filter(([key]) => key !== '_headName');
  
  let totalPrice = 0;
  const baseEmojiPrice = 0.01;
  
  for (const [part, emoji] of parts) {
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji === emoji);
    if (item) {
      const poolTotalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      // Price is proportional to rarity: totalWeight / weight
      // Common (weight ~90) -> ~$0.10–$0.30, Rare (weight ~1) -> ~$3–$30
      const rarityMultiplier = poolTotalWeight / item.weight;
      const emojiPrice = baseEmojiPrice * rarityMultiplier;
      totalPrice += emojiPrice;
    }
  }
  
  return Math.round(totalPrice * 100) / 100;
}

/**
 * Format price as a readable string with $ symbol
 */
export function formatPrice(price: number): string {
  return `$${price.toFixed(2)}`;
}

/**
 * Generate monster name from rarity, base name, and quality
 */
export function generateMonsterName(monster: EmutationMonster): string {
  const rarityInfo = getRarityInfo(monster.rarity);
  const qualityInfo = getQualityInfo(monster.quality);

  return `${rarityInfo.name} ${monster.baseName} ${qualityInfo.name}`;
}
