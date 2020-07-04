import App from './App.svelte';

const config = window.__StockStatsCfg || null;

const app = new App({
  target: document.body,
  props: {
    stocks: config && config.stocks,
    quotesService: config && config.quotesService
  }
});

export default app;