import { oddsToPrice, americanToImpliedProb, teamToTicker } from './config.js';

// Baseline odds reflecting approximate current-season futures market
const SIMULATED_TEAMS = {
  NBA: [
    { team: 'Oklahoma City Thunder', odds: 300 },
    { team: 'Cleveland Cavaliers', odds: 350 },
    { team: 'Boston Celtics', odds: 400 },
    { team: 'Golden State Warriors', odds: 700 },
    { team: 'Denver Nuggets', odds: 800 },
    { team: 'New York Knicks', odds: 900 },
    { team: 'Minnesota Timberwolves', odds: 1000 },
    { team: 'Los Angeles Lakers', odds: 1200 },
    { team: 'Dallas Mavericks', odds: 1400 },
    { team: 'Memphis Grizzlies', odds: 1800 },
    { team: 'Philadelphia 76ers', odds: 2000 },
    { team: 'Indiana Pacers', odds: 2500 },
    { team: 'Houston Rockets', odds: 2500 },
    { team: 'Miami Heat', odds: 3000 },
    { team: 'Phoenix Suns', odds: 3500 },
    { team: 'Milwaukee Bucks', odds: 4000 },
    { team: 'Sacramento Kings', odds: 5000 },
    { team: 'Los Angeles Clippers', odds: 5000 },
    { team: 'Orlando Magic', odds: 6000 },
    { team: 'Toronto Raptors', odds: 8000 },
    { team: 'Chicago Bulls', odds: 10000 },
    { team: 'Atlanta Hawks', odds: 12000 },
    { team: 'Brooklyn Nets', odds: 15000 },
    { team: 'New Orleans Pelicans', odds: 15000 },
    { team: 'Portland Trail Blazers', odds: 20000 },
    { team: 'Utah Jazz', odds: 25000 },
    { team: 'San Antonio Spurs', odds: 30000 },
    { team: 'Washington Wizards', odds: 50000 },
    { team: 'Detroit Pistons', odds: 50000 },
    { team: 'Charlotte Hornets', odds: 50000 },
  ],
  NFL: [
    { team: 'Kansas City Chiefs', odds: -130 },
    { team: 'Philadelphia Eagles', odds: 400 },
    { team: 'Buffalo Bills', odds: 600 },
    { team: 'Baltimore Ravens', odds: 800 },
    { team: 'Detroit Lions', odds: 900 },
    { team: 'San Francisco 49ers', odds: 1000 },
    { team: 'Green Bay Packers', odds: 1400 },
    { team: 'Los Angeles Rams', odds: 1500 },
    { team: 'Dallas Cowboys', odds: 1800 },
    { team: 'Minnesota Vikings', odds: 2000 },
    { team: 'Houston Texans', odds: 2000 },
    { team: 'Washington Commanders', odds: 2500 },
    { team: 'Atlanta Falcons', odds: 3000 },
    { team: 'Cincinnati Bengals', odds: 3000 },
    { team: 'Seattle Seahawks', odds: 3500 },
    { team: 'Tampa Bay Buccaneers', odds: 3500 },
    { team: 'Pittsburgh Steelers', odds: 4000 },
    { team: 'Denver Broncos', odds: 4000 },
    { team: 'Las Vegas Raiders', odds: 5000 },
    { team: 'New York Giants', odds: 5000 },
    { team: 'Miami Dolphins', odds: 5500 },
    { team: 'Indianapolis Colts', odds: 6000 },
    { team: 'New England Patriots', odds: 7000 },
    { team: 'Los Angeles Chargers', odds: 7000 },
    { team: 'New Orleans Saints', odds: 8000 },
    { team: 'Arizona Cardinals', odds: 8000 },
    { team: 'New York Jets', odds: 10000 },
    { team: 'Jacksonville Jaguars', odds: 12000 },
    { team: 'Tennessee Titans', odds: 15000 },
    { team: 'Carolina Panthers', odds: 20000 },
    { team: 'Chicago Bears', odds: 20000 },
    { team: 'Cleveland Browns', odds: 25000 },
  ],
  MLB: [
    { team: 'Los Angeles Dodgers', odds: 350 },
    { team: 'New York Yankees', odds: 500 },
    { team: 'Atlanta Braves', odds: 700 },
    { team: 'Houston Astros', odds: 700 },
    { team: 'Philadelphia Phillies', odds: 900 },
    { team: 'Texas Rangers', odds: 1000 },
    { team: 'Baltimore Orioles', odds: 1200 },
    { team: 'Boston Red Sox', odds: 1400 },
    { team: 'Seattle Mariners', odds: 1500 },
    { team: 'San Diego Padres', odds: 1600 },
    { team: 'Toronto Blue Jays', odds: 1800 },
    { team: 'Minnesota Twins', odds: 2000 },
    { team: 'Chicago Cubs', odds: 2000 },
    { team: 'Arizona Diamondbacks', odds: 2500 },
    { team: 'Tampa Bay Rays', odds: 2500 },
    { team: 'San Francisco Giants', odds: 3000 },
    { team: 'Milwaukee Brewers', odds: 3500 },
    { team: 'Cleveland Guardians', odds: 4000 },
    { team: 'New York Mets', odds: 4500 },
    { team: 'Detroit Tigers', odds: 5000 },
    { team: 'Los Angeles Angels', odds: 6000 },
    { team: 'Cincinnati Reds', odds: 7000 },
    { team: 'Pittsburgh Pirates', odds: 8000 },
    { team: 'St. Louis Cardinals', odds: 8000 },
    { team: 'Kansas City Royals', odds: 10000 },
    { team: 'Miami Marlins', odds: 12000 },
    { team: 'Chicago White Sox', odds: 15000 },
    { team: 'Colorado Rockies', odds: 20000 },
    { team: 'Oakland Athletics', odds: 25000 },
    { team: 'Washington Nationals', odds: 30000 },
  ],
};

const SPORT_LABELS = {
  NBA: 'NBA',
  NFL: 'NFL',
  MLB: 'MLB',
};

export function buildSimulatedSnapshot() {
  const stocks = {};
  for (const [sport, teams] of Object.entries(SIMULATED_TEAMS)) {
    for (const { team, odds } of teams) {
      const ticker = teamToTicker(team);
      const price = oddsToPrice(odds);
      stocks[ticker] = {
        ticker,
        team,
        sport: SPORT_LABELS[sport],
        odds,
        price,
        previousPrice: price,
        openPrice: price,
        change: 0,
        changePct: 0,
        impliedProbability: americanToImpliedProb(odds),
        volume: Math.floor(Math.random() * 5000) + 100,
        lastUpdated: Date.now(),
        isSimulated: true,
      };
    }
  }
  return stocks;
}

// Add small random noise to a single stock price (±0.5% of current price)
export function addNoise(stock) {
  const volatility = 0.005;
  const noise = (Math.random() - 0.5) * 2 * volatility * stock.price;
  const newPrice = Math.max(0.10, stock.price + noise);
  return Math.round(newPrice * 100) / 100;
}
