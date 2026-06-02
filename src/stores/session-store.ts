import { writable, get } from 'svelte/store';

/**
 * Player session interface
 * Contains all session-related state for the player
 */
export interface PlayerSession {
  /** Number of monsters generated in this session */
  generationCount: number;
}

/**
 * Create the player session store using Svelte's writable store
 */
function createPlayerSession() {
  const { subscribe, set, update } = writable<PlayerSession>({ generationCount: 0 });

  return {
    subscribe,
    
    /** Increment the generation count */
    incrementGeneration: () => update((state) => ({ generationCount: state.generationCount + 1 })),
    
    /** Reset the generation count */
    resetGeneration: () => set({ generationCount: 0 }),
    
    /** Get the current generation count synchronously */
    getGenerationCount: () => get({ subscribe }).generationCount,
    
    /** Get the current luck multiplier based on generation count */
    getLuckMultiplier: () => {
      const { generationCount } = get({ subscribe });
      // Exponential curve: reaches ~0.55 after 100 generations, ~0.8 after 200
      // Tuned for ~20 minutes of play (~150-200 gens with animation)
      return 1 - Math.exp(-generationCount / 55);
    },
  };
}

/**
 * The player session store
 * Subscribe to this store in Svelte components to get reactive updates
 */
export const playerSession = createPlayerSession();

/**
 * Get the current generation count (for non-reactive usage)
 */
export function getGenerationCount(): number {
  return playerSession.getGenerationCount();
}

/**
 * Get the current luck multiplier (for non-reactive usage)
 */
export function getLuckMultiplier(): number {
  return playerSession.getLuckMultiplier();
}

/**
 * Increment the generation count (for non-reactive usage)
 */
export function incrementGeneration(): void {
  playerSession.incrementGeneration();
}

/**
 * Reset the generation count (for non-reactive usage)
 */
export function resetGeneration(): void {
  playerSession.resetGeneration();
}