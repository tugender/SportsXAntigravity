import { Briefcase } from 'lucide-react';
import { Portfolio } from '../components/portfolio/Portfolio.jsx';
import { useUserStore } from '../stores/userStore.js';

export function PortfolioPage() {
  const username = useUserStore((s) => s.username);

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Briefcase size={18} style={{ color: 'var(--color-neon-green)' }} />
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          {username}'s Portfolio
        </h1>
      </div>
      <Portfolio />
    </div>
  );
}
