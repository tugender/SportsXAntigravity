import { config } from './config.js';
import { getAllStocks, getState, getOrCreateUser } from './marketCache.js';
import { tickPrices } from './marketCache.js';
import { recordAll, getHistory } from './priceHistory.js';
import { placeOrder } from './tradingEngine.js';
import { computeLeaderboard } from './leaderboard.js';

export function registerSocketHandlers(io) {
  // ─── Price broadcast: every 3 seconds ────────────────────────────────────
  setInterval(() => {
    const updates = tickPrices();
    recordAll(updates);
    io.emit('PRICE_UPDATE', {
      updates,
      isSimulated: getState().isSimulated,
    });
  }, config.PRICE_BROADCAST_INTERVAL_MS);

  // ─── Leaderboard broadcast: every 30 seconds ─────────────────────────────
  setInterval(() => {
    const rankings = computeLeaderboard();
    io.emit('LEADERBOARD_UPDATE', { rankings });
  }, config.LEADERBOARD_BROADCAST_INTERVAL_MS);

  // ─── Per-client handlers ──────────────────────────────────────────────────
  io.on('connection', (socket) => {
    const clientIp = socket.handshake.address;
    console.log(`[socket] Client connected: ${socket.id} (${clientIp})`);

    // Send full market snapshot immediately on connect
    const state = getState();
    socket.emit('MARKET_SNAPSHOT', {
      stocks: getAllStocks(),
      timestamp: Date.now(),
      isSimulated: state.isSimulated,
      apiRequestsRemaining: state.apiRequestsRemaining,
    });

    // ── REGISTER_USER ──
    socket.on('REGISTER_USER', ({ username }) => {
      if (!username || typeof username !== 'string') return;
      const sanitized = username.trim().slice(0, 24).replace(/[^a-zA-Z0-9_\-. ]/g, '');
      if (!sanitized) return;

      const portfolio = getOrCreateUser(sanitized);

      // Put user in their own room for targeted events
      socket.join(`user:${sanitized}`);
      socket.data.username = sanitized;

      socket.emit('PORTFOLIO_UPDATE', serializePortfolio(portfolio));
      console.log(`[socket] ${sanitized} registered (balance: $${portfolio.cashBalance})`);
    });

    // ── JOIN_USER_ROOM (idempotent reconnect helper) ──
    socket.on('JOIN_USER_ROOM', ({ username }) => {
      if (username && typeof username === 'string') {
        socket.join(`user:${username.trim()}`);
      }
    });

    // ── PLACE_ORDER ──
    socket.on('PLACE_ORDER', (order) => {
      const { username, ticker, side, shares, orderType } = order;

      if (!username || !ticker || !side || shares == null) {
        socket.emit('TRADE_REJECTED', { success: false, reason: 'Invalid order payload', order });
        return;
      }

      const result = placeOrder({ username, ticker, side, shares: Number(shares), orderType });

      if (result.success) {
        socket.emit('TRADE_CONFIRMED', {
          success: true,
          order: result.order,
          portfolio: serializePortfolio(result.portfolio),
        });
        // Also push updated portfolio to user's room (other tabs, etc.)
        io.to(`user:${username}`).emit('PORTFOLIO_UPDATE', serializePortfolio(result.portfolio));
      } else {
        socket.emit('TRADE_REJECTED', { success: false, reason: result.reason, order });
      }
    });

    // ── REQUEST_PRICE_HISTORY ──
    socket.on('REQUEST_PRICE_HISTORY', ({ ticker }) => {
      socket.emit('PRICE_HISTORY', {
        ticker,
        history: getHistory(ticker),
      });
    });

    // ── Disconnect ──
    socket.on('disconnect', () => {
      console.log(`[socket] Client disconnected: ${socket.id}`);
    });
  });
}

// Strip internal fields before sending to client
function serializePortfolio(portfolio) {
  return {
    username: portfolio.username,
    cashBalance: portfolio.cashBalance,
    positions: portfolio.positions,
    realizedPnl: portfolio.realizedPnl,
    tradeHistory: portfolio.tradeHistory.slice(0, 50), // Last 50 trades only
    joinedAt: portfolio.joinedAt,
    lastActive: portfolio.lastActive,
  };
}
