import Anthropic from '@anthropic-ai/sdk';
import { config } from './config.js';

const client = config.CLAUDE_API_KEY
  ? new Anthropic({ apiKey: config.CLAUDE_API_KEY })
  : null;

// In-memory cache: ticker → { text, expires }
const briefingCache = new Map();
const CACHE_TTL_MS = 10 * 60 * 1000; // 10 minutes

export async function getStockBriefing(stock, priceHistory) {
  if (!client) return null;

  const cached = briefingCache.get(stock.ticker);
  if (cached && Date.now() < cached.expires) return cached.text;

  const recentPrices = priceHistory.slice(-20);
  const trendPct =
    recentPrices.length >= 2
      ? (((recentPrices.at(-1).price - recentPrices[0].price) / recentPrices[0].price) * 100).toFixed(1)
      : '0.0';

  const evLabel = stock.ev > 0 ? `+$${stock.ev.toFixed(2)} (undervalued)` : `$${stock.ev?.toFixed(2)} (overvalued)`;
  const oddsStr = stock.odds > 0 ? `+${stock.odds}` : String(stock.odds ?? 'N/A');

  const prompt = `You are a terse sports-betting analyst for a synthetic championship futures exchange where odds are converted to share prices (price = implied win probability × 100).

Team: ${stock.team}
Sport: ${stock.sport}
Current price: $${stock.price?.toFixed(2)} (${(stock.price ?? 0).toFixed(1)}% implied championship probability)
Fair value (consensus): $${stock.fairValue?.toFixed(2) ?? 'N/A'}
Expected Value: ${evLabel}
American odds: ${oddsStr}
Recent price trend: ${trendPct}% over last ${recentPrices.length} snapshots

Write 3–4 sentences of analyst commentary covering: (1) the implied championship probability and whether it seems reasonable, (2) whether the stock is fairly valued vs consensus, (3) one concrete factor affecting their odds this season. Under 90 words. No bullet points. No fluff.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 180,
      messages: [{ role: 'user', content: prompt }],
    });

    const text = message.content[0]?.text?.trim() ?? '';
    briefingCache.set(stock.ticker, { text, expires: Date.now() + CACHE_TTL_MS });
    return text;
  } catch (err) {
    console.error('[ai] Stock briefing error:', err.message);
    return null;
  }
}

export async function getPortfolioReview(portfolio, stocksMap) {
  if (!client) return null;

  const lines = Object.entries(portfolio.positions)
    .map(([ticker, pos]) => {
      const s = stocksMap[ticker];
      if (!s) return null;
      const mv = pos.shares * s.price;
      const upnl = mv - pos.totalCost;
      const evTag = s.ev > 0 ? `+EV $${s.ev.toFixed(2)}` : `-EV $${Math.abs(s.ev ?? 0).toFixed(2)}`;
      return `${ticker} (${s.team}): ${pos.shares}sh @ avg $${pos.averageCostBasis?.toFixed(2)}, now $${s.price?.toFixed(2)}, ${evTag}, P&L ${upnl >= 0 ? '+' : ''}$${upnl.toFixed(2)}`;
    })
    .filter(Boolean);

  if (lines.length === 0) return 'No open positions to analyze.';

  const prompt = `You are a terse sports-betting portfolio analyst reviewing a championship futures portfolio.

Cash: $${portfolio.cashBalance?.toFixed(2)}
Realized P&L: ${portfolio.realizedPnl >= 0 ? '+' : ''}$${portfolio.realizedPnl?.toFixed(2)}
Open positions:
${lines.join('\n')}

Write 4–5 sentences covering: (1) overall portfolio quality, (2) best and worst EV positions by name, (3) any concentration risk, (4) one specific actionable recommendation. Under 130 words. No bullet points. Be direct.`;

  try {
    const message = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      messages: [{ role: 'user', content: prompt }],
    });

    return message.content[0]?.text?.trim() ?? '';
  } catch (err) {
    console.error('[ai] Portfolio review error:', err.message);
    return null;
  }
}
