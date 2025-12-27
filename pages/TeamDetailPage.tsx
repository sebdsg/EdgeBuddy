
import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { TEAMS, LEAGUES } from '../constants';

interface TeamDetailPageProps {
  favorites: string[];
  toggleFavorite: (name: string) => void;
}

const TeamDetailPage: React.FC<TeamDetailPageProps> = ({ favorites, toggleFavorite }) => {
  const { id } = useParams();
  const team = TEAMS.find(t => t.id === id);
  const league = LEAGUES.find(l => l.id === team?.leagueId);

  if (!team) return <div className="p-8 text-center text-white">Team not found.</div>;

  const isFav = favorites.includes(team.name);

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <Link to="/search" className="text-green-500 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest">Back to Search</Link>
      <div className={`bg-gradient-to-br from-green-800 to-zinc-950 dark:from-blue-900 dark:to-zinc-950 p-8 rounded-[3rem] border ${isFav ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-[var(--border-color)]/30'} text-center space-y-4 relative`}>
        <button 
          onClick={() => toggleFavorite(team.name)}
          className="absolute top-6 right-6 p-2 rounded-full bg-black/20"
        >
          <svg 
            className={`w-6 h-6 ${isFav ? 'text-yellow-400 fill-current' : 'text-white/20'}`} 
            fill="none" 
            stroke="currentColor" 
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
          </svg>
        </button>
        <div className={`w-24 h-24 ${isFav ? 'bg-yellow-900/20' : 'bg-black/40'} rounded-full mx-auto flex items-center justify-center text-3xl font-black border-2 ${isFav ? 'border-yellow-400' : 'border-[var(--border-color)]'}`}>
          {team.shortName}
        </div>
        <div className="space-y-1">
          <h2 className={`text-3xl font-black uppercase tracking-tighter ${isFav ? 'text-yellow-400' : ''}`}>{team.name} {isFav && '★'}</h2>
          <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">{league?.name} • {team.sportId}</p>
        </div>
      </div>
      <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)]/20 text-center">
        <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Team Hub Coming Soon</p>
        <p className="text-[10px] mt-2 opacity-30 px-6 italic">We're gathering AI insights, historical form, and key stats for this squad.</p>
      </div>
    </div>
  );
};

export default TeamDetailPage;
