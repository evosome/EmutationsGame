import type { EmutationBodyparts, Emoji } from '$types/index';
import { getEmojiPool } from '$constants/emoji-pools';
import { ALL_BODYPARTS, getBodyPart } from '$types/bodyparts';

/**
 * Calculate the drop chance for a monster by multiplying individual emoji probabilities.
 * Returns the probability as a decimal (0-1).
 */
export function calculateDropChance(bodyparts: EmutationBodyparts): number {
  let probability = 1;
  
  for (const part of ALL_BODYPARTS) {
    const emoji = getBodyPart(bodyparts, part);
    if (!emoji) continue;
    
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji.unicodeSymbol === emoji.unicodeSymbol);
    if (item) {
      const poolTotalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      probability *= item.weight / poolTotalWeight;
    }
  }
  
  return probability;
}