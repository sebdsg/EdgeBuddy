
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Sport, SavedBet, ValueCheckResult } from '../types';
import { LEAGUES, MOCK_GAMES } from '../constants';
import { americanToImplied, impliedToAmerican, getProbabilityMock } from '../utils/bettingUtils';
import { getValueExplanation } from '../services/geminiService';

const ValueCheckPage: React.FC<{ onSave: (bet: SavedBet) => void }> = ({ onSave }) => {
  const location = useLocation();
  const prefill = location.state?.prefill;

  const [sport, setSport] = useState<Sport>(prefill?.sport || 'Soccer');
  const [league, setLeague] = useState(prefill?.league || '');
  const [game, setGame] = useState(prefill?.game || '');
  const [market, setMarket] = useState(prefill?.market || 'Moneyline');
  const [selection, setSelection] = useState(prefill?.selection || '');
  const [odds, setOdds] = useState('');
  const [stake, setStake] = useState('1');
  const [result, setResult] = useState<ValueCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [showMath, setShowMath] = useState(false);
  const [oddsError, setOddsError] = useState<string | null>(null);

  const sports: Sport[] = ['Soccer', 'Basketball', 'Football', 'Hockey', 'Baseball'];
  const markets = ['Moneyline', 'Spread', 'Total', 'Team Total', '1st Half', 'Player Prop'];

  const validateOdds = (val: string) => {
    if (!val) {
      setOddsError(null);
      return;
    }
    const cleanVal = val.replace(/^[+-]/, '');
    if (cleanVal && !/^\d+$/.test(cleanVal)) {
      setOddsError("Please enter numbers only (e.g. -110)");
      return;
    }
    const num = parseInt(val);
    if (isNaN(num)) {
      setOddsError(null);
      return;
    }
    if (num > -100 && num < 100) {
      setOddsError("American odds must be +/- 100 or greater");
    } else {
      setOddsError(null);
    }
  };

  const handleOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    setOdds(val);
    validateOdds(val);
  };

  const handleCheck = async () => {
    const numOdds = parseInt(odds);
    if (isNaN(numOdds) || oddsError) return;
    setLoading(true);
    setResult(null);
    const implied = americanToImplied(numOdds);
    const appProb = getProbabilityMock(game || 'Generic Game', selection || 'Generic Selection');
    const edge = appProb - implied;
    let rating: ValueCheckResult['rating'] = 'Fair price';
    if (edge > 0.05) rating = 'Good value';
    if (edge < -0.02) rating = 'Not worth it';
    const explanation = await getValueExplanation(game, market, selection, odds, appProb, rating);
    setResult({
      rating,
      appProb,
      impliedProb: implied,
      fairOdds: impliedToAmerican(appProb),
      edge: edge * 100,
      explanation: explanation?.points || ["Price looks balanced.", "Consider alternatives."],
      risks: explanation?.risks || ["Variance inherent in sports.", "Model limitations."]
    });
    setLoading(false);
  };

  const handleSave = () => {
    if (!result) return;
    const bet: SavedBet = {
      id: Math.random().toString(36).substr(2, 9),
      gameId: 'custom',
      gameTitle: game,
      market,
      selection,
      odds,
      valueRating: result.rating === 'Good value' ? 'Good' : result.rating === 'Fair price' ? 'Fair' : 'Bad',
      status: 'Pending',
      timestamp: Date.now()
    };
    onSave(bet);
    alert('Bet saved to My Bets!');
  };

  const isFormValid = game && selection && odds && !oddsError && !loading;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--text-main)] dark:text-white uppercase tracking-tight">Value Check</h2>
        <p className="text-gray-500 dark:text-white text-xs uppercase font-bold tracking-widest">AI analysis of sportsbook odds.</p>
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-5 theme-transition">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Sport</label>
            <select 
              value={sport} 
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm text-[var(--text-main)] dark:text-white font-bold uppercase outline-none"
            >
              {sports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Market</label>
            <select 
              value={market} 
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm text-[var(--text-main)] dark:text-white font-bold uppercase outline-none"
            >
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Game / Matchup</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers vs Celtics"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm text-[var(--text-main)] dark:text-white font-bold outline-none"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-white uppercase">Your Selection</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers +5.5 or Over 210.5"
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm text-[var(--text-main)] dark:text-white font-bold outline-none"
          />
        </div>

        <button 
          onClick={handleCheck}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${
            !isFormValid
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-white cursor-not-allowed' 
              : 'bg-blue-600 text-white dark:text-white hover:bg-blue-700 active:scale-95'
          }`}
        >
          {loading ? 'Analyzing...' : 'Check My Bet'}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slideUp">
          <div className={`animate-popIn rounded-3xl p-6 text-center space-y-2 border-2 shadow-sm ${
            result.rating === 'Good value' ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800' :
            result.rating === 'Fair price' ? 'bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800' : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
          }`}>
            <h3 className={`text-3xl font-black uppercase tracking-tight ${
              result.rating === 'Good value' ? 'text-green-700 dark:text-white' :
              result.rating === 'Fair price' ? 'text-orange-700 dark:text-white' : 'text-red-700 dark:text-white'
            }`}>
              {result.rating}
            </h3>
            <p className="text-[10px] opacity-70 font-black uppercase tracking-widest dark:text-white">AI-Powered Verdict</p>
          </div>

          <section className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-widest dark:text-white ml-1">AI Reasoning</h4>
            <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--border-color)] shadow-sm space-y-4">
              {result.explanation.map((p, i) => (
                <div key={i} className="flex items-start space-x-3 text-sm dark:text-white">
                  <span className="w-2 h-2 rounded-full bg-blue-500 mt-1.5 shrink-0"></span>
                  <p className="leading-relaxed dark:text-white">{p}</p>
                </div>
              ))}
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ValueCheckPage;
