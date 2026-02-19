import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useSocket } from './hooks/useSocket.js';
import { useUserStore } from './stores/userStore.js';
import { TopNav } from './components/layout/TopNav.jsx';
import { MarketTicker } from './components/layout/MarketTicker.jsx';
import { TradeModal } from './components/trading/TradeModal.jsx';
import { UsernameGate } from './components/ui/UsernameGate.jsx';
import { MarketsPage } from './pages/MarketsPage.jsx';
import { StockDetailPage } from './pages/StockDetailPage.jsx';
import { PortfolioPage } from './pages/PortfolioPage.jsx';
import { LeaderboardPage } from './pages/LeaderboardPage.jsx';

function AppInner() {
  useSocket(); // Initialize Socket.io connection

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--color-bg)', color: 'var(--color-text-primary)' }}>
      <TopNav />
      <MarketTicker />
      <main className="max-w-7xl mx-auto px-4 py-6">
        <Routes>
          <Route path="/" element={<MarketsPage />} />
          <Route path="/stock/:ticker" element={<StockDetailPage />} />
          <Route path="/portfolio" element={<PortfolioPage />} />
          <Route path="/leaderboard" element={<LeaderboardPage />} />
        </Routes>
      </main>
      <TradeModal />
    </div>
  );
}

export default function App() {
  const username = useUserStore((s) => s.username);

  if (!username) {
    return <UsernameGate />;
  }

  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  );
}
