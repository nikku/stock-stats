<script>

  import {
    scaleTime,
    scaleLinear
  } from 'd3-scale';

  const padding = { top: 5, right: 25, bottom: 20, left: 40 };

  export let period;
  export let data;

  export let svgStyle = '';

  let width = 500;
  let height = 200;

  $: tldr = {
    left: padding.left,
    right: width - padding.right,
    top: padding.top,
    bottom: height - padding.bottom,
    width: width - padding.left - padding.right,
    height: height - padding.top - padding.bottom
  };

  const xTickExact = {
    intraday: true,
    week: false,
    month: true,
    month6: false,
    year: false
  };

  const xTickFormats = {
    intraday: '%H:%M',
    week: '%a',
    month: '%d.%m',
    __default: '%b'
  };

  function time(point) {
    return new Date(point.time);
  }

  function money(point) {
    return parseFloat(point.last);
  }

  $: points = data.values;

  $: dates = points.map(time);

  $: yValues = points.map(money).filter(m => !isNaN(m));

  $: yMax = Math.max.apply(null, yValues);
  $: yMin = Math.min.apply(null, yValues);

  $: xDomain = dates.reduce(
    (result, date, idx) => {

      let {
        currentRange
      } = result;

      if (currentRange && date.getDay() !== currentRange[0].getDay()) {
        currentRange = result.currentRange = null;
      }

      if (!currentRange) {
        currentRange = result.currentRange = [
          tradeDayBegin(date),
          tradeDayEnd(date)
        ];

        result.ranges.push(currentRange);
      }

      return result;
    }, { ranges: [], currentRange: null }
  ).ranges.flat();

  $: xRange = xDomain.reduce((ranges, _, idx) => {
    const days = (xDomain.length / 2);

    const day = Math.trunc(idx / 2);

    const range = idx % 2 === 0 ? day / days : (day + 1) / days;

    ranges.push(range);

    return ranges;
  }, []).flat();

  $: xTicksExact = xTickExact[period];

  $: xScale = scaleTime()
    .domain(xDomain)
    .range(xRange)
    .nice();

  $: yScale = scaleLinear()
    .domain([ yMax + (yMax - yMin) / 50, yMin - (yMax - yMin) / 50 ])
    .nice();

  $: xTicks = xScale.ticks(getXTicks(period));
  $: yTicks = yScale.ticks(5);

  $: formatXTick = xScale.tickFormat(xTicks.length, xTickFormats[period] || xTickFormats['__default']);
  $: formatYTick = yScale.tickFormat();

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

    date.setHours(8, 0, 0, 0);

    return date;
  }

  function tradeDayEnd(date) {

    date = new Date(date.getTime());

    date.setHours(22, 0, 0, 0);

    return date;
  }

  function getXTicks(period) {

    const tmap = {
      intraday: 9,
      week: 8,
      month: 4,
      month6: 8,
      year: 6
    };

    return tmap[period];
  }

  function showXTick(ticks, tick, index, period) {
    if (period !== 'intraday') {
      return true;
    } else {
      return index % 2 === 0;
    }
  }
</script>

<div class="chart" bind:clientWidth={width} bind:clientHeight={height}>
  <svg style={ svgStyle }>

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
          {#if showXTick(xTicks, tick, idx, period)}
            <line class="line" y1="{ tldr.top }" y2="{ tldr.bottom }"></line>

            {#if xTicksExact}
              <line class="legend" y1={ tldr.bottom } y2={ tldr.bottom + 3 }></line>
              <text y={ tldr.bottom + 15 }>{formatXTick(tick)}</text>
            {:else if xTicks.length - 1 !== idx && xScale(xTicks[idx + 1]) - xScale(tick) > 0}
              <text x={ (xScale(xTicks[idx + 1]) - xScale(tick)) / 2 * tldr.width } y={ tldr.bottom + 15 }>{formatXTick(tick)}</text>
            {/if}
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
