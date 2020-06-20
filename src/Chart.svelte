<script>

  import {
    scaleTime,
    scaleLinear
  } from 'd3-scale';

  const padding = { top: 15, right: 15, bottom: 25, left: 35 };

  export let period;
  export let data;

  let width = 500;
  let height = 200;

  function time(point) {
    return new Date(point.time);
  }

  function money(point) {
    return (parseFloat(point.bid) + parseFloat(point.ask)) / 2;
  }

  $: points = data.values;

  $: dates = points.map(time);

  $: yValues = points.map(money).filter(m => !isNaN(m));

  $: yMax = Math.max.apply(null, yValues);
  $: yMin = Math.min.apply(null, yValues);

  $: xDomain = dates.reduce((result, date, idx) => {

    if (!result.currentRange && date.getHours() >= 8) {
      const nextRange = result.currentRange = [
        tradeDayBegin(date),
        tradeDayEnd(date)
      ];

      result.ranges.push(nextRange);
    }

    if (date.getHours() >= 22) {
      delete result.currentRange;
    }

    return result;
  }, { ranges: [], currentRange: null }).ranges.flat();

  $: xRange = xDomain.reduce((ranges, _, idx) => {
    const days = (xDomain.length / 2);

    const day = Math.trunc(idx / 2);

    const range = idx % 2 === 0 ? day / days : (day + 1) / days;

    ranges.push(range);

    return ranges;
  }, []).flat();

  $: tldr = {
    left: padding.left,
    right: width - padding.right,
    top: padding.top,
    bottom: height - padding.bottom,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom
  };

  $: xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();

  // [ startA, endA, startB, endB, startC, endC ]
  // [0, 1/3, 1/3, 2/3, 2/3, 1]
  $: console.log(xScale.range());

  $: formatXTick = xScale.tickFormat();
  $: formatYTick = yScale.tickFormat();

  $: yScale = scaleLinear()
    .domain([ yMax, yMin ])
    .nice();

  $: xTicks = xScale.ticks(getXTicks(period));
  $: yTicks = yScale.ticks(5);

  $: path = points.reduce((segments, p) => {

    const t = time(p);
    const m = money(p);

    const last = segments[segments.length - 1];

    const nextSegment = isNaN(m) ? [] : [
      last && last.length ? 'L' : 'M',
      xScale(t) * tldr.width,
      ',',
      yScale(m) * tldr.height
    ];

    segments.push(nextSegment);

    return segments;
  }, []).flat().join('');

  function tradeDayBegin(date) {

    date = new Date(date.getTime());

    date.setHours(8, 0, 0);

    return date;
  }

  function tradeDayEnd(date) {

    date = new Date(date.getTime());

    date.setHours(22, 0, 0);

    return date;
  }

  function getXTicks(period) {

    const tmap = {
      intraday: 9,
      week: 5,
      month: 4,
      month6: 6,
      year: 6
    };

    return tmap[period];
  }
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg>

    <!-- y axis -->
    <g class="axis y-axis">
      {#each yTicks as tick}
        <g class="tick" transform="translate(0, { tldr.top + yScale(tick) * tldr.height })">
          <line class="line" x1={ tldr.left } x2={ tldr.right }></line>
          <line class="legend" x1={ tldr.left - 3 } x2={ tldr.left }></line>

          <text y="4" x={ tldr.left - 6 }>{formatYTick(tick) }</text>
        </g>
      {/each}
    </g>

    <!-- x axis -->
    <g class="axis x-axis">
      {#each xTicks as tick, idx}
        <g class="tick" transform="translate({ tldr.left + xScale(tick) * tldr.width }, 0)">
          {#if xTicks.length < 8 || idx % 2 === 0}
            <line class="line" y1="{ tldr.top }" y2="{ tldr.bottom }"></line>
            <line class="legend" y1="{ tldr.bottom }" y2="{ tldr.bottom + 3 }"></line>
            <text y="{ tldr.bottom + 15 }">{formatXTick(tick)}</text>
          {/if}
        </g>
      {/each}
    </g>

    <!-- bounding box -->
    <g class="box">
      <path class="pbox" d="M{ tldr.left },{tldr.top}H{tldr.right}V{tldr.bottom}H{tldr.left}Z" />
    </g>

    <!-- data -->
    <g class="graph" transform="translate({ tldr.left }, { tldr.top })">
      <path class="path-line" d={path}></path>
    </g>
  </svg>
</div>

<style>

  :root {
    --black: #333;
    --dark-grey: #555;
    --light-grey: #e0e0e0;
    --blue: #239fd9;
  }

  .chart, h2, p {
    width: 100%;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .pbox {
    fill: none;
    stroke: var(--dark-grey);
  }

  svg {
    width: 100%;
    height: 240px;
    overflow: visible;
  }

  .tick {
    font-size: .8em;
    font-weight: 400;
    font-family: monospace;
  }

  .tick .legend {
    stroke: var(--dark-grey);
  }

  .tick .line {
    stroke: var(--light-grey);
    stroke-dasharray: 3;
  }

  .tick text {
    fill: var(--black);
  }

  .tick.tick-0 line {
    stroke-dasharray: 0;
  }

  .y-axis .tick text {
    text-anchor: end;
  }

  .x-axis .tick text {
    text-anchor: middle;
  }

  .path-line {
    fill: none;
    stroke: var(--blue);
    stroke-linejoin: round;
    stroke-linecap: round;
    stroke-width: 1;
  }
</style>
