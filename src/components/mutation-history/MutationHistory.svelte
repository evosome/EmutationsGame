<script lang="ts">
  import type { MutationInfo } from "$types/index";
  import MutationCard from "./MutationCard.svelte";

  const MAX_HISTORY_ITEMS = 6;

  interface MutationHistoryProps {
    mutations?: MutationInfo[];
    maxItems?: number;
  }

  let { mutations = [], maxItems = MAX_HISTORY_ITEMS }: MutationHistoryProps =
    $props();
  const limitedMonsters = $derived(mutations.slice(0, maxItems));
</script>

<div class="mutation-history">
  <h2 class="mutation-history__title">История мутаций</h2>

  <div class="mutation-history__cards">
    {#if limitedMonsters.length === 0}
      <div class="mutation-history__empty">
        Пока нет мутантов. Создайте первого!
      </div>
    {:else}
      {#each limitedMonsters as mutationInfo}
        <MutationCard {mutationInfo} showCopyButton />
      {/each}
    {/if}
  </div>
</div>

<style>
  .mutation-history {
    display: flex;
    flex-direction: column;
    gap: 16px;
    padding: 16px;
    border: 1px solid #d9d9d9;
    border-radius: 12px;
    background: #fff;
    max-height: 600px;
    overflow: hidden;
  }

  .mutation-history__title {
    font-size: 24px;
    font-weight: 700;
    margin: 0;
    color: #000;
  }

  .mutation-history__cards {
    display: flex;
    flex-direction: column;
    gap: 12px;
    overflow-y: auto;
    padding-right: 8px;
  }

  .mutation-history__cards::-webkit-scrollbar {
    width: 6px;
  }

  .mutation-history__cards::-webkit-scrollbar-track {
    background: #f5f5f5;
    border-radius: 3px;
  }

  .mutation-history__cards::-webkit-scrollbar-thumb {
    background: #d9d9d9;
    border-radius: 3px;
  }

  .mutation-history__cards::-webkit-scrollbar-thumb:hover {
    background: #bbb;
  }

  .mutation-history__empty {
    text-align: center;
    color: #999;
    padding: 32px 16px;
    font-size: 16px;
  }
</style>
