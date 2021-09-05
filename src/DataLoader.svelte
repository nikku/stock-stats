<script>

  export let loader;

  export let args;

  let error;
  let result;
  let state = 'initialized';

  $: loader && args && (state = 'loading') && loader(...args).then(_result => {
    result = _result;
    state = 'loaded';
  }).catch(_error => {
    error = _error;
    state = 'error';
  });

</script>

<slot {error} {result} {state} />