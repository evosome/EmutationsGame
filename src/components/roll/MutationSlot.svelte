<script lang="ts">
  import { EmutationBodypartsEnum } from "$types/bodyparts";
  import type { Emoji } from "$types/index";
  import Reel from "./Reel.svelte";

  interface MutationSlotProps {
    label: string;
    isRolling: boolean;
    part: EmutationBodypartsEnum;
    finalEmoji: Emoji;
    delay: number;
    onSlotComplete?: () => void;
  }

  let {
    label,
    isRolling = false,
    part,
    finalEmoji,
    delay = 0,
    onSlotComplete,
  }: MutationSlotProps = $props();

  let hasCompleted = $state(false);

  function handleReelComplete() {
    if (!hasCompleted) {
      hasCompleted = true;
      onSlotComplete?.();
    }
  }

  $effect(() => {
    if (isRolling) {
      hasCompleted = false;
    }
  });
</script>

<div class="mutation-slot">
  <span class="mutation-slot__label">{label}</span>
  <div
    class="mutation-slot__cell"
    class:mutation-slot__cell--rolling={isRolling}
    class:mutation-slot__cell--completed={!isRolling && finalEmoji}
  >
    <Reel
      isSpinning={isRolling}
      targetEmoji={finalEmoji}
      {delay}
      {part}
      onReelComplete={handleReelComplete}
    />
  </div>
</div>

<style>
  .mutation-slot {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .mutation-slot__cell {
    width: 32px;
    max-width: 32px;
    height: 94px;
    border: 1px solid #d9d9d9;
    display: flex;
    align-items: center;
    justify-content: center;
    background: #fff;
    transition:
      border-color 0.2s,
      background 0.2s;
    box-shadow:
      inset 0px 35px 10px -20px rgba(0, 0, 0, 0.9),
      inset 0px -35px 10px -20px rgba(0, 0, 0, 0.9);
    overflow: hidden;
  }

  .mutation-slot__cell--rolling {
    border-color: #aa3bff;
  }

  .mutation-slot__cell--completed {
    background: #f0f0f0;
  }

  .mutation-slot__label {
    font-size: 9px;
    color: #aa3bff;
    font-weight: 600;
    line-height: 1.2;
    white-space: nowrap;
  }
</style>
