import { Trophy } from 'lucide-react';
import { Leaderboard } from '../components/leaderboard/Leaderboard.jsx';

export function LeaderboardPage() {
  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Trophy size={18} style={{ color: 'var(--color-neon-yellow)' }} />
        <h1
          className="text-xl font-bold"
          style={{ fontFamily: 'var(--font-display)', color: 'var(--color-text-primary)' }}
        >
          Leaderboard
        </h1>
      </div>
      <Leaderboard />
    </div>
  );
}
