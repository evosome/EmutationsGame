<script lang="ts">
  import type { EmutationBodyparts, Emoji } from '$types/index';
  import { loadEmojiSVGData, hasEmoji } from '$utils/svg-emoji-loader';

  interface MutationCanvasProps {
    bodyparts: EmutationBodyparts;
    size?: number;
  }

  let { bodyparts, size = 148 }: MutationCanvasProps = $props();

  // Calculate emoji size based on canvas size
  const emojiSize = Math.floor(size / 5);

  interface EmojiPosition {
    emoji: Emoji;
    x: number;
    y: number;
    scale?: number;
    flip?: boolean;
    id: string;
  }

  // Get positioned emojis for the monster
  const positionedEmojis = $derived.by(() => {
    const center = size / 2;
    const positions: EmojiPosition[] = [];
    let index = 0;

    // Hat (top center, above head)
    if (bodyparts.hat) {
      positions.push({
        emoji: bodyparts.hat,
        x: center,
        y: center - emojiSize,
        id: `hat-${index++}`
      });
    }

    // Head (upper center) - slightly larger
    if (bodyparts.head) {
      positions.push({
        emoji: bodyparts.head,
        x: center,
        y: center,
        id: `head-${index++}`
      });
    }

    // Body (center, below head)
    if (bodyparts.body) {
      positions.push({
        emoji: bodyparts.body,
        x: center,
        y: center + emojiSize,
        id: `body-${index++}`
      });
    }

    // Left Hand (left side) - flipped
    if (bodyparts.leftHand) {
      positions.push({
        emoji: bodyparts.leftHand,
        x: center - emojiSize,
        y: center + emojiSize,
        flip: true,
        id: `leftHand-${index++}`
      });
    }

    // Right Hand (right side)
    if (bodyparts.rightHand) {
      positions.push({
        emoji: bodyparts.rightHand,
        x: center + emojiSize,
        y: center + emojiSize,
        id: `rightHand-${index++}`
      });
    }

    // Left Leg (bottom left) - flipped
    if (bodyparts.leftLeg) {
      positions.push({
        emoji: bodyparts.leftLeg,
        x: center - emojiSize + (emojiSize / 2),
        y: center + 2 * emojiSize,
        flip: true,
        id: `leftLeg-${index++}`
      });
    }

    // Right Leg (bottom right)
    if (bodyparts.rightLeg) {
      positions.push({
        emoji: bodyparts.rightLeg,
        x: center + emojiSize - (emojiSize / 2),
        y: center + 2 * emojiSize,
        id: `rightLeg-${index++}`
      });
    }

    return positions;
  });

  // Helper to get emoji SVG content
  function getEmojiSVG(emoji: Emoji): string | null {
    return loadEmojiSVGData(emoji) || null;
  }

  // Function to get screenshot as data URL (using html2canvas or similar would be needed)
  // For now, we provide a placeholder that indicates this needs a different approach
  function toDataURL(type?: string, quality?: number): string {
    console.warn('toDataURL with Twemoji requires html2canvas or similar library');
    return '';
  }

  async function toBlob(type?: string, quality?: number): Promise<Blob | null> {
    console.warn('toBlob with Twemoji requires html2canvas or similar library');
    return null;
  }

  export { toDataURL, toBlob };
</script>

<div
  class="mutation-canvas"
  style="width: {size}px; height: {size}px;"
>
  {#each positionedEmojis as pos (pos.id)}
    {@const svgContent = getEmojiSVG(pos.emoji)}
    {@const scaledSize = emojiSize * (pos.scale || 1)}
    
    {#if svgContent}
      <img
        class="emoji-sprite"
        style="
          position: absolute;
          left: {pos.x - scaledSize / 2}px;
          top: {pos.y - scaledSize / 2}px;
          width: {scaledSize}px;
          height: {scaledSize}px;
          transform: {pos.flip ? 'scaleX(-1)' : 'none'};
        "
        src="{svgContent}"
        alt="{pos.emoji.unicodeSymbol}"
      />
    {:else}
      <!-- Fallback to native emoji if Twemoji not available -->
      <span
        class="emoji-sprite native"
        style="
          position: absolute;
          left: {pos.x}px;
          top: {pos.y}px;
          font-size: {scaledSize}px;
          transform: {pos.flip ? 'scaleX(-1)' : 'none'};
          text-align: center;
          line-height: 1;
        "
      >{pos.emoji.unicodeSymbol}</span>
    {/if}
  {/each}
</div>

<style>
  .mutation-canvas {
    position: relative;
    background-color: #ffffff;
    border: 1px solid #d9d9d9;
    border-radius: 16px;
    overflow: hidden;
    display: block;
  }

  .emoji-sprite {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .emoji-sprite :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>