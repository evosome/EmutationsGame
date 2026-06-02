<script lang="ts">
  import GenField from "./GenField.svelte";
  import MutationCanvas from "./MutationCanvas.svelte";
  import MutationRoll from "./MutationRoll.svelte";

  import { ROLL_ORDER } from "$constants/emoji-pools";
  import { generateMonster, getMonsterWithLuck } from "$services/index";
  import {
    getLuckMultiplier,
    incrementGeneration,
    playerSession,
  } from "$stores/session-store";
  import { getBodyPartKey } from "$types/bodyparts";
  import type { EmutationBodyparts, EmutationMonster } from "$types/index";
  import { EmutationRarity } from "$types/index";
  import { generateRandomSeed, getRarityInfo } from "$utils/formatting";

  interface MutationWindowProps {
    onMonsterGenerated?: (monster: EmutationMonster) => void;
  }

  let { onMonsterGenerated }: MutationWindowProps = $props();

  let currentSeed = $state(generateRandomSeed());
  let currentMonster = $state<EmutationMonster | null>(null);
  let currentBodyparts = $state<EmutationBodyparts>({});

  // Rolling state
  let isRolling = $state(false);

  // Track if we've shown the absolute monster message
  let showAbsoluteMonsterMessage = $state(false);

  // Generate monster with animation
  function generateMonsterWithRoll() {
    if (isRolling) return;

    const monster = getMonsterWithLuck(getLuckMultiplier());
    currentMonster = monster;

    if (monster) {
      currentSeed = monster.gen;
    }

    // Reset rolling state and bodyparts (will be filled as slots complete)
    isRolling = true;
    currentBodyparts = {};

    incrementGeneration();
  }

  // Generate monster from custom seed without animation
  function generateMonsterFromCustomSeed() {
    if (isRolling || !currentSeed.trim()) return;

    // Format the seed
    currentSeed = currentSeed.trim().toUpperCase();

    // Generate monster directly
    const monster = generateMonster(currentSeed);
    currentMonster = monster;
    currentBodyparts = monster.bodyparts;
    isRolling = false;

    // Emit monster via callback prop
    if (onMonsterGenerated) {
      onMonsterGenerated(monster);
    }
  }

  // Handle slot complete event from MutationRoll (receives index directly)
  function handleSlotComplete(index: number) {
    // Update bodyparts as slots complete using ROLL_ORDER
    if (currentMonster && index < ROLL_ORDER.length) {
      const part = getBodyPartKey(ROLL_ORDER[index]);
      currentBodyparts = {
        ...currentBodyparts,
        [part]: currentMonster.bodyparts[part],
      };
    }
  }

  // Handle roll complete (when all slots are done)
  function handleRollComplete() {
    isRolling = false;

    // Emit monster via callback prop (parent will handle NONEXISTING effect)
    if (currentMonster && onMonsterGenerated) {
      onMonsterGenerated(currentMonster);
    }
  }

  // Get rarity info for display
  const rarityInfo = $derived(
    currentMonster ? getRarityInfo(currentMonster.rarity) : null,
  );

  // Luck display - use $playerSession for reactive store subscription
  // The $ prefix automatically subscribes to the store and triggers updates
  const session = $derived($playerSession);
  const generationCount = $derived(session.generationCount);

  // Calculate luck multiplier reactively based on generation count
  function calculateLuckPercent(genCount: number): number {
    return Math.round((1 - Math.exp(-genCount / 50)) * 100);
  }
  const luckPercent = $derived(calculateLuckPercent(session.generationCount));

  // Check if generate button should be shown (hidden for NONEXISTING rarity)
  const showGenerateButton = $derived(
    !currentMonster ||
      currentMonster.rarity !== EmutationRarity.NONEXISTING ||
      isRolling,
  );
</script>

<div class="mutation-window">
  <h2 class="mutation-window__label">Мутация</h2>

  <div class="mutation-window__content">
    <div class="mutation-window__canvas-container">
      <MutationCanvas bodyparts={currentBodyparts} size={148} />
    </div>

    <div class="mutation-window__info">
      <div class="mutation-window__roll-container">
        <div class="mutation-window__arrow">◀</div>
        <MutationRoll
          bodyparts={currentMonster?.bodyparts ?? {}}
          {isRolling}
          onSlotComplete={handleSlotComplete}
          onRollComplete={handleRollComplete}
        />
      </div>

      {#if currentMonster?.rarity === EmutationRarity.NONEXISTING && !isRolling}
        <div class="mutation-window__absolute-monster-message">
          ВЫ СОЗДАЛИ АБСОЛЮТНОГО МОНСТРИКА!
        </div>
      {:else}
        <GenField bind:value={currentSeed} />
        <div class="mutation-window__seed-container">
          <button
            class="mutation-window__button"
            onclick={generateMonsterWithRoll}
            disabled={isRolling}
          >
            Генерировать!
          </button>
          <button
            class="mutation-window__button mutation-window__button--secondary"
            onclick={generateMonsterFromCustomSeed}
            disabled={isRolling}
          >
            По сидам
          </button>
        </div>
      {/if}

      {#if currentMonster && !isRolling}
        <div class="mutation-window__result" style="color: {rarityInfo?.color}">
          {currentMonster.baseName} • {rarityInfo?.name}
        </div>
      {/if}

      {#if generationCount > 0}
        <div class="mutation-window__luck">
          ✨ Удача: {luckPercent}%
        </div>
      {/if}
    </div>
  </div>
</div>

<style>
  .mutation-window {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    background: #fff;
  }

  .mutation-window__label {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #000;
  }

  .mutation-window__content {
    display: flex;
    gap: 16px;
    align-items: flex-start;
  }

  .mutation-window__canvas-container {
    flex-shrink: 0;
  }

  .mutation-window__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .mutation-window__roll-container {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mutation-window__arrow {
    font-size: 32px;
    color: #d9d9d9;
    flex-shrink: 0;
  }

  .mutation-window__seed-container {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .mutation-window__button {
    padding: 12px 24px;
    background: #d9d9d9;
    border: none;
    border-radius: 8px;
    font-size: 16px;
    font-weight: 600;
    cursor: pointer;
    transition: background 0.2s;
    white-space: nowrap;
  }

  .mutation-window__button:hover:not(:disabled) {
    background: #c0c0c0;
  }

  .mutation-window__button:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }

  .mutation-window__button--secondary {
    background: #e8e8e8;
  }

  .mutation-window__button--secondary:hover:not(:disabled) {
    background: #d0d0d0;
  }

  .mutation-window__result {
    font-size: 14px;
    font-weight: 600;
    text-align: center;
    padding: 8px;
    background: #f9f9f9;
    border-radius: 6px;
  }

  .mutation-window__luck {
    font-size: 13px;
    font-weight: 600;
    text-align: center;
    padding: 6px 8px;
    color: #e91e63;
    background: #fce4ec;
    border-radius: 6px;
  }

  .mutation-window__absolute-monster-message {
    font-size: 18px;
    font-weight: 700;
    text-align: center;
    padding: 16px;
    color: #ff0000;
    border-radius: 12px;
    animation: pulse-glow 1s ease-in-out infinite alternate;
  }

  @keyframes pulse-glow {
    0% {
      box-shadow: 0 0 20px rgba(255, 0, 0, 0.5);
      transform: scale(1);
    }
    100% {
      box-shadow: 0 0 40px rgba(255, 215, 0, 0.8);
      transform: scale(1.05);
    }
  }

  @media (max-width: 640px) {
    .mutation-window__content {
      flex-direction: column;
      align-items: center;
    }

    .mutation-window__seed-container {
      flex-direction: column;
    }
  }
</style>
