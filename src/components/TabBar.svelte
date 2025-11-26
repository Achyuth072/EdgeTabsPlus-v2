<script lang="ts">
  import { tabsStore } from '../stores/tabsStore';
  import TabItem from './TabItem.svelte';

  function handleNewTab() {
    browser.runtime.sendMessage({ type: 'TAB_NEW' });
  }
</script>

<div class="tab-bar-container">
  <div class="tab-bar">
    <div class="tabs-list">
      {#each $tabsStore as tab (tab.id)}
        <TabItem {tab} isActive={tab.isActive} />
      {/each}
    </div>
    
    <button class="new-tab-button" onclick={handleNewTab} title="New tab">
      +
    </button>
  </div>
</div>

<style>
  .tab-bar-container {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    pointer-events: none;
  }

  .tab-bar {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    pointer-events: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  }

  .tabs-list {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    overflow-y: hidden;
    flex: 1;
    scrollbar-width: thin;
    scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
  }

  .tabs-list::-webkit-scrollbar {
    height: 4px;
  }

  .tabs-list::-webkit-scrollbar-track {
    background: transparent;
  }

  .tabs-list::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
  }

  .tabs-list::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.5);
  }

  .new-tab-button {
    flex-shrink: 0;
    width: 36px;
    height: 36px;
    padding: 0;
    background: rgba(0, 120, 212, 0.3);
    border: 1px solid rgba(0, 120, 212, 0.5);
    border-radius: 6px;
    cursor: pointer;
    color: white;
    font-size: 24px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.2s ease;
  }

  .new-tab-button:hover {
    background: rgba(0, 120, 212, 0.5);
    border-color: rgba(0, 120, 212, 0.7);
  }

  .new-tab-button:active {
    transform: scale(0.95);
  }

  /* Light theme adjustments */
  @media (prefers-color-scheme: light) {
    .tab-bar {
      background: rgba(255, 255, 255, 0.9);
      border-bottom-color: rgba(0, 0, 0, 0.1);
    }

    .tabs-list {
      scrollbar-color: rgba(0, 0, 0, 0.3) transparent;
    }

    .tabs-list::-webkit-scrollbar-thumb {
      background: rgba(0, 0, 0, 0.3);
    }

    .tabs-list::-webkit-scrollbar-thumb:hover {
      background: rgba(0, 0, 0, 0.5);
    }

    .new-tab-button {
      background: rgba(0, 120, 212, 0.2);
      border-color: rgba(0, 120, 212, 0.4);
      color: rgb(0, 120, 212);
    }

    .new-tab-button:hover {
      background: rgba(0, 120, 212, 0.3);
      border-color: rgba(0, 120, 212, 0.5);
    }
  }
</style>