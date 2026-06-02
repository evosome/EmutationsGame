import type { EmutationMonster, EmutationRarity } from "./types";
import { EmutationRarity as Rarity } from "./types";
import {
  generateRandomSeed,
  generateMonster,
  calculatePrice,
  formatSeed,
} from "./generator";

/**
 * Pool entry containing a monster and its metadata
 */
export interface PoolEntry {
  seed: string;
  monster: EmutationMonster;
  price: number;
  rarity: EmutationRarity;
}

/**
 * Monster pool configuration
 */
export interface MonsterPoolConfig {
  /** Initial pool size */
  initialSize: number;
  /** Rarity distribution weights - higher value = more common */
  rarityWeights: Record<EmutationRarity, number>;
}

/**
 * Default rarity distribution - exponential decay to make rare monsters extremely rare
 * This creates a distribution where:
 * - Common monsters (0-2) are very frequent
 * - Mid-tier monsters (3-5) are uncommon
 * - Rare monsters (6-8) are very rare
 * - Legendary/Nonexisting (9) are extremely rare
 */
const DEFAULT_RARITY_WEIGHTS: Record<EmutationRarity, number> = {
  [Rarity.STINKY]: 1000, // Most common
  [Rarity.POOR]: 800,
  [Rarity.COMMON]: 600,
  [Rarity.UNCOMMON]: 400,
  [Rarity.CUTY]: 250,
  [Rarity.STRANGE]: 150,
  [Rarity.EPIC]: 80,
  [Rarity.MIND_BLOWING]: 40,
  [Rarity.LEGENDARY]: 15,
  [Rarity.NONEXISTING]: 5, // Extremely rare
};

const DEFAULT_POOL_SIZE = 1000;

/**
 * Monster Pool class - manages a pool of pre-generated monster seeds
 * sorted by price, with rarity-weighted distribution.
 */
class MonsterPool {
  private pool: PoolEntry[] = [];
  private config: MonsterPoolConfig;
  private initialized = false;

  constructor(config?: Partial<MonsterPoolConfig>) {
    this.config = {
      initialSize: config?.initialSize ?? DEFAULT_POOL_SIZE,
      rarityWeights: config?.rarityWeights ?? DEFAULT_RARITY_WEIGHTS,
    };
  }

  /**
   * Initialize the pool with pre-generated monsters
   * Should be called once at game startup
   */
  initialize(): void {
    if (this.initialized) {
      console.warn("MonsterPool already initialized");
      return;
    }

    console.log(
      `Initializing monster pool with ${this.config.initialSize} entries...`,
    );

    // Generate monsters with rarity-weighted distribution
    this.pool = this.generateWeightedPool(this.config.initialSize);

    // Sort by price (ascending)
    this.sortByPrice();

    this.initialized = true;
    this.logPoolStats();
  }

  /**
   * Generate a pool with rarity-weighted distribution
   */
  private generateWeightedPool(size: number): PoolEntry[] {
    const entries: PoolEntry[] = [];
    const totalWeight = Object.values(this.config.rarityWeights).reduce(
      (a, b) => a + b,
      0,
    );

    // Calculate how many monsters of each rarity we need
    const rarityCounts: Record<EmutationRarity, number> = {} as Record<
      EmutationRarity,
      number
    >;
    let remaining = size;

    for (let r = 0; r <= 9; r++) {
      const rarity = r as EmutationRarity;
      const weight = this.config.rarityWeights[rarity] || 0;
      const count = Math.max(1, Math.round((weight / totalWeight) * size));
      rarityCounts[rarity] = Math.min(count, remaining);
      remaining -= rarityCounts[rarity];
    }

    // Distribute any remaining slots to common rarities
    let idx = 0;
    while (remaining > 0 && idx <= 9) {
      rarityCounts[idx as EmutationRarity] =
        (rarityCounts[idx as EmutationRarity] || 0) + 1;
      remaining--;
      idx = (idx + 1) % 10;
    }

    // Generate monsters for each rarity tier
    for (let r = 0; r <= 9; r++) {
      const rarity = r as EmutationRarity;
      const count = rarityCounts[rarity] || 0;

      for (let i = 0; i < count; i++) {
        const entry = this.generateMonsterForRarity(rarity);
        if (entry) {
          entries.push(entry);
        }
      }
    }

    return entries;
  }

  /**
   * Generate a monster seed that matches a target rarity using targeted brute-force
   * This is more efficient than the original approach as it's only used during pool initialization
   */
  private generateMonsterForRarity(
    targetRarity: EmutationRarity,
  ): PoolEntry | null {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    const maxAttempts = 5000;

    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      let seed = "";
      for (let i = 0; i < 12; i++) {
        seed += chars.charAt(Math.floor(Math.random() * chars.length));
      }

      const monster = generateMonster(formatSeed(seed));
      const rarity = monster.rarity;

      // Accept if exact match or within ±1 for edge cases
      if (
        rarity === targetRarity ||
        (attempt > maxAttempts * 0.8 && Math.abs(rarity - targetRarity) <= 1)
      ) {
        const price = calculatePrice(monster.bodyparts);
        return {
          seed,
          monster,
          price,
          rarity,
        };
      }
    }

    // Fallback - generate any monster
    const seed = generateRandomSeed();
    const monster = generateMonster(seed);
    const price = calculatePrice(monster.bodyparts);
    return {
      seed,
      monster,
      price,
      rarity: monster.rarity,
    };
  }

  /**
   * Sort the pool by price (ascending)
   */
  private sortByPrice(): void {
    this.pool.sort((a, b) => a.price - b.price);
  }

  /**
   * Get a monster from the pool based on luck
   * Higher luck = higher index (more expensive/rarer monster)
   * Removes the monster from the pool and adds a new one with similar rarity
   */
  getMonster(luck: number = 0): PoolEntry | null {
    if (this.pool.length === 0) {
      console.warn("Monster pool is empty!");
      return null;
    }

    luck += (Math.random() - 0.25) * 0.45;
    const clampedLuck = Math.max(0, Math.min(1, luck));

    console.log(`Overrandomized luck = ${clampedLuck}`);

    // 2. Рассчитываем веса для каждого монстра в пуле.
    // Так как пул уже отсортирован по цене (дешевые в начале, дорогие в конце),
    // мы можем дать первому (самому дешевому) монстру максимальный вес,
    // а последнему (самому дорогому) — минимальный базовый вес.
    // Формула: вес = (длина пула) - индекс. Для пула в 1000 элементов:
    // Индекс 0 (дешевый)   -> вес 1000
    // Индекс 999 (дорогой) -> вес 1
    let totalWeight = 0;
    const weightedPool = this.pool.map((entry, index) => {
      const baseWeight = entry.price;
      totalWeight += baseWeight;
      return { entry, baseWeight, index };
    });

    // 3. Сдвиг СГЧ (случайная начальная точка на колесе рулетки)
    const rngShift = Math.random() * totalWeight;

    // 4. Сдвиг Удачи. Чем выше удача, тем больше веса обычных монстров мы "пропускаем".
    // При максимальной удаче (1.0) мы срезаем до 85% общего веса в начале пула,
    // гарантированно проталкивая указатель к дорогим монстрам в конец массива.
    const luckShift = clampedLuck * (totalWeight * 1);

    // Итоговое число для обратного отсчета (зациклено через остаток от деления)
    let countdown = luckShift;

    // Переменная для хранения индекса выбранного монстра в оригинальном массиве this.pool
    let targetIndex = this.pool.length - 1;

    // 5. Бежим по пулу весов и ищем точку остановки
    for (const item of weightedPool) {
      countdown -= item.baseWeight;
      if (countdown <= 0) {
        targetIndex = item.index;
        break;
      }
    }

    // 6. Достаем и удаляем монстра по найденному индексу
    const entry = this.pool.splice(targetIndex, 1)[0];

    // 7. Пополняем пул новым монстром схожей редкости
    this.replenishPool(entry.rarity);

    // 8. Сортируем заново
    this.sortByPrice();

    return entry;
  }

  /**
   * Replenish the pool with a new monster of similar rarity (±2)
   */
  private replenishPool(baseRarity: EmutationRarity): void {
    // Determine target rarity (±2, clamped to 0-9)
    const rarityOffset = Math.floor(Math.random() * 5) - 2; // -2 to +2
    let targetRarity = baseRarity + rarityOffset;
    targetRarity = Math.max(0, Math.min(9, targetRarity));

    // Weight toward the original rarity
    if (Math.random() < 0.6) {
      targetRarity = baseRarity;
    }

    const entry = this.generateMonsterForRarity(
      targetRarity as EmutationRarity,
    );
    if (entry) {
      this.pool.push(entry);
    }
  }

  /**
   * Get the current pool size
   */
  getSize(): number {
    return this.pool.length;
  }

  /**
   * Get pool statistics
   */
  getStats(): {
    total: number;
    byRarity: Record<EmutationRarity, number>;
    minPrice: number;
    maxPrice: number;
    avgPrice: number;
  } {
    const byRarity: Record<EmutationRarity, number> = {} as Record<
      EmutationRarity,
      number
    >;
    let minPrice = Infinity;
    let maxPrice = -Infinity;
    let totalPrice = 0;

    for (const entry of this.pool) {
      byRarity[entry.rarity] = (byRarity[entry.rarity] || 0) + 1;
      minPrice = Math.min(minPrice, entry.price);
      maxPrice = Math.max(maxPrice, entry.price);
      totalPrice += entry.price;
    }

    return {
      total: this.pool.length,
      byRarity,
      minPrice: minPrice === Infinity ? 0 : minPrice,
      maxPrice: maxPrice === -Infinity ? 0 : maxPrice,
      avgPrice: this.pool.length > 0 ? totalPrice / this.pool.length : 0,
    };
  }

  /**
   * Log pool statistics to console
   */
  private logPoolStats(): void {
    const stats = this.getStats();
    console.log("=== Monster Pool Stats ===");
    console.log(`Total entries: ${stats.total}`);
    console.log(
      `Price range: $${stats.minPrice.toFixed(2)} - $${stats.maxPrice.toFixed(2)}`,
    );
    console.log(`Average price: $${stats.avgPrice.toFixed(2)}`);
    console.log("Rarity distribution:");
    for (let r = 0; r <= 9; r++) {
      const count = stats.byRarity[r as EmutationRarity] || 0;
      const pct = ((count / stats.total) * 100).toFixed(1);
      const rarityNames = [
        "STINKY",
        "POOR",
        "COMMON",
        "UNCOMMON",
        "CUTY",
        "STRANGE",
        "EPIC",
        "MIND_BLOWING",
        "LEGENDARY",
        "NONEXISTING",
      ];
      console.log(`  ${rarityNames[r]}: ${count} (${pct}%)`);
    }
    console.log("=========================");
  }

  /**
   * Reset and reinitialize the pool
   */
  reset(): void {
    this.pool = [];
    this.initialized = false;
    this.initialize();
  }
}

// Singleton instance
let monsterPoolInstance: MonsterPool | null = null;

/**
 * Get the singleton MonsterPool instance
 */
export function getMonsterPool(): MonsterPool {
  if (!monsterPoolInstance) {
    monsterPoolInstance = new MonsterPool();
    monsterPoolInstance.initialize();
  }
  return monsterPoolInstance;
}

/**
 * Initialize the monster pool (call at game startup)
 */
export function initializeMonsterPool(
  config?: Partial<MonsterPoolConfig>,
): void {
  if (!monsterPoolInstance) {
    monsterPoolInstance = new MonsterPool(config);
  }
  monsterPoolInstance.initialize();
}

/**
 * Get a monster from the pool based on current luck
 * This replaces the brute-force approach in generateRandomSeedWithLuck
 */
export function getMonsterFromPool(
  luck: number = 0,
): { seed: string; monster: EmutationMonster } | null {
  const pool = getMonsterPool();
  const entry = pool.getMonster(luck);

  if (!entry) {
    return null;
  }

  return {
    seed: entry.seed,
    monster: entry.monster,
  };
}

/**
 * Get pool statistics
 */
export function getPoolStats(): ReturnType<MonsterPool["getStats"]> {
  const pool = getMonsterPool();
  return pool.getStats();
}

/**
 * Get current pool size
 */
export function getPoolSize(): number {
  const pool = getMonsterPool();
  return pool.getSize();
}
