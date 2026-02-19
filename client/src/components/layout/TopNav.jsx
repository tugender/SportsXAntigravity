import { Link, useLocation } from 'react-router-dom';
import { TrendingUp, Briefcase, Trophy, Wifi, WifiOff } from 'lucide-react';
import { useMarketStore } from '../../stores/marketStore.js';
import { useUserStore } from '../../stores/userStore.js';
import { usePnl } from '../../hooks/usePnl.js';
import { clsx } from 'clsx';

export function TopNav() {
  const location = useLocation();
  const isConnected = useMarketStore((s) => s.isConnected);
  const isSimulated = useMarketStore((s) => s.isSimulated);
  const username = useUserStore((s) => s.username);
  const { totalPortfolioValue } = usePnl();

  const navLinks = [
    { to: '/', label: 'Markets', icon: TrendingUp },
    { to: '/portfolio', label: 'Portfolio', icon: Briefcase },
    { to: '/leaderboard', label: 'Leaderboard', icon: Trophy },
  ];

  return (
    <nav
      className="sticky top-0 z-40 border-b"
      style={{
        backgroundColor: 'var(--color-surface)',
        borderColor: 'var(--color-border)',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <div
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ backgroundColor: 'var(--color-neon-green)', color: '#000' }}
          >
            SX
          </div>
          <span
            className="text-base font-bold hidden sm:block"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            SportsX
          </span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1">
          {navLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to;
            return (
              <Link
                key={to}
                to={to}
                className={clsx(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded text-sm font-medium no-underline transition-colors',
                  active
                    ? 'text-[var(--color-neon-green)] bg-[var(--color-neon-green-dim)]'
                    : 'text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-3)]'
                )}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{label}</span>
              </Link>
            );
          })}
        </div>

        {/* Right section */}
        <div className="flex items-center gap-3">
          {isSimulated && (
            <span
              className="text-xs px-2 py-0.5 rounded font-mono"
              style={{
                backgroundColor: '#ff990020',
                color: '#ff9900',
                border: '1px solid #ff990040',
              }}
            >
              SIM
            </span>
          )}

          {/* Connection indicator */}
          <span className="flex items-center gap-1">
            {isConnected ? (
              <Wifi size={13} style={{ color: 'var(--color-neon-green)' }} />
            ) : (
              <WifiOff size={13} style={{ color: 'var(--color-neon-red)' }} />
            )}
          </span>

          {/* Portfolio value */}
          <div className="text-right hidden sm:block">
            <div
              className="text-xs"
              style={{ color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}
            >
              {username}
            </div>
            <div
              className="text-sm font-semibold"
              style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
            >
              ${totalPortfolioValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
