<script>
  export let isin;
  export let period;
  export let now;
</script>

<img src="https://www.tradegate.de/images/charts/{ period }/{ isin }.png?{ now }" />

<style>
  img {
    background: var(--gray-6);
    border-radius: 5px;
    height: 207px;
  }
</style>