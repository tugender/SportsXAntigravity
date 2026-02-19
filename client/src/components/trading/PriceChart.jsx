import { useEffect } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { socket } from '../../socket.js';
import { useMarketStore } from '../../stores/marketStore.js';

function formatTime(ts) {
  return new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

function CustomTooltip({ active, payload }) {
  if (!active || !payload?.length) return null;
  const { price, timestamp } = payload[0].payload;
  return (
    <div
      className="rounded-lg px-3 py-2 text-xs"
      style={{
        backgroundColor: 'var(--color-surface-3)',
        border: '1px solid var(--color-border)',
        color: 'var(--color-text-primary)',
        fontFamily: 'var(--font-mono)',
      }}
    >
      <div>${price?.toFixed(2)}</div>
      <div style={{ color: 'var(--color-text-muted)' }}>{formatTime(timestamp)}</div>
    </div>
  );
}

export function PriceChart({ ticker }) {
  const history = useMarketStore((s) => s.priceHistory[ticker] || []);

  useEffect(() => {
    if (ticker) {
      socket.emit('REQUEST_PRICE_HISTORY', { ticker });
    }
  }, [ticker]);

  if (history.length < 2) {
    return (
      <div
        className="flex items-center justify-center h-40 text-xs"
        style={{ color: 'var(--color-text-muted)' }}
      >
        Collecting price data...
      </div>
    );
  }

  const firstPrice = history[0].price;
  const lastPrice = history[history.length - 1].price;
  const isGain = lastPrice >= firstPrice;
  const lineColor = isGain ? 'var(--color-neon-green)' : 'var(--color-neon-red)';

  return (
    <ResponsiveContainer width="100%" height={180}>
      <LineChart data={history} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
        <XAxis
          dataKey="timestamp"
          tickFormatter={formatTime}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          minTickGap={60}
        />
        <YAxis
          domain={['auto', 'auto']}
          tick={{ fill: 'var(--color-text-muted)', fontSize: 10 }}
          axisLine={false}
          tickLine={false}
          tickFormatter={(v) => `$${v.toFixed(2)}`}
          width={55}
        />
        <Tooltip content={<CustomTooltip />} />
        <Line
          type="monotone"
          dataKey="price"
          stroke={lineColor}
          strokeWidth={2}
          dot={false}
          isAnimationActive={false}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}
