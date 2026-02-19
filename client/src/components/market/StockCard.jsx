import { useNavigate } from 'react-router-dom';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore.js';
import { useUserStore } from '../../stores/userStore.js';
import { clsx } from 'clsx';

export function StockCard({ stock }) {
  const navigate = useNavigate();
  const openTradeModal = useUiStore((s) => s.openTradeModal);
  const positions = useUserStore((s) => s.positions);
  const holding = positions[stock.ticker];

  const isUp = stock.changePct >= 0;
  const changeColor = isUp ? 'var(--color-neon-green)' : 'var(--color-neon-red)';

  return (
    <div
      className="rounded-xl border p-4 cursor-pointer transition-all hover:scale-[1.02]"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
      onClick={() => navigate(`/stock/${stock.ticker}`)}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded"
              style={{
                fontFamily: 'var(--font-mono)',
                backgroundColor: 'var(--color-surface-3)',
                color: 'var(--color-text-secondary)',
                border: '1px solid var(--color-border)',
              }}
            >
              {stock.ticker}
            </span>
            {holding && (
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-neon-green-dim)',
                  color: 'var(--color-neon-green)',
                  border: '1px solid var(--color-neon-green)30',
                }}
              >
                {holding.shares}sh
              </span>
            )}
          </div>
          <div
            className="text-sm font-medium mt-1 leading-tight"
            style={{ color: 'var(--color-text-primary)' }}
          >
            {stock.team}
          </div>
        </div>
        <div className="text-right">
          <div
            className="text-lg font-bold"
            style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
          >
            ${stock.price?.toFixed(2)}
          </div>
          <div
            className="flex items-center justify-end gap-0.5 text-xs font-medium"
            style={{ color: changeColor }}
          >
            {isUp ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
            {isUp ? '+' : ''}{stock.changePct?.toFixed(2)}%
          </div>
        </div>
      </div>

      {/* Implied probability bar */}
      <div className="mb-3">
        <div
          className="flex justify-between text-xs mb-1"
          style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
        >
          <span>Implied Prob.</span>
          <span>{((stock.impliedProbability || stock.price / 100) * 100).toFixed(1)}%</span>
        </div>
        <div
          className="h-1 rounded-full overflow-hidden"
          style={{ backgroundColor: 'var(--color-surface-3)' }}
        >
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min((stock.impliedProbability || stock.price / 100) * 100, 100)}%`,
              backgroundColor: changeColor,
            }}
          />
        </div>
      </div>

      {/* Trade buttons */}
      <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
        <button
          className="flex-1 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-neon-green-dim)',
            color: 'var(--color-neon-green)',
            border: '1px solid var(--color-neon-green)40',
          }}
          onClick={() => openTradeModal(stock.ticker, 'buy')}
        >
          BUY
        </button>
        <button
          className="flex-1 py-1.5 rounded text-xs font-semibold transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-neon-red-dim)',
            color: 'var(--color-neon-red)',
            border: '1px solid var(--color-neon-red)40',
          }}
          onClick={() => openTradeModal(stock.ticker, 'sell')}
        >
          SELL
        </button>
      </div>
    </div>
  );
}
