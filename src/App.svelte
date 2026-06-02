<script lang="ts">
  import type { EmutationMonster } from '$types/index';
  import { EmutationRarity } from '$types/index';
  import MutationHistory from './components/MutationHistory.svelte';
  import MutationWindow from './components/MutationWindow.svelte';

  let monsters = $state<EmutationMonster[]>([]);
  let isAbsoluteMonster = $state(false);
  const maxHistory = 6;
  const ABSOLUTE_MONSTER_TITLE = 'Вы создали абсолютного монстрика!';
  let originalTitle = $state('');

  // Store original title on mount and cleanup on unmount
  $effect(() => {
    originalTitle = document.title;
    
    return () => {
      document.title = originalTitle;
    };
  });

  // Handle monster generated event from MutationWindow via callback prop
  function handleMonsterGenerated(monster: EmutationMonster) {
    // Add to history (at the beginning)
    monsters = [monster, ...monsters].slice(0, maxHistory);
    
    // Check for NONEXISTING rarity - trigger absolute monster effect
    if (monster.rarity === EmutationRarity.NONEXISTING) {
      triggerAbsoluteMonsterEffect();
    }
  }

  // Trigger the special NONEXISTING monster effect
  function triggerAbsoluteMonsterEffect() {
    isAbsoluteMonster = true;
    document.title = ABSOLUTE_MONSTER_TITLE;
  }
</script>

<main class="app">
  <header class="app__header">
    <h1 class="app__title">Лаборатория эмодзи-монстриков</h1>
  </header>

  <div class="app__content">
    <section class="app__mutation-section">
      <MutationWindow onMonsterGenerated={handleMonsterGenerated} />
    </section>

    <section class="app__history-section">
      <MutationHistory monsters={monsters} />
    </section>
  </div>
</main>

<style>
  .app {
    min-height: 100vh;
    display: flex;
    flex-direction: column;
    background: #f5f5f5;
  }

  .app__header {
    padding: 24px 16px;
    text-align: center;
    background: #fff;
    border-bottom: 1px solid #d9d9d9;
  }

  .app__title {
    font-size: 32px;
    font-weight: 700;
    margin: 0;
    color: #000;
    line-height: 1.3;
  }

  .app__content {
    flex: 1;
    display: flex;
    gap: 24px;
    padding: 24px;
    max-width: 1200px;
    margin: 0 auto;
    width: 100%;
    box-sizing: border-box;
  }

  .app__mutation-section {
    flex: 1;
    min-width: 0;
  }

  .app__history-section {
    flex: 0 0 380px;
    min-width: 0;
  }

  @media (max-width: 900px) {
    .app__content {
      flex-direction: column;
    }

    .app__history-section {
      flex: 1;
    }

    .app__title {
      font-size: 24px;
    }
  }
</style>