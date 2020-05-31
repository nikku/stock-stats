<script>

  import { fetchStocks } from './util';

  import StockDataLoader from './StockDataLoader.svelte';

  let stocksURL;

  parseSearchParams();

  let stocksLoaded = stocksURL && fetchStocks(stocksURL);

  function parseSearchParams() {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    stocksURL = searchParams.get('stocks');
  }

</script>

<main>

  {#if stocksLoaded}

    {#await stocksLoaded}
      Loading stocks...
    {:then stocks}
      <StockDataLoader stocks={ stocks } />
    {:catch loadError}
      <p class="error">
        Could not load stocks: { loadError.message }
      </p>
    {/await}

  {:else}
    <div class="notice">

      <form method="get">
        <input bind:value={ stocksURL } placeholder="Enter location of stocks.csv source" />
        <input type="hidden" name="stocks" value={ stocksURL } />
        <button class="primary" type="submit" disabled={ !stocksURL }>
          Open
        </button>

        <div class="hint">
          This has to be a semicolon separated list of (Name, ISIN) for each stock that should be shown. <br/>
          First line will be ignored. <a rel="download" href="stocks.csv">Download example</a> or <a href="?stocks=stocks.csv" target="_blank" rel="noopener noreferer">explore in action</a>.
        </div>

      </form>

    </div>
  {/if}
</main>

<style>

  h1,
  .intro,
  .notice {
    margin: var(--site-margin);
  }

  .hint {
    margin-top: 5px;
    line-height: 1.2rem;
    font-size: var(--font-size-small);
  }

  .notice {
    border: solid 1px var(--gray-3);
    padding: 20px;
    border-radius: 2px;
    background: var(--gray-6);
  }

  @media(min-width: 768px) {
    .notice input {
      width: 500px;
    }
  }
</style>