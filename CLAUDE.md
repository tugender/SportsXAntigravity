# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

**Install dependencies** (from root — installs all workspaces):
```bash
npm install          # installs root (concurrently)
cd server && npm install
cd client && npm install
```

**Development** (starts both server on :3001 and Vite on :5173):
```bash
npm run dev          # from root
```

**Production build + serve**:
```bash
npm run build        # builds client/dist/
npm run start        # server also serves client/dist/ as static
```

**Individual workspaces**:
```bash
cd server && npm run dev    # server only (node --watch)
cd client && npm run dev    # Vite only
```

## Architecture

Monorepo with two workspaces: `server/` (Node.js) and `client/` (React/Vite). In production, the server also serves the built React SPA via `express.static`.

### Core concept
- Each championship-eligible team = a tradable "stock"
- **Price = implied probability × 100** (e.g., +400 odds → 20% → $20.00/share)
- American odds → probability: positive `100/(odds+100)`, negative `|odds|/(|odds|+100)`
- Prices update via Socket.io every 3 seconds (noise-on-cache between real API polls)

### Server (`server/src/`)
- `index.js` — Express + Socket.io bootstrap, loads data, starts polling
- `config.js` — env vars, `TEAM_TICKER_MAP` (all 92 teams), `teamToTicker()`, `oddsToPrice()`
- `simulatedData.js` — baseline odds for all NBA/NFL/MLB teams; `addNoise()` for ±0.5% random walk
- `marketCache.js` — in-memory `state.stocks` and `state.users`; JSON persistence every 5 min to `persistence/users.json`
- `oddsService.js` — polls The Odds API hourly; tracks `x-requests-remaining` header; stops if < 50 remaining
- `socketHandlers.js` — all Socket.io events: price tick loop (3s), leaderboard loop (30s), per-socket REGISTER/PLACE_ORDER/PRICE_HISTORY handlers
- `tradingEngine.js` — `placeOrder()` with VWAC cost basis; `executeBuy()`/`executeSell()` with full validation
- `priceHistory.js` — ring buffer of last 60 price snapshots per ticker
- `leaderboard.js` — `computeLeaderboard()` computes total portfolio value per user

### Client (`client/src/`)
- **Stores** (Zustand): `marketStore` (stocks, priceHistory, leaderboard — subscribeWithSelector), `userStore` (username persisted in localStorage; financials from server), `uiStore` (modal state, active league)
- `socket.js` — singleton socket.io-client (`autoConnect: false`; connects after username set)
- `hooks/useSocket.js` — binds all socket events to stores; reconnects when username changes
- `hooks/usePnl.js` — client-side computed unrealized P&L from stored `averageCostBasis` × live prices
- `components/layout/` — `TopNav` (connection status, nav, portfolio value), `MarketTicker` (CSS infinite scroll)
- `components/market/` — `StockCard` (buy/sell buttons, probability bar), `StockGrid`, `LeagueTab`
- `components/trading/` — `TradeModal` (Radix Dialog, market orders), `PriceChart` (Recharts LineChart)
- `components/portfolio/` — `Portfolio` (positions table with live P&L)
- `components/leaderboard/` — `Leaderboard` (ranked by total portfolio value)
- `components/ui/UsernameGate` — username entry screen; guards the whole app until set

### Socket.io events
Server → client: `MARKET_SNAPSHOT`, `PRICE_UPDATE` (every 3s), `PORTFOLIO_UPDATE`, `TRADE_CONFIRMED`, `TRADE_REJECTED`, `LEADERBOARD_UPDATE` (every 30s), `PRICE_HISTORY`
Client → server: `REGISTER_USER`, `JOIN_USER_ROOM`, `PLACE_ORDER`, `REQUEST_PRICE_HISTORY`

## Environment variables

Create `server/.env` (never commit this):
```
PORT=3001
CLIENT_ORIGIN=http://localhost:5173
ODDS_API_KEY=           # leave empty → SIMULATED mode; get a key at the-odds-api.com
```

Simulated mode is the default and works without any API key. The UI shows a "SIM" badge in the nav. All trading logic works identically in both modes.

## Key invariants
- Portfolio state is **server-authoritative**; `userStore` financials are always overwritten by `PORTFOLIO_UPDATE` events
- Only `username` and `joinedAt` are persisted in `localStorage` (via Zustand `persist`)
- The Vite dev server proxies `/api` and `/socket.io` to `:3001` — never hardcode ports in client code
- The odds API free tier has 500 requests/month; polling is set to 60-minute intervals to stay within ~2,160 req/month
