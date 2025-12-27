
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

  const isFormValid = game && selection && odds && !oddsError && !loading;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn text-white">
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white uppercase tracking-tight">Value Check</h2>
        <p className="text-white opacity-60 text-xs uppercase font-bold tracking-widest">AI analysis of sportsbook odds.</p>
      </div>

      <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] shadow-sm p-6 space-y-5 theme-transition">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase">Sport</label>
            <select 
              value={sport} 
              onChange={(e) => setSport(e.target.value as Sport)}
              className="w-full bg-black/40 border border-[var(--border-color)]/30 rounded-xl p-3 text-sm text-white font-bold uppercase outline-none"
            >
              {sports.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase">Market</label>
            <select 
              value={market} 
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-black/40 border border-[var(--border-color)]/30 rounded-xl p-3 text-sm text-white font-bold uppercase outline-none"
            >
              {markets.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
            </select>
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase">Game / Matchup</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers vs Celtics"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-black/40 border border-[var(--border-color)]/30 rounded-xl p-3 text-sm text-white font-bold outline-none placeholder:opacity-30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase">Your Selection</label>
          <input 
            type="text" 
            placeholder="e.g. Lakers +5.5 or Over 210.5"
            value={selection}
            onChange={(e) => setSelection(e.target.value)}
            className="w-full bg-black/40 border border-[var(--border-color)]/30 rounded-xl p-3 text-sm text-white font-bold outline-none placeholder:opacity-30"
          />
        </div>

        <div className="space-y-1">
          <label className="text-[10px] font-bold text-green-500 dark:text-blue-500 uppercase">American Odds</label>
          <input 
            type="text" 
            placeholder="e.g. -110 or +200"
            value={odds}
            onChange={handleOddsChange}
            className={`w-full bg-black/40 border rounded-xl p-3 text-sm text-white font-bold outline-none ${oddsError ? 'border-red-500' : 'border-[var(--border-color)]/30'}`}
          />
          {oddsError && <p className="text-[8px] text-red-500 font-bold uppercase mt-1">{oddsError}</p>}
        </div>

        <button 
          onClick={handleCheck}
          disabled={!isFormValid}
          className={`w-full py-4 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg transition-all ${
            !isFormValid
              ? 'bg-zinc-800 text-white/30 cursor-not-allowed border border-white/5' 
              : 'bg-green-600 dark:bg-blue-600 text-white hover:opacity-90 active:scale-95'
          }`}
        >
          {loading ? 'Analyzing...' : 'Check My Bet'}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slideUp">
          <div className={`animate-popIn rounded-3xl p-6 text-center space-y-2 border-2 shadow-sm ${
            result.rating === 'Good value' ? 'bg-green-900/20 border-green-500/50 dark:bg-blue-900/20 dark:border-blue-500/50' :
            result.rating === 'Fair price' ? 'bg-zinc-900 border-zinc-700' : 'bg-red-900/20 border-red-500/50'
          }`}>
            <h3 className={`text-3xl font-black uppercase tracking-tight text-white`}>
              {result.rating}
            </h3>
            <p className="text-[10px] opacity-70 font-black uppercase tracking-widest">AI-Powered Verdict</p>
          </div>

          <section className="space-y-3">
            <h4 className="font-black text-xs uppercase tracking-widest ml-1 text-green-500 dark:text-blue-500">AI Reasoning</h4>
            <div className="bg-[var(--card-bg)] rounded-2xl p-5 border border-[var(--border-color)] shadow-sm space-y-4">
              {result.explanation.map((p, i) => (
                <div key={i} className="flex items-start space-x-3 text-sm text-white">
                  <span className="w-2 h-2 rounded-full bg-green-500 dark:bg-blue-500 mt-1.5 shrink-0"></span>
                  <p className="leading-relaxed opacity-90">{p}</p>
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
