<script lang="ts">
  import { EmutationBodypartsEnum } from '$types/bodyparts';
  import type { Emoji } from '$types/index';
  import {
    getEmojiRarityColor,
    getEmojiDropChance,
    getEmojiPrice,
    formatDropChance,
    formatPrice,
  } from '$utils/index';

  interface SlotMetadataProps {
    part?: EmutationBodypartsEnum;
    emoji?: Emoji;
    isRolling?: boolean;
  }

  let { part, emoji, isRolling = false }: SlotMetadataProps = $props();

  //FIXED - cond. was `emoji && part`, so meta data was not available, because HAT value was falsy.
  let rarityColor = $derived(emoji && part !== undefined ? getEmojiRarityColor(part, emoji) : undefined);
  let dropChance = $derived(emoji && part !== undefined ? getEmojiDropChance(part, emoji) : undefined);
  let price = $derived(emoji && part !== undefined ? getEmojiPrice(part, emoji) : undefined);
</script>

<div class="slot-metadata" class:dimmed={isRolling}>
  <span
    class="slot-metadata__chance"
    style={rarityColor ? `color: ${rarityColor}` : ''}
  >
    {dropChance !== undefined ? formatDropChance(dropChance) : '-'}
  </span>
  <span
    class="slot-metadata__price"
    style={rarityColor ? `color: ${rarityColor}; opacity: 0.8` : ''}
  >
    {price !== undefined ? formatPrice(price) : '-'}
  </span>
</div>

<style>
  .slot-metadata {
    display: flex;
    flex-direction: column;
    align-items: center;
    min-height: 24px;
    justify-content: center;
  }

  .slot-metadata.dimmed {
    opacity: 0.3;
  }

  .slot-metadata__chance {
    font-size: 9px;
    font-weight: 600;
    line-height: 1.2;
    min-height: 11px;
  }

  .slot-metadata__price {
    font-size: 9px;
    font-weight: 500;
    line-height: 1.2;
    min-height: 11px;
  }
</style>