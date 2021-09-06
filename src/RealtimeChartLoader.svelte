<script>
  import RealtimeChart from './RealtimeChart.svelte';
  import DataLoader from './DataLoader.svelte';

  import Loader from './Loader.svelte';
  import Placeholder from './Placeholder.svelte';

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

  {#if error}
    <div class="error">
      E: { error.message }
    </div>
  {/if}

  {#if result}
    <RealtimeChart
      data={ result }
      period={ period }
      svgStyle="height: var(--chart-height)"
    />
  {:else}
    <Placeholder>
      <div style="height: var(--chart-height)"></div>
    </Placeholder>
  {/if}

  {#if state === 'loading'}
    <Loader />
  {/if}
</DataLoader>

<style>

  :root {
    --chart-height: 240px;
  }

  .error {
    font-size: var(--font-size-small);
    color: var(--white);
    background: var(--red);
    padding: 5px;
    border-radius: var(--border-radius-small);
    margin-bottom: 10px;
  }
</style>