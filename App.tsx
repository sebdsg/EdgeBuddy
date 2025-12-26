
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
    { path: '/', label: 'Feed', icon: '🏠' },
    { path: '/value-check', label: 'Check', icon: '⚖️' },
    { path: '/studio', label: 'Studio', icon: '✨' },
    { path: '/my-bets', label: 'Bets', icon: '📋' },
    { path: '/learn', label: 'Learn', icon: '📖' },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-[var(--nav-bg)] border-t border-[var(--border-color)] px-4 py-3 flex justify-between items-center z-50 theme-transition">
      {navItems.map((item) => {
        const isActive = location.pathname === item.path || (item.path === '/' && location.pathname.startsWith('/game/'));
        return (
          <Link
            key={item.path}
            to={item.path}
            className={`flex flex-col items-center space-y-1 transition-colors ${
              isActive ? 'text-blue-500' : 'text-gray-400 dark:text-gray-500'
            }`}
          >
            <span className="text-xl">{item.icon}</span>
            <span className="text-[10px] font-bold uppercase">{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );
};

const App: React.FC = () => {
  const [savedBets, setSavedBets] = useState<SavedBet[]>([]);
  const [darkMode, setDarkMode] = useState<boolean>(() => localStorage.getItem('edgebuddy_theme') === 'dark');

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('edgebuddy_theme', darkMode ? 'dark' : 'light');
  }, [darkMode]);

  useEffect(() => {
    const stored = localStorage.getItem('edgebuddy_bets');
    if (stored) setSavedBets(JSON.parse(stored));
  }, []);

  const saveBet = (bet: SavedBet) => {
    const updated = [bet, ...savedBets];
    setSavedBets(updated);
    localStorage.setItem('edgebuddy_bets', JSON.stringify(updated));
  };

  const updateBetStatus = (id: string, status: 'Pending' | 'Won' | 'Lost') => {
    const updated = savedBets.map(b => b.id === id ? { ...b, status } : b);
    setSavedBets(updated);
    localStorage.setItem('edgebuddy_bets', JSON.stringify(updated));
  };

  return (
    <HashRouter>
      <div className="min-h-screen bg-[var(--app-bg)] text-[var(--text-main)] pb-24 theme-transition">
        <header className="bg-[var(--card-bg)] px-4 py-4 border-b border-[var(--border-color)] flex items-center justify-between sticky top-0 z-40 theme-transition">
          <div className="flex items-center space-x-2">
            <span className="text-2xl">⚡</span>
            <h1 className="text-xl font-black bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 uppercase tracking-tighter">
              EdgeBuddy
            </h1>
          </div>
          <div className="flex items-center space-x-3">
            <button 
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 transition-all"
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
            <button className="text-gray-500 bg-gray-50 dark:bg-gray-800 p-2 rounded-xl">⚙️</button>
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
