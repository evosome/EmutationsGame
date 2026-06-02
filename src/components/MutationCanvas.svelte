<script lang="ts">
  import type { EmutationBodyparts } from '$lib/types';

  interface MutationCanvasProps {
    bodyparts: EmutationBodyparts;
    size?: number;
  }

  let { bodyparts, size = 148 }: MutationCanvasProps = $props();
  let canvas: HTMLCanvasElement;

  // Calculate emoji size based on canvas size
  const emojiSize = Math.floor(size / 5);

  // Draw the monster on canvas
  $effect(() => {
    const ctx = canvas?.getContext('2d');
    if (!ctx || !canvas) return;

    // Clear canvas
    ctx.clearRect(0, 0, size, size);

    // White background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, size, size);

    const center = size / 2;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // Hat (top center, above head)
    if (bodyparts.hat) {
      ctx.font = `${emojiSize}px serif`;
      ctx.fillText(bodyparts.hat, center, center - emojiSize);
    }

    // Head (upper center)
    if (bodyparts.head) {
      ctx.font = `${emojiSize * 1.2}px serif`;
      ctx.fillText(bodyparts.head, center, center);
    }

    // Body (center, below head)
    if (bodyparts.body) {
      ctx.font = `${emojiSize}px serif`;
      ctx.fillText(bodyparts.body, center, center + emojiSize);
    }

    // Left Hand (left side) - flipped
    if (bodyparts.leftHand) {
      ctx.save();
      ctx.translate(center - emojiSize, center + emojiSize);
      ctx.scale(-1, 1);
      ctx.font = `${emojiSize * 0.8}px serif`;
      ctx.fillText(bodyparts.leftHand, 0, 0);
      ctx.restore();
    }

    // Right Hand (right side)
    if (bodyparts.rightHand) {
      ctx.font = `${emojiSize * 0.8}px serif`;
      ctx.fillText(bodyparts.rightHand, center + emojiSize, center + emojiSize);
    }

    // Left Leg (bottom left) - flipped
    if (bodyparts.leftLeg) {
      ctx.save();
      ctx.translate(center - emojiSize + (emojiSize / 2), center + 2 * emojiSize);
      ctx.scale(-1, 1);
      ctx.font = `${emojiSize * 0.7}px serif`;
      ctx.fillText(bodyparts.leftLeg, 0, 0);
      ctx.restore();
    }

    // Right Leg (bottom right)
    if (bodyparts.rightLeg) {
      ctx.font = `${emojiSize * 0.7}px serif`;
      ctx.fillText(bodyparts.rightLeg, center + emojiSize - (emojiSize / 2), center + 2 * emojiSize);
    }
  });

  // Function to get screenshot as data URL
  function toDataURL(type?: string, quality?: number): string {
    return canvas.toDataURL(type, quality);
  }

  // Function to get screenshot as Blob
  async function toBlob(type?: string, quality?: number): Promise<Blob | null> {
    return new Promise((resolve) => {
      canvas.toBlob(resolve, type, quality);
    });
  }

  export { toDataURL, toBlob };
</script>

<canvas
  bind:this={canvas}
  class="mutation-canvas"
  width={size}
  height={size}
  style="width: {size}px; height: {size}px;"
></canvas>

<style>
  .mutation-canvas {
    border: 1px solid #d9d9d9;
    border-radius: 16px;
    display: block;
  }
</style>