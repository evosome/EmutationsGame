import { writable, get } from 'svelte/store';

export interface PlayerSession {
  generationCount: number;
}

function createPlayerSession() {
  // 1. Сохраняем базовый writable стор в переменную
  const baseStore = writable<PlayerSession>({ generationCount: 0 });
  const { subscribe, set, update } = baseStore;

  return {
    subscribe,
    
    /** Increment the generation count */
    incrementGeneration: () => update((state) => ({ generationCount: state.generationCount + 1 })),
    
    /** Reset the generation count */
    resetGeneration: () => set({ generationCount: 0 }),
    
    /** Get the current generation count synchronously */
    getGenerationCount: () => {
      // Передаем baseStore напрямую в get()
      return get(baseStore).generationCount;
    },
    
    /** Get the current luck multiplier based on generation count */
    getLuckMultiplier: () => {
      // Передаем baseStore напрямую в get()
      const { generationCount } = get(baseStore);
      // Exponential curve: reaches ~0.55 after 100 generations, ~0.8 after 200
      return 1 - Math.exp(-generationCount / 55);
    },
  };
}

export const playerSession = createPlayerSession();

// Экспортируемые функции-хелперы теперь будут работать стабильно:
export function getGenerationCount(): number {
  return playerSession.getGenerationCount();
}

export function getLuckMultiplier(): number {
  return playerSession.getLuckMultiplier();
}

export function incrementGeneration(): void {
  playerSession.incrementGeneration();
}

export function resetGeneration(): void {
  playerSession.resetGeneration();
}
