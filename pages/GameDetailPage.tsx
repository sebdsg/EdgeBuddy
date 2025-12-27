
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

  const formatMatchTimeLabel = (startTime: string) => {
    const date = new Date(startTime);
    if (isNaN(date.getTime())) return startTime;

    const now = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(now.getDate() + 1);

    let day = "";
    if (date.toDateString() === now.toDateString()) day = "Today";
    else if (date.toDateString() === tomorrow.toDateString()) day = "Tomorrow";
    else day = date.toLocaleDateString([], { month: 'short', day: 'numeric' });

    const time = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    return `${day} - ${time}`;
  };

  if (!game) return <div className="p-8 text-center"><Link to="/" className="text-blue-500 dark:text-white uppercase font-black text-xs tracking-widest">Game not found. Go back home.</Link></div>;

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <Link to="/" className="text-blue-600 dark:text-white text-[10px] font-black uppercase tracking-widest">Back to Feed</Link>

      <div className="bg-gradient-to-br from-blue-700 to-indigo-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="space-y-6 relative z-10">
          <div className="text-center text-xs font-black uppercase tracking-[0.2em] opacity-60 dark:text-white">{game.league} Matchup</div>
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col items-center space-y-3 w-1/3">
              <TeamCrestLarge name={game.homeTeam} logoUrl={game.homeLogoUrl} />
              <span className="font-bold text-xs text-center dark:text-white">{game.homeTeam}</span>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <span className="text-2xl font-black italic opacity-20 dark:text-white">VS</span>
              <span className="text-xs bg-white/10 px-3 py-2 rounded-full font-bold mt-2 uppercase dark:text-white whitespace-nowrap">
                {formatMatchTimeLabel(game.startTime)}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-3 w-1/3">
              <TeamCrestLarge name={game.awayTeam} logoUrl={game.awayLogoUrl} />
              <span className="font-bold text-xs text-center dark:text-white">{game.awayTeam}</span>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-6">
          <div className="relative inline-block">
             <div className="animate-spin h-16 w-16 border-4 border-blue-100 border-t-blue-600 rounded-full" />
          </div>
          <p className="font-bold text-blue-600 dark:text-white animate-pulse uppercase text-[10px] tracking-widest">Searching latest injury reports & form...</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-black text-gray-400 dark:text-white uppercase tracking-widest px-1">Search Grounded Intel</h3>
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-4 theme-transition">
              {analysis?.quickTakes?.map((take, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm text-gray-700 dark:text-white leading-relaxed">
                  <span className="mt-1 w-2 h-2 rounded-full bg-blue-500 shrink-0"></span>
                  <p className="dark:text-white">{take}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-gray-400 dark:text-white uppercase tracking-widest px-1">AI Betting Angles</h3>
            <div className="grid gap-4">
              {analysis?.angles?.map((angle, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden theme-transition">
                  <div className="aspect-video w-full bg-gray-50 dark:bg-gray-900 relative">
                    {angleImages[idx] ? (
                      <img src={angleImages[idx]} className="w-full h-full object-cover animate-fadeIn" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3">
                        <div className="w-24 h-1 bg-blue-100 rounded-full overflow-hidden">
                           <div className="h-full bg-blue-500 animate-progressBar" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-blue-900 dark:text-white text-lg leading-tight uppercase tracking-tighter pr-4">{angle.title}</h4>
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase text-white ${
                        angle.riskLevel === 'Low' ? 'bg-green-500' : angle.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-red-500'
                      }`}>
                        {angle.riskLevel} Risk
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-gray-600 dark:text-white leading-snug"><span className="font-bold text-blue-500 dark:text-white uppercase text-[9px]">Insight:</span> {angle.why}</p>
                      <p className="text-xs text-gray-400 dark:text-white italic"><span className="font-bold text-red-400 dark:text-white uppercase text-[9px]">Watch:</span> {angle.risk}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
};

export default GameDetailPage;
