<script>

  import { onMount } from 'svelte';

  import RealtimeChartLoader from './RealtimeChartLoader.svelte';
  import Chart from './Chart.svelte';

  import StockDetails from './StockDetails.svelte';

  const periods = {
    intraday: 'Intraday',
    woche: 'Woche',
    monat: 'Monat',
    monat6: '6 Monate',
    jahr: 'Jahr'
  };

  const periodLengths = {
    intraday: 1000 * 60 * 60 * 24,
    woche: 1000 * 60 * 60 * 24 * 7,
    monat: 1000 * 60 * 60 * 24 * 30,
    monat6: 1000 * 60 * 60 * 24 * 30 * 6,
    jahr: 1000 * 60 * 60 * 24 * 365
  };

  const refreshResolution = {
    intraday: 1,
    woche: 1000,
    monat: 1000,
    monat6: 1000,
    jahr: 1000
  };

  const periodEntries = Object.entries(periods);

  export let quotesService = null;
  export let stocks;

  // the time, coming from the app
  let _now; export { _now as now };

  // the actual local time, with refresh resolution applied
  let now;

  // persistent search and stuff
  let period;
  let filter;
  let expandStocks;
  let page = 0;

  parseSearchParams();

  let filterInputEl;

  $: end = new Date(Date.now() - periodLengths[period] * page);

  $: filteredStocks = filterStocks(stocks, filter);

  $: {
    const newNow = Math.ceil(_now / refreshResolution[period]) * refreshResolution[period];

    if (now !== newNow) {
      now = newNow;

      console.log('refresh', new Date(now));
    }
  };

  function filterStocks(stocks, filterTerms) {
    if (!filterTerms) {
      return stocks;
    }

    const terms = Array.from(filterTerms.matchAll(/(?:"([^"]*)(?:"|$)|([^,]*)),?/g), m => m[1] || m[2]).map(t => t.trim().toLowerCase()).filter(t => t);

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

  function parseSearchParams() {
    const url = new URL(window.location.href);
    const searchParams = url.searchParams;

    const _period = searchParams.get('period');
    const _expandStocks = searchParams.get('expand-stocks');

    filter = searchParams.get('filter') || '';
    expandStocks = _expandStocks !== null ? _expandStocks.split(/,/) : null;
    period = periods[_period] && _period || 'woche';
    page = parseInt(searchParams.get('page') || '0', 10);

    quotesService = searchParams.get('quotes-service') || quotesService;
  }

  $: updateSearchParams({ filter, period, page, expandStocks });

  function updateSearchParams({ filter, period, page, expandStocks }) {

    const href = window.location.href;
    const url = new URL(href);

    const searchParams = url.searchParams;

    if (!filter) {
      searchParams.delete('filter');
    } else {
      searchParams.set('filter', filter);
    }

    if (!expandStocks) {
      searchParams.delete('expand-stocks');
    } else {
      searchParams.set('expand-stocks', expandStocks.join(','));
    }

    searchParams.set('period', period);

    if (page) {
      searchParams.set('page', page);
    } else {
      searchParams.delete('page');
    }

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

    searchParams.set('filter', stock.name.includes(',') ? `"${ stock.name }"` : stock.name);

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

  function changePage(direction) {
    page = Math.max(0, page + direction);
  }

  let dropdownOpen = false;
</script>

<svelte:window
  on:keydown={ handleKey }
  on:popstate={ parseSearchParams }
  on:scroll={ checkSticky }
  on:click={ () => {
    dropdownOpen = false;
  } }
/>

<div class="head-container" class:sticky={ stickyHeader } bind:this={ headerEl }>
  <div class="head">

    <div class="outer-section">
      <div
        class="section period button primary dropdown"
        class:open={ dropdownOpen }
        on:click|stopPropagation={ () => dropdownOpen = !dropdownOpen }
      >

        { periods[period] }

        <div class="dropdown-menu">
          {#each periodEntries as [ key, label ]}
            <a class="dropdown-item button" on:click|preventDefault={ () => (period = key) }>
              { label }
            </a>
          {/each}
        </div>
      </div>

      {#if quotesService}
        <div class="section page">
          <button on:click={ () => changePage(1) }>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="currentColor" d="M9.78 12.78a.75.75 0 01-1.06 0L4.47 8.53a.75.75 0 010-1.06l4.25-4.25a.75.75 0 011.06 1.06L6.06 8l3.72 3.72a.75.75 0 010 1.06z"></path></svg>
          </button><button on:click={ () => changePage(-1)} disabled={ !page }>
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill-rule="evenodd" fill="currentColor" d="M6.22 3.22a.75.75 0 011.06 0l4.25 4.25a.75.75 0 010 1.06l-4.25 4.25a.75.75 0 01-1.06-1.06L9.94 8 6.22 4.28a.75.75 0 010-1.06z"></path></svg>
          </button>
          {#if page}
            <span class="context-info">End = { end.getDate() }/{ end.getMonth() + 1 }/{ end.getFullYear() }</span>
          {/if}
        </div>
      {/if}

      <div class="section spacer"></div>

      <div class="section details-toggle" class:compact={ expandStocks }>
        <button on:click={ () => expandStocks = expandStocks ? null : [] } title="Toggle compact view mode">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" width="16" height="16"><path fill="currentColor" fill-rule="evenodd" d="M0 3.75C0 2.784.784 2 1.75 2h12.5c.966 0 1.75.784 1.75 1.75v8.5A1.75 1.75 0 0114.25 14H1.75A1.75 1.75 0 010 12.25v-8.5zm1.75-.25a.25.25 0 00-.25.25v8.5c0 .138.112.25.25.25h12.5a.25.25 0 00.25-.25v-8.5a.25.25 0 00-.25-.25H1.75zM3.5 6.25a.75.75 0 01.75-.75h7a.75.75 0 010 1.5h-7a.75.75 0 01-.75-.75zm.75 2.25a.75.75 0 000 1.5h4a.75.75 0 000-1.5h-4z"></path></svg>
        </button>
      </div>
    </div>
    <div class="outer-section section filter">
      <input type="search" placeholder="Filter nach Name oder ISIN" bind:value={ filter } bind:this={ filterInputEl }/>{#if filter}<span class="context-info">Filtered = { filteredStocks.length }/{stocks.length}</span>{/if}
    </div>
  </div>
</div>

<div class="stocks" class:compact={ expandStocks }>

  {#each filteredStocks as stock (stock.isin)}
    <div class="stock" class:expanded={ expandStocks && expandStocks.includes(stock.isin) }>
      <div class="stock-head">
        <h3>
          <a href={ createStockDeepLink(stock) }>{ stock.name }</a>

          <StockDetails data={ stock.data } />
        </h3>
        <div class="actions">
          {#if expandStocks }
            <a class="button" style="padding: .3rem .1rem" on:click={
              () => expandStocks = expandStocks.includes(stock.isin) ? expandStocks.filter(isin => isin !== stock.isin) : expandStocks.concat(stock.isin)
            }>

              {#if expandStocks.includes(stock.isin) }
                <svg xmlns="http://www.w3.org/2000/svg" style="vertical-align: bottom" viewBox="0 0 16 16" width="16" height="16"><path d="M4.427 9.573l3.396-3.396a.25.25 0 01.354 0l3.396 3.396a.25.25 0 01-.177.427H4.604a.25.25 0 01-.177-.427z"></path></svg>
              {:else}
                <svg xmlns="http://www.w3.org/2000/svg" style="vertical-align: bottom" viewBox="0 0 16 16" width="16" height="16"><path d="M4.427 7.427l3.396 3.396a.25.25 0 00.354 0l3.396-3.396A.25.25 0 0011.396 7H4.604a.25.25 0 00-.177.427z"></path></svg>
              {/if}
            </a>
            <span class="spacer"></span>
          {/if}

          <a class="button" title="Stock information" href="https://www.dkb.de/kurse/portrait.html?isin={ stock.isin }">
            I
          </a>
          <a class="button" title="Kaufen" href="https://www.dkb.de/-?$part=DkbTransactionBanking.content.brokerage.processes.SecurityOrder&$event=$pageflow-start&buy=true&wknIsin={ stock.isin }" target="_blank" rel="noreferrer noopener">K</a>
          <a class="button" title="Verkaufen" href="https://www.dkb.de/-?$part=DkbTransactionBanking.content.brokerage.processes.SecurityOrder&$event=$pageflow-start&sell=true&wknIsin={ stock.isin }" target="_blank" rel="noreferrer noopener">V</a>
        </div>
      </div>

      {#if !expandStocks || expandStocks.includes(stock.isin) }
        <div class="chart">
          {#if quotesService}
            <RealtimeChartLoader
              isin={ stock.isin }
              period={ period }
              end={ end }
              quotesService={ quotesService }
              now={ now }
            />
          {:else}
            <Chart
              isin={ stock.isin }
              period={ period }
              now={ now }
            />
          {/if}
        </div>

        <div class="credit">
          Data: <a href="https://www.tradegate.de/orderbuch.php?isin={ stock.isin }">Tradegate</a>,
          ISIN: { stock.isin }
        </div>
      {/if}
    </div>
  {/each}
</div>

<style>
  :root {
    --grid-width: 370px;
  }

  .head {
    padding: 0 var(--site-margin);

    display: flex;
    align-items: center;
    flex-wrap: wrap;
  }

  .head .filter,
  .head .period,
  .head .page {
    flex: initial;
    white-space: nowrap;
    margin: 10px 0;
  }

  .head .outer-section {
    display: flex;
    flex-direction: row;
    align-items: center;
    flex: 1;
  }

  .head .outer-section.filter {
    flex: initial;
  }

  .head .spacer {
    flex: 1;
  }

  .head button + button {
    margin-left: .3rem;
  }

  .head .section + .section {
    margin-left: 1rem;
  }

  .details-toggle svg {
    color: var(--gray-1);
  }

  .details-toggle.compact svg {
    color: var(--gray-3);
  }

  .head .context-info {
    margin-left: .3rem;
    color: var(--gray-3);
    font-size: .85rem;
  }

  .head button svg {
    vertical-align: -.1rem;
  }

  .head button,
  .head input {
    margin-bottom: 0;
  }

  .credit {
    font-size: var(--font-size-small);
    color: var(--gray-2);
    margin-top: 10px;
  }

  .stock {
    width: var(--grid-width);
  }

  .stock-head {
    display: flex;
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
    flex: 0;
    font-size: .8em;
  }

  .stock-head .actions .spacer {
    width: .3rem;
    display: inline-block;
  }

  .stock-head .actions a {
    text-decoration: none;
  }

  .stock-head + .chart {
    margin-top: 10px;
  }

  .stocks {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(var(--grid-width), 1fr));
    gap: 3rem 5rem;

    margin: var(--site-margin);
  }

  .stocks.compact {
    gap: 1rem 5rem;
  }

  .stock.expanded {
    grid-row: span 5;
    margin-bottom: 7px;
  }

  @media(min-width: 1024px) {
    .head .filter {
      min-width: 30%;
      display: flex;
      align-items: center;
    }
  }

  .head .filter input {
    width: auto;
    flex: 1;
    margin: 0;
  }

  @media(max-width: 768px) {
    .stocks {
      grid-template-columns: repeat(auto-fill, minmax(min(--grid-width, 100%), 1fr));
    }

    .head {
      flex-direction: column;
      align-items: stretch;
    }

    .head .outer-section + .outer-section {
      margin-top: 0;
    }
  }

  @media(min-width: 769px) {
    .head .outer-section + .outer-section {
      margin-left: 1rem;
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
    z-index: 100;
  }

  .head-container.sticky + .stocks {
    padding-top: 30px;
  }

  .head-container {
    margin-bottom: 1.5rem;
  }

  .dropdown {
    display: flex;
    flex-direction: row;
    align-items: center;
    position: relative;
  }

  .dropdown .dropdown-menu {
    display:  none;

    border: solid 1px var(--gray-4);
    border-radius: var(--border-radius-1);
    background: var(--white);
  }

  .dropdown.open .dropdown-menu {
    display: flex;
    position: absolute;
    left: 0;
    top: 100%;
    width: 200px;
    flex-direction: column;
    margin-top: 2px;
    z-index: 100;
  }

  .dropdown .dropdown-item {
    margin: 0;
    text-decoration: none;
    color: var(--gray-1);
    background: var(--white);
    border-radius: 0;
  }

  .dropdown .dropdown-item:hover {
    background:  var(--gray-6);
  }
</style>