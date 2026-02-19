import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, TrendingUp, TrendingDown, BrainCircuit, Loader } from 'lucide-react';
import { useMarketStore } from '../stores/marketStore.js';
import { useUiStore } from '../stores/uiStore.js';
import { useUserStore } from '../stores/userStore.js';
import { PriceChart } from '../components/trading/PriceChart.jsx';

export function StockDetailPage() {
  const { ticker } = useParams();
  const navigate = useNavigate();
  const stock = useMarketStore((s) => s.stocks[ticker]);
  const openTradeModal = useUiStore((s) => s.openTradeModal);
  const positions = useUserStore((s) => s.positions);
  const holding = positions[ticker];

  if (!stock) {
    return (
      <div className="text-center py-20">
        <div className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
          Loading {ticker}...
        </div>
      </div>
    );
  }

  const [briefing, setBriefing] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState(null);

  async function fetchBriefing() {
    setBriefingLoading(true);
    setBriefingError(null);
    try {
      const res = await fetch(`/api/ai/analysis/${ticker}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setBriefing(data.briefing);
    } catch (err) {
      setBriefingError(err.message);
    } finally {
      setBriefingLoading(false);
    }
  }

  const isUp = stock.changePct >= 0;
  const changeColor = isUp ? 'var(--color-neon-green)' : 'var(--color-neon-red)';

  return (
    <div className="max-w-2xl mx-auto">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm mb-5 transition-colors"
        style={{ color: 'var(--color-text-muted)' }}
      >
        <ArrowLeft size={15} />
        Back to Markets
      </button>

      {/* Header */}
      <div
        className="rounded-2xl p-6 mb-4"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className="text-sm font-bold px-2 py-0.5 rounded"
                style={{
                  fontFamily: 'var(--font-mono)',
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                {stock.ticker}
              </span>
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{ backgroundColor: 'var(--color-surface-3)', color: 'var(--color-text-muted)' }}
              >
                {stock.sport}
              </span>
            </div>
            <h1
              className="text-xl font-bold"
              style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
            >
              {stock.team}
            </h1>
          </div>
          <div className="text-right">
            <div
              className="text-3xl font-bold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
            >
              ${stock.price.toFixed(2)}
            </div>
            <div className="flex items-center justify-end gap-1 text-sm" style={{ color: changeColor }}>
              {isUp ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
              {isUp ? '+' : ''}{stock.changePct?.toFixed(2)}%
            </div>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-4 mb-4">
          {[
            { label: 'Implied Prob.', value: `${((stock.impliedProbability || stock.price / 100) * 100).toFixed(1)}%` },
            { label: 'Odds', value: stock.odds > 0 ? `+${stock.odds}` : String(stock.odds) },
            { label: 'Volume', value: stock.volume?.toLocaleString() || '—' },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>{label}</div>
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                {value}
              </div>
            </div>
          ))}
        </div>

        {/* Analytics row — Fair Value + EV */}
        {stock.fairValue != null && (
          <div
            className="grid grid-cols-2 gap-3 mb-4 rounded-lg p-3"
            style={{ backgroundColor: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
          >
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Fair Value (consensus)</div>
              <div className="text-sm font-semibold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}>
                ${stock.fairValue.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs mb-0.5" style={{ color: 'var(--color-text-muted)' }}>Expected Value</div>
              <div
                className="text-sm font-bold"
                style={{
                  fontFamily: 'var(--font-mono)',
                  color: stock.ev >= 0 ? 'var(--color-neon-green)' : 'var(--color-neon-red)',
                }}
              >
                {stock.ev >= 0 ? '+' : ''}${stock.ev.toFixed(2)}{' '}
                <span className="text-xs font-normal">
                  {stock.ev >= 0 ? '(undervalued)' : '(overvalued)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Chart */}
        <PriceChart ticker={ticker} />
      </div>

      {/* Holding info */}
      {holding && (
        <div
          className="rounded-xl p-4 mb-4"
          style={{
            backgroundColor: 'var(--color-neon-green-dim)',
            border: '1px solid var(--color-neon-green)30',
          }}
        >
          <div className="text-xs font-semibold mb-2" style={{ color: 'var(--color-neon-green)' }}>
            Your Position
          </div>
          <div className="grid grid-cols-3 gap-3 text-sm">
            <div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Shares</div>
              <div className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                {holding.shares}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Avg Cost</div>
              <div className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                ${holding.averageCostBasis?.toFixed(2)}
              </div>
            </div>
            <div>
              <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>Market Value</div>
              <div className="font-mono font-semibold" style={{ color: 'var(--color-text-primary)' }}>
                ${(holding.shares * stock.price).toFixed(2)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI Briefing panel */}
      <div
        className="rounded-xl p-4 mb-4"
        style={{ backgroundColor: 'var(--color-surface)', border: '1px solid var(--color-border)' }}
      >
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-1.5 text-xs font-semibold" style={{ color: 'var(--color-text-secondary)' }}>
            <BrainCircuit size={13} />
            AI Analyst
          </div>
          {!briefing && (
            <button
              onClick={fetchBriefing}
              disabled={briefingLoading}
              className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg transition-all hover:opacity-90 disabled:opacity-50"
              style={{
                backgroundColor: 'var(--color-neon-blue)20',
                color: 'var(--color-neon-blue)',
                border: '1px solid var(--color-neon-blue)40',
              }}
            >
              {briefingLoading ? <Loader size={11} className="animate-spin" /> : <BrainCircuit size={11} />}
              {briefingLoading ? 'Analysing...' : 'Generate Briefing'}
            </button>
          )}
          {briefing && (
            <button
              onClick={() => { setBriefing(null); setBriefingError(null); }}
              className="text-xs"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Refresh
            </button>
          )}
        </div>

        {!briefing && !briefingLoading && !briefingError && (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Get an AI-generated market commentary on {stock.team}'s championship odds.
          </div>
        )}
        {briefingLoading && (
          <div className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
            Generating analysis...
          </div>
        )}
        {briefingError && (
          <div className="text-xs" style={{ color: 'var(--color-neon-red)' }}>
            {briefingError}
          </div>
        )}
        {briefing && (
          <p className="text-sm leading-relaxed" style={{ color: 'var(--color-text-primary)' }}>
            {briefing}
          </p>
        )}
      </div>

      {/* Trade buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => openTradeModal(ticker, 'buy')}
          className="py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{ backgroundColor: 'var(--color-neon-green)', color: '#000' }}
        >
          Buy {stock.ticker}
        </button>
        <button
          onClick={() => openTradeModal(ticker, 'sell')}
          className="py-3.5 rounded-xl font-bold text-sm transition-all hover:opacity-90"
          style={{
            backgroundColor: 'var(--color-neon-red-dim)',
            color: 'var(--color-neon-red)',
            border: '1px solid var(--color-neon-red)40',
          }}
          disabled={!holding}
        >
          Sell {stock.ticker}
        </button>
      </div>
    </div>
  );
}
