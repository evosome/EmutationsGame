<script lang="ts">
  import type { EmutationMonster } from '$lib/types';
  import MutationCanvas from './MutationCanvas.svelte';
  import GenField from './GenField.svelte';
  import { generateMonsterName, getRarityInfo, calculateDropChance, formatDropChance, calculatePrice, formatPrice } from '$lib/generator';

  interface MutationCardProps {
    monster: EmutationMonster;
    showCopyButton?: boolean;
  }

  let { monster, showCopyButton = false }: MutationCardProps = $props();

  const name = $derived(generateMonsterName(monster));
  const rarityInfo = $derived(getRarityInfo(monster.rarity));
  const dropChance = $derived(calculateDropChance(monster.bodyparts));
  const formattedChance = $derived(formatDropChance(dropChance));
  const price = $derived(calculatePrice(monster.bodyparts));
  const formattedPrice = $derived(formatPrice(price));

  let canvasComponent: { toDataURL: () => string; toBlob: () => Promise<Blob | null> };

  async function copyScreenshot() {
    try {
      // Get screenshot from MutationCanvas
      const blob = await canvasComponent.toBlob();

      if (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob }),
          ]);
        } catch {
          // Fallback: copy gen text
          await navigator.clipboard.writeText(monster.gen);
        }
      }
    } catch (err) {
      console.error('Failed to copy:', err);
      // Fallback: copy gen
      await navigator.clipboard.writeText(monster.gen);
    }
  }
</script>

<div class="mutation-card">
  <div class="mutation-card__header">
    <span class="mutation-card__name" style="color: {rarityInfo.color}">
      {name}
    </span>
  </div>

  <div class="mutation-card__content">
    <MutationCanvas bind:this={canvasComponent} bodyparts={monster.bodyparts} size={100} />

    <div class="mutation-card__info">
      <div class="mutation-card__stats">
        <div class="mutation-card__price" style="color: {rarityInfo.color}">
          Цена: {formattedPrice}
        </div>
      </div>
      <GenField value={monster.gen} />
      {#if showCopyButton}
        <button class="mutation-card__copy" onclick={copyScreenshot}>
          📋
        </button>
      {/if}
    </div>
  </div>
</div>

<style>
  .mutation-card {
    display: flex;
    flex-direction: column;
    gap: 8px;
    padding: 12px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    background: #fff;
    min-width: 200px;
  }

  .mutation-card__header {
    text-align: center;
  }

  .mutation-card__name {
    font-size: 14px;
    font-weight: 600;
    line-height: 1.3;
  }

  .mutation-card__content {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .mutation-card__info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 8px;
    align-items: center;
  }

  .mutation-card__rarity {
    padding: 4px 12px;
    border-radius: 12px;
    border: 1px solid;
    font-size: 12px;
    font-weight: 600;
    text-align: center;
  }

  .mutation-card__rarity-label {
    white-space: nowrap;
  }

  .mutation-card__stats {
    display: flex;
    gap: 12px;
    align-items: center;
  }

  .mutation-card__chance,
  .mutation-card__price {
    font-size: 11px;
    font-weight: 500;
    text-align: center;
    opacity: 0.8;
  }

  .mutation-card__copy {
    background: none;
    border: 1px solid #d9d9d9;
    border-radius: 6px;
    padding: 4px 8px;
    cursor: pointer;
    font-size: 16px;
    transition: background 0.2s;
  }

  .mutation-card__copy:hover {
    background: #f5f5f5;
  }
</style>