
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Sport, Game } from '../types';
import { getLiveGames } from '../services/geminiService';

const TeamCrest: React.FC<{ name: string; size?: string }> = ({ name, size = "w-6 h-6" }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = name.length % 2 === 0 ? 'bg-blue-600' : 'bg-indigo-600';
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

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      const liveGames = await getLiveGames(selectedSports);
      setGames(liveGames);
      setLoading(false);
    };
    fetchGames();
  }, [selectedSports]);

  const toggleSport = (sport: Sport) => {
    setSelectedSports(prev => prev.includes(sport) ? prev.filter(s => s !== sport) : [...prev, sport]);
  };

  const getSportIcon = (sport: Sport) => {
    switch (sport) {
      case 'Soccer': return '⚽';
      case 'Basketball': return '🏀';
      case 'Football': return '🏈';
      case 'Hockey': return '🏒';
      case 'Baseball': return '⚾';
      default: return '🏆';
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight px-1">Active Sports</h3>
        <div className="flex space-x-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
          {sports.map((sport) => {
            const isActive = selectedSports.includes(sport);
            return (
              <button
                key={sport}
                onClick={() => toggleSport(sport)}
                className={`flex flex-col items-center justify-center min-w-[5rem] h-20 rounded-2xl border-2 transition-all ${
                  isActive ? 'bg-blue-600 border-blue-600 text-white shadow-lg' : 'bg-[var(--card-bg)] border-[var(--border-color)] text-gray-500'
                }`}
              >
                <span className="text-2xl mb-1">{getSportIcon(sport)}</span>
                <span className="text-[10px] font-bold uppercase">{sport}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-end px-1">
          <h2 className="text-xl font-bold text-[var(--text-main)]">Live & Upcoming</h2>
          <span className="text-[10px] text-blue-500 font-bold uppercase animate-pulse">● Real-time Data</span>
        </div>

        {loading ? (
          <div className="py-20 text-center space-y-4">
            <div className="animate-spin text-4xl">⚽</div>
            <p className="text-sm font-bold text-gray-500">Searching global matchups...</p>
          </div>
        ) : games.length > 0 ? (
          <div className="grid gap-4">
            {games.map((game) => (
              <div key={game.id} className="bg-[var(--card-bg)] rounded-3xl shadow-sm border border-[var(--border-color)] p-5 space-y-4 theme-transition">
                <div className="flex justify-between items-start">
                  <div className="space-y-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-lg">{getSportIcon(game.sport)}</span>
                      <div className="text-[10px] text-gray-400 font-bold uppercase">{game.league} • {game.startTime}</div>
                    </div>
                    <div className="text-lg font-bold text-[var(--text-main)] pt-1">
                      <div className="flex items-center space-x-2">
                        <TeamCrest name={game.homeTeam} />
                        <span>{game.homeTeam}</span>
                      </div>
                      <div className="pl-3.5 text-gray-300 text-xs py-0.5 italic">vs</div>
                      <div className="flex items-center space-x-2">
                        <TeamCrest name={game.awayTeam} />
                        <span>{game.awayTeam}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-2 bg-gray-50/50 dark:bg-gray-900/30 p-3 rounded-2xl border border-gray-100 dark:border-gray-800">
                  <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 px-1">AI Hot Takes</div>
                  {game.insights.map((insight, idx) => (
                    <div key={idx} className="flex items-center space-x-2 text-xs text-gray-600 dark:text-gray-400">
                      <span className="text-blue-500">✨</span>
                      <span>{insight}</span>
                    </div>
                  ))}
                </div>

                <Link 
                  to={`/game/${game.id}`}
                  state={{ game }}
                  className="block w-full text-center py-3.5 bg-blue-600 text-white font-bold rounded-2xl shadow-md"
                >
                  Analyze Value
                </Link>
              </div>
            ))}
            
            {games[0]?.groundingSources && (
              <div className="p-4 bg-gray-100 dark:bg-gray-800/50 rounded-2xl">
                 <h4 className="text-[10px] font-bold text-gray-400 uppercase mb-2">Sources</h4>
                 <div className="flex flex-wrap gap-2">
                   {games[0].groundingSources.map((source, i) => (
                     <a key={i} href={source.uri} target="_blank" rel="noopener noreferrer" className="text-[9px] bg-white dark:bg-gray-900 px-2 py-1 rounded border border-gray-200 dark:border-gray-700 text-blue-500 truncate max-w-[150px]">
                       {source.title}
                     </a>
                   ))}
                 </div>
              </div>
            )}
          </div>
        ) : (
          <div className="text-center py-20 bg-[var(--card-bg)] rounded-3xl border-2 border-dashed">
            <p className="font-bold text-gray-400">No live data found for selection.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePage;
