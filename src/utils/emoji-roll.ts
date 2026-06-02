import { getEmojiPool } from '$constants/emoji-pools';
import { BASE_EMOJI_PRICE } from '$constants/price';
import { EmutationBodypartsEnum } from '$types/bodyparts';
import type { Emoji } from '$types/emoji';
import { getRarityInfo } from './formatting';

/**
 * Get rarity color for an emoji based on its weight in the pool.
 * Lower weight = rarer = more valuable color.
 */
export function getEmojiRarityColor(part: EmutationBodypartsEnum, emoji: Emoji): string {
  const pool = getEmojiPool(part);
  const item = pool.find((p) => p.emoji.unicodeSymbol === emoji.unicodeSymbol);
  if (!item) return '#ccc';

  const normalizedScore = item.weight / 10;
  if (normalizedScore <= 1) return getRarityInfo(9).color;
  if (normalizedScore <= 1.5) return getRarityInfo(8).color;
  if (normalizedScore <= 2) return getRarityInfo(7).color;
  if (normalizedScore <= 3) return getRarityInfo(6).color;
  if (normalizedScore <= 4) return getRarityInfo(5).color;
  if (normalizedScore <= 5) return getRarityInfo(4).color;
  if (normalizedScore <= 6) return getRarityInfo(3).color;
  if (normalizedScore <= 7) return getRarityInfo(2).color;
  if (normalizedScore <= 8) return getRarityInfo(1).color;
  return getRarityInfo(0).color;
}

/**
 * Calculate drop chance for an emoji in its pool (as a decimal 0-1).
 */
export function getEmojiDropChance(part: EmutationBodypartsEnum, emoji: Emoji): number {
  const pool = getEmojiPool(part);
  const item = pool.find((p) => p.emoji.unicodeSymbol === emoji.unicodeSymbol);
  if (!item) return 0;

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  return item.weight / totalWeight;
}

/**
 * Calculate price for an emoji based on its weight (inverse relationship).
 * Rarer emojis (lower weight) cost more.
 */
export function getEmojiPrice(part: EmutationBodypartsEnum, emoji: Emoji): number {
  const pool = getEmojiPool(part);
  const item = pool.find((p) => p.emoji.unicodeSymbol === emoji.unicodeSymbol);
  if (!item) return 0;

  const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
  const rarityMultiplier = totalWeight / item.weight;
  const emojiPrice = BASE_EMOJI_PRICE * rarityMultiplier;
  return Math.round(emojiPrice * 100) / 100;
}
