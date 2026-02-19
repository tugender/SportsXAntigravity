import { useMarketStore } from '../../stores/marketStore.js';
import { StockCard } from './StockCard.jsx';

export function StockGrid({ sport }) {
  const stocks = useMarketStore((s) =>
    Object.values(s.stocks)
      .filter((st) => st.sport === sport)
      .sort((a, b) => b.price - a.price)
  );

  if (stocks.length === 0) {
    return (
      <div
        className="text-center py-16 text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Loading {sport} markets...
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {stocks.map((stock) => (
        <StockCard key={stock.ticker} stock={stock} />
      ))}
    </div>
  );
}
