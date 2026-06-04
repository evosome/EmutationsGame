<script lang="ts">
  import GenField from "./GenField.svelte";
  import MutationCanvas from "./MutationCanvas.svelte";
  import { MutationRoll } from "./roll/index";

  import { ROLL_ORDER } from "$constants/emoji-pools";
  import {
    generateMonster,
    getMonsterWithLuck,
    calculateLuckDrift,
    calculatePrice,
  } from "$services/index";
  import {
    getLuckMultiplier,
    incrementGeneration,
    playerSession,
  } from "$stores/session-store";
  import { getBodyPartKey } from "$types/bodyparts";
  import type { EmutationBodyparts, EmutationMonster } from "$types/index";
  import { EmutationRarity } from "$types/index";
  import {
    formatPrice,
    generateMonsterName,
    generateRandomSeed,
    getRarityInfo,
  } from "$utils/formatting";

  interface MutationWindowProps {
    onMonsterGenerated?: (monster: EmutationMonster) => void;
  }

  let { onMonsterGenerated }: MutationWindowProps = $props();

  let currentSeed = $state(generateRandomSeed());
  let currentMonster = $state<EmutationMonster | null>(null);
  let currentBodyparts = $state<EmutationBodyparts>({});
  let isRolling = $state(false);

  const session = $derived($playerSession);
  const generationCount = $derived(session.generationCount);

  let displayedLuckPercent = $state(0);
  let displayedLuckDrift = $state(0);
  let displayedLuckDriftPercent = $state(0);

  const rarityInfo = $derived(
    currentMonster ? getRarityInfo(currentMonster.rarity) : null,
  );

  const monsterPrice = $derived(
    currentMonster ? calculatePrice(currentMonster.bodyparts) : null,
  );

  const luckDriftColor = $derived(
    displayedLuckDrift >= 0 ? "var(--color-success)" : "var(--color-danger)",
  );

  function generateMonsterWithRoll() {
    if (isRolling) return;

    // calculate luck for THE CURRENT roll
    const multiplier = 1 - Math.exp(-session.generationCount / 55);
    const currentLuckDrift = calculateLuckDrift(multiplier);
    const currentLuck = currentLuckDrift + getLuckMultiplier();

    displayedLuckPercent = Math.round(
      (1 - Math.exp(-session.generationCount / 50)) * 100,
    );
    displayedLuckDrift = currentLuckDrift;
    displayedLuckDriftPercent = Math.round(currentLuckDrift * 100);

    // 2. Генерируем монстра с этой удачей
    const monster = getMonsterWithLuck(currentLuck);
    currentMonster = monster;

    if (monster) {
      currentSeed = monster.gen;
    }

    isRolling = true;
    currentBodyparts = {};

    incrementGeneration();
  }

  function generateMonsterFromCustomSeed() {
    if (isRolling || !currentSeed.trim()) return;

    currentSeed = currentSeed.trim().toUpperCase();

    const monster = generateMonster(currentSeed);
    currentMonster = monster;
    currentBodyparts = monster.bodyparts;
    isRolling = false;

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
</script>

<div class="mutation-window">
  <h2 class="mutation-window__label">Мутация</h2>

  <div class="mutation-window__content">
    <div class="mutation-window__canvas-container">
      <MutationCanvas bodyparts={currentBodyparts} size={148} />
    </div>

    <div
      class="mutation-window__result"
      style="color: {currentMonster && !isRolling
        ? rarityInfo?.color
        : 'var(--text)'}"
    >
      {currentMonster && !isRolling
        ? `${generateMonsterName(currentMonster)} ${monsterPrice ? formatPrice(monsterPrice) : ""}`
        : "Ожидаем монстрика..."}
    </div>

    <div class="mutation-window__info">
      <div class="mutation-window__roll-container">
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

      {#if generationCount > 0}
        <div
          class="mutation-window__luck"
          style="background-color: {luckDriftColor}"
        >
          ✨ Удача: {displayedLuckPercent}% ({displayedLuckDrift >= 0
            ? "+"
            : "-"}{displayedLuckDriftPercent}%)
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

  @media (max-width: 370px) {
    .mutation-window {
      padding: 0px;
      border: none;
      border-radius: 0px;
    }
  }

  .mutation-window__label {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #000;
  }

  .mutation-window__content {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 16px;
  }

  .mutation-window__canvas-container {
    flex-shrink: 0;
  }

  .mutation-window__info {
    width: 100%;
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
    width: 100%;
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
    background: #fce4ec;
    border-radius: 6px;
    transition: color 0.3s ease;
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
    .mutation-window__seed-container {
      flex-direction: column;
    }
  }
</style>
