
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
        <h2 className="text-2xl font-black text-[var(--text-main)] dark:text-white uppercase tracking-tight">My Bets</h2>
        <p className="text-gray-500 dark:text-white text-xs uppercase font-bold tracking-widest">Track your performance over time.</p>
      </div>

      {bets.length > 0 ? (
        <>
          <div className="grid grid-cols-3 gap-3">
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Bets</div>
              <div className="text-lg font-black dark:text-white">{stats.total}</div>
            </div>
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Wins</div>
              <div className="text-lg font-black text-blue-600 dark:text-white">{(stats.winRate * 100).toFixed(0)}%</div>
            </div>
            <div className="bg-[var(--card-bg)] p-3 rounded-2xl border border-[var(--border-color)] text-center">
              <div className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Edge</div>
              <div className="text-lg font-black text-green-600 dark:text-white">+{stats.avgEdge.toFixed(1)}%</div>
            </div>
          </div>

          <div className="space-y-4">
            {bets.map((bet) => (
              <div key={bet.id} className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border-color)] p-4 space-y-3 relative overflow-hidden">
                <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                  bet.valueRating === 'Good' ? 'bg-green-500' :
                  bet.valueRating === 'Fair' ? 'bg-orange-500' : 'bg-red-500'
                }`} />
                <div className="flex justify-between items-start">
                  <div className="space-y-0.5">
                    <div className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">{bet.gameTitle}</div>
                    <div className="text-base font-bold dark:text-white">{bet.selection}</div>
                    <div className="text-xs text-gray-500 dark:text-white uppercase font-bold">{bet.market} @ {bet.odds}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div className="text-center py-20 space-y-4">
          <p className="text-gray-500 dark:text-white uppercase font-black text-sm tracking-widest">No saved bets yet</p>
        </div>
      )}
    </div>
  );
};

export default MyBetsPage;
