<script lang="ts">
  import { getEmojiPool } from "$constants/emoji-pools";
  import { EmutationBodypartsEnum } from "$types/bodyparts";
  import type { Emoji } from "$types/emoji";
  import { getEmojiRarityColor } from "$utils/emoji-roll";
  import { untrack } from "svelte";

  // Props
  let props: {
    isSpinning: boolean;
    targetEmoji: Emoji;
    delay: number;
    part: EmutationBodypartsEnum;
    onReelComplete?: () => void;
  } = $props();

  const VISIBLE_CELLS = 5; // Always 5 cells in DOM
  const CELL_HEIGHT = 48; // Height of one cell in pixels
  const TOTAL_HEIGHT = VISIBLE_CELLS * CELL_HEIGHT;
  const WINDOW_HEIGHT = VISIBLE_CELLS * CELL_HEIGHT; // Height of the visible window

  /**
   * Min difference between current and target Y coord
   */
  const DISTANCE_DIFF_EPSILON = 0.5;

  const MAX_SPEED = 25; // Max pixels per frame
  const ACCELERATION = 0.3; // Speed increase per frame
  const DECELERATION = 0.2; // Speed decrease per frame
  const SNAP_SPEED = 1.5; // Speed during final alignment

  type ReelState =
    | "idle"
    | "delayed_start"
    | "accelerating"
    | "loop"
    | "decelerating"
    | "snapping"
    | "completed";

  interface CellInfo {
    id: number;
    emoji?: Emoji;
  }

  let reelState = $state<ReelState>("idle");
  let cells = $state<Array<CellInfo>>([]);
  let nextId = $state(0);
  let speed = $state(0);
  let offsetY = $state(0);

  let animationFrameId: number | null = null;
  let targetOffsetY = 0;

  function initializeCells(): void {
    cells = [];
    for (let i = 0; i < VISIBLE_CELLS; i++) {
      cells.push({
        id: nextId++,
        emoji: getRandomEmoji(),
      });
    }
  }

  //TODO - move to utils
  function getRandomEmoji(): Emoji {
    const pool = getEmojiPool(props.part);
    const totalWeight = pool.reduce((sum, item) => sum + item.weight, 0);
    let random = Math.random() * totalWeight;
    for (const item of pool) {
      random -= item.weight;
      if (random <= 0) {
        return item.emoji;
      }
    }
    return pool[pool.length - 1].emoji;
  }

  function animate(): void {
    if (reelState === "idle" || reelState === "completed") return;

    switch (reelState) {
      case "accelerating":
        speed = Math.min(speed + ACCELERATION, MAX_SPEED);
        offsetY += speed;
        if (speed >= MAX_SPEED) reelState = "loop";
        break;

      case "loop":
        offsetY += speed;
        break;

      case "decelerating":
        speed = Math.max(speed - DECELERATION, SNAP_SPEED);
        offsetY += speed;

        //#region AI slop
        //FIXME - investigate AI code

        // Когда скорость упала до минимальной, вычисляем финальную точку остановки
        if (speed <= SNAP_SPEED) {
          // 1. Находим верхнюю ячейку прямо в этот микромомент времени
          const currentGridOffset = offsetY % TOTAL_HEIGHT;
          const closestTopIndex =
            Math.round((TOTAL_HEIGHT - currentGridOffset) / CELL_HEIGHT) %
            VISIBLE_CELLS;
          const targetCellIndex =
            (closestTopIndex + VISIBLE_CELLS) % VISIBLE_CELLS;

          // 2. Инжектим целевой эмодзи в эту ячейку
          cells[targetCellIndex].emoji = props.targetEmoji;

          // 3. Вычисляем идеальный финишный offsetY (чтобы targetCellIndex встал на физический индекс 2)
          const baseOffset = Math.floor(offsetY / TOTAL_HEIGHT) * TOTAL_HEIGHT;
          let calculatedTarget =
            baseOffset +
            ((TOTAL_HEIGHT - (targetCellIndex - 1) * CELL_HEIGHT) %
              TOTAL_HEIGHT);

          if (calculatedTarget <= offsetY) {
            calculatedTarget += TOTAL_HEIGHT;
          }

          targetOffsetY = calculatedTarget;
          reelState = "snapping";
        }

        //#endregion

        break;

      case "snapping":
        const distanceLeft = targetOffsetY - offsetY;

        if (distanceLeft <= DISTANCE_DIFF_EPSILON) {
          offsetY = targetOffsetY;
          reelState = "completed";
          props.onReelComplete?.();
          return;
        }

        const step = Math.min(distanceLeft * 0.09, SNAP_SPEED);
        offsetY += step;
        break;
    }

    animationFrameId = requestAnimationFrame(animate);
  }

  function startSpinning(): void {
    if (reelState !== "idle" && reelState !== "completed") return;

    reelState = "delayed_start";
    speed = 0;
    offsetY = 0;

    // Used before. But now cells got initialized when component
    // mounts.
    //initializeCells();

    setTimeout(() => {
      if (reelState === "delayed_start") {
        reelState = "accelerating";
        animationFrameId = requestAnimationFrame(animate);
      }
    }, props.delay);
  }

  function stopSpinning(): void {
    if (reelState === "loop") {
      reelState = "decelerating";
    }
  }

  $effect(() => {
    const isSpinning = props.isSpinning;

    // untrack reelState and other props
    untrack(() => {
      if (isSpinning) {
        startSpinning();
      } else if (reelState === "accelerating" || reelState === "loop") {
        stopSpinning();
      }
    });
  });

  $effect(() => {
    if (
      !props.isSpinning &&
      (reelState === "completed" || reelState === "idle")
    ) {
      untrack(() => {
        reelState = "completed";

        if (animationFrameId !== null) {
          cancelAnimationFrame(animationFrameId);
        }
      });
    }
  });

  const getCellTransform = (y: number) => {
    return `translate3d(0, ${y}px, 0)`;
  };

  const calculateYTransform = (index: number) => {
    return ((index * CELL_HEIGHT + offsetY) % TOTAL_HEIGHT) + CELL_HEIGHT;
  };

  initializeCells();
</script>

<div
  class="reel"
  style="--cell-height: {CELL_HEIGHT}px; --window-height: {WINDOW_HEIGHT}px;"
>
  <div class="reel__window">
    {#each cells as cell, index (cell.id)}
      <span
        class="reel__cell"
        style="transform: {getCellTransform(
          calculateYTransform(index),
        )}; background-color: {cell.emoji
          ? getEmojiRarityColor(props.part, cell.emoji)
          : '#fffff'}80;"
      >
        {cell.emoji?.unicodeSymbol}
      </span>
    {/each}
  </div>
</div>

<style>
  .reel {
    width: 32px;
    height: var(--window-height, 160px);
    overflow: hidden;
    position: relative;
  }

  .reel__window {
    width: 32px;
    height: var(--window-height, 160px);
    overflow: hidden;
    position: relative;
  }

  .reel__cell {
    font-size: 24px;
    line-height: 1;
    height: var(--cell-height, 32px);
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    will-change: transform;
    transition: none;
  }
</style>
