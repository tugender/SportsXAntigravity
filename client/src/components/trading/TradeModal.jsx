import { useState, useEffect } from 'react';
import * as Dialog from '@radix-ui/react-dialog';
import { X, TrendingUp, TrendingDown, AlertCircle } from 'lucide-react';
import { socket } from '../../socket.js';
import { useUiStore } from '../../stores/uiStore.js';
import { useUserStore } from '../../stores/userStore.js';
import { useMarketStore } from '../../stores/marketStore.js';

export function TradeModal() {
  const { tradeModalOpen, closeTradeModal, selectedTicker, tradeSide } = useUiStore();
  const openTradeModal = useUiStore((s) => s.openTradeModal);
  const { username, cashBalance, positions } = useUserStore();
  const stock = useMarketStore((s) => s.stocks[selectedTicker]);

  const [shares, setShares] = useState(1);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(null);
  const [confirmed, setConfirmed] = useState(false);

  useEffect(() => {
    if (tradeModalOpen) {
      setShares(1);
      setError(null);
      setConfirmed(false);
    }
  }, [tradeModalOpen, selectedTicker]);

  if (!stock) return null;

  const currentPosition = positions[selectedTicker];
  const totalCost = Math.round(shares * stock.price * 100) / 100;
  const maxBuyShares = Math.floor(cashBalance / Math.max(stock.price, 0.01));
  const maxSellShares = currentPosition?.shares || 0;

  // Kelly Criterion: f* = (fairValue - price) / (100 - price)
  // Kelly shares = f* × (cashBalance / price), floored and capped at maxBuy
  const kellyShares = (() => {
    const fv = stock.fairValue;
    const p = stock.price;
    if (!fv || p >= 100 || fv <= p) return 0;
    const fraction = (fv - p) / (100 - p);
    return Math.min(Math.floor(fraction * cashBalance / p), maxBuyShares);
  })();
  const canTrade =
    tradeSide === 'buy' ? totalCost <= cashBalance && shares > 0
    : shares > 0 && shares <= maxSellShares;

  function handleSubmit() {
    if (!canTrade || pending) return;
    setPending(true);
    setError(null);

    socket.emit('PLACE_ORDER', {
      username,
      ticker: selectedTicker,
      side: tradeSide,
      shares: parseInt(shares, 10),
      orderType: 'market',
    });

    function onConfirmed() {
      setPending(false);
      setConfirmed(true);
      setTimeout(closeTradeModal, 800);
      socket.off('TRADE_REJECTED', onRejected);
    }

    function onRejected({ reason }) {
      setPending(false);
      setError(reason);
      socket.off('TRADE_CONFIRMED', onConfirmed);
    }

    socket.once('TRADE_CONFIRMED', onConfirmed);
    socket.once('TRADE_REJECTED', onRejected);
  }

  const isUp = stock.changePct >= 0;

  return (
    <Dialog.Root open={tradeModalOpen} onOpenChange={closeTradeModal}>
      <Dialog.Portal>
        <Dialog.Overlay
          className="fixed inset-0 z-50"
          style={{ backgroundColor: 'rgba(0,0,0,0.75)', backdropFilter: 'blur(4px)' }}
        />
        <Dialog.Content
          className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-50 w-full max-w-sm rounded-2xl p-6 shadow-2xl"
          style={{
            backgroundColor: 'var(--color-surface-2)',
            border: '1px solid var(--color-border)',
          }}
        >
          {/* Close button */}
          <Dialog.Close
            className="absolute top-4 right-4 p-1 rounded transition-colors hover:bg-[var(--color-surface-3)]"
            style={{ color: 'var(--color-text-muted)' }}
          >
            <X size={16} />
          </Dialog.Close>

          {/* Header */}
          <div className="mb-5">
            <div className="flex items-center gap-2 mb-1">
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
              <span
                className="text-xs px-1.5 py-0.5 rounded"
                style={{
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-text-muted)',
                }}
              >
                {stock.sport}
              </span>
            </div>
            <div className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
              {stock.team}
            </div>
            <div className="flex items-center gap-2 mt-1">
              <span
                className="text-2xl font-bold"
                style={{ fontFamily: 'var(--font-mono)', color: 'var(--color-text-primary)' }}
              >
                ${stock.price.toFixed(2)}
              </span>
              <span
                className="flex items-center gap-0.5 text-sm"
                style={{ color: isUp ? 'var(--color-neon-green)' : 'var(--color-neon-red)' }}
              >
                {isUp ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                {isUp ? '+' : ''}{stock.changePct?.toFixed(2)}%
              </span>
            </div>
          </div>

          {/* Buy / Sell toggle */}
          <div
            className="flex rounded-lg p-1 mb-5"
            style={{ backgroundColor: 'var(--color-surface-3)' }}
          >
            {['buy', 'sell'].map((side) => (
              <button
                key={side}
                onClick={() => { openTradeModal(selectedTicker, side); setError(null); }}
                className="flex-1 py-2 rounded-md text-sm font-bold transition-all uppercase"
                style={{
                  backgroundColor:
                    tradeSide === side
                      ? side === 'buy' ? 'var(--color-neon-green)' : 'var(--color-neon-red)'
                      : 'transparent',
                  color:
                    tradeSide === side
                      ? '#000'
                      : 'var(--color-text-muted)',
                }}
              >
                {side}
              </button>
            ))}
          </div>

          {/* Shares input */}
          <div className="mb-4">
            <label
              className="block text-xs mb-1.5"
              style={{ color: 'var(--color-text-muted)' }}
            >
              Shares
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShares((s) => Math.max(1, Number(s) - 1))}
                className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                −
              </button>
              <input
                type="number"
                min={1}
                max={tradeSide === 'buy' ? maxBuyShares : maxSellShares}
                value={shares}
                onChange={(e) => setShares(Math.max(1, parseInt(e.target.value) || 1))}
                className="flex-1 text-center rounded py-2 text-sm font-mono outline-none"
                style={{
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)',
                }}
              />
              <button
                onClick={() =>
                  setShares((s) =>
                    tradeSide === 'buy'
                      ? Math.min(maxBuyShares, Number(s) + 1)
                      : Math.min(maxSellShares, Number(s) + 1)
                  )
                }
                className="w-8 h-8 rounded flex items-center justify-center text-lg font-bold transition-colors"
                style={{
                  backgroundColor: 'var(--color-surface-3)',
                  color: 'var(--color-text-secondary)',
                  border: '1px solid var(--color-border)',
                }}
              >
                +
              </button>
            </div>
            {/* Max buttons */}
            {tradeSide === 'buy' && maxBuyShares > 0 && (
              <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                <button
                  className="text-xs"
                  style={{ color: 'var(--color-neon-green)' }}
                  onClick={() => setShares(maxBuyShares)}
                >
                  Max: {maxBuyShares} shares
                </button>
                {kellyShares > 0 && (
                  <button
                    className="text-xs"
                    style={{ color: 'var(--color-neon-blue)' }}
                    onClick={() => setShares(kellyShares)}
                  >
                    Kelly: {kellyShares} shares
                  </button>
                )}
              </div>
            )}
            {tradeSide === 'sell' && maxSellShares > 0 && (
              <button
                className="text-xs mt-1.5"
                style={{ color: 'var(--color-neon-red)' }}
                onClick={() => setShares(maxSellShares)}
              >
                Sell all: {maxSellShares} shares
              </button>
            )}
          </div>

          {/* Order summary */}
          <div
            className="rounded-lg p-3 mb-4 space-y-1.5"
            style={{ backgroundColor: 'var(--color-surface-3)', border: '1px solid var(--color-border)' }}
          >
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>Price per share</span>
              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                ${stock.price.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>Shares</span>
              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                {shares}
              </span>
            </div>
            <div
              className="flex justify-between text-sm font-semibold pt-1"
              style={{ borderTop: '1px solid var(--color-border)' }}
            >
              <span style={{ color: 'var(--color-text-secondary)' }}>
                {tradeSide === 'buy' ? 'Total cost' : 'You receive'}
              </span>
              <span style={{ color: 'var(--color-text-primary)', fontFamily: 'var(--font-mono)' }}>
                ${totalCost.toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: 'var(--color-text-muted)' }}>Cash after</span>
              <span style={{ fontFamily: 'var(--font-mono)', color: canTrade ? 'var(--color-text-secondary)' : 'var(--color-neon-red)' }}>
                ${Math.max(0, tradeSide === 'buy' ? cashBalance - totalCost : cashBalance + totalCost).toFixed(2)}
              </span>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div
              className="flex items-center gap-2 rounded-lg p-2.5 mb-3 text-xs"
              style={{
                backgroundColor: 'var(--color-neon-red-dim)',
                color: 'var(--color-neon-red)',
                border: '1px solid var(--color-neon-red)40',
              }}
            >
              <AlertCircle size={13} />
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!canTrade || pending || confirmed}
            className="w-full py-3 rounded-xl font-bold text-sm transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            style={{
              backgroundColor:
                confirmed ? '#00ff8820'
                : tradeSide === 'buy' ? 'var(--color-neon-green)' : 'var(--color-neon-red)',
              color:
                confirmed ? 'var(--color-neon-green)' : '#000',
            }}
          >
            {confirmed ? '✓ Order Filled!'
              : pending ? 'Placing...'
              : tradeSide === 'buy' ? `Buy ${shares} share${shares !== 1 ? 's' : ''}` : `Sell ${shares} share${shares !== 1 ? 's' : ''}`}
          </button>

          {/* Holdings hint */}
          {currentPosition && (
            <div
              className="text-xs text-center mt-2"
              style={{ color: 'var(--color-text-muted)' }}
            >
              You own {currentPosition.shares} shares · avg cost ${currentPosition.averageCostBasis?.toFixed(2)}
            </div>
          )}
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
