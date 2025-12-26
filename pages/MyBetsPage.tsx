
import React from 'react';
import { SavedBet } from '../types';

const TeamCrestSmall: React.FC<{ name: string }> = ({ name }) => {
  const initials = name.split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = name.length % 2 === 0 ? 'bg-blue-600' : 'bg-indigo-600';
  return (
    <div className={`w-4 h-4 ${bgColor} rounded-full flex items-center justify-center text-[6px] font-bold text-white shrink-0`}>
      {initials}
    </div>
  );
};

const MyBetsPage: React.FC<{ bets: SavedBet[], onUpdateStatus: (id: string, status: 'Pending' | 'Won' | 'Lost') => void }> = ({ bets, onUpdateStatus }) => {
  const stats = {
    total: bets.length,
    winRate: bets.filter(b => b.status === 'Won').length / (bets.filter(b => b.status !== 'Pending').length || 1),
    avgEdge: bets.reduce((acc, b) => acc + (b.valueRating === 'Good' ? 7 : b.valueRating === 'Fair' ? 1 : -3), 0) / (bets.length || 1)
  };

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">My Bets</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Track your saved picks and performance over time.</p>
      </div>

      {bets.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm text-center theme-transition">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Bets</div>
              <div className="text-lg font-bold text-[var(--text-main)]">{stats.total}</div>
            </div>
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm text-center theme-transition">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Win %</div>
              <div className="text-lg font-bold text-blue-600 dark:text-blue-400">{(stats.winRate * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] shadow-sm text-center theme-transition">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Avg Edge</div>
              <div className="text-lg font-bold text-green-600 dark:text-green-400">+{stats.avgEdge.toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] shadow-sm p-4 space-y-3 relative overflow-hidden theme-transition">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  bet.valueRating === 'Good' ? 'bg-green-500' :
                  bet.valueRating === 'Fair' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="flex items-center space-x-1.5">
                       <TeamCrestSmall name={bet.gameTitle.split(' vs ')[0] || bet.gameTitle} />
                       <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">{bet.gameTitle}</div>
                    </div>
                    <div className="text-base font-bold text-[var(--text-main)]">{bet.selection}</div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">{bet.market} @ {bet.odds}</div>
                  </div>
                  <div className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                    bet.valueRating === 'Good' ? 'bg-green-100 dark:bg-green-900/30 text-green-600 dark:text-green-400' :
                    bet.valueRating === 'Fair' ? 'bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400' : 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400'
                  }`}>
                    {bet.valueRating} Value
                  </div>
                </div>

                <div className="flex space-x-2 pt-2 border-t border-gray-50 dark:border-gray-800">
                  <button 
                    onClick={() => onUpdateStatus(bet.id, 'Won')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bet.status === 'Won' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    Win
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(bet.id, 'Lost')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bet.status === 'Lost' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    Loss
                  </button>
                  <button 
                    onClick={() => onUpdateStatus(bet.id, 'Pending')}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-bold transition-all ${
                      bet.status === 'Pending' ? 'bg-gray-800 dark:bg-gray-200 text-white dark:text-gray-900 shadow-md' : 'bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500'
                    }`}
                  >
                    Pending
                  </button>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 space-y-4">
          <div className="text-5xl">Empty 📭</div>
          <p className="text-gray-500 dark:text-gray-400">You haven't saved any bets yet.</p>
          <button 
            className="px-6 py-2 bg-blue-600 text-white font-bold rounded-xl"
            onClick={() => window.location.hash = '#/'}
          >
            Find a Bet
          </button>
        </div>
      )}
    </div>
  );
};

export default MyBetsPage;
