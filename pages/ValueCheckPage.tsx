
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

    // Basic check for numeric content after prefix
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
    // Allow users to type the prefix freely but validate the result
    setOdds(val);
    validateOdds(val);
  };

  const handleCheck = async () => {
    const numOdds = parseInt(odds);
    if (isNaN(numOdds) || oddsError) return;

    setLoading(true);
    setResult(null); // Reset result to re-trigger animations if checking again
    
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
    alert('Bet saved to My Bets! 📋');
  };

  const isFormValid = game && selection && odds && !oddsError && !loading;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-[var(--text-main)]">Value Check</h2>
        <p className="text-gray-500 dark:text-gray-400 text-sm">Compare your sportsbook odds against AI estimates to find an edge.</p>
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-5 theme-transition">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Sport</label>
            <select 
              value={sport} 
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-main)] theme-transition"
            >
              {sports.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Market</label>
            <select 
              value={market} 
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-main)] theme-transition"
            >
              {markets.map(m => <option key={m} value={m}>{m}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Game / Matchup</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers vs Celtics"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-main)] theme-transition"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Your Selection</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers +5.5 or Over 210.5"
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-main)] theme-transition"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1 relative">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Sportsbook Odds</label>
            <input 
              type="text" 
              inputMode="text"
              placeholder="+150 or -110"
              value={odds}
              onChange={handleOddsChange}
              className={`w-full bg-gray-50 dark:bg-gray-900/50 border rounded-xl p-3 text-sm font-bold focus:ring-2 outline-none transition-all ${
                oddsError 
                  ? 'border-red-400 text-red-600 focus:ring-red-200' 
                  : 'border-gray-100 dark:border-gray-800 text-blue-600 focus:ring-blue-500'
              }`}
            />
            {oddsError && (
              <p className="absolute -bottom-5 left-1 text-[9px] font-bold text-red-500 animate-fadeIn whitespace-nowrap">
                {oddsError}
              </p>
            )}
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase">Stake (Units)</label>
            <input 
              type="number" 
              value={stake}
              onChange={(e) => setStake(e.target.value)}
              className="w-full bg-gray-50 dark:bg-gray-900/50 border border-gray-100 dark:border-gray-800 rounded-xl p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none text-[var(--text-main)] theme-transition"
            />
          </div>
        </div>

        <button 
          onClick={handleCheck}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl font-bold text-lg shadow-lg transition-all ${
            !isFormValid
              ? 'bg-gray-200 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-blue-600 text-white hover:bg-blue-700 active:scale-95'
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
            <div className="animate-bounce mb-2">
              <span className="text-5xl">
                {result.rating === 'Good value' ? '✅' : result.rating === 'Fair price' ? '⚠️' : '❌'}
              </span>
            </div>
            <h3 className={`text-3xl font-black uppercase tracking-tight ${
              result.rating === 'Good value' ? 'text-green-700 dark:text-green-400' :
              result.rating === 'Fair price' ? 'text-orange-700 dark:text-orange-400' : 'text-red-700 dark:text-red-400'
            }`}>
              {result.rating}
            </h3>
            <p className="text-sm opacity-70 font-bold text-[var(--text-main)]">AI-Powered Verdict</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm text-center theme-transition">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">AI Win Chance</div>
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{(result.appProb * 100).toFixed(1)}%</div>
            </div>
            <div className="bg-[var(--card-bg)] p-4 rounded-2xl border border-[var(--border-color)] shadow-sm text-center theme-transition">
              <div className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase mb-1">Estimated Edge</div>
              <div className={`text-2xl font-bold ${result.edge > 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {result.edge > 0 ? '+' : ''}{result.edge.toFixed(1)}%
              </div>
            </div>
          </div>

          <section className="space-y-3">
            <h4 className="font-bold text-[var(--text-main)] ml-1">AI Reasoning</h4>
            <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--border-color)] shadow-sm space-y-4 theme-transition">
              <div className="space-y-3">
                {result.explanation.map((p, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm text-gray-600 dark:text-gray-400">
                    <span className="text-blue-500 mt-1 shrink-0">✨</span>
                    <p className="leading-relaxed">{p}</p>
                  </div>
                ))}
              </div>
              <div className="pt-4 border-t border-gray-50 dark:border-gray-800">
                <span className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase block mb-2 px-1">Critical Factors & Risks</span>
                <div className="space-y-2">
                  {result.risks.map((r, i) => (
                    <div key={i} className="flex items-start space-x-3 text-sm text-gray-500 dark:text-gray-600">
                      <span className="text-red-400 mt-1 shrink-0">⚠️</span>
                      <p className="leading-relaxed italic">{r}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          <section className="bg-gray-100 dark:bg-gray-900 rounded-2xl p-4 theme-transition">
            <button 
              onClick={() => setShowMath(!showMath)}
              className="w-full flex justify-between items-center text-xs font-bold text-gray-500 uppercase tracking-wider px-1"
            >
              <span>{showMath ? 'Hide' : 'Show'} transparency data</span>
              <span className="text-lg">{showMath ? '−' : '+'}</span>
            </button>
            {showMath && (
              <div className="mt-4 space-y-2 text-xs text-gray-600 dark:text-gray-400 font-mono bg-white dark:bg-slate-800 p-3 rounded-lg border border-gray-200 dark:border-gray-700 animate-fadeIn">
                <p>Implied Probability: {(result.impliedProb * 100).toFixed(2)}%</p>
                <p>AI Estimated Prob: {(result.appProb * 100).toFixed(2)}%</p>
                <p>Fair Market Odds: {result.fairOdds}</p>
                <p className="pt-2 border-t border-gray-100 dark:border-gray-700 mt-2">Calculated Edge: {result.edge.toFixed(2)}%</p>
              </div>
            )}
          </section>

          <button 
            onClick={handleSave}
            className="w-full py-4 bg-gray-900 dark:bg-gray-100 dark:text-gray-900 text-white font-bold rounded-2xl shadow-xl active:scale-95 transition-all"
          >
            Save to My Bets
          </button>
        </div>
      )}
    </div>
  );
};

export default ValueCheckPage;
