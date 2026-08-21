import type { EmutationMonster, Emoji, EmutationBodyparts } from '$types/index';
import { ALL_BODYPARTS, setBodyPart } from '$types/bodyparts';
import { getEmojiPool } from '$constants/emoji-pools';
import { generate, hashSeed } from '$utils/random';
import { calculateRarity } from './rarity.service';
import { calculateQuality } from './quality.service';

const MONSTER_NAME_PLACEHOLDER = 'monster';

/**
 * Select a random emoji from a weighted pool using a seeded RNG
 */
function selectWeightedEmoji(
  pool: { emoji: Emoji; weight: number }[],
  rng: () => number,
): Emoji {
  const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
  let random = (rng() + 0.25) * totalWeight;

  for (const item of pool) {
    random -= item.weight;
    if (random <= 0) {
      return item.emoji;
    }
  }

  // Fallback to last item
  return pool[pool.length - 1].emoji;
}

/**
 * Generate a complete monster from a seed string.
 * The same seed will always produce the same monster (deterministic).
 */
export function generateMonster(seed: string): EmutationMonster {
  const rng = generate(hashSeed(seed));
  const bodyparts: EmutationBodyparts = {};

  // Generate each body part using weighted random selection
  for (const part of ALL_BODYPARTS) {
    const pool = getEmojiPool(part);
    if (pool.length === 0) continue;

    const emoji = selectWeightedEmoji(pool, rng);
    setBodyPart(bodyparts, part, emoji);
  }

  // Base name comes from the head emoji's name
  const headEmoji = bodyparts.head;
  const baseName = headEmoji?.name || MONSTER_NAME_PLACEHOLDER;

  return {
    gen: seed,
    rarity: calculateRarity(bodyparts),
    quality: calculateQuality(bodyparts, seed),
    baseName,
    bodyparts,
  };
}
