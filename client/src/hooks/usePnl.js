import { useMarketStore } from '../stores/marketStore.js';
import { useUserStore } from '../stores/userStore.js';

export function usePnl() {
  const stocks = useMarketStore((s) => s.stocks);
  const { cashBalance, positions, realizedPnl } = useUserStore();

  let positionsValue = 0;
  const enrichedPositions = {};

  for (const [ticker, pos] of Object.entries(positions)) {
    const stock = stocks[ticker];
    const currentPrice = stock?.price ?? pos.averageCostBasis;
    const marketValue = pos.shares * currentPrice;
    const unrealizedPnl = marketValue - pos.totalCost;
    const unrealizedPnlPct = pos.totalCost > 0
      ? (unrealizedPnl / pos.totalCost) * 100
      : 0;

    positionsValue += marketValue;
    enrichedPositions[ticker] = {
      ...pos,
      currentPrice,
      marketValue: Math.round(marketValue * 100) / 100,
      unrealizedPnl: Math.round(unrealizedPnl * 100) / 100,
      unrealizedPnlPct: Math.round(unrealizedPnlPct * 100) / 100,
      team: stock?.team ?? ticker,
      sport: stock?.sport ?? '',
    };
  }

  const totalPortfolioValue = cashBalance + positionsValue;
  const totalUnrealizedPnl = positionsValue - Object.values(positions).reduce(
    (sum, p) => sum + p.totalCost, 0
  );

  return {
    enrichedPositions,
    positionsValue: Math.round(positionsValue * 100) / 100,
    totalPortfolioValue: Math.round(totalPortfolioValue * 100) / 100,
    totalUnrealizedPnl: Math.round(totalUnrealizedPnl * 100) / 100,
    realizedPnl,
  };
}
