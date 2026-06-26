<script lang="ts">
  import type { Emoji } from "$types/index";
  import {
    loadEmojiSVGData,
    hasEmoji,
    getHexCode,
  } from "$utils/svg-emoji-loader";

  interface EmojiProps {
    emoji: Emoji;
    size: number;
    class?: string;
    useTwemoji?: boolean;
  }

  let {
    emoji,
    size = 24,
    class: className = "",
    useTwemoji = true,
  }: EmojiProps = $props();

  const shouldUseTwemoji = $derived(useTwemoji && hasEmoji(emoji));
  const svgContent = $derived(shouldUseTwemoji ? loadEmojiSVGData(emoji) : null);

  const sizeValue = $derived(typeof size === "number" ? `${size}px` : size);
</script>

{#if shouldUseTwemoji && svgContent}
  <img
    class="emoji twemoji {className}"
    data-emoji={emoji}
    style="display: inline-block; width: {sizeValue}; height: {sizeValue}; line-height: 1;"
    src={svgContent}
    alt={emoji.unicodeSymbol}
  />
{:else}
  <span
    class="emoji native {className}"
    data-emoji={emoji.unicodeSymbol}
    style="display: inline-block; font-size: {sizeValue}; line-height: 1;"
    >{emoji.unicodeSymbol}</span
  >
{/if}

<style>
  .emoji {
    vertical-align: middle;
    display: inline-block;
  }

  .emoji.twemoji :global(svg) {
    width: 100%;
    height: 100%;
    display: block;
  }
</style>
