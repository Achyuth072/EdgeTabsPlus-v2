<script lang="ts">
  import { createEventDispatcher } from "svelte";

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
    {
      label: "Duplicate",
      action: "duplicate",
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>`,
    },
    {
      label: "Close",
      action: "close",
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>`,
    },
    {
      label: "Close Others",
      action: "close-others",
      icon: `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>`,
    },
  ];

  function handleAction(action: string) {
    dispatch("action", { action, tabId });
  }

  function handleClickOutside(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest(".context-menu")) {
      dispatch("close");
    }
  }

  function handleKeyDown(event: KeyboardEvent) {
    if (event.key === "Escape") {
      dispatch("close");
    }
  }

  // Clamp position to viewport bounds
  $: clampedX = Math.min(Math.max(x, 10), window.innerWidth - 160);
  $: clampedY = Math.min(Math.max(y, 10), window.innerHeight - 150);
</script>

{#if visible}
  <div
    class="context-menu-overlay"
    onclick={handleClickOutside}
    onkeydown={handleKeyDown}
    role="button"
    tabindex="0"
    aria-label="Close context menu"
  >
    <div
      class="context-menu"
      style="left: {clampedX}px; top: {clampedY}px;"
      role="menu"
    >
      {#each menuItems as item}
        <button
          class="menu-item"
          onclick={() => handleAction(item.action)}
          role="menuitem"
        >
          <span class="menu-icon">{@html item.icon}</span>
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
    color: rgba(255, 255, 255, 0.9);
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
    color: rgba(255, 255, 255, 0.95) !important;
    font-size: 14px;
    font-family:
      system-ui,
      -apple-system,
      BlinkMacSystemFont,
      "Segoe UI",
      Roboto,
      Oxygen,
      Ubuntu,
      Cantarell,
      "Open Sans",
      "Helvetica Neue",
      sans-serif;
    font-weight: 500;
    text-align: left;
    transition: background 0.15s ease;
    min-height: 44px;
    appearance: none;
    -webkit-appearance: none;
    text-shadow: 0 1px 2px rgba(0, 0, 0, 0.5);
  }

  .menu-item:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .menu-item:active {
    background: rgba(255, 255, 255, 0.15);
    transform: scale(0.98);
  }

  .menu-icon {
    width: 16px;
    height: 16px;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .menu-label {
    flex: 1;
  }
</style>
