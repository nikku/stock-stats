<script>
  export let isin;

  export let period;

  export let detailsLink;

  export let now;
</script>

<a href={detailsLink}>
  <img src="https://www.tradegate.de/images/charts/{ period }/{ isin }.png?{ now }" />
</a>

<style>
  img {
    background: var(--gray-6);
    border-radius: 5px;
    height: 207px;
  }
</style>