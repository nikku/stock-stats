<script>

  import { onMount } from 'svelte';

  import ChartLoader from './ChartLoader.svelte';

  import StockDetails from './StockDetails.svelte';

  const periods = {
    intraday: 'Intraday',
    woche: 'Woche',
    monat: 'Monat',
    monat6: '6 Monate',
    jahr: 'Jahr'
  };

  const periodEntries = Object.entries(periods);

  export let stocks;
  export let now;

  // persistent search and stuff
  let period;
  let filter;

  parseSearchParams();

  let updateTimer;

  let filterInputEl;

  $: filteredStocks = filterStocks(stocks, filter);

  function filterStocks(stocks, filterTerms) {
    if (!filter) {
      return stocks;
    }

    const terms = filter.split(',').map(t => t.trim().toLowerCase()).filter(t => t)

    const found = {};

    for (const term of terms) {

      for (const stock of stocks) {
        const {
          isin,
          name
        } = stock;

        if (found[isin]) {
          continue;
        }

        if (name.toLowerCase().includes(term) || term === isin.toLowerCase()) {
          found[isin] = stock;
        }
      }
    }

    return Object.values(found);
  }

  function handleKey(e) {

    if (e.code == 'KeyF' && e.ctrlKey) {
      filterInputEl.focus();
      filterInputEl.select();

      e.preventDefault();
      e.stopPropagation();
    }
  }

  function parseSearchParams(defaults) {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const _period = searchParams.get('period');

    filter = searchParams.get('filter') || '';
    period = periods[_period] && _period || 'woche';
  }

  $: updateSearchParams({ filter, period });

  function updateSearchParams({ filter, period }) {

    const href = window.location.href;
    const url = new URL(href);

    const searchParams = url.searchParams;

    if (!filter) {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }

    searchParams.set('period', period);

    const title = `${filter ? 'Filtered Stocks=' + filter : 'All stocks'} (period=${ period }) - Stock Stats`;

    const newHref = url.toString();

    if (href !== newHref) {
      window.history.pushState({ filter, period }, title, newHref);

      document.title = title;
    }
  }

  function createStockDeepLink(stock) {
    const href = window.location.href;
    const url = new URL(href);

    const searchParams = url.searchParams;

    searchParams.set('filter', stock.name);

    return url.toString();
  }

  let headerEl;

  let stickyHeader = false;

  let stickyOffset;

  onMount(() => {
    stickyOffset = headerEl.offsetTop;
  });

  function checkSticky() {
    stickyHeader = window.pageYOffset > stickyOffset;
  }
</script>

<svelte:window
  on:keydown={ handleKey }
  on:popstate={ parseSearchParams }
  on:scroll={ checkSticky }
/>

<div class="head-container" class:sticky={ stickyHeader } bind:this={ headerEl }>
  <div class="head">

    <div class="period">
      {#each periodEntries as [ key, label ]}
        <button class:primary={ period ==key }  on:click={ () => period = key }>{ label }</button>
      {/each}
    </div>

    <div class="filter">
      <input type="search" placeholder="Filter nach Name oder ISIN" bind:value={ filter } bind:this={ filterInputEl }/> <span class="filtered-count">{ filter ? filteredStocks.length + '/' + stocks.length : ''}</span>
    </div>
  </div>
</div>

<div class="stocks">

  {#each filteredStocks as stock}
    <div class="stock">
      <div class="stock-head">
        <h3>
          <a href={ createStockDeepLink(stock) }>{ stock.name }</a>

          <StockDetails data={ stock.data } />
        </h3>
        <div class="actions">
          <a class="button" title="Stock information" href="https://www.dkb.de/kurse/portrait.html?isin={ stock.isin }">
            I
          </a>
          <a class="button" title="Kaufen" href="https://www.dkb.de/-?$part=DkbTransactionBanking.content.brokerage.processes.SecurityOrder&$event=$pageflow-start&buy=true&wknIsin={ stock.isin }" target="_blank" rel="noreferrer noopener">K</a>
          <a class="button" title="Verkaufen" href="https://www.dkb.de/-?$part=DkbTransactionBanking.content.brokerage.processes.SecurityOrder&$event=$pageflow-start&sell=true&wknIsin={ stock.isin }" target="_blank" rel="noreferrer noopener">V</a>
        </div>
      </div>

      <div class="chart">
        <ChartLoader
          isin={ stock.isin }
          period={ period }
          now={ now }
        />
      </div>

      <div class="credit">
        Data: <a href="https://www.tradegate.de/orderbuch.php?isin={ stock.isin }">Tradegate</a>,
        ISIN: { stock.isin }
      </div>
    </div>
  {/each}
</div>

<style>
  :root {
    --grid-width: 370px;
  }

  .head {
    padding: 10px var(--site-margin);

    display: flex;
    align-items: center
  }

  .head .period {
    flex: 1;
  }

  .head .period button + button {
    margin-left: .3rem;
  }

  @media(min-width: 1024px) {
    .head .filter {
      min-width: 30%;
      display: flex;
      align-items: center;
    }

    .head .filter input {
      width: auto;
      flex: 1;
      margin: 0;
    }
  }

  .head .filter {
    flex: 0;
    white-space: nowrap;
  }

  .head .filtered-count {
    margin-left: .3rem;
    color: var(--gray-3);
  }

  .head button,
  .head input {
    margin-bottom: 0;
  }

  .credit {
    font-size: var(--font-size-small);
    color: var(--gray-2);
  }

  .stock {
    width: var(--grid-width);
  }

  .stock-head {
    display: flex;
    margin-bottom: 10px;

    align-items: center;
  }

  .stock-head h3 a {
    color: var(--gray-1);
    text-decoration: none;
  }

  .stock-head h3 {
    margin: 0;

    flex: 1;
  }

  .stock-head .actions {
    white-space: nowrap;
    margin: 0 20px;
    flex: 0;
    font-size: .8em;
  }

  .stocks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-width), 1fr));
    grid-gap: 3rem 1rem;

    margin: var(--site-margin);
  }

  @media(max-width: 768px) {
    .stocks {
      grid-template-columns: repeat(auto-fill, minmax(min(--grid-width, 100%), 1fr));
    }
  }

  /* sticky header position */
  .head-container.sticky {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    background: var(--gray-6);
    border-bottom: solid 1px var(--gray-4);
  }

  .head-container.sticky + .stocks {
    padding-top: 30px;
  }

  .head-container {
    margin-bottom: 1.5rem;
  }
</style>