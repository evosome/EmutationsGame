import type { EmutationBodyparts } from '$types/index';
import { getEmojiPool } from '$constants/emoji-pools';
import { ALL_BODYPARTS, getBodyPart } from '$types/bodyparts';
import { BASE_EMOJI_PRICE } from '$constants/price';

/**
 * Calculate the price of a monster by summing individual emoji prices.
 * Each emoji's price is based on its rarity (inverse of weight).
 * Rarer emojis are more expensive.
 */
export function calculatePrice(bodyparts: EmutationBodyparts): number {
  let totalPrice = 0;
  
  for (const part of ALL_BODYPARTS) {
    const emoji = getBodyPart(bodyparts, part);
    if (!emoji) continue;
    
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji.unicodeSymbol === emoji.unicodeSymbol);
    if (item) {
      const poolTotalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
      // Price is proportional to rarity: totalWeight / weight
      // Common (weight ~90) -> ~$0.10–$0.30, Rare (weight ~1) -> ~$3–$30
      const rarityMultiplier = poolTotalWeight / item.weight;
      const emojiPrice = BASE_EMOJI_PRICE * rarityMultiplier;
      totalPrice += emojiPrice;
    }
  }
  
  return Math.round(totalPrice * 100) / 100;
}