<script lang="ts">
  import TabBar from '../../components/TabBar.svelte';
  import ScrollManager from '../../components/ScrollManager.svelte';
</script>

<ScrollManager>
  <TabBar />
</ScrollManager>

<style>
  :global(:host) {
    all: initial;
  }
</style>