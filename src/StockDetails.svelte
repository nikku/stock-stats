<script>
  import Placeholder from './Placeholder.svelte';

  import {
    getStockValue,
    getStockDelta
  } from './util';

  export let data;

  $: last = getStockValue(data);
  $: delta = getStockDelta(data);
</script>

<div class="details">

  {#if data}
    <span class="average" title="Aktueller Wert">
      { last }
    </span>

    <span class="delta" title="Aktuelles Tagesdelta" class:falling={ delta < 0 } class:rising={ delta > 0 }>
      { delta }%
    </span>
  {:else}
    <Placeholder>
      <span class="average">
        4.1775
      </span>

      <span class="delta">
        -4,12%
      </span>
    </Placeholder>
  {/if}
</div>

<style>

  .details {
    font-size: .8em;
    display: flex;
  }

  .average {
    color: var(--gray-3);
  }

  .delta {
    margin-left: 5px;
  }

  .falling {
    color: var(--red);
  }

  .rising {
    color: var(--green);
  }
</style>