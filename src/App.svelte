<script>
  import { onMount, onDestroy } from 'svelte';

  import StocksLoader from './StocksLoader.svelte';

  import StockDataLoader from './StockDataLoader.svelte';

  export let quotesService;

  export let stocks = null;

  function sortStocks(stocks) {
    return stocks.slice().sort((a, b) => {
      var nameA = a.name.toUpperCase();
      var nameB = b.name.toUpperCase();

      if (nameA < nameB) {
        return -1;
      }

      if (nameA > nameB) {
        return 1;
      }
      return 0;
    });
  }

  let updateTimer;

  let now = Date.now();

  function tick() {
    now = Date.now();
  }

  function startTick() {
    if (Date.now() - 30000 > now) {
      tick();
    }

    updateTimer = setInterval(tick, 30000);
  }

  function stopTick() {
    clearInterval(updateTimer);
  }

  onMount(startTick);

  onDestroy(stopTick);
</script>

<svelte:window
  on:focus={ () => startTick() }
  on:blur={ () => stopTick() }
/>

<main>

  {#if !stocks}
    <StocksLoader onStocksLoaded={ _stocks => console.log(stocks = sortStocks(_stocks)) } />
  {:else}
    <StockDataLoader stocks={ stocks } quotesService={ quotesService } now={ now } />
  {/if}

</main>