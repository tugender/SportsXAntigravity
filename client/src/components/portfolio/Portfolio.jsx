import { useState } from 'react';
import { TrendingUp, TrendingDown, BrainCircuit, Loader } from 'lucide-react';
import { useUiStore } from '../../stores/uiStore.js';
import { useUserStore } from '../../stores/userStore.js';
import { usePnl } from '../../hooks/usePnl.js';

function PnlBadge({ value }) {
  const isPos = value >= 0;
  return (
    <span
      className="inline-flex items-center gap-0.5 text-xs font-mono font-medium"
      style={{ color: isPos ? 'var(--color-neon-green)' : 'var(--color-neon-red)' }}
    >
      {isPos ? <TrendingUp size={11} /> : <TrendingDown size={11} />}
      {isPos ? '+' : ''}${Math.abs(value).toFixed(2)}
    </span>
  );
}

export function Portfolio() {
  const openTradeModal = useUiStore((s) => s.openTradeModal);
  const username = useUserStore((s) => s.username);
  const cashBalance = useUserStore((s) => s.cashBalance);
  const { enrichedPositions, positionsValue, totalPortfolioValue, totalUnrealizedPnl, realizedPnl } = usePnl();

  const [review, setReview] = useState(null);
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewError, setReviewError] = useState(null);

  async function fetchReview() {
    setReviewLoading(true);
    setReviewError(null);
    try {
      const res = await fetch('/api/ai/portfolio', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setReview(data.review);
    } catch (err) {
      setReviewError(err.message);
    } finally {
      setReviewLoading(false);
    }
  }

  const positions = Object.values(enrichedPositions);
  const hasPositions = positions.length > 0;

  return (
    <div>
      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: 'Portfolio Value', value: `$${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, mono: true },
          { label: 'Cash Balance', value: `$${cashBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}`, mono: true },
          { label: 'Unrealized P&L', value: totalUnrealizedPnl, isPnl: true },
          { label: 'Realized P&L', value: realizedPnl, isPnl: true },
        ].map(({ label, value, mono, isPnl }) => (
          <div
            key={label}
            className="rounded-xl p-4"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <div className="text-xs mb-1" style={{ color: 'var(--color-text-muted)' }}>
              {label}
            </div>
            {isPnl ? (
              <PnlBadge value={value} />
            ) : (
              <div
                className="text-base font-bold"
                style={{
                  fontFamily: mono ? 'var(--font-mono)' : undefined,
                  color: 'var(--color-text-primary)',
                }}
              >
                {value}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* AI Portfolio Review */}
      {hasPositions && (
        <div
          className="rounded-xl p-4 mb-6"
          style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
        >
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
              <BrainCircuit size={13} />
              AI Portfolio Review
            </div>
            {!review && (
              <button
                onClick={fetchReview}
                disabled={reviewLoading}
                className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
                style={{
                  backgroundColor: 'var(--color-neon-blue)20',
                  color: 'var(--color-neon-blue)',
                  border: '1px solid var(--color-neon-blue)40',
                }}
              >
                {reviewLoading ? <Loader size={11} className="animate-spin" /> : <BrainCircuit size={11} />}
                {reviewLoading ? 'Analysing...' : 'Review My Portfolio'}
              </button>
            )}
            {review && (
              <button
                onClick={() => { setReview(null); setReviewError(null); }}
                className="text-xs"
                style={{ color: 'var(--color-text-muted)' }}
              >
                Refresh
              </button>
            )}
          </div>

          {!review && !reviewLoading && !reviewError && (
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Get an AI analysis of your positions, EV scores, and portfolio risk.
            </div>
          )}
          {reviewLoading && (
            <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Generating analysis...</div>
          )}
          {reviewError && (
            <div className="text-xs" style={{ color: 'var(--color-neon-red)' }}>{reviewError}</div>
          )}
          {review && (
            <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>{review}</p>
          )}
        </div>
      )}

      {/* Positions table */}
      <div
        className="rounded-xl overflow-hidden"
        style={{ border: '1px solid var(--color-border)' }}
      >
        <div
          className="px-4 py-3 text-sm font-semibold"
          style={{
            backgroundColor: 'var(--color-surface)',
            borderBottom: '1px solid var(--color-border)',
            color: 'var(--color-text-secondary)',
          }}
        >
          Open Positions {hasPositions && `(${positions.length})`}
        </div>

        {!hasPositions ? (
          <div
            className="py-12 text-center text-sm"
            style={{ backgroundColor: 'var(--color-surface)', color: 'var(--color-text-muted)' }}
          >
            No open positions. Go to Markets to start trading.
          </div>
        ) : (
          <div style={{ backgroundColor: 'var(--color-surface)' }}>
            {/* Table header */}
            <div
              className="grid grid-cols-12 px-4 py-2 text-xs gap-2"
              style={{ color: 'var(--color-text-muted)', borderBottom: '1px solid var(--color-border)' }}
            >
              <span className="col-span-3">Team</span>
              <span className="col-span-2 text-right">Shares</span>
              <span className="col-span-2 text-right">Avg Cost</span>
              <span className="col-span-2 text-right">Current</span>
              <span className="col-span-3 text-right">P&amp;L</span>
            </div>

            {positions.map((pos) => (
              <div
                key={pos.ticker}
                className="grid grid-cols-12 px-4 py-3 text-sm gap-2 items-center hover:bg-[var(--color-surface-2)] transition-colors"
                style={{ borderBottom: '1px solid var(--color-border)' }}
              >
                <div className="col-span-3">
                  <div
                    className="text-xs font-bold"
                    style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-secondary)' }}
                  >
                    {pos.ticker}
                  </div>
                  <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                    {pos.sport}
                  </div>
                </div>
                <div
                  className="col-span-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  {pos.shares}
                </div>
                <div
                  className="col-span-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-secondary)' }}
                >
                  ${pos.averageCostBasis?.toFixed(2)}
                </div>
                <div
                  className="col-span-2 text-right font-mono text-xs"
                  style={{ color: 'var(--color-text-primary)' }}
                >
                  ${pos.currentPrice?.toFixed(2)}
                </div>
                <div className="col-span-3 text-right flex flex-col items-end">
                  <PnlBadge value={pos.unrealizedPnl} />
                  <span className="text-xs" style={{ color: pos.unrealizedPnlPct >= 0 ? 'var(--color-neon-green)' : 'var(--color-neon-red)', fontFamily: 'var(--font-mono)' }}>
                    {pos.unrealizedPnlPct >= 0 ? '+' : ''}{pos.unrealizedPnlPct?.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
