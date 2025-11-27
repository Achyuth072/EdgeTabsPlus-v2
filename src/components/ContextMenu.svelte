<script lang="ts">
  import { createEventDispatcher } from 'svelte';

  export let tabId: number;
  export let x: number = 0;
  export let y: number = 0;
  export let visible: boolean = false;

  const dispatch = createEventDispatcher();

  interface MenuItem {
    label: string;
    action: string;
    icon: string;
  }

  const menuItems: MenuItem[] = [
    { label: 'Duplicate', action: 'duplicate', icon: '📋' },
    { label: 'Close', action: 'close', icon: '✕' },
    { label: 'Close Others', action: 'close-others', icon: '🗑️' },
  ];

  function handleAction(action: string) {
    dispatch('action', { action, tabId });
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.context-menu')) {
      dispatch('close');
    }
  }

  // Clamp position to viewport bounds
  $: clampedX = Math.min(Math.max(x, 10), window.innerWidth - 160);
  $: clampedY = Math.min(Math.max(y, 10), window.innerHeight - 150);
</script>

{#if visible}
  <div class="context-menu-overlay" on:click={handleClickOutside}>
    <div
      class="context-menu"
      style="left: {clampedX}px; top: {clampedY}px;"
      role="menu"
    >
      {#each menuItems as item}
        <button
          class="menu-item"
          on:click={() => handleAction(item.action)}
          role="menuitem"
        >
          <span class="menu-icon">{item.icon}</span>
          <span class="menu-label">{item.label}</span>
        </button>
      {/each}
    </div>
  </div>
{/if}

<style>
  .context-menu-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 2147483646;
    background: transparent;
  }

  .context-menu {
    position: fixed;
    min-width: 150px;
    background: rgba(30, 30, 30, 0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255, 255, 255, 0.15);
    border-radius: 8px;
    padding: 4px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
    animation: fadeIn 0.15s ease-out;
    z-index: 2147483647;
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .menu-item {
    display: flex;
    align-items: center;
    gap: 10px;
    width: 100%;
    padding: 10px 12px;
    background: transparent;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    color: rgba(255, 255, 255, 0.9);
    font-size: 14px;
    text-align: left;
    transition: background 0.15s ease;
    min-height: 44px;
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .menu-item:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
  }

  .menu-icon {
    font-size: 16px;
    flex-shrink: 0;
  }

  .menu-label {
    flex: 1;
  }

  /* Light theme adjustments */
  @media (prefers-color-scheme: light) {
    .context-menu {
      background: rgba(255, 255, 255, 0.95);
      border-color: rgba(0, 0, 0, 0.15);
    }

    .menu-item {
      color: rgba(0, 0, 0, 0.9);
    }

    .menu-item:hover {
      background: rgba(0, 0, 0, 0.05);
    }

    .menu-item:active {
      background: rgba(0, 0, 0, 0.1);
    }
  }
</style>