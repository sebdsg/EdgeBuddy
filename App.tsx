
import React, { useState, useEffect } from 'react';
import { HashRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import HomePage from './pages/HomePage';
import GameDetailPage from './pages/GameDetailPage';
import ValueCheckPage from './pages/ValueCheckPage';
import MyBetsPage from './pages/MyBetsPage';
import LearnPage from './pages/LearnPage';
import StudioPage from './pages/StudioPage';
import { SavedBet } from './types';

const BottomNav: React.FC = () => {
  const location = useLocation();
  const navItems = [
    { path: '/', label: 'Feed' },
    { path: '/value-check', label: 'Check' },
    { path: '/studio', label: 'Studio' },
    { path: '/my-bets', label: 'Bets' },
    { path: '/learn', label: 'Learn' },
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
              isActive ? 'text-blue-600 dark:text-white' : 'text-gray-500 dark:text-white'
            }`}
          >
            <span className={`text-[12px] font-black uppercase tracking-widest transition-transform ${isActive ? 'scale-105' : 'scale-100'}`}>
              {item.label}
            </span>
            {isActive && (
              <div className="absolute bottom-0 left-1/4 right-1/4 h-1 bg-blue-600 dark:bg-white rounded-t-full animate-fadeIn" />
            )}
          </Link>
        );
      })}
    </nav>
  );
};

const App: React.FC = () => {
  const [savedBets, setSavedBets] = useState<SavedBet[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('pickpal_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('pickpal_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('pickpal_bets');
    if (stored) setSavedBets(JSON.parse(stored));
  }, []);

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
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] pb-24 theme-transition">
        <header className="bg-[var(--card-bg)] px-4 py-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-40 theme-transition">
          <div className="flex items-center space-x-2">
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-white dark:to-white uppercase tracking-tighter">
              PickPal
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 px-3 rounded-xl bg-gray-50 dark:bg-gray-800 text-[10px] font-black uppercase text-gray-500 dark:text-white transition-all tracking-widest"
            >
              {darkMode ? 'Light' : 'Dark'}
            </button>
            <button className="text-[10px] font-black uppercase text-gray-500 dark:text-white bg-gray-50 dark:bg-gray-800 p-2 px-3 rounded-xl tracking-widest">Menu</button>
          </div>
        </header>

        <main className="container mx-auto max-w-md px-4 py-6">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/game/:id" element={<GameDetailPage />} />
            <Route path="/value-check" element={<ValueCheckPage onSave={saveBet} />} />
            <Route path="/studio" element={<StudioPage />} />
            <Route path="/my-bets" element={<MyBetsPage bets={savedBets} onUpdateStatus={updateBetStatus} />} />
            <Route path="/learn" element={<LearnPage />} />
          </Routes>
        </main>

        <BottomNav />
      </div>
    </HashRouter>
  );
};

export default App;
