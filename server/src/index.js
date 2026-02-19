import 'dotenv/config';
import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { existsSync } from 'fs';
import { config } from './config.js';
import { initializeMarket, loadPersistedData, startPersistence } from './marketCache.js';
import { startOddsPolling } from './oddsService.js';
import { registerSocketHandlers } from './socketHandlers.js';

const __dirname = dirname(fileURLToPath(import.meta.url));

const app = express();
const httpServer = createServer(app);

// In production the server serves the client from the same origin,
// so CORS only matters in dev. Allow all origins when CLIENT_ORIGIN is unset.
const corsOrigin = config.CLIENT_ORIGIN || '*';

const io = new Server(httpServer, {
  cors: {
    origin: corsOrigin,
    methods: ['GET', 'POST'],
  },
});

app.use(cors({ origin: corsOrigin }));
app.use(express.json());

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    status: 'ok',
    timestamp: Date.now(),
    mode: config.ODDS_API_KEY ? 'live' : 'simulated',
  });
});

// Serve built React client in production
const clientDist = join(__dirname, '../../client/dist');
if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(join(clientDist, 'index.html'));
  });
}

async function main() {
  await loadPersistedData();
  initializeMarket();
  registerSocketHandlers(io);
  startOddsPolling(io);
  startPersistence();

  httpServer.listen(config.PORT, () => {
    console.log(`\n🏆 SportsX server running on http://localhost:${config.PORT}`);
    console.log(`   Mode: ${config.ODDS_API_KEY ? '📡 LIVE (The Odds API)' : '🎲 SIMULATED'}`);
    console.log(`   Client origin: ${config.CLIENT_ORIGIN}\n`);
  });
}

main().catch((err) => {
  console.error('Server startup failed:', err);
  process.exit(1);
});
