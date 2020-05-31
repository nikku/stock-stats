<script>

  import { onMount, onDestroy } from 'svelte';

  import {
    fetchBrokerInformation,
    fetchStockInformation
  } from './util';

  import StocksStats from './StocksStats.svelte';

  export let stocks;

  let now = Date.now();

  let updateTimer;

  let stocksWithData;

  $: fetchStockData(stocks, now).then(stockData => stocksWithData = stocks.map(stock => {
    return {
      ...stock,
      data: stockData[stock.isin]
    }
  }));

  // TODO(nikku): not working, due to CORS
  // let brokerInfo;

  // $: brokerInformationLoaded = fetchBrokerInformation(now).then(_brokerInfo => brokerInfo = _brokerInfo);

  function fetchStockData(stocks, now) {

    return Promise.all(stocks.map(s => {

      const isin = s.isin;

      return fetchStockInformation(s.isin, now).then(info => {

        return {
          isin: s.isin,
          info
        };
      })
    })).then(results => results.reduce((keyed, result) => {

      keyed[result.isin] = result.info;

      return keyed;
    }, {}));
  }

  function tick() {
    now = Date.now();
  }

  onMount(() => {
    updateTimer = setInterval(tick, 30000);
  });

  onDestroy(() => {
    clearInterval(updateTimer);
  });
</script>

<StocksStats stocks={ stocksWithData || stocks } now={ now } />