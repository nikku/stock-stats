<script>
  import StocksLoader from './StocksLoader.svelte';

  import StockDataLoader from './StockDataLoader.svelte';

  export let quotesService;

  export let stocks = null;
</script>

<main>

  {#if !stocks}
    <StocksLoader onStocksLoaded={ (_stocks) => stocks = _stocks } />
  {:else}
    <StockDataLoader stocks={ stocks } quotesService={ quotesService } />
  {/if}

</main>