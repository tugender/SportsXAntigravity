import { getOrCreateUser, getStock } from './marketCache.js';

function executeBuy(portfolio, ticker, shares, price) {
  const totalCost = Math.round(shares * price * 100) / 100;

  if (shares <= 0 || !Number.isInteger(shares)) {
    return { success: false, reason: 'Shares must be a positive integer' };
  }
  if (totalCost > portfolio.cashBalance) {
    return { success: false, reason: `Insufficient cash — need $${totalCost.toFixed(2)}, have $${portfolio.cashBalance.toFixed(2)}` };
  }

  portfolio.cashBalance = Math.round((portfolio.cashBalance - totalCost) * 100) / 100;

  const pos = portfolio.positions[ticker] || { ticker, shares: 0, totalCost: 0, averageCostBasis: 0 };
  const newShares = pos.shares + shares;
  const newTotalCost = Math.round((pos.totalCost + totalCost) * 100) / 100;

  portfolio.positions[ticker] = {
    ticker,
    shares: newShares,
    totalCost: newTotalCost,
    averageCostBasis: Math.round((newTotalCost / newShares) * 100) / 100,
  };

  return { success: true };
}

function executeSell(portfolio, ticker, shares, price) {
  const pos = portfolio.positions[ticker];

  if (shares <= 0 || !Number.isInteger(shares)) {
    return { success: false, reason: 'Shares must be a positive integer' };
  }
  if (!pos || pos.shares < shares) {
    return {
      success: false,
      reason: `Insufficient shares — have ${pos?.shares ?? 0}, trying to sell ${shares}`,
    };
  }

  const proceeds = Math.round(shares * price * 100) / 100;
  const costBasis = Math.round(shares * pos.averageCostBasis * 100) / 100;
  const realizedPnl = Math.round((proceeds - costBasis) * 100) / 100;

  portfolio.cashBalance = Math.round((portfolio.cashBalance + proceeds) * 100) / 100;
  portfolio.realizedPnl = Math.round((portfolio.realizedPnl + realizedPnl) * 100) / 100;

  const newShares = pos.shares - shares;
  const newTotalCost = Math.round((pos.totalCost - costBasis) * 100) / 100;

  if (newShares === 0) {
    delete portfolio.positions[ticker];
  } else {
    portfolio.positions[ticker] = {
      ...pos,
      shares: newShares,
      totalCost: newTotalCost,
      averageCostBasis: Math.round((newTotalCost / newShares) * 100) / 100,
    };
  }

  return { success: true, realizedPnl };
}

export function placeOrder({ username, ticker, side, shares, orderType }) {
  const portfolio = getOrCreateUser(username);
  const stock = getStock(ticker);

  if (!stock) {
    return { success: false, reason: `Unknown ticker: ${ticker}` };
  }

  const executionPrice = stock.price;
  let result;

  if (side === 'buy') {
    result = executeBuy(portfolio, ticker, shares, executionPrice);
  } else if (side === 'sell') {
    result = executeSell(portfolio, ticker, shares, executionPrice);
  } else {
    return { success: false, reason: `Unknown order side: ${side}` };
  }

  if (!result.success) return result;

  const tradeRecord = {
    id: simpleId(),
    ticker,
    team: stock.team,
    sport: stock.sport,
    side,
    shares,
    executionPrice,
    executionTime: Date.now(),
    totalValue: Math.round(shares * executionPrice * 100) / 100,
    realizedPnl: result.realizedPnl ?? null,
  };

  portfolio.tradeHistory.unshift(tradeRecord); // Newest first
  if (portfolio.tradeHistory.length > 200) {
    portfolio.tradeHistory = portfolio.tradeHistory.slice(0, 200);
  }

  return {
    success: true,
    order: {
      ...tradeRecord,
      cashRemaining: portfolio.cashBalance,
    },
    portfolio,
  };
}

// Simple ID without a dependency
function simpleId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}
