<script>
  import Chart from './Chart.svelte';

  import Loader from './Loader.svelte';

  export let isin;

  let periodDE; export { periodDE as period };

  export let now;

  const periods = {
    intraday: 'intraday',
    woche: 'week',
    monat: 'month',
    monat6: 'month6',
    jahr: 'year'
  };

  $: period = periods[periodDE];

  $: dataLoaded = fetchStockPoints(isin, period, now).then(results => console.log(results) || results);

  function fetchStockPoints(isin, period, now) {
    return (
      fetch(`http://localhost:3000/stats/${isin}?period=${period}&now=${now}`)
        .then(r => r.json())
    );
  }
</script>

{#await dataLoaded}
  ...
{:then data}
  <Chart data={ data } period={ period } />
{:catch loadError}
  <p class="error">
    Could not load chart: { loadError.message }
  </p>
{/await}