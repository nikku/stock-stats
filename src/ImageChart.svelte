<script>
  export let isin;
  export let period;
  export let now;
</script>

<img src="https://www.tradegate.de/images/charts/{ period }/{ isin }.png?{ now }" />

<style>
  img {
    background: var(--gray-6);
    border-radius: var(--border-radius-large);
    height: 207px;
    position: relative;
  }
</style>