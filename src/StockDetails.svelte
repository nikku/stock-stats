<script>
  export let data;

  $: numericDelta = parseFloat(data.delta.replace(',', '.'));
</script>

<div class="details">

  <span class="average" title="Aktueller Wert">
    { data.avg }
  </span>

  <span class="delta" title="Aktuelles Tagesdelta" class:falling={ numericDelta < 0 } class:rising={ numericDelta > 0 }>
    { data.delta }
  </span>
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