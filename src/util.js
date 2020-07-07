export function fetchStocks(url) {

  return fetch(url).then(r => r.text()).then(text => {
    const lines = text.split('\n');

    return lines.slice(1, lines.length).map(row => {
      const [ name, isin ] = row.split(';');

      return (name && isin) ? {
        name: unquote(name),
        isin: unquote(isin)
      } : null;
    }).filter(s => s);
  });
}

export function fetchStockInformation(isin) {
  return fetch('https://www.tradegate.de/refresh.php?isin=' + isin).then(r => r.json());
}


function unquote(str) {
  return str.replace(/^["\s]*|["\s]*$/g, '');
}