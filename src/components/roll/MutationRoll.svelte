<script lang="ts">
  import { ROLL_ORDER } from "$constants/emoji-pools";
  import { getBodyPartKey } from "$types/bodyparts";
  import type { EmutationBodyparts } from "$types/index";
  import MutationSlot from "./MutationSlot.svelte";
  import SlotMetadata from "./SlotMetadata.svelte";

  interface MutationRollProps {
    bodyparts: EmutationBodyparts;
    isRolling: boolean;
    onSlotComplete?: (index: number) => void;
    onRollComplete?: () => void;
  }

  let {
    bodyparts = {},
    isRolling = false,
    onSlotComplete,
    onRollComplete,
  }: MutationRollProps = $props();

  const rollLabels = [
    "Голова",
    "Тело",
    "Рука 1",
    "Рука 2",
    "Нога 1",
    "Нога 2",
    "Шапка",
  ];

  const START_WAVE_DELAY = 150;
  const STOP_WAVE_DELAY = 200;

  //FIXME - when the reel accelerates slowly with lower accel. value,
  // and state `isRolling` of cell changes to false from interval call,
  // it causes infinite rolling of the slowly accelerated cell.
  const MIN_SPIN_DURATION = 2000;

  let completedSet = $state<Set<number>>(new Set());
  let hasFiredRollComplete = $state(false);
  let rollStartTime = $state(0);
  let stopSignaledSet = $state<Set<number>>(new Set());

  $effect(() => {
    if (isRolling) {
      completedSet = new Set();
      hasFiredRollComplete = false;
      stopSignaledSet = new Set();
      rollStartTime = Date.now();
    }
  });

  function handleSlotStopped(index: number) {
    if (completedSet.has(index)) return;
    completedSet = new Set([...completedSet, index]);

    onSlotComplete?.(index);

    if (completedSet.size >= ROLL_ORDER.length && !hasFiredRollComplete) {
      hasFiredRollComplete = true;
      onRollComplete?.();
    }
  }

  function getDelay(index: number): number {
    return index * START_WAVE_DELAY;
  }

  function getStopTime(index: number): number {
    return rollStartTime + MIN_SPIN_DURATION + index * STOP_WAVE_DELAY;
  }

  function shouldStop(index: number): boolean {
    if (!isRolling) return true;
    const now = Date.now();
    return now >= getStopTime(index);
  }

  function getSlotIsRolling(index: number): boolean {
    if (stopSignaledSet.has(index)) return false;
    if (shouldStop(index)) return false;
    return isRolling;
  }

  let stopTimers: ReturnType<typeof setTimeout>[] = [];

  $effect(() => {
    if (isRolling) {
      stopTimers.forEach(clearTimeout);
      stopTimers = [];

      ROLL_ORDER.forEach((_, index) => {
        const stopDelay = MIN_SPIN_DURATION + index * STOP_WAVE_DELAY;
        const timer = setTimeout(() => {
          stopSignaledSet = new Set([...stopSignaledSet, index]);
        }, stopDelay);
        stopTimers.push(timer);
      });
    }

    return () => {
      stopTimers.forEach(clearTimeout);
      stopTimers = [];
    };
  });

  $inspect(completedSet);
</script>

<div class="mutation-roll">
  <div class="mutation-roll__cells">
    {#each ROLL_ORDER as part, index}
      <div
        class="mutation-roll__slot-wrapper"
        data-slot-part-id={part}
        data-slot-done={completedSet.has(part)}
      >
        <MutationSlot
          {part}
          label={rollLabels[index]}
          isRolling={getSlotIsRolling(index)}
          finalEmoji={bodyparts[getBodyPartKey(part)]!}
          delay={getDelay(index)}
          onSlotComplete={() => handleSlotStopped(part)}
        />
        <SlotMetadata
          part={completedSet.has(index) ? part : undefined}
          emoji={completedSet.has(index)
            ? bodyparts[getBodyPartKey(part)]
            : undefined}
        />
      </div>
    {/each}
  </div>
</div>

<style>
  .mutation-roll {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
    width: 100%;
  }

  .mutation-roll__cells {
    display: flex;
    padding: 8px 16px;
    gap: 6px;
    flex-wrap: wrap;
    justify-content: center;
    border: #777 1px solid;
    border-radius: 16px;
  }

  .mutation-roll__slot-wrapper {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }
</style>
