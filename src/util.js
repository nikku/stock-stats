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

export async function fetchStockInformation(isin) {

  const response = await fetch('https://www.tradegate.de/refresh.php?isin=' + isin);

  let data;

  try {
    data = await response.json();
  } catch (error) {
    console.error('failed to retrive stock <' + isin + '>', error);

    return null;
  }

  const {
    delta,
    last,
    ...additionalData
  } = data;

  return {
    delta: parseFloat(delta.replace(',', '.')),
    last: parseFloat((last + '').replace(' ', '').replace(',', '.')),
    ...additionalData
  };
}

function unquote(str) {
  return str.replace(/^["\s]*|["\s]*$/g, '');
}

export function formatNumber(number, digits=2) {
  return Math.abs(number) < 100 ? Number.parseFloat(number).toFixed(digits) : number;
}