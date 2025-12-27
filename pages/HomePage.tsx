
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sport, Game } from '../types';
import { getLiveGames } from '../services/geminiService';

const TeamCrest: React.FC<{ name: string; logoUrl?: string; size?: string; isFavorite?: boolean }> = ({ name, logoUrl, size = "w-6 h-6", isFavorite }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "T").split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = isFavorite ? 'bg-yellow-600' : ((name || "").length % 2 === 0 ? 'bg-green-700 dark:bg-blue-700' : 'bg-green-800 dark:bg-blue-800');

  if (logoUrl && logoUrl.trim() !== '' && !imgError) {
    return (
      <div className={`${size} shrink-0 bg-white rounded-full p-0.5 border ${isFavorite ? 'border-yellow-400' : 'border-gray-800'} shadow-sm overflow-hidden flex items-center justify-center`}>
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
    <div className={`${size} ${bgColor} rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 border ${isFavorite ? 'border-yellow-400' : 'border-white/20'}`}>
      {initials}
    </div>
  );
};

interface HomePageProps {
  favorites: string[];
}

const HomePage: React.FC<HomePageProps> = ({ favorites }) => {
  const [selectedSports, setSelectedSports] = useState<Sport[]>(['Soccer', 'Basketball']);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const sports: Sport[] = ['Soccer', 'Basketball', 'Football', 'Hockey', 'Baseball'];

  const sportLabels: Record<Sport, string> = {
    Soccer: 'Soccer',
    Basketball: 'NBA',
    Football: 'NFL',
    Hockey: 'NHL',
    Baseball: 'MLB'
  };

  const fetchGames = async () => {
    setLoading(true);
    try {
      const liveGames = await getLiveGames(selectedSports);
      setGames(Array.isArray(liveGames) ? liveGames : []);
    } catch (err) {
      console.error("Failed to fetch live games:", err);
      setGames([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGames();
  }, [selectedSports]);

  const toggleSport = (sport: Sport) => {
    setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const formatMatchDisplay = (league: string, startTime: string) => {
    const date = new Date(startTime);
    if (isNaN(date.getTime())) return `${league} - ${startTime}`;
    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);
    let dayLabel = "";
    if (date.toDateString() === now.toDateString()) dayLabel = "Today";
    else if (date.toDateString() === tomorrow.toDateString()) dayLabel = "Tomorrow";
    else dayLabel = date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    const timeLabel = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${league} - ${dayLabel} - ${timeLabel}`;
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-white uppercase tracking-tight px-1 opacity-70">Active Sports</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {sports.map((sport) => {
            const isActive = selectedSports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`flex flex-col items-center justify-center min-w-[6rem] h-14 rounded-2xl border-2 transition-all px-4 ${
                  isActive 
                    ? 'bg-green-600 border-green-600 dark:bg-blue-600 dark:border-blue-600 text-white shadow-lg' 
                    : 'bg-[var(--card-bg)] border-[var(--border-color)] text-white'
                }`}
              >
                <span className="text-[12px] font-black uppercase tracking-wider text-center text-white">
                  {sportLabels[sport]}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold text-white uppercase tracking-tight">Live & Upcoming</h2>
          <span className="text-[10px] text-green-500 dark:text-blue-500 font-bold uppercase animate-pulse">Live Tracking</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]">
            <div className="relative inline-block">
               <div className="animate-spin h-12 w-12 border-4 border-gray-900 border-t-green-500 dark:border-t-blue-500 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-green-500 dark:text-blue-500 uppercase tracking-widest">Searching Global Feeds</p>
              <p className="text-[10px] text-white uppercase font-bold animate-pulse">Verifying sources...</p>
            </div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-4">
            {games.map((game) => {
              const homeFav = favorites.includes(game.homeTeam);
              const awayFav = favorites.includes(game.awayTeam);
              const hasFav = homeFav || awayFav;

              return (
                <div key={game.id} className={`bg-[var(--card-bg)] rounded-3xl shadow-sm border ${hasFav ? 'border-yellow-500/50 shadow-yellow-500/10' : 'border-[var(--border-color)]'} p-5 space-y-4 theme-transition animate-slideUp relative overflow-hidden`}>
                  {hasFav && <div className="absolute top-0 right-0 w-16 h-16 bg-yellow-400/5 rounded-full blur-2xl -translate-y-8 translate-x-8" />}
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <div className="text-xs text-white opacity-60 font-bold uppercase">
                          {formatMatchDisplay(game.league, game.startTime)}
                        </div>
                      </div>
                      <div className="text-lg font-bold text-white pt-1">
                        <div className="flex items-center space-x-3">
                          <TeamCrest name={game.homeTeam} logoUrl={game.homeLogoUrl} isFavorite={homeFav} />
                          <span className={`${homeFav ? 'text-yellow-400' : ''}`}>{game.homeTeam} {homeFav && '★'}</span>
                        </div>
                        <div className="pl-4 text-white opacity-40 text-xs py-0.5 italic lowercase">vs</div>
                        <div className="flex items-center space-x-3">
                          <TeamCrest name={game.awayTeam} logoUrl={game.awayLogoUrl} isFavorite={awayFav} />
                          <span className={`${awayFav ? 'text-yellow-400' : ''}`}>{game.awayTeam} {awayFav && '★'}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 bg-black/30 p-3 rounded-2xl border border-[var(--border-color)]/30">
                    <div className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase mb-1 px-1">AI Intel</div>
                    {game.insights?.map((insight, idx) => (
                      <div key={idx} className="flex items-center space-x-2 text-xs text-white">
                        <span className="w-1 h-1 rounded-full bg-green-500 dark:bg-blue-500 shrink-0"></span>
                        <span>{insight}</span>
                      </div>
                    ))}
                  </div>

                  <Link 
                    to={`/game/${game.id}`}
                    state={{ game }}
                    className={`block w-full text-center py-3.5 ${hasFav ? 'bg-yellow-600' : 'bg-green-600 dark:bg-blue-600'} text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md active:scale-95 transition-transform`}
                  >
                    Analyze Value
                  </Link>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border-2 border-dashed border-[var(--border-color)] space-y-4">
            <p className="font-bold text-white uppercase text-xs tracking-widest">No live data found</p>
            <button 
              onClick={fetchGames}
              className="px-8 py-3 bg-green-600 dark:bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-green-500/20 dark:shadow-blue-500/20 active:scale-95"
            >
              Retry Global Search
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
