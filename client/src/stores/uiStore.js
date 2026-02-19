import { create } from 'zustand';

export const useUiStore = create((set) => ({
  selectedTicker: null,
  tradeModalOpen: false,
  tradeSide: 'buy',
  activeLeague: 'NBA',

  openTradeModal: (ticker, side = 'buy') =>
    set({ selectedTicker: ticker, tradeModalOpen: true, tradeSide: side }),

  closeTradeModal: () =>
    set({ tradeModalOpen: false }),

  setActiveLeague: (league) =>
    set({ activeLeague: league }),

  setSelectedTicker: (ticker) =>
    set({ selectedTicker: ticker }),
}));
