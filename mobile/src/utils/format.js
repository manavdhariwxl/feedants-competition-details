const SYMBOLS = { INR: '₹', USD: '$', EUR: '€', GBP: '£' };

export function formatCurrency(amount, currency = 'INR') {
  const symbol = SYMBOLS[currency] || `${currency} `;
  const formatted = Number(amount).toLocaleString('en-IN');
  return `${symbol}${formatted}`;
}

export function formatDate(iso) {
  const d = new Date(iso);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = String(d.getFullYear()).slice(2);
  return `${String(day).padStart(2, '0')} ${month} ${year}`;
}

export function formatTime(iso) {
  const d = new Date(iso);
  let hours = d.getHours();
  const minutes = String(d.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12 || 12;
  return `${hours}:${minutes} ${ampm}`;
}
