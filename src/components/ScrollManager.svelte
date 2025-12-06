<script lang="ts">
  import { onMount } from "svelte";
  import { settingsStore } from "../stores/settingsStore";

  export let position: "top" | "bottom" = "top";

  let isVisible = true;
  let lastScrollY = 0;
  let ticking = false;
  let scrollBehavior: "always-show" | "hide-on-scroll" = "hide-on-scroll";

  const SCROLL_THRESHOLD = 10; // pixels before triggering hide/show

  // Subscribe to settings
  const unsubscribe = settingsStore.subscribe((settings) => {
    scrollBehavior = settings.scrollBehavior;
    // If set to always show, make sure it's visible
    if (scrollBehavior === "always-show") {
      isVisible = true;
    }
  });

  function handleScroll() {
    // Don't hide if set to always show
    if (scrollBehavior === "always-show") {
      isVisible = true;
      return;
    }

    const currentScrollY = window.scrollY;

    // Only process if we've scrolled more than threshold
    if (Math.abs(currentScrollY - lastScrollY) < SCROLL_THRESHOLD) {
      return;
    }

    // Scrolling down - hide bar
    if (currentScrollY > lastScrollY && currentScrollY > 50) {
      isVisible = false;
    }
    // Scrolling up - show bar
    else if (currentScrollY < lastScrollY) {
      isVisible = true;
    }

    // At top of page - always show (only relevant for top bar)
    if (position === "top" && currentScrollY <= 50) {
      isVisible = true;
    }

    lastScrollY = currentScrollY;
  }

  function onScroll() {
    if (!ticking) {
      window.requestAnimationFrame(() => {
        handleScroll();
        ticking = false;
      });
      ticking = true;
    }
  }

  onMount(() => {
    // Use passive listener for better performance
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      window.removeEventListener("scroll", onScroll);
      unsubscribe();
    };
  });
</script>

<div
  class="scroll-manager"
  class:hidden={!isVisible}
  class:top={position === "top"}
  class:bottom={position === "bottom"}
>
  <slot />
</div>

<style>
  .scroll-manager {
    position: fixed;
    left: 0;
    right: 0;
    z-index: 2147483647;
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .scroll-manager.top {
    top: 0;
    bottom: auto;
    transform: translateY(0);
  }

  .scroll-manager.bottom {
    top: auto;
    bottom: 0;
    transform: translateY(0);
  }

  .scroll-manager.top.hidden {
    transform: translateY(-100%);
  }

  .scroll-manager.bottom.hidden {
    transform: translateY(100%);
  }
</style>
