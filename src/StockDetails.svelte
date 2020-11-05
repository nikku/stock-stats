<script>
  import Placeholder from './Placeholder.svelte';

  export let data;

  $: last = data && (typeof data.last === 'string' ? data.last.replace(' ', '').replace(',', '.') : data.last);
  $: delta = data && data.delta.replace(',', '.');
  $: numericDelta = data && parseFloat(delta);
</script>

<div class="details">

  {#if data}
    <span class="average" title="Aktueller Wert">
      { last }
    </span>

    <span class="delta" title="Aktuelles Tagesdelta" class:falling={ numericDelta < 0 } class:rising={ numericDelta > 0 }>
      { delta }
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