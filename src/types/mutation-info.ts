import type { EmutationMonster } from './monster';

/**
 * Mutation information that includes the monster and luck-related data
 */
export interface MutationInfo {
  /** The monster data */
  monster: EmutationMonster;
  /** The accompanying luck coefficient at the time of mutation */
  accompanyingLuck: number;
  /** The luck drift value */
  luckDrift: number;
}