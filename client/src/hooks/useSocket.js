import { useEffect } from 'react';
import { socket } from '../socket.js';
import { useMarketStore } from '../stores/marketStore.js';
import { useUserStore } from '../stores/userStore.js';

export function useSocket() {
  const username = useUserStore((s) => s.username);
  const { applySnapshot, applyPriceUpdates, setPriceHistory, setConnected, setLeaderboard } =
    useMarketStore();
  const applyPortfolioUpdate = useUserStore((s) => s.applyPortfolioUpdate);

  useEffect(() => {
    if (!username) return;

    socket.connect();

    function onConnect() {
      setConnected(true);
      socket.emit('REGISTER_USER', { username });
      socket.emit('JOIN_USER_ROOM', { username });
    }

    function onDisconnect() {
      setConnected(false);
    }

    function onPriceUpdate({ updates }) {
      applyPriceUpdates(updates);
    }

    function onLeaderboardUpdate({ rankings }) {
      setLeaderboard(rankings);
    }

    function onPriceHistory({ ticker, history }) {
      setPriceHistory(ticker, history);
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('MARKET_SNAPSHOT', applySnapshot);
    socket.on('PRICE_UPDATE', onPriceUpdate);
    socket.on('PORTFOLIO_UPDATE', applyPortfolioUpdate);
    socket.on('LEADERBOARD_UPDATE', onLeaderboardUpdate);
    socket.on('PRICE_HISTORY', onPriceHistory);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('MARKET_SNAPSHOT', applySnapshot);
      socket.off('PRICE_UPDATE', onPriceUpdate);
      socket.off('PORTFOLIO_UPDATE', applyPortfolioUpdate);
      socket.off('LEADERBOARD_UPDATE', onLeaderboardUpdate);
      socket.off('PRICE_HISTORY', onPriceHistory);
      socket.disconnect();
    };
  }, [username]);

  return socket;
}
