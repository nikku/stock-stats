<script>
  import RealtimeChart from './RealtimeChart.svelte';

  import Loader from './Loader.svelte';

  export let isin;

  let periodDE; export { periodDE as period };

  export let now;

  export let quotesService;

  const periods = {
    intraday: 'intraday',
    woche: 'week',
    monat: 'month',
    monat6: 'month6',
    jahr: 'year'
  };

  $: period = periods[periodDE];

  $: dataLoaded = fetchStockPoints(isin, period, now);

  function fetchStockPoints(isin, period, now) {
    return (
      fetch(`${quotesService}/stats/${isin}?period=${period}&now=${now}`)
        .then(r => r.json())
    );
  }
</script>

{#await dataLoaded}
  <div class="loader">
    <Loader />
  </div>
{:then data}
  <RealtimeChart
    data={ data }
    period={ period }
    svgStyle="var(--chart-height)"
  />
{:catch loadError}
  <p class="error">
    Could not load chart: { loadError.message }
  </p>
{/await}


<style>

  :root {
    --chart-height: 240px;
  }

  .loader {
    height: var(--chart-height);
    border-radius: 5px;
    background: var(--gray-6);
    position: relative;
  }

</style>