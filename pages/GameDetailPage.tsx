
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getGameAnalysis, generateAngleImage } from '../services/geminiService';
import { BettingAngle, GroundingSource, Game } from '../types';

const TeamCrestLarge: React.FC<{ name: string; logoUrl?: string }> = ({ name, logoUrl }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "T").split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = (name || "").length % 2 === 0 ? 'bg-blue-500' : 'bg-indigo-500';

  if (logoUrl && logoUrl.trim() !== '' && !imgError) {
    return (
      <div className="w-16 h-16 bg-white rounded-full p-2 border-2 border-white/30 shadow-2xl overflow-hidden flex items-center justify-center shrink-0">
        <img 
          src={logoUrl} 
          alt={name} 
          className="w-full h-full object-contain" 
          onError={() => setImgError(true)}
        />
      </div>
    );
  }

  return (
    <div className={`w-16 h-16 ${bgColor} rounded-full flex items-center justify-center text-xl font-bold text-white shadow-lg border-2 border-white/30 shrink-0`}>
      {initials}
    </div>
  );
};

const GameDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const game = location.state?.game as Game;
  
  const [analysis, setAnalysis] = useState<{ quickTakes: string[], angles: BettingAngle[], sources?: GroundingSource[] } | null>(null);
  const [angleImages, setAngleImages] = useState<Record<number, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (game) {
      const fetchData = async () => {
        setLoading(true);
        const res = await getGameAnalysis(game.homeTeam, game.awayTeam, game.sport);
        if (res) {
          setAnalysis(res);
          setLoading(false);
          res.angles?.forEach(async (angle: BettingAngle, index: number) => {
            const imageUrl = await generateAngleImage(angle.title, game.sport);
            if (imageUrl) setAngleImages(prev => ({ ...prev, [index]: imageUrl }));
          });
        } else {
          setLoading(false);
        }
      };
      fetchData();
    }
  }, [game]);

  if (!game) return <div className="p-8 text-center"><Link to="/" className="text-blue-500">Game not found. Go back home.</Link></div>;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <Link to="/" className="text-blue-600 text-sm font-bold">← Back to Feed</Link>

      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="space-y-6 relative z-10">
          <div className="text-center text-[10px] font-black uppercase tracking-[0.2em] opacity-60">{game.league} Matchup</div>
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col items-center space-y-3 w-1/3">
              <TeamCrestLarge name={game.homeTeam} logoUrl={game.homeLogoUrl} />
              <span className="font-bold text-xs text-center">{game.homeTeam}</span>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <span className="text-2xl font-black italic opacity-20">VS</span>
              <span className="text-[10px] bg-white/10 px-3 py-1 rounded-full font-bold mt-2 uppercase">{game.startTime}</span>
            </div>
            <div className="flex flex-col items-center space-y-3 w-1/3">
              <TeamCrestLarge name={game.awayTeam} logoUrl={game.awayLogoUrl} />
              <span className="font-bold text-xs text-center">{game.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-6">
          <div className="relative inline-block">
             <div className="animate-spin h-16 w-16 border-4 border-blue-100 border-t-blue-600 rounded-full" />
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">🔍</div>
          </div>
          <p className="font-bold text-blue-600 animate-pulse uppercase text-xs tracking-widest">Searching latest injury reports & form...</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">Search Grounded Intel</h3>
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-4 theme-transition">
              {analysis?.quickTakes?.map((take, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
                  <span className="mt-1 text-blue-500 font-bold shrink-0">⚡</span>
                  <p>{take}</p>
                </div>
              ))}
              {(!analysis?.quickTakes || analysis.quickTakes.length === 0) && (
                 <p className="text-xs text-gray-400 italic">No specific news found for this matchup yet.</p>
              )}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest px-1">AI Betting Angles</h3>
            <div className="grid gap-4">
              {analysis?.angles?.map((angle, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden theme-transition">
                  <div className="aspect-video w-full bg-gray-50 dark:bg-gray-900 relative">
                    {angleImages[idx] ? (
                      <img src={angleImages[idx]} className="w-full h-full object-cover animate-fadeIn" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3 opacity-50">
                        <div className="animate-pulse text-2xl">🪄</div>
                        <div className="w-24 h-1 bg-blue-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 animate-progressBar" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-blue-900 dark:text-blue-300 text-lg leading-tight uppercase tracking-tighter pr-4">{angle.title}</h4>
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase text-white ${
                        angle.riskLevel === 'Low' ? 'bg-green-500' : angle.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {angle.riskLevel} Risk
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-gray-400 leading-snug"><span className="font-bold text-blue-500 uppercase text-[9px]">Insight:</span> {angle.why}</p>
                      <p className="text-xs text-gray-400 italic"><span className="font-bold text-red-400 uppercase text-[9px]">Watch:</span> {angle.risk}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>

          {analysis?.sources && analysis.sources.length > 0 && (
            <section className="p-4 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-100 dark:border-gray-800">
               <h4 className="text-[10px] font-black text-gray-400 uppercase mb-3 tracking-widest px-1">Data Sources</h4>
               <div className="flex flex-col gap-2">
                 {analysis.sources?.slice(0, 3).map((source, i) => (
                   <a key={i} href={source.uri} target="_blank" className="flex items-center justify-between text-[10px] bg-white dark:bg-gray-800 p-3 rounded-xl border border-gray-200 dark:border-gray-700 text-blue-500 font-bold group">
                     <span className="truncate pr-4">{source.title}</span>
                     <span className="group-hover:translate-x-1 transition-transform">→</span>
                   </a>
                 ))}
               </div>
            </section>
          )}
        </>
      )}
    </div>
  );
};

export default GameDetailPage;
