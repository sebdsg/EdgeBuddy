
import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Sport, SavedBet, ValueCheckResult } from '../types';
import { LEAGUES, MOCK_GAMES } from '../constants';
import { americanToImplied, decimalToImplied, impliedToAmerican, getProbabilityMock } from '../utils/bettingUtils';
import { getValueExplanation } from '../services/geminiService';

const ValueCheckPage: React.FC<{ onSave: (bet: SavedBet) => void }> = ({ onSave }) => {
  const location = useLocation();
  const prefill = location.state?.prefill;

  const [sport, setSport] = useState<Sport>(prefill?.sport || 'Soccer');
  const [league, setLeague] = useState(prefill?.league || '');
  const [game, setGame] = useState(prefill?.game || '');
  const [market, setMarket] = useState(prefill?.market || 'Moneyline');
  const [selection, setSelection] = useState(prefill?.selection || '');
  const [oddsFormat, setOddsFormat] = useState<'american' | 'decimal'>('american');
  const [odds, setOdds] = useState('');
  const [result, setResult] = useState<ValueCheckResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [oddsError, setOddsError] = useState<string | null>(null);

  const sports: Sport[] = ['Soccer', 'Basketball', 'Football', 'Hockey', 'Baseball'];
  const markets = ['Moneyline', 'Spread', 'Total', 'Team Total', '1st Half', 'Player Prop'];

  // Filter leagues based on selected sport
  const filteredLeagues = useMemo(() => {
    return LEAGUES.filter(l => l.sport === sport);
  }, [sport]);

  // Reset league when sport changes if current league isn't in the new list
  useEffect(() => {
    if (filteredLeagues.length > 0) {
      const exists = filteredLeagues.find(l => l.name === league || l.id === league);
      if (!exists && league !== 'Other') {
        setLeague('');
      }
    }
  }, [sport, filteredLeagues]);

  const validateOdds = (val: string, format: 'american' | 'decimal') => {
    if (!val) {
      setOddsError(null);
      return;
    }

    if (format === 'american') {
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
    } else {
      if (!/^\d*\.?\d*$/.test(val)) {
        setOddsError("Please enter a valid decimal number (e.g. 1.91)");
        return;
      }
      const num = parseFloat(val);
      if (!isNaN(num) && num <= 1.0) {
        setOddsError("Decimal odds must be greater than 1.0");
      } else {
        setOddsError(null);
      }
    }
  };

  const handleOddsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.trim();
    setOdds(val);
    validateOdds(val, oddsFormat);
  };

  const handleFormatToggle = (format: 'american' | 'decimal') => {
    setOddsFormat(format);
    setOdds(''); 
    setOddsError(null);
    setResult(null);
  };

  const handleCheck = async () => {
    const numOdds = parseFloat(odds);
    if (isNaN(numOdds) || oddsError) return;
    
    setLoading(true);
    setResult(null);

    const implied = oddsFormat === 'american' 
      ? americanToImplied(numOdds) 
      : decimalToImplied(numOdds);

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
      <div className="space-y-2 text-center">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Value Check</h2>
        <p className="text-white opacity-60 text-[10px] uppercase font-bold tracking-[0.2em]">Smart AI Analysis of Any Line</p>
      </div>

      <div className="bg-[var(--card-bg)] rounded-[2.5rem] border border-[var(--border-color)]/30 shadow-2xl p-6 space-y-6 theme-transition relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 dark:bg-blue-500/5 rounded-full blur-3xl -translate-y-16 translate-x-16" />
        
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Sport</label>
            <div className="relative">
              <select 
                value={sport} 
                onChange={(e) => setSport(e.target.value as Sport)}
                className="w-full bg-black/40 border border-[var(--border-color)]/20 rounded-2xl p-4 text-sm text-white font-bold uppercase outline-none focus:border-green-500/50 transition-colors appearance-none"
              >
                {sports.map(s => <option key={s} value={s} className="bg-zinc-900">{s === 'Basketball' ? 'NBA' : s === 'Football' ? 'NFL' : s === 'Hockey' ? 'NHL' : s === 'Baseball' ? 'MLB' : s}</option>)}
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
          
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">League</label>
            <div className="relative">
              <select 
                value={league} 
                onChange={(e) => setLeague(e.target.value)}
                className="w-full bg-black/40 border border-[var(--border-color)]/20 rounded-2xl p-4 text-sm text-white font-bold uppercase outline-none focus:border-green-500/50 transition-colors appearance-none"
              >
                <option value="" className="bg-zinc-900">Choose League</option>
                {filteredLeagues.map(l => <option key={l.id} value={l.name} className="bg-zinc-900">{l.name}</option>)}
                <option value="Other" className="bg-zinc-900">Other / Global</option>
              </select>
              <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none opacity-40">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" /></svg>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Market</label>
            <select 
              value={market} 
              onChange={(e) => setMarket(e.target.value)}
              className="w-full bg-black/40 border border-[var(--border-color)]/20 rounded-2xl p-4 text-sm text-white font-bold uppercase outline-none appearance-none"
            >
              {markets.map(m => <option key={m} value={m} className="bg-zinc-900">{m}</option>)}
            </select>
          </div>
          <div className="space-y-1.5">
             <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Odds Format</label>
             <div className="flex bg-black/40 rounded-2xl p-1 border border-[var(--border-color)]/20 h-[52px]">
              <button 
                onClick={() => handleFormatToggle('american')}
                className={`flex-1 text-[10px] font-black uppercase rounded-xl transition-all ${oddsFormat === 'american' ? 'bg-green-600 dark:bg-blue-600 text-white shadow-lg' : 'text-white opacity-40'}`}
              >
                USA
              </button>
              <button 
                onClick={() => handleFormatToggle('decimal')}
                className={`flex-1 text-[10px] font-black uppercase rounded-xl transition-all ${oddsFormat === 'decimal' ? 'bg-green-600 dark:bg-blue-600 text-white shadow-lg' : 'text-white opacity-40'}`}
              >
                DEC
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Matchup</label>
          <input 
            type="text" 
            placeholder="e.g. Manchester United vs Liverpool"
            value={game}
            onChange={(e) => setGame(e.target.value)}
            className="w-full bg-black/40 border border-[var(--border-color)]/20 rounded-2xl p-4 text-sm text-white font-bold outline-none placeholder:opacity-20 focus:border-green-500/50 transition-colors"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Selection</label>
            <input 
              type="text" 
              placeholder="e.g. Over 2.5"
              value={selection}
              onChange={(e) => setSelection(e.target.value)}
              className="w-full bg-black/40 border border-[var(--border-color)]/20 rounded-2xl p-4 text-sm text-white font-bold outline-none placeholder:opacity-20 focus:border-green-500/50 transition-colors"
            />
          </div>
          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-green-500 dark:text-blue-500 uppercase tracking-widest ml-1">Odds</label>
            <input 
              type="text" 
              placeholder={oddsFormat === 'american' ? "-110" : "1.91"}
              value={odds}
              onChange={handleOddsChange}
              className={`w-full bg-black/40 border rounded-2xl p-4 text-sm text-white font-bold outline-none placeholder:opacity-20 transition-all ${oddsError ? 'border-red-500' : 'border-[var(--border-color)]/20 focus:border-green-500/50'}`}
            />
          </div>
        </div>
        {oddsError && <p className="text-[9px] text-red-500 font-bold uppercase mt-[-15px] ml-2 animate-fadeIn">{oddsError}</p>}

        <button 
          onClick={handleCheck}
          disabled={!isFormValid}
          className={`w-full py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-xl transition-all ${
            !isFormValid
              ? 'bg-zinc-800 text-white/20 cursor-not-allowed border border-white/5' 
              : 'bg-green-600 dark:bg-blue-600 text-white hover:opacity-90 active:scale-95'
          }`}
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              <span>Analyzing Market...</span>
            </div>
          ) : 'Verify AI Value'}
        </button>
      </div>

      {result && (
        <div className="space-y-6 animate-slideUp">
          <div className={`animate-popIn rounded-[2.5rem] p-8 text-center space-y-2 border-4 shadow-2xl relative overflow-hidden ${
            result.rating === 'Good value' ? 'bg-green-900/20 border-green-500/50 dark:bg-blue-900/20 dark:border-blue-500/50 shadow-green-500/10' :
            result.rating === 'Fair price' ? 'bg-zinc-900 border-zinc-700' : 'bg-red-900/20 border-red-500/50 shadow-red-500/10'
          }`}>
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-24" />
            <h3 className="text-4xl font-black uppercase tracking-tighter text-white relative z-10">
              {result.rating}
            </h3>
            <p className="text-[10px] opacity-70 font-black uppercase tracking-[0.3em] relative z-10">Edge Buddy Verdict</p>
          </div>

          <section className="space-y-4">
            <h4 className="font-black text-[10px] uppercase tracking-[0.3em] ml-2 opacity-50">AI Reasoning Feed</h4>
            <div className="bg-[var(--card-bg)] rounded-[2rem] p-6 border border-[var(--border-color)]/30 shadow-xl space-y-6 theme-transition">
              <div className="flex justify-between items-center pb-4 border-b border-white/5">
                <div className="space-y-0.5">
                  <span className="text-[9px] font-black opacity-30 uppercase tracking-widest block">Probability Advantage</span>
                  <span className={`text-xl font-black ${result.edge > 0 ? 'text-green-500 dark:text-blue-500' : 'text-red-500'}`}>
                    {result.edge > 0 ? '+' : ''}{result.edge.toFixed(1)}%
                  </span>
                </div>
                <div className="text-right space-y-0.5">
                   <span className="text-[9px] font-black opacity-30 uppercase tracking-widest block">Fair Market Odds</span>
                   <span className="text-lg font-black text-white">{result.fairOdds}</span>
                </div>
              </div>
              
              <div className="space-y-4">
                {result.explanation.map((p, i) => (
                  <div key={i} className="flex items-start space-x-3 text-sm text-white/90">
                    <div className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-blue-500 mt-2 shrink-0 shadow-sm shadow-green-500/50"></div>
                    <p className="leading-relaxed font-bold italic opacity-80">"{p}"</p>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>
      )}
    </div>
  );
};

export default ValueCheckPage;
