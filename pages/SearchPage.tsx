
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Sport, Team, League, Player } from '../types';
import { searchAll } from '../utils/searchUtils';
import { LEAGUES, TEAMS } from '../constants';

const TeamCrestSmall: React.FC<{ name: string; logoUrl?: string; isFavorite?: boolean }> = ({ name, logoUrl, isFavorite }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "T").split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = isFavorite ? 'bg-yellow-600' : 'bg-zinc-800';

  if (logoUrl && !imgError) {
    return (
      <div className={`w-10 h-10 shrink-0 bg-white rounded-full p-1 border ${isFavorite ? 'border-yellow-400' : 'border-white/10'} shadow-sm overflow-hidden flex items-center justify-center mr-4`}>
        <img 
          src={logoUrl} 
          alt={name} 
          className="w-full h-full object-contain" 
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`w-10 h-10 ${bgColor} rounded-full flex items-center justify-center text-[10px] font-black text-white shadow-sm shrink-0 border ${isFavorite ? 'border-yellow-400' : 'border-white/10'} mr-4 uppercase`}>
      {initials}
    </div>
  );
};

interface SearchPageProps {
  favorites: string[];
}

const SearchPage: React.FC<SearchPageProps> = ({ favorites }) => {
  const [query, setQuery] = useState('');
  const [sportFilter, setSportFilter] = useState<Sport | 'All'>('All');
  const [typeFilter, setTypeFilter] = useState<'All' | 'Teams' | 'Leagues' | 'Players'>('All');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  
  const [expanded, setExpanded] = useState<Record<string, boolean>>({
    teams: false,
    leagues: false,
    players: false
  });

  const sports: (Sport | 'All')[] = ['All', 'Soccer', 'Basketball', 'Football', 'Hockey', 'Baseball'];
  const types: ('All' | 'Teams' | 'Leagues' | 'Players')[] = ['All', 'Teams', 'Leagues', 'Players'];

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(query);
    }, 200);
    return () => clearTimeout(handler);
  }, [query]);

  const results = useMemo(() => {
    return searchAll(debouncedQuery, { sportFilter, typeFilter });
  }, [debouncedQuery, sportFilter, typeFilter]);

  // Reset expansion when query changes
  useEffect(() => {
    setExpanded({ teams: false, leagues: false, players: false });
  }, [debouncedQuery]);

  const toggleExpand = (section: string) => {
    setExpanded(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const isEmpty = !debouncedQuery.trim();
  const hasResults = results.teams.length > 0 || results.leagues.length > 0 || results.players.length > 0;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-white">
      <div className="space-y-4">
        <div className="relative">
          <input
            autoFocus
            type="text"
            placeholder="Search teams, players, or leagues"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-black/40 p-5 pl-14 rounded-3xl text-sm border-2 border-[var(--border-color)]/30 focus:border-[var(--border-color)] outline-none font-bold uppercase tracking-tight theme-transition placeholder:opacity-30"
          />
          <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>

        <div className="flex flex-col space-y-3">
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {sports.map(s => (
              <button
                key={s}
                onClick={() => setSportFilter(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  sportFilter === s ? 'bg-green-600 dark:bg-blue-600 border-transparent shadow-lg' : 'bg-zinc-900 border-[var(--border-color)]/20'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
          <div className="flex space-x-2 overflow-x-auto pb-1 scrollbar-hide">
            {types.map(t => (
              <button
                key={t}
                onClick={() => setTypeFilter(t)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest whitespace-nowrap transition-all border ${
                  typeFilter === t ? 'bg-green-600 dark:bg-blue-600 border-transparent shadow-lg' : 'bg-zinc-900 border-[var(--border-color)]/20'
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
      </div>

      {isEmpty ? (
        <div className="text-center py-20 space-y-4">
          <div className="w-16 h-16 bg-zinc-900 border border-[var(--border-color)]/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm font-black text-white/40 uppercase tracking-[0.2em]">Try searching for...</p>
          <div className="flex flex-wrap justify-center gap-2 px-4">
            {['Arsenal', 'NBA', 'LeBron', 'MCI', 'Dodgers'].map(term => (
              <button 
                key={term} 
                onClick={() => setQuery(term)}
                className="bg-zinc-900/50 px-4 py-2 rounded-full text-[10px] font-bold text-white/60 hover:text-white border border-white/5"
              >
                "{term}"
              </button>
            ))}
          </div>
        </div>
      ) : !hasResults ? (
        <div className="text-center py-20 space-y-4 bg-zinc-900/50 rounded-[2rem] border border-white/5 mx-2">
          <p className="font-black text-white/30 uppercase text-xs tracking-widest px-8 leading-relaxed">
            No results for "{debouncedQuery}".<br/>Check your spelling or try a shorter term.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Teams Section */}
          {results.teams.length > 0 && (
            <div className="space-y-4 animate-slideUp">
              <div className="px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Squads ({results.teams.length})</h3>
              </div>
              <div className="grid gap-2">
                {(expanded.teams ? results.teams : results.teams.slice(0, 3)).map(team => {
                  const isFav = favorites.includes(team.name);
                  return (
                    <Link 
                      key={team.id} 
                      to={`/team/${team.id}`}
                      className={`flex items-center p-4 bg-[var(--card-bg)] rounded-[1.5rem] border ${isFav ? 'border-yellow-500/50' : 'border-[var(--border-color)]/20'} hover:border-[var(--border-color)]/60 transition-all active:scale-[0.98] animate-fadeIn`}
                    >
                      <TeamCrestSmall name={team.name} logoUrl={team.logoUrl} isFavorite={isFav} />
                      <div className="flex-1 overflow-hidden">
                        <div className={`text-sm font-black uppercase tracking-tight truncate ${isFav ? 'text-yellow-400' : ''}`}>
                          {team.name} {isFav && '★'}
                        </div>
                        <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">
                          {LEAGUES.find(l => l.id === team.leagueId)?.name || 'Pro'} • {team.sportId}
                        </div>
                      </div>
                      <svg className={`w-4 h-4 ml-2 ${isFav ? 'text-yellow-400' : 'opacity-20'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  );
                })}
              </div>
              {results.teams.length > 3 && (
                <button 
                  onClick={() => toggleExpand('teams')}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-green-500 dark:text-blue-500 bg-white/5 rounded-2xl border border-white/5"
                >
                  {expanded.teams ? 'Show Less' : `Show All ${results.teams.length} Teams`}
                </button>
              )}
            </div>
          )}

          {/* Leagues Section */}
          {results.leagues.length > 0 && (
            <div className="space-y-4 animate-slideUp">
              <div className="px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Leagues ({results.leagues.length})</h3>
              </div>
              <div className="grid gap-2">
                {(expanded.leagues ? results.leagues : results.leagues.slice(0, 3)).map(league => (
                  <Link 
                    key={league.id} 
                    to={`/league/${league.id}`}
                    className="flex items-center p-4 bg-[var(--card-bg)] rounded-[1.5rem] border border-[var(--border-color)]/20 hover:border-[var(--border-color)]/60 transition-all active:scale-[0.98] animate-fadeIn"
                  >
                    <div className="w-10 h-10 bg-green-900/10 dark:bg-blue-900/10 rounded-full flex items-center justify-center font-black text-xs border border-[var(--border-color)]/10 mr-4 uppercase">
                      <svg className="w-5 h-5 text-green-500 dark:text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 002 2 2 2 0 012 2v.627M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-black uppercase tracking-tight truncate">{league.name}</div>
                      <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">{league.region} • {league.sport}</div>
                    </div>
                    <svg className="w-4 h-4 ml-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              {results.leagues.length > 3 && (
                <button 
                  onClick={() => toggleExpand('leagues')}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-green-500 dark:text-blue-500 bg-white/5 rounded-2xl border border-white/5"
                >
                  {expanded.leagues ? 'Show Less' : `Show All ${results.leagues.length} Leagues`}
                </button>
              )}
            </div>
          )}

          {/* Players Section */}
          {results.players.length > 0 && (
            <div className="space-y-4 animate-slideUp">
              <div className="px-2">
                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] opacity-40">Athletes ({results.players.length})</h3>
              </div>
              <div className="grid gap-2">
                {(expanded.players ? results.players : results.players.slice(0, 3)).map(player => (
                  <Link 
                    key={player.id} 
                    to={`/player/${player.id}`}
                    className="flex items-center p-4 bg-[var(--card-bg)] rounded-[1.5rem] border border-[var(--border-color)]/20 hover:border-[var(--border-color)]/60 transition-all active:scale-[0.98] animate-fadeIn"
                  >
                    <div className="w-10 h-10 bg-zinc-800 rounded-full flex items-center justify-center font-black text-xs border border-white/5 mr-4 uppercase overflow-hidden">
                      {player.headshotUrl ? <img src={player.headshotUrl} className="w-full h-full object-cover" /> : player.name.charAt(0)}
                    </div>
                    <div className="flex-1 overflow-hidden">
                      <div className="text-sm font-black uppercase tracking-tight truncate">{player.name}</div>
                      <div className="text-[9px] font-bold opacity-40 uppercase tracking-widest mt-0.5">
                        {TEAMS.find(t => t.id === player.teamId)?.shortName || 'PRO'} • {player.position || 'Athlete'}
                      </div>
                    </div>
                    <svg className="w-4 h-4 ml-2 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                ))}
              </div>
              {results.players.length > 3 && (
                <button 
                  onClick={() => toggleExpand('players')}
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-green-500 dark:text-blue-500 bg-white/5 rounded-2xl border border-white/5"
                >
                  {expanded.players ? 'Show Less' : `Show All ${results.players.length} Players`}
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchPage;
