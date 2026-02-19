import { LeagueTab } from '../components/market/LeagueTab.jsx';
import { StockGrid } from '../components/market/StockGrid.jsx';
import { useUiStore } from '../stores/uiStore.js';
import { useMarketStore } from '../stores/marketStore.js';

export function MarketsPage() {
  const activeLeague = useUiStore((s) => s.activeLeague);
  const topMovers = useMarketStore((s) => s.getTopMovers(3));

  return (
    <div>
      {/* Top Movers */}
      {topMovers.length > 0 && (
        <div className="mb-6">
          <h2 className="text-xs font-semibold uppercase tracking-widest mb-3" style={{ color: 'var(--color-text-muted)' }}>
            Top Movers
          </h2>
          <div className="flex gap-3 overflow-x-auto pb-1">
            {topMovers.map((stock) => {
              const isUp = stock.changePct >= 0;
              return (
                <div
                  key={stock.ticker}
                  className="flex-shrink-0 rounded-xl px-4 py-2.5 flex items-center gap-3"
                  style={{
                    backgroundColor: 'var(--color-surface)',
                    border: `1px solid ${isUp ? 'var(--color-neon-green)30' : 'var(--color-neon-red)30'}`,
                  }}
                >
                  <span
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}
                  >
                    {stock.ticker}
                  </span>
                  <span
                    className="text-sm font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
                  >
                    ${stock.price?.toFixed(2)}
                  </span>
                  <span
                    className="text-xs font-semibold"
                    style={{ color: isUp ? 'var(--color-neon-green)' : 'var(--color-neon-red)' }}
                  >
                    {isUp ? '+' : ''}{stock.changePct?.toFixed(2)}%
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <LeagueTab />
      <StockGrid sport={activeLeague} />
    </div>
  );
}
