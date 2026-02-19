import 'dotenv/config';

export const config = {
  PORT: process.env.PORT || 3001,
  CLIENT_ORIGIN: process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  ODDS_API_KEY: process.env.ODDS_API_KEY || null,
  CLAUDE_API_KEY: process.env.CLAUDE_API_KEY || null,
  ODDS_API_BASE: 'https://api.the-odds-api.com/v4',
  ODDS_POLL_INTERVAL_MS: 60 * 60 * 1000,       // 1 hour (keeps usage ~2,160 req/month on free tier)
  PRICE_BROADCAST_INTERVAL_MS: 3000,            // 3 seconds
  LEADERBOARD_BROADCAST_INTERVAL_MS: 30000,     // 30 seconds
  DATA_PERSISTENCE_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
  STARTING_CASH: 10000,
  MAX_PRICE_HISTORY: 60,                        // Last 60 snapshots (~3 min at 3s intervals)
  SPORTS: [
    'basketball_nba_championship_winner',
    'americanfootball_nfl_super_bowl_winner',
    'baseball_mlb_world_series_winner',
  ],
};

// Deterministic ticker map — team name → exchange symbol
export const TEAM_TICKER_MAP = {
  // NBA (30 teams)
  'Atlanta Hawks': 'ATL',
  'Boston Celtics': 'BOS',
  'Brooklyn Nets': 'BKN',
  'Charlotte Hornets': 'CHA',
  'Chicago Bulls': 'CHI',
  'Cleveland Cavaliers': 'CLE',
  'Dallas Mavericks': 'DAL',
  'Denver Nuggets': 'DEN',
  'Detroit Pistons': 'DET',
  'Golden State Warriors': 'GSW',
  'Houston Rockets': 'HOU',
  'Indiana Pacers': 'IND',
  'Los Angeles Clippers': 'LAC',
  'Los Angeles Lakers': 'LAL',
  'Memphis Grizzlies': 'MEM',
  'Miami Heat': 'MIA',
  'Milwaukee Bucks': 'MIL',
  'Minnesota Timberwolves': 'MIN',
  'New Orleans Pelicans': 'NOP',
  'New York Knicks': 'NYK',
  'Oklahoma City Thunder': 'OKC',
  'Orlando Magic': 'ORL',
  'Philadelphia 76ers': 'PHI',
  'Phoenix Suns': 'PHX',
  'Portland Trail Blazers': 'POR',
  'Sacramento Kings': 'SAC',
  'San Antonio Spurs': 'SAS',
  'Toronto Raptors': 'TOR',
  'Utah Jazz': 'UTA',
  'Washington Wizards': 'WAS',

  // NFL (32 teams)
  'Arizona Cardinals': 'ARI',
  'Atlanta Falcons': 'ATF',
  'Baltimore Ravens': 'BAL',
  'Buffalo Bills': 'BUF',
  'Carolina Panthers': 'CAR',
  'Chicago Bears': 'CHB',
  'Cincinnati Bengals': 'CIN',
  'Cleveland Browns': 'CLB',
  'Dallas Cowboys': 'DAC',
  'Denver Broncos': 'DEB',
  'Detroit Lions': 'DEL',
  'Green Bay Packers': 'GB',
  'Houston Texans': 'HXT',
  'Indianapolis Colts': 'INC',
  'Jacksonville Jaguars': 'JAX',
  'Kansas City Chiefs': 'KC',
  'Las Vegas Raiders': 'LV',
  'Los Angeles Chargers': 'LAC2',
  'Los Angeles Rams': 'LAR',
  'Miami Dolphins': 'MID',
  'Minnesota Vikings': 'MIN2',
  'New England Patriots': 'NE',
  'New Orleans Saints': 'NOS',
  'New York Giants': 'NYG',
  'New York Jets': 'NYJ',
  'Philadelphia Eagles': 'PHE',
  'Pittsburgh Steelers': 'PIT',
  'San Francisco 49ers': 'SF',
  'Seattle Seahawks': 'SEA',
  'Tampa Bay Buccaneers': 'TB',
  'Tennessee Titans': 'TEN',
  'Washington Commanders': 'WSH',

  // MLB (30 teams)
  'Arizona Diamondbacks': 'AZD',
  'Atlanta Braves': 'ATB',
  'Baltimore Orioles': 'BAO',
  'Boston Red Sox': 'RSX',
  'Chicago Cubs': 'CHC',
  'Chicago White Sox': 'CWS',
  'Cincinnati Reds': 'CIN2',
  'Cleveland Guardians': 'CLG',
  'Colorado Rockies': 'COL',
  'Detroit Tigers': 'DET2',
  'Houston Astros': 'HOU2',
  'Kansas City Royals': 'KCR',
  'Los Angeles Angels': 'LAA',
  'Los Angeles Dodgers': 'LAD',
  'Miami Marlins': 'MIA2',
  'Milwaukee Brewers': 'MIL2',
  'Minnesota Twins': 'MIN3',
  'New York Mets': 'NYM',
  'New York Yankees': 'NYY',
  'Oakland Athletics': 'OAK',
  'Philadelphia Phillies': 'PHP',
  'Pittsburgh Pirates': 'PIP',
  'San Diego Padres': 'SD',
  'San Francisco Giants': 'SFG',
  'Seattle Mariners': 'SEA2',
  'St. Louis Cardinals': 'STL',
  'Tampa Bay Rays': 'TBR',
  'Texas Rangers': 'TEX',
  'Toronto Blue Jays': 'TBJ',
  'Washington Nationals': 'WSN',
};

export function teamToTicker(teamName) {
  const known = TEAM_TICKER_MAP[teamName];
  if (known) return known;
  // Fallback: uppercase letters only, max 4 chars
  return teamName.replace(/[^A-Z]/g, '').slice(0, 4) || teamName.slice(0, 4).toUpperCase();
}

export function americanToImpliedProb(odds) {
  if (odds > 0) return 100 / (odds + 100);
  const abs = Math.abs(odds);
  return abs / (abs + 100);
}

export function oddsToPrice(odds) {
  return Math.round(americanToImpliedProb(odds) * 10000) / 100;
}
