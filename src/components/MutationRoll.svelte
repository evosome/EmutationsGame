<script lang="ts">
  import type { EmutationBodyparts } from '$lib/types';
  import { getEmojiPool, ROLL_ORDER } from '$lib/emoji-pools';
  import { getRarityInfo } from '$lib/generator';

  interface MutationRollProps {
    bodyparts: EmutationBodyparts;
    isRolling: boolean;
    onSlotComplete?: (index: number) => void;
    onRollComplete?: () => void;
  }

  let { bodyparts = {}, isRolling = false, onSlotComplete, onRollComplete }: MutationRollProps = $props();

  // Labels for each roll position
  const rollLabels = ['Голова', 'Тело', 'Левая рука', 'Правая рука', 'Левая нога', 'Правая нога', 'Шапка'];

  // Track which slots have been completed (emoji + rarity color + drop chance + price)
  let completedSlots = $state<Record<string, { emoji: string; color: string; chance: number; price: number }>>({});
  let currentRollIndex = $state(0);
  let rollingEmoji = $state('');
  let rollAnimationInterval: number | null = null;
  let isAnimating = $state(false);

  /**
   * Get rarity color for an emoji based on its weight.
   * Lower weight = rarer = more valuable color.
   */
  function getEmojiRarityColor(part: string, emoji: string): string {
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji === emoji);
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
   * Calculate drop chance percentage for an emoji in its pool.
   */
  function getEmojiDropChance(part: string, emoji: string): number {
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji === emoji);
    if (!item) return 0;

    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    return (item.weight / totalWeight) * 100;
  }

  /**
   * Format drop chance as a readable string.
   */
  function formatChance(chance: number): string {
    if (chance >= 1) {
      return `${chance.toFixed(1)}%`;
    } else if (chance >= 0.1) {
      return `${chance.toFixed(2)}%`;
    } else if (chance >= 0.01) {
      return `${chance.toFixed(3)}%`;
    } else {
      return `<0.01%`;
    }
  }

  /**
   * Calculate price for an emoji based on its weight (inverse relationship).
   * Rarer emojis (lower weight) cost more.
   */
  function getEmojiPrice(part: string, emoji: string): number {
    const pool = getEmojiPool(part);
    const item = pool.find((p) => p.emoji === emoji);
    if (!item) return 0;

    const totalWeight = pool.reduce((sum, p) => sum + p.weight, 0);
    const maxWeight = 100; // Maximum possible weight
    const baseEmojiPrice = 0.01;
    const emojiPrice = (maxWeight / (item.weight / totalWeight) / 100) * baseEmojiPrice; // Base price per emoji
    return Math.round(emojiPrice * 100) / 100;
  }

  /**
   * Format price as a readable string.
   */
  function formatPrice(price: number): string {
    return `$${price.toFixed(2)}`;
  }

  // Watch for isRolling changes to start/stop animation
  $effect(() => {
    if (isRolling && !isAnimating) {
      // Reset state when rolling starts
      completedSlots = {};
      currentRollIndex = 0;
      isAnimating = true;
      startRollAnimation();
    } else if (!isRolling && isAnimating) {
      // Stop animation when not rolling
      stopAnimation();
      isAnimating = false;
    }
  });

  async function startRollAnimation() {
    // Animate each roll position
    for (let i = 0; i < ROLL_ORDER.length; i++) {
      if (!isRolling) break;

      currentRollIndex = i;
      const part = ROLL_ORDER[i];
      const pool = getEmojiPool(part);
      const finalEmoji = (bodyparts as any)[part] || '';

      // Animate random emojis for a short time
      await animateRoll(pool, finalEmoji, 500);

      if (!isRolling) break;

      // Set the final emoji with rarity color, drop chance, and price
      const rarityColor = getEmojiRarityColor(part, finalEmoji);
      const dropChance = getEmojiDropChance(part, finalEmoji);
      const emojiPrice = getEmojiPrice(part, finalEmoji);
      completedSlots = { ...completedSlots, [part]: { emoji: finalEmoji, color: rarityColor, chance: dropChance, price: emojiPrice } };

      // Emit slot complete event via callback
      onSlotComplete?.(i);
    }

    if (isRolling) {
      currentRollIndex = ROLL_ORDER.length;
      onRollComplete?.();
    }
  }

  function stopAnimation() {
    if (rollAnimationInterval) {
      clearInterval(rollAnimationInterval);
      rollAnimationInterval = null;
    }
  }

  // Animate rolling emojis
  function animateRoll(pool: { emoji: string }[], finalEmoji: string, duration: number): Promise<void> {
    return new Promise((resolve) => {
      const startTime = Date.now();
      const intervalTime = 80; // ms between emoji changes

      rollAnimationInterval = window.setInterval(() => {
        const elapsed = Date.now() - startTime;
        if (elapsed >= duration) {
          clearInterval(rollAnimationInterval!);
          rollingEmoji = finalEmoji;
          resolve();
        } else {
          // Show random emoji from pool
          const randomIdx = Math.floor(Math.random() * pool.length);
          rollingEmoji = pool[randomIdx].emoji;
        }
      }, intervalTime);
    });
  }

  function getSlotContent(index: number) {
    const part = ROLL_ORDER[index];

    if (index < currentRollIndex) {
      // Completed slot - show final emoji
      return completedSlots[part]?.emoji || '?';
    } else if (index === currentRollIndex && isRolling) {
      // Currently rolling slot
      return rollingEmoji || '?';
    } else {
      // Empty slot
      return '?';
    }
  }

  function getSlotColor(index: number): string {
    const part = ROLL_ORDER[index];
    if (index < currentRollIndex && completedSlots[part]) {
      return completedSlots[part].color;
    }
    return '';
  }

  function getSlotChance(index: number): string {
    const part = ROLL_ORDER[index];
    if (index < currentRollIndex && completedSlots[part]) {
      return formatChance(completedSlots[part].chance);
    }
    return '';
  }

  function getSlotPrice(index: number): string {
    const part = ROLL_ORDER[index];
    if (index < currentRollIndex && completedSlots[part]) {
      return formatPrice(completedSlots[part].price);
    }
    return '';
  }

  function getSlotClass(index: number) {
    if (index < currentRollIndex) {
      return 'mutation-roll__cell completed';
    } else if (index === currentRollIndex && isRolling) {
      return 'mutation-roll__cell active';
    }
    return 'mutation-roll__cell';
  }

  function getCurrentLabel() {
    if (isRolling && currentRollIndex < rollLabels.length) {
      return rollLabels[currentRollIndex];
    } else if (currentRollIndex >= ROLL_ORDER.length) {
      return 'Готово!';
    }
    return 'Ожидание...';
  }
</script>

<div class="mutation-roll">
  <div class="mutation-roll__cells">
    {#each ROLL_ORDER as part, index}
      <div class="mutation-roll__slot">
        <div 
          class={getSlotClass(index)} 
          style={index < currentRollIndex ? `border-color: ${getSlotColor(index)}; box-shadow: 0 0 6px ${getSlotColor(index)}40;` : ''}
        >
          {#if index < currentRollIndex}
            <!-- Show completed emoji -->
            <span class="mutation-roll__emoji">{getSlotContent(index)}</span>
          {:else if index === currentRollIndex && isRolling}
            <!-- Show rolling animation -->
            <span class="mutation-roll__emoji mutation-roll__emoji--rolling">{getSlotContent(index)}</span>
          {:else}
            <!-- Empty slot -->
            <span class="mutation-roll__placeholder">?</span>
          {/if}
        </div>
        {#if index < currentRollIndex}
          <!-- Show drop chance percentage and price -->
          <div class="mutation-roll__slot-info">
            <span class="mutation-roll__chance" style="color: {getSlotColor(index)}">
              {getSlotChance(index)}
            </span>
            <span class="mutation-roll__price" style="color: {getSlotColor(index)}">
              {getSlotPrice(index)}
            </span>
          </div>
        {/if}
      </div>
    {/each}
  </div>
  <div class="mutation-roll__label">
    {getCurrentLabel()}
  </div>
</div>

<style>
  .mutation-roll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
    width: 100%;
  }

  .mutation-roll__cells {
    display: flex;
    gap: 8px;
    flex-wrap: wrap;
    justify-content: center;
  }

  .mutation-roll__slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .mutation-roll__slot-info {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1px;
  }

  .mutation-roll__cell {
    width: 48px;
    height: 48px;
    border: 1px solid #d9d9d9;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    transition: all 0.2s;
  }

  .mutation-roll__cell.active {
    border-color: #aa3bff;
    box-shadow: 0 0 8px rgba(170, 59, 255, 0.3);
  }

  .mutation-roll__cell.completed {
    background: #f0f0f0;
  }

  .mutation-roll__emoji {
    font-size: 24px;
    line-height: 1;
  }

  .mutation-roll__emoji--rolling {
    animation: roll 0.1s linear infinite;
  }

  .mutation-roll__placeholder {
    color: #ccc;
    font-size: 20px;
  }

  .mutation-roll__label {
    font-size: 14px;
    color: #666;
    text-align: center;
    min-height: 20px;
  }

  .mutation-roll__chance {
    font-size: 10px;
    font-weight: 600;
    min-height: 14px;
  }

  .mutation-roll__price {
    font-size: 9px;
    font-weight: 500;
    opacity: 0.8;
    min-height: 12px;
  }

  @keyframes roll {
    0% { transform: translateY(-2px); }
    50% { transform: translateY(2px); }
    100% { transform: translateY(-2px); }
  }
</style>