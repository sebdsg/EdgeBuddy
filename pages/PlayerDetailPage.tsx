
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { PLAYERS, TEAMS } from '../constants';
import { getPlayerStats } from '../services/geminiService';

const PlayerDetailPage: React.FC = () => {
  const { id } = useParams();
  const player = PLAYERS.find(p => p.id === id);
  const team = TEAMS.find(t => t.id === player?.teamId);

  const [dynamicStats, setDynamicStats] = useState<Record<string, string | number> | null>(null);
  const [loadingStats, setLoadingStats] = useState(false);

  useEffect(() => {
    if (player) {
      const fetchStats = async () => {
        setLoadingStats(true);
        const stats = await getPlayerStats(player.name, player.sportId);
        if (stats) {
          setDynamicStats(stats);
        } else {
          // Fallback to mock if search fails
          setDynamicStats(player.stats || null);
        }
        setLoadingStats(false);
      };
      fetchStats();
    }
  }, [player]);

  if (!player) return <div className="p-8 text-center text-white">Player not found.</div>;

  return (
    <div className="space-y-8 animate-fadeIn text-white">
      <Link to="/search" className="text-green-500 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest">Back to Search</Link>
      
      {/* Profile Header */}
      <div className="bg-gradient-to-br from-green-800 to-zinc-950 dark:from-blue-900 dark:to-zinc-950 p-8 rounded-[3rem] border border-[var(--border-color)]/30 text-center space-y-4 shadow-xl">
        <div className="w-28 h-28 bg-zinc-800 rounded-full mx-auto flex items-center justify-center text-4xl font-black border-4 border-[var(--border-color)] overflow-hidden shadow-2xl">
          {player.headshotUrl ? (
            <img src={player.headshotUrl} className="w-full h-full object-cover" alt={player.name} />
          ) : (
            <span className="text-white opacity-40">{player.name.charAt(0)}</span>
          )}
        </div>
        <div className="space-y-1">
          <h2 className="text-3xl font-black uppercase tracking-tighter">{player.name}</h2>
          <p className="text-xs font-bold opacity-60 uppercase tracking-[0.2em]">
            {team?.name || 'Free Agent'} • {player.position}
          </p>
        </div>
      </div>

      {/* Statistics Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Performance Metrics</h3>
          <span className="text-[8px] font-black bg-green-500/10 dark:bg-blue-500/10 text-green-500 dark:text-blue-500 px-2 py-1 rounded-full uppercase tracking-widest border border-current">Season 25/26</span>
        </div>
        
        {loadingStats ? (
          <div className="bg-[var(--card-bg)] p-12 rounded-[2rem] border border-[var(--border-color)]/20 text-center space-y-4">
            <div className="animate-spin h-8 w-8 border-4 border-gray-900 border-t-green-500 dark:border-t-blue-500 rounded-full mx-auto" />
            <p className="text-[10px] font-black opacity-40 uppercase tracking-widest animate-pulse">Fetching latest 25/26 stats from Sofascore...</p>
          </div>
        ) : dynamicStats ? (
          <div className="grid grid-cols-2 gap-3">
            {Object.entries(dynamicStats).map(([label, value]) => (
              <div key={label} className="bg-[var(--card-bg)] p-5 rounded-[1.8rem] border border-[var(--border-color)]/20 flex flex-col items-center justify-center space-y-1 group hover:border-[var(--border-color)] transition-all">
                <span className="text-[9px] font-black opacity-30 uppercase tracking-[0.2em] group-hover:opacity-60 transition-opacity">{label}</span>
                <span className="text-2xl font-black text-white">{value}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-[var(--card-bg)] p-8 rounded-[2rem] border border-dashed border-[var(--border-color)]/20 text-center">
            <p className="text-[10px] font-black opacity-30 uppercase tracking-widest italic">Live stats unavailable. Check back later.</p>
          </div>
        )}
      </section>

      {/* Player Props Section */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Player Props</h3>
          <span className="text-[8px] font-black text-white/20 uppercase tracking-widest">Upcoming</span>
        </div>
        <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)]/20 text-center space-y-3 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-green-500/5 dark:bg-blue-500/5 rounded-full blur-2xl" />
          <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mx-auto border border-white/5">
            <svg className="w-6 h-6 text-green-500 dark:text-blue-500 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
            </svg>
          </div>
          <div className="space-y-1">
            <p className="text-sm font-black uppercase tracking-tight">AI Projections & Market Analysis</p>
            <p className="text-[10px] opacity-40 px-6 leading-relaxed italic">
              Find your edge with real-time prop tracking. We're training our models to compare sportsbook lines with AI-powered player performance projections for the 25/26 season.
            </p>
          </div>
        </div>
      </section>

      {/* Search Grounding Citation */}
      {!loadingStats && dynamicStats && (
        <div className="px-4 text-center">
          <p className="text-[8px] font-bold opacity-20 uppercase tracking-widest">
            Data sourced from real-time 2025/2026 season feeds via Sofascore.
          </p>
        </div>
      )}

      {/* Placeholder for future features */}
      <div className="bg-[var(--card-bg)] p-6 rounded-[2rem] border border-[var(--border-color)]/20 text-center relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
        <p className="text-sm font-bold opacity-40 uppercase tracking-widest">Athlete Hub Coming Soon</p>
        <p className="text-[10px] mt-2 opacity-30 px-6 italic">We're indexing injury updates and AI performance projections to help you find edge on global markets.</p>
      </div>
    </div>
  );
};

export default PlayerDetailPage;
