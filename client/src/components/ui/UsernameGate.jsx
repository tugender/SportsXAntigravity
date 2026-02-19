import { useState } from 'react';
import { useUserStore } from '../../stores/userStore.js';

export function UsernameGate() {
  const [input, setInput] = useState('');
  const [error, setError] = useState('');
  const setUsername = useUserStore((s) => s.setUsername);

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = input.trim();
    if (trimmed.length < 2) {
      setError('Username must be at least 2 characters');
      return;
    }
    if (trimmed.length > 24) {
      setError('Username must be 24 characters or less');
      return;
    }
    if (!/^[a-zA-Z0-9_\-. ]+$/.test(trimmed)) {
      setError('Only letters, numbers, spaces, and _ - . are allowed');
      return;
    }
    setUsername(trimmed);
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4"
      style={{ backgroundColor: 'var(--color-bg)' }}
    >
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl text-2xl font-black mb-4"
            style={{ backgroundColor: 'var(--color-neon-green)', color: '#000' }}
          >
            SX
          </div>
          <h1
            className="text-3xl font-black mb-2"
            style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
          >
            SportsX
          </h1>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            The Sports Stock Exchange
          </p>
          <p className="text-xs mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Trade championship futures like stocks. $10,000 to start.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div
            className="rounded-2xl p-6"
            style={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
            }}
          >
            <label
              className="block text-xs font-semibold mb-2"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Choose a trader name
            </label>
            <input
              type="text"
              placeholder="e.g. BullishOnKC"
              value={input}
              onChange={(e) => { setInput(e.target.value); setError(''); }}
              autoFocus
              maxLength={24}
              className="w-full rounded-xl px-4 py-3 text-sm outline-none mb-3"
              style={{
                backgroundColor: 'var(--color-surface-2)',
                color: 'var(--color-text-primary)',
                border: `1px solid ${error ? 'var(--color-neon-red)' : 'var(--color-border)'}`,
                fontFamily: 'var(--font-mono)',
              }}
              onKeyDown={(e) => e.key === 'Enter' && handleSubmit(e)}
            />
            {error && (
              <p className="text-xs mb-3" style={{ color: 'var(--color-neon-red)' }}>
                {error}
              </p>
            )}
            <button
              type="submit"
              className="w-full py-3 rounded-xl font-bold text-sm transition-all hover:opacity-90"
              style={{ backgroundColor: 'var(--color-neon-green)', color: '#000' }}
            >
              Enter Exchange →
            </button>
          </div>
        </form>

        <p className="text-center text-xs mt-4" style={{ color: 'var(--color-text-muted)' }}>
          No account required · Virtual money only
        </p>
      </div>
    </div>
  );
}
