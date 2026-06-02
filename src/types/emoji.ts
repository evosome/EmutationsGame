/**
 * Basic emoji representation
 */
export interface Emoji {
  unicodeSymbol: string;
  name?: string;
}

/**
 * Weighted emoji entry for random selection
 */
export interface WeightedEmoji {
  emoji: Emoji;
  weight: number;
}
