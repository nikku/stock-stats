<script>
  import {
    fetchStockInformation
  } from './util';

  import StocksStats from './StocksStats.svelte';

  export let stocks;

  export let quotesService = null;

  export let now;

  let stocksWithData;

  $: fetchStockData(stocks, now).then(stockData => stocksWithData = stocks.map(stock => {
    return {
      ...stock,
      data: stockData[stock.isin]
    }
  }));

  function fetchStockData(stocks, now) {

    return Promise.all(stocks.map(stock => {

      const { isin } = stock;

      return fetchStockInformation(isin, now).then(info => {

        return {
          isin,
          info
        };
      })
    })).then(results => results.reduce((keyed, result) => {

      keyed[result.isin] = result.info;

      return keyed;
    }, {}));
  }
</script>

<StocksStats
  stocks={ stocksWithData || stocks }
  quotesService={ quotesService }
  now={ now }
/>