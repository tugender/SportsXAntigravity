import { getAllUsers, getAllStocks } from './marketCache.js';

export function computeLeaderboard() {
  const users = getAllUsers();
  const stocks = getAllStocks();
  const priceMap = Object.fromEntries(stocks.map(s => [s.ticker, s.price]));

  const rankings = users.map(user => {
    const positionsValue = Object.values(user.positions).reduce((sum, pos) => {
      const price = priceMap[pos.ticker] ?? pos.averageCostBasis;
      return sum + pos.shares * price;
    }, 0);

    const totalValue = Math.round((user.cashBalance + positionsValue) * 100) / 100;

    return {
      username: user.username,
      totalValue,
      cashBalance: Math.round(user.cashBalance * 100) / 100,
      positionsValue: Math.round(positionsValue * 100) / 100,
      realizedPnl: Math.round(user.realizedPnl * 100) / 100,
    };
  });

  // Sort by total portfolio value descending
  rankings.sort((a, b) => b.totalValue - a.totalValue);

  return rankings.map((entry, i) => ({ rank: i + 1, ...entry }));
}
