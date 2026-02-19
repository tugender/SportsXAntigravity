import { readFile, writeFile, mkdir } from 'fs/promises';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { buildSimulatedSnapshot, addNoise } from './simulatedData.js';
import { config } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PERSIST_PATH = join(__dirname, 'persistence', 'users.json');
const PERSIST_DIR = join(__dirname, 'persistence');

// In-memory state
const state = {
  stocks: {},           // { [ticker]: StockData }
  users: {},            // { [username]: PortfolioData }
  lastRealUpdate: null,
  apiRequestsRemaining: null,
  isSimulated: true,
};

// Initialize market with simulated data
export function initializeMarket() {
  state.stocks = buildSimulatedSnapshot();
  state.isSimulated = true;
  console.log(`[market] Initialized with ${Object.keys(state.stocks).length} stocks (SIMULATED)`);
}

// Update stock prices from real API data
export function updateStocksFromOdds(oddsData) {
  const now = Date.now();
  for (const stockUpdate of oddsData) {
    const existing = state.stocks[stockUpdate.ticker];
    if (existing) {
      state.stocks[stockUpdate.ticker] = {
        ...existing,
        ...stockUpdate,
        previousPrice: existing.price,
        change: stockUpdate.price - existing.openPrice,
        changePct: ((stockUpdate.price - existing.openPrice) / existing.openPrice) * 100,
        lastUpdated: now,
        isSimulated: false,
      };
    } else {
      // New team discovered from API
      state.stocks[stockUpdate.ticker] = {
        ...stockUpdate,
        previousPrice: stockUpdate.price,
        openPrice: stockUpdate.price,
        change: 0,
        changePct: 0,
        volume: 0,
        lastUpdated: now,
        isSimulated: false,
      };
    }
  }
  state.lastRealUpdate = now;
  state.isSimulated = false;
  console.log(`[market] Updated ${oddsData.length} stocks from live API`);
}

// Apply noise to all stocks and return the list of updates to broadcast
export function tickPrices() {
  const updates = [];
  const now = Date.now();

  for (const [ticker, stock] of Object.entries(state.stocks)) {
    const newPrice = addNoise(stock);
    const prevPrice = stock.price;
    const changePct = ((newPrice - stock.openPrice) / stock.openPrice) * 100;

    const newEv = stock.fairValue != null
      ? Math.round((stock.fairValue - newPrice) * 100) / 100
      : 0;

    state.stocks[ticker] = {
      ...stock,
      previousPrice: prevPrice,
      price: newPrice,
      change: newPrice - stock.openPrice,
      changePct: Math.round(changePct * 100) / 100,
      ev: newEv,
      volume: stock.volume + Math.floor(Math.random() * 3),
      lastUpdated: now,
    };

    updates.push({
      ticker,
      price: newPrice,
      previousPrice: prevPrice,
      change: state.stocks[ticker].change,
      changePct: state.stocks[ticker].changePct,
      volume: state.stocks[ticker].volume,
      timestamp: now,
    });
  }

  return updates;
}

export function getAllStocks() {
  return Object.values(state.stocks);
}

export function getStock(ticker) {
  return state.stocks[ticker] || null;
}

export function getState() {
  return state;
}

export function setApiRequestsRemaining(n) {
  state.apiRequestsRemaining = n;
}

// ─── User / Portfolio persistence ─────────────────────────────────────────────

export function getOrCreateUser(username) {
  if (!state.users[username]) {
    state.users[username] = {
      username,
      cashBalance: config.STARTING_CASH,
      positions: {},
      realizedPnl: 0,
      tradeHistory: [],
      joinedAt: Date.now(),
      lastActive: Date.now(),
    };
    console.log(`[market] New user: ${username} (starting cash: $${config.STARTING_CASH})`);
  }
  state.users[username].lastActive = Date.now();
  return state.users[username];
}

export function getUser(username) {
  return state.users[username] || null;
}

export function getAllUsers() {
  return Object.values(state.users);
}

export async function loadPersistedData() {
  try {
    const raw = await readFile(PERSIST_PATH, 'utf8');
    const saved = JSON.parse(raw);
    if (saved.users) {
      state.users = saved.users;
      console.log(`[market] Loaded ${Object.keys(state.users).length} users from disk`);
    }
  } catch {
    // File doesn't exist yet — that's fine on first run
    console.log('[market] No persisted data found; starting fresh');
  }
}

export async function persistData() {
  try {
    await mkdir(PERSIST_DIR, { recursive: true });
    await writeFile(PERSIST_PATH, JSON.stringify({ users: state.users }, null, 2), 'utf8');
  } catch (err) {
    console.error('[market] Failed to persist data:', err.message);
  }
}

// Start the auto-persist timer
export function startPersistence() {
  setInterval(persistData, config.DATA_PERSISTENCE_INTERVAL_MS);
}
