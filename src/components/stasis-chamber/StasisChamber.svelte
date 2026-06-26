<script lang="ts">
  import type { EmutationBodyparts } from "$types/index";
  import MutationCanvas from "$components/MutationCanvas.svelte";
  import { getRarityInfo } from "$utils/formatting";
  import { EmutationRarity } from "$types/index";

  interface StasisChamberProps {
    bodyparts: EmutationBodyparts;
    size?: number;
    rarity?: EmutationRarity;
  }

  let { bodyparts, size = 148, rarity }: StasisChamberProps = $props();

  const liquidColor = $derived.by(() => {
    if (rarity !== undefined) {
      const rarityInfo = getRarityInfo(rarity);
      return rarityInfo.color + '80';
    }
    return "var(--mm-light-gray)";
  });

  // Bubble animation for the stasis fluid
  const bubbles = $derived(
    Array.from({ length: 8 }, (_, i) => ({
      id: i,
      left: Math.random() * 75 + 5,
      delay: Math.random() * 3,
      duration: 2 + Math.random() * 2,
      size: 4 + Math.random() * 10,
    })),
  );
</script>

<div class="stasis-chamber" style="--stasis-chamber-size: {size}px;">
  <div class="stasis-chamber__flask">
    <div class="stasis-chamber__neck neck-top"></div>
    <div class="stasis-chamber__body">
      <div class="stasis-chamber__liquid" style="background: {liquidColor}">
        {#each bubbles as bubble (bubble.id)}
          <div
            class="stasis-chamber__bubble"
            style="
              left: {bubble.left}%;
              width: {bubble.size}px;
              height: {bubble.size}px;
              animation-delay: {bubble.delay}s;
              animation-duration: {bubble.duration}s;
            "
          ></div>
        {/each}
      </div>
      <div class="stasis-chamber__canvas-wrapper">
        <MutationCanvas {bodyparts} {size} />
      </div>
    </div>
    <div class="stasis-chamber__neck neck-bottom"></div>
  </div>
</div>

<style>
  .stasis-chamber {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    width: var(--stasis-chamber-size, 200px);
    height: var(--stasis-chamber-size, 200px);
  }

  .stasis-chamber__flask {
    display: flex;
    flex-direction: column;
    align-items: center;
    width: calc(var(--stasis-chamber-size, 200px) * 0.75);
    height: 100%;
    border: 1px #777 solid;
    border-radius: 16px;
  }

  .neck-top {
    border-radius: 16px 16px 0 0;
  }

  .neck-bottom {
    border-radius: 0 0 16px 16px;
  }

  .stasis-chamber__neck {
    width: 100%;
    height: 16px;
    background-color: #777;
  }

  .stasis-chamber__body {
    position: relative;
    width: 100%;
    height: 100%;
    background: rgba(200, 200, 200, 0.15);
    overflow: hidden;
    z-index: 1;
  }

  .stasis-chamber__liquid {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    height: 100%;
    overflow: hidden;
    transition: background-color 1.5s ease-in-out 0.1s;
  }

  .stasis-chamber__bubble {
    position: absolute;
    bottom: -10px;
    background: rgba(255, 255, 255, 1);
    border-radius: 50%;
    border: 1px solid white;
    animation: bubble-rise linear infinite;
    z-index: 99;
  }

  @keyframes bubble-rise {
    0% {
      transform: scale(0);
      bottom: -10px;
      opacity: 0;
    }
    10% {
      transform: scale(1);
      opacity: 0.6;
    }
    90% {
      transform: scale(1);
      opacity: 0.6;
    }
    100% {
      transform: scale(0);
      bottom: 100%;
      opacity: 0;
    }
  }

  .stasis-chamber__canvas-wrapper {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    z-index: 2;
  }
</style>
