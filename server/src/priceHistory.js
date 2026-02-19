import { config } from './config.js';

// Ring buffer: last N price snapshots per ticker
const historyMap = new Map(); // ticker → Array<{price, timestamp}>

export function recordSnapshot(ticker, price) {
  if (!historyMap.has(ticker)) {
    historyMap.set(ticker, []);
  }
  const arr = historyMap.get(ticker);
  arr.push({ price, timestamp: Date.now() });
  if (arr.length > config.MAX_PRICE_HISTORY) {
    arr.shift();
  }
}

export function getHistory(ticker) {
  return historyMap.get(ticker) || [];
}

export function recordAll(updates) {
  for (const { ticker, price } of updates) {
    recordSnapshot(ticker, price);
  }
}
