import { clsx } from 'clsx';
import { useUiStore } from '../../stores/uiStore.js';
import { useMarketStore } from '../../stores/marketStore.js';

const LEAGUES = ['NBA', 'NFL', 'MLB'];

export function LeagueTab() {
  const activeLeague = useUiStore((s) => s.activeLeague);
  const setActiveLeague = useUiStore((s) => s.setActiveLeague);
  const stocks = useMarketStore((s) => s.stocks);

  return (
    <div className="flex gap-1 mb-6">
      {LEAGUES.map((league) => {
        const count = Object.values(stocks).filter((s) => s.sport === league).length;
        const active = activeLeague === league;
        return (
          <button
            key={league}
            onClick={() => setActiveLeague(league)}
            className={clsx(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-all',
              active
                ? 'text-black'
                : 'hover:text-[var(--color-text-primary)]'
            )}
            style={{
              backgroundColor: active ? 'var(--color-neon-green)' : 'var(--color-surface-2)',
              color: active ? '#000' : 'var(--color-text-secondary)',
              border: `1px solid ${active ? 'transparent' : 'var(--color-border)'}`,
            }}
          >
            {league}
            {count > 0 && (
              <span
                className="ml-1.5 text-xs opacity-70"
              >
                {count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
