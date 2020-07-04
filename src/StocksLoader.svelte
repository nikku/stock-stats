<script>
  import { fetchStocks } from './util';

  import Loader from './Loader.svelte';

  export let onStocksLoaded;

  let {
    stocksURL
  } = parseSearchParams();

  let stocksLoaded = stocksURL && fetchStocks(stocksURL).then(onStocksLoaded);

  function parseSearchParams() {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    return {
      stocksURL: searchParams.get('stocks')
    };
  }
</script>

<div class="stocks-loader">
  {#if stocksLoaded}

    {#await stocksLoaded}
      <Loader />
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

</div>

<style>

  .stocks-loader {
    padding: var(--site-margin);
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