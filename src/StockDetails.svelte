<script>
  import Placeholder from './Placeholder.svelte';

  export let data;

  $: numericDelta = data && parseFloat(data.delta.replace(',', '.'));
</script>

<div class="details">

  {#if data}
    <span class="average" title="Aktueller Wert">
      { data.last }
    </span>

    <span class="delta" title="Aktuelles Tagesdelta" class:falling={ numericDelta < 0 } class:rising={ numericDelta > 0 }>
      { data.delta }
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