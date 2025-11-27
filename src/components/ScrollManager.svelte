<script lang="ts">
  import { onMount } from 'svelte';

  let isVisible = true;
  let lastScrollY = 0;
  let ticking = false;

  const SCROLL_THRESHOLD = 10; // pixels before triggering hide/show

  function handleScroll() {
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

    // At top of page - always show
    if (currentScrollY <= 50) {
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
    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  });
</script>

<div class="scroll-manager" class:hidden={!isVisible}>
  <slot />
</div>

<style>
  .scroll-manager {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 2147483647;
    transform: translateY(0);
    transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: transform;
  }

  .scroll-manager.hidden {
    transform: translateY(-100%);
  }
</style>