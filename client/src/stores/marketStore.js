import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

export const useMarketStore = create(
  subscribeWithSelector((set, get) => ({
    stocks: {},              // { [ticker]: StockData }
    priceHistory: {},        // { [ticker]: Array<{price, timestamp}> }
    lastUpdateTime: null,
    isSimulated: true,
    isConnected: false,
    apiRequestsRemaining: null,
    leaderboard: [],

    setConnected: (connected) => set({ isConnected: connected }),

    applySnapshot: (snapshot) => {
      const stocks = {};
      for (const s of snapshot.stocks) {
        stocks[s.ticker] = s;
      }
      set({
        stocks,
        isSimulated: snapshot.isSimulated,
        apiRequestsRemaining: snapshot.apiRequestsRemaining,
        lastUpdateTime: snapshot.timestamp,
      });
    },

    applyPriceUpdates: (updates) => {
      set((state) => {
        const updatedStocks = { ...state.stocks };
        for (const u of updates) {
          if (updatedStocks[u.ticker]) {
            updatedStocks[u.ticker] = { ...updatedStocks[u.ticker], ...u };
          }
        }
        return { stocks: updatedStocks, lastUpdateTime: Date.now() };
      });
    },

    setPriceHistory: (ticker, history) => {
      set((state) => ({
        priceHistory: { ...state.priceHistory, [ticker]: history },
      }));
    },

    setLeaderboard: (rankings) => set({ leaderboard: rankings }),

    // Derived helpers
    getStock: (ticker) => get().stocks[ticker] || null,

    getStocksBySport: (sport) =>
      Object.values(get().stocks).filter((s) => s.sport === sport),

    getTopMovers: (limit = 5) =>
      Object.values(get().stocks)
        .sort((a, b) => Math.abs(b.changePct) - Math.abs(a.changePct))
        .slice(0, limit),
  }))
);
