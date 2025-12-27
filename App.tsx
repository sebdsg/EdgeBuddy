
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import ValueCheckPage from './pages/ValueCheckPage';
import MyBetsPage from './pages/MyBetsPage';
import LearnPage from './pages/LearnPage';
import StudioPage from './pages/StudioPage';
import SearchPage from './pages/SearchPage';
import TeamDetailPage from './pages/TeamDetailPage';
import LeagueDetailPage from './pages/LeagueDetailPage';
import PlayerDetailPage from './pages/PlayerDetailPage';
import { SavedBet } from './types';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Feed' },
    { path: '/search', label: 'Search' },
    { path: '/value-check', label: 'Check' },
    { path: '/studio', label: 'Studio' },
    { path: '/my-bets', label: 'Bets' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] border-t border-[var(--border-color)] px-2 flex justify-between items-stretch h-16 z-50 theme-transition shadow-[0_-4px_10px_rgba(0,0,0,0.03)]">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/game/'));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex-1 flex flex-col items-center justify-center transition-all relative ${
              isActive ? 'text-green-500 dark:text-blue-500' : 'text-white'
            }`}
          >
            <span className={`text-[12px] font-black uppercase tracking-widest transition-transform ${isActive ? 'scale-105' : 'scale-100'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-green-500 dark:bg-blue-500 rounded-t-full animate-fadeIn" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

const App: React.FC = () => {
  const [savedBets, setSavedBets] = useState<SavedBet[]>([]);
  const [favorites, setFavorites] = useState<string[]>(() => {
    const stored = localStorage.getItem('pickpal_favorites');
    return stored ? JSON.parse(stored) : [];
  });
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('pickpal_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pickpal_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('pickpal_bets');
    if (stored) setSavedBets(JSON.parse(stored));
  }, []);

  const toggleFavorite = (teamName: string) => {
    setFavorites(prev => {
      const updated = prev.includes(teamName) 
        ? prev.filter(t => t !== teamName) 
        : [...prev, teamName];
      localStorage.setItem('pickpal_favorites', JSON.stringify(updated));
      return updated;
    });
  };

  const saveBet = (bet: SavedBet) => {
    const updated = [bet, ...savedBets];
    setSavedBets(updated);
    localStorage.setItem('pickpal_bets', JSON.stringify(updated));
  };

  const updateBetStatus = (id: string, status: 'Pending' | 'Won' | 'Lost') => {
    const updated = savedBets.map(b => b.id === id ? { ...b, status } : b);
    setSavedBets(updated);
    localStorage.setItem('pickpal_bets', JSON.stringify(updated));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[var(--app-bg)] text-white pb-24 theme-transition">
        <header className="bg-[var(--card-bg)] px-4 py-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-40 theme-transition">
          <Link to="/" className="flex items-center space-x-2">
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-green-400 to-green-600 dark:from-blue-400 dark:to-blue-600 uppercase tracking-tighter">
              PickPal
            </h1>
          </Link>
          <div className="flex items-center space-x-3">
            <Link to="/search" className="p-2 px-3 rounded-xl bg-gray-900 border border-[var(--border-color)] flex items-center">
               <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
            </Link>
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 px-3 rounded-xl bg-gray-900 text-[10px] font-black uppercase text-white transition-all tracking-widest border border-[var(--border-color)]"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
          </div>
        </header>

        <main className="container mx-auto max-w-md px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage favorites={favorites} />} />
            <Route path="/search" element={<SearchPage favorites={favorites} />} />
            <Route path="/game/:id" element={<GameDetailPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/value-check" element={<ValueCheckPage onSave={saveBet} />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/my-bets" element={<MyBetsPage bets={savedBets} onUpdateStatus={updateBetStatus} />} />
            <Route path="/learn" element={<LearnPage />} />
            <Route path="/team/:id" element={<TeamDetailPage favorites={favorites} toggleFavorite={toggleFavorite} />} />
            <Route path="/league/:id" element={<LeagueDetailPage />} />
            <Route path="/player/:id" element={<PlayerDetailPage />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
