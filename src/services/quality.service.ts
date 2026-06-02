import type { EmutationBodyparts, EmutationQuality } from '$types/index';
import { EmutationQuality as Quality } from '$types/index';
import { generate, hashSeed } from '$utils/random';
import { calculateRarity } from './rarity.service';

/**
 * Calculate quality based on monster rarity with a random shift.
 * Higher rarity gives better base quality, but luck can shift it up or down.
 */
export function calculateQuality(bodyparts: EmutationBodyparts, seed: string): EmutationQuality {
  const rng = generate(hashSeed(seed) + 12345);

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