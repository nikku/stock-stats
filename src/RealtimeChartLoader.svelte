<script>
  import RealtimeChart from './RealtimeChart.svelte';
  import DataLoader from './DataLoader.svelte';

  import Loader from './Loader.svelte';

  export let isin;

  let periodDE; export { periodDE as period };

  export let now;

  export let quotesService;

  export let end;

  const periods = {
    intraday: 'intraday',
    woche: 'week',
    monat: 'month',
    monat6: 'month6',
    jahr: 'year'
  };

  $: period = periods[periodDE];

  $: args = [ isin, period, end, now ];

  function fetchStockPoints(isin, period, end, now) {
    return (
      fetch(`${quotesService}/stats/${isin}?period=${period}&end=${end.toISOString()}&now=${now}`)
        .then(r => r.json())
    );
  }
</script>

<DataLoader
  loader={ fetchStockPoints } args={ args }
  let:state
  let:result
  let:error
>

  {#if state === 'loading'}
    <div class="loader" class:placeholder={ !result }>
      <Loader />
    </div>
  {/if}

  {#if result}
    <RealtimeChart
      data={ result }
      period={ period }
      svgStyle="height: var(--chart-height)"
    />
  {/if}

  {#if error}
    <p class="error">
      Could not load chart: { error.message }
    </p>
  {/if}
</DataLoader>

<style>

  :root {
    --chart-height: 240px;
  }

  .loader {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }

  .loader.placeholder {
    height: var(--chart-height);
    background: var(--gray-6);
    border-radius: 5px;
  }

</style>