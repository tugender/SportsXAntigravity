import fetch from 'node-fetch';
import { config, teamToTicker, oddsToPrice, americanToImpliedProb } from './config.js';
import { updateStocksFromOdds, setApiRequestsRemaining } from './marketCache.js';

let quotaExhausted = false;

function extractBestOddsPerTeam(bookmakers) {
  const teamData = {};

  for (const bm of bookmakers) {
    for (const market of bm.markets) {
      if (market.key !== 'outrights') continue;
      for (const outcome of market.outcomes) {
        if (!teamData[outcome.name]) teamData[outcome.name] = { odds: [], probs: [] };
        teamData[outcome.name].odds.push(outcome.price);
        teamData[outcome.name].probs.push(americanToImpliedProb(outcome.price));
      }
    }
  }

  // Average odds and implied probs across all bookmakers for each team
  // fairValue = consensus implied prob × 100 (before our noise function touches it)
  return Object.entries(teamData).map(([team, { odds, probs }]) => {
    const avgOdds = odds.reduce((sum, o) => sum + o, 0) / odds.length;
    const avgProb = probs.reduce((sum, p) => sum + p, 0) / probs.length;
    return {
      team,
      odds: Math.round(avgOdds),
      fairValue: Math.round(avgProb * 10000) / 100,
    };
  });
}

async function fetchSportFutures(sportKey, sport) {
  const url = new URL(`${config.ODDS_API_BASE}/sports/${sportKey}/odds`);
  url.searchParams.set('apiKey', config.ODDS_API_KEY);
  url.searchParams.set('regions', 'us');
  url.searchParams.set('oddsFormat', 'american');
  url.searchParams.set('markets', 'outrights');

  const response = await fetch(url.toString());

  // Track remaining quota
  const remaining = response.headers.get('x-requests-remaining');
  if (remaining !== null) {
    const n = parseInt(remaining, 10);
    setApiRequestsRemaining(n);
    if (n < 50) {
      console.warn(`[odds] API quota low: ${n} requests remaining — stopping polling`);
      quotaExhausted = true;
    }
  }

  if (!response.ok) {
    throw new Error(`Odds API ${response.status}: ${await response.text()}`);
  }

  const data = await response.json();
  if (!Array.isArray(data) || data.length === 0) return [];

  // Futures = single event with all teams as outcomes
  const event = data[0];
  const teamsOdds = extractBestOddsPerTeam(event.bookmakers || []);

  return teamsOdds.map(({ team, odds, fairValue }) => ({
    ticker: teamToTicker(team),
    team,
    sport,
    odds,
    price: oddsToPrice(odds),
    fairValue,
    ev: Math.round((fairValue - oddsToPrice(odds)) * 100) / 100,
    impliedProbability: americanToImpliedProb(odds),
    isSimulated: false,
  }));
}

export async function pollOdds(io) {
  if (!config.ODDS_API_KEY || quotaExhausted) return;

  console.log('[odds] Polling The Odds API...');
  const allStocks = [];

  const sportPairs = [
    ['basketball_nba_championship_winner', 'NBA'],
    ['americanfootball_nfl_super_bowl_winner', 'NFL'],
    ['baseball_mlb_world_series_winner', 'MLB'],
  ];

  for (const [sportKey, sport] of sportPairs) {
    try {
      const stocks = await fetchSportFutures(sportKey, sport);
      allStocks.push(...stocks);
      console.log(`[odds] ${sport}: fetched ${stocks.length} teams`);
    } catch (err) {
      console.error(`[odds] Failed to fetch ${sport}:`, err.message);
    }
    if (quotaExhausted) break;
  }

  if (allStocks.length > 0) {
    updateStocksFromOdds(allStocks);
    io.emit('API_MODE_CHANGE', { isSimulated: false });
  }
}

export function startOddsPolling(io) {
  if (!config.ODDS_API_KEY) {
    console.log('[odds] No ODDS_API_KEY — running in SIMULATED mode');
    return;
  }

  console.log('[odds] Starting live odds polling (interval: 60 min)');
  // Initial fetch immediately
  pollOdds(io);
  // Then every hour
  setInterval(() => pollOdds(io), config.ODDS_POLL_INTERVAL_MS);
}
