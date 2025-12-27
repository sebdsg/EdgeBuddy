
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sport, Game } from '../types';
import { getLiveGames } from '../services/geminiService';

const TeamCrest: React.FC<{ name: string; logoUrl?: string; size?: string }> = ({ name, logoUrl, size = "w-6 h-6" }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "T").split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = (name || "").length % 2 === 0 ? 'bg-blue-600' : 'bg-indigo-600';

  if (logoUrl && logoUrl.trim() !== '' && !imgError) {
    return (
      <div className={`${size} shrink-0 bg-white rounded-full p-0.5 border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden flex items-center justify-center`}>
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
    <div className={`${size} ${bgColor} rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm shrink-0 border border-white/20`}>
      {initials}
    </div>
  );
};

const HomePage: React.FC = () => {
  const [selectedSports, setSelectedSports] = useState<Sport[]>(['Soccer', 'Basketball']);
  const [games, setGames] = useState<Game[]>([]);
  const [loading, setLoading] = useState(true);
  const sports: Sport[] = ['Soccer', 'Basketball', 'Football', 'Hockey', 'Baseball'];

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

  const getSportShort = (sport: Sport) => {
    switch (sport) {
      case 'Soccer': return 'SOC';
      case 'Basketball': return 'BKN';
      case 'Football': return 'FB';
      case 'Hockey': return 'HKY';
      case 'Baseball': return 'BSB';
      default: return 'SPT';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 dark:text-white uppercase tracking-tight px-1">Active Sports</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {sports.map((sport) => {
            const isActive = selectedSports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`flex flex-col items-center justify-center min-w-[5rem] h-20 rounded-2xl border-2 transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-gray-500 dark:text-white'
                }`}
              >
                <span className="text-lg mb-1 font-black dark:text-white">{getSportShort(sport)}</span>
                <span className="text-[10px] font-bold uppercase dark:text-white">{sport}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold text-[var(--text-main)] dark:text-white uppercase tracking-tight">Live & Upcoming</h2>
          <span className="text-[10px] text-blue-500 dark:text-white font-bold uppercase animate-pulse">Live Tracking</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-6 bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)]">
            <div className="relative inline-block">
               <div className="animate-spin h-12 w-12 border-4 border-blue-50 border-t-blue-600 rounded-full" />
            </div>
            <div className="space-y-2">
              <p className="text-sm font-black text-blue-600 dark:text-white uppercase tracking-widest">Searching Global Feeds</p>
              <p className="text-[10px] text-gray-400 dark:text-white uppercase font-bold animate-pulse">Verifying sources...</p>
            </div>
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-4">
            {games.map((game) => (
              <div key={game.id} className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] p-5 space-y-4 theme-transition animate-slideUp">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <div className="text-[10px] text-gray-400 dark:text-white font-bold uppercase">{game.league} • {game.startTime}</div>
                    </div>
                    <div className="text-lg font-bold text-[var(--text-main)] dark:text-white pt-1">
                      <div className="flex items-center space-x-3">
                        <TeamCrest name={game.homeTeam} logoUrl={game.homeLogoUrl} />
                        <span className="dark:text-white">{game.homeTeam}</span>
                      </div>
                      <div className="pl-4 text-gray-300 dark:text-white text-xs py-0.5 italic lowercase">vs</div>
                      <div className="flex items-center space-x-3">
                        <TeamCrest name={game.awayTeam} logoUrl={game.awayLogoUrl} />
                        <span className="dark:text-white">{game.awayTeam}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-gray-50/50 dark:bg-gray-900/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 dark:text-white uppercase mb-1 px-1">AI Intel</div>
                  {game.insights?.map((insight, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-white">
                      <span className="w-1 h-1 rounded-full bg-blue-500 shrink-0"></span>
                      <span className="dark:text-white">{insight}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={`/game/${game.id}`}
                  state={{ game }}
                  className="block w-full text-center py-3.5 bg-blue-600 text-white font-black uppercase text-xs tracking-widest rounded-2xl shadow-md active:scale-95 transition-transform dark:text-white"
                >
                  Analyze Value
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border-2 border-dashed border-[var(--border-color)] space-y-4">
            <p className="font-bold text-gray-400 dark:text-white uppercase text-xs tracking-widest">No live data found</p>
            <button 
              onClick={fetchGames}
              className="px-8 py-3 bg-blue-600 text-white font-black rounded-2xl text-[10px] uppercase tracking-widest shadow-lg shadow-blue-500/20 active:scale-95"
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
