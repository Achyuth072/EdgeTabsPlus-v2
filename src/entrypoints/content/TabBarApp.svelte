<script lang="ts">
  import TabBar from "../../components/TabBar.svelte";
  import ScrollManager from "../../components/ScrollManager.svelte";
  import { settingsStore } from "../../stores/settingsStore";
  import { onMount } from "svelte";

  let isPWA = false;

  onMount(() => {
    // Check PWA mode
    const mediaQuery = window.matchMedia("(display-mode: standalone)");
    isPWA = mediaQuery.matches;

    // Listen for changes
    const handler = (e: MediaQueryListEvent) => {
      isPWA = e.matches;
    };
    mediaQuery.addEventListener("change", handler);

    return () => {
      mediaQuery.removeEventListener("change", handler);
    };
  });

  // Reactive visibility check
  $: isVisible = !(isPWA && $settingsStore.disableInPwa);
</script>

{#if isVisible}
  <ScrollManager position={$settingsStore.tabBarPosition}>
    <TabBar />
  </ScrollManager>
{/if}

<style>
  :global(:host) {
    all: initial;
  }
</style>
