import { Trophy, Medal } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore.js';
import { useUserStore } from '../../stores/userStore.js';

const RANK_COLORS = {
  1: '#ffd700',
  2: '#c0c0c0',
  3: '#cd7f32',
};

export function Leaderboard() {
  const rankings = useMarketStore((s) => s.leaderboard);
  const username = useUserStore((s) => s.username);

  if (rankings.length === 0) {
    return (
      <div
        className="py-16 text-center text-sm"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Leaderboard updates every 30 seconds...
      </div>
    );
  }

  return (
    <div
      className="rounded-xl overflow-hidden"
      style={{ border: '1px solid var(--color-border)' }}
    >
      {/* Header */}
      <div
        className="px-5 py-3 flex items-center gap-2 text-sm font-semibold"
        style={{
          backgroundColor: 'var(--color-surface)',
          borderBottom: '1px solid var(--color-border)',
          color: 'var(--color-text-secondary)',
        }}
      >
        <Trophy size={14} />
        Leaderboard — {rankings.length} traders
      </div>

      {/* Column headers */}
      <div
        className="grid grid-cols-12 px-5 py-2 text-xs"
        style={{
          backgroundColor: 'var(--color-surface)',
          color: 'var(--color-text-muted)',
          borderBottom: '1px solid var(--color-border)',
        }}
      >
        <span className="col-span-1">#</span>
        <span className="col-span-4">Trader</span>
        <span className="col-span-3 text-right">Portfolio</span>
        <span className="col-span-2 text-right">Positions</span>
        <span className="col-span-2 text-right">Realized</span>
      </div>

      {/* Rows */}
      <div style={{ backgroundColor: 'var(--color-surface)' }}>
        {rankings.map((entry) => {
          const isMe = entry.username === username;
          const rankColor = RANK_COLORS[entry.rank] || 'var(--color-text-muted)';
          return (
            <div
              key={entry.username}
              className="grid grid-cols-12 px-5 py-3 text-sm items-center"
              style={{
                borderBottom: '1px solid var(--color-border)',
                backgroundColor: isMe ? 'var(--color-neon-green-dim)' : 'transparent',
              }}
            >
              {/* Rank */}
              <div className="col-span-1 font-bold" style={{ color: rankColor, fontFamily: 'var(--font-mono)' }}>
                {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
              </div>

              {/* Username */}
              <div className="col-span-4 flex items-center gap-1.5">
                <span
                  className="font-medium text-sm truncate"
                  style={{ color: isMe ? 'var(--color-neon-green)' : 'var(--color-text-primary)' }}
                >
                  {entry.username}
                </span>
                {isMe && (
                  <span
                    className="text-xs px-1 rounded"
                    style={{ backgroundColor: 'var(--color-neon-green-dim)', color: 'var(--color-neon-green)' }}
                  >
                    You
                  </span>
                )}
              </div>

              {/* Total value */}
              <div
                className="col-span-3 text-right font-mono font-semibold text-sm"
                style={{ color: 'var(--color-text-primary)' }}
              >
                ${entry.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>

              {/* Positions value */}
              <div
                className="col-span-2 text-right font-mono text-xs"
                style={{ color: 'var(--color-text-secondary)' }}
              >
                ${entry.positionsValue.toFixed(2)}
              </div>

              {/* Realized P&L */}
              <div
                className="col-span-2 text-right font-mono text-xs"
                style={{ color: entry.realizedPnl >= 0 ? 'var(--color-neon-green)' : 'var(--color-neon-red)' }}
              >
                {entry.realizedPnl >= 0 ? '+' : ''}${entry.realizedPnl.toFixed(2)}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
