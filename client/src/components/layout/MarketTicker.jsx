import { useMarketStore } from '../../stores/marketStore.js';

export function MarketTicker() {
  const stocks = useMarketStore((s) => Object.values(s.stocks));

  if (stocks.length === 0) return null;

  // Duplicate for seamless infinite scroll
  const items = [...stocks, ...stocks];

  return (
    <div
      className="overflow-hidden h-8 flex items-center border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div
        className="flex gap-8 whitespace-nowrap shrink-0"
        style={{ animation: 'ticker-scroll 90s linear infinite' }}
      >
        {items.map((stock, i) => {
          const isUp = stock.changePct >= 0;
          return (
            <span
              key={`${stock.ticker}-${i}`}
              className="inline-flex items-center gap-1.5 text-xs"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>{stock.ticker}</span>
              <span style={{ color: 'var(--color-text-primary)' }}>
                ${stock.price?.toFixed(2)}
              </span>
              <span style={{ color: isUp ? 'var(--color-neon-green)' : 'var(--color-neon-red)' }}>
                {isUp ? '+' : ''}{stock.changePct?.toFixed(2)}%
              </span>
            </span>
          );
        })}
      </div>
    </div>
  );
}
