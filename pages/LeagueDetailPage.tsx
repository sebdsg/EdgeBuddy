
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { LEAGUES } from '../constants';

const LeagueDetailPage: React.FC = () => {
  const { id } = useParams();
  const league = LEAGUES.find(l => l.id === id);

  if (!league) return <div className="p-8 text-center text-white">League not found.</div>;

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <Link to="/search" className="text-green-500 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest">Back to Search</Link>
      <div className="bg-gradient-to-br from-green-800 to-zinc-950 dark:from-blue-900 dark:to-zinc-950 p-8 rounded-[3rem] border border-[var(--border-color)]/30 text-center space-y-4">
        <div className="w-24 h-24 bg-black/40 rounded-full mx-auto flex items-center justify-center text-2xl font-black border-2 border-[var(--border-color)]">
          {league.shortName}
        </div>
        <div className="space-y-1">
          <h2 className="text-2xl font-black uppercase tracking-tighter leading-tight">{league.name}</h2>
          <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">{league.region} • {league.sport}</p>
        </div>
      </div>
      <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)]/20 text-center">
        <p className="text-sm font-bold opacity-40 uppercase tracking-widest">League Portal Coming Soon</p>
        <p className="text-[10px] mt-2 opacity-30 px-6 italic">Stay tuned for standings, upcoming fixtures, and AI-powered season outlooks.</p>
      </div>
    </div>
  );
};

export default LeagueDetailPage;
