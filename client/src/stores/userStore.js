import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useUserStore = create(
  persist(
    (set, get) => ({
      // Persisted in localStorage (identity only)
      username: null,
      joinedAt: null,

      // Server-authoritative (overwritten on PORTFOLIO_UPDATE)
      cashBalance: 10000,
      positions: {},       // { [ticker]: { ticker, shares, averageCostBasis, totalCost } }
      realizedPnl: 0,
      tradeHistory: [],
      lastActive: null,

      setUsername: (username) =>
        set({ username: username.trim(), joinedAt: Date.now() }),

      clearUsername: () =>
        set({
          username: null,
          joinedAt: null,
          cashBalance: 10000,
          positions: {},
          realizedPnl: 0,
          tradeHistory: [],
        }),

      applyPortfolioUpdate: (portfolio) =>
        set({
          cashBalance: portfolio.cashBalance,
          positions: portfolio.positions,
          realizedPnl: portfolio.realizedPnl,
          tradeHistory: portfolio.tradeHistory,
          lastActive: portfolio.lastActive,
          joinedAt: portfolio.joinedAt,
        }),
    }),
    {
      name: 'sportsx-user',
      // Only persist username + joinedAt; financials come from server
      partialize: (state) => ({
        username: state.username,
        joinedAt: state.joinedAt,
      }),
    }
  )
);
