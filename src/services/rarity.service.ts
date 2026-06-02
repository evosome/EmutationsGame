import { EmutationRarity, type EmutationBodyparts } from '$types/index';
import { EmutationRarity as Rarity } from '$types/index';
import { getEmojiPool } from '$constants/emoji-pools';
import { ALL_BODYPARTS, setBodyPart } from '$types/bodyparts';
import { calculatePrice } from './price.service';

/**
 * Calculate the minimum and maximum possible prices for a monster.
 * Min = all parts have highest weight (most common), Max = all parts have lowest weight (rarest).
 */
function getPriceBounds(): { min: number; max: number } {
  const minBodyparts: EmutationBodyparts = {};
  const maxBodyparts: EmutationBodyparts = {};

  for (const part of ALL_BODYPARTS) {
    const pool = getEmojiPool(part);
    if (pool.length === 0) continue;

    const maxWeightItem = pool.reduce((max, item) => (item.weight > max.weight ? item : max), pool[0]);
    const minWeightItem = pool.reduce((min, item) => (item.weight < min.weight ? item : min), pool[0]);

    setBodyPart(minBodyparts, part, maxWeightItem.emoji);
    setBodyPart(maxBodyparts, part, minWeightItem.emoji);
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