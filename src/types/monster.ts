import type { EmutationRarity } from './rarity';
import type { EmutationQuality } from './quality';
import type { EmutationBodyparts } from './bodyparts';

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