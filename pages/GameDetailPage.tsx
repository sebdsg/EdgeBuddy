
import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import { getGameAnalysis, generateAngleImage } from '../services/geminiService';
import { BettingAngle, GroundingSource, Game } from '../types';

const FavoriteStar: React.FC<{ isFavorite: boolean; onToggle: () => void }> = ({ isFavorite, onToggle }) => (
  <button 
    onClick={(e) => {
      e.preventDefault();
      e.stopPropagation();
      onToggle();
    }}
    className="focus:outline-none p-1 transition-transform active:scale-125"
  >
    <svg 
      className={`w-5 h-5 ${isFavorite ? 'text-yellow-400 fill-current' : 'text-white/20'}`} 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
    >
      <path 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        strokeWidth="2.5" 
        d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.921-.755 1.688-1.54 1.118l-3.976-2.888a1 1 0 00-1.175 0l-3.976 2.888c-.784.57-1.838-.197-1.539-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" 
      />
    </svg>
  </button>
);

const TeamCrestLarge: React.FC<{ name: string; logoUrl?: string }> = ({ name, logoUrl }) => {
  const [imgError, setImgError] = useState(false);
  const initials = (name || "T").split(' ').map(n => n[0]).join('').substring(0, 2);
  const bgColor = (name || "").length % 2 === 0 ? 'bg-green-600 dark:bg-blue-600' : 'bg-green-800 dark:bg-blue-800';

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

interface GameDetailPageProps {
  favorites: string[];
  toggleFavorite: (name: string) => void;
}

const GameDetailPage: React.FC<GameDetailPageProps> = ({ favorites, toggleFavorite }) => {
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

  if (!game) return <div className="p-8 text-center text-white"><Link to="/" className="text-green-500 dark:text-blue-500 uppercase font-black text-xs tracking-widest">Game not found. Go back home.</Link></div>;

  const isHomeFavorite = favorites.includes(game.homeTeam);
  const isAwayFavorite = favorites.includes(game.awayTeam);

  return (
    <div className="space-y-6 pb-12 animate-fadeIn">
      <Link to="/" className="text-green-500 dark:text-blue-500 text-[10px] font-black uppercase tracking-widest">Back to Feed</Link>

      <div className="bg-gradient-to-br from-green-800 to-zinc-900 dark:from-blue-900 dark:to-zinc-950 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden border border-[var(--border-color)]/30">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full -translate-y-16 translate-x-16" />
        <div className="space-y-6 relative z-10">
          <div className="text-center text-xs font-black uppercase tracking-[0.2em] opacity-60">{game.league} Matchup</div>
          <div className="flex items-center justify-between px-2">
            <div className="flex flex-col items-center space-y-3 w-1/3 relative">
              <TeamCrestLarge name={game.homeTeam} logoUrl={game.homeLogoUrl} />
              <div className="flex items-center space-x-1">
                <span className={`font-bold text-xs text-center ${isHomeFavorite ? 'text-yellow-400' : ''}`}>{game.homeTeam}</span>
                <FavoriteStar isFavorite={isHomeFavorite} onToggle={() => toggleFavorite(game.homeTeam)} />
              </div>
            </div>
            <div className="flex flex-col items-center w-1/3">
              <span className="text-2xl font-black italic opacity-20">VS</span>
              <span className="text-xs bg-white/10 px-3 py-2 rounded-full font-bold mt-2 uppercase whitespace-nowrap">
                {formatMatchTimeLabel(game.startTime)}
              </span>
            </div>
            <div className="flex flex-col items-center space-y-3 w-1/3 relative">
              <TeamCrestLarge name={game.awayTeam} logoUrl={game.awayLogoUrl} />
              <div className="flex items-center space-x-1">
                <span className={`font-bold text-xs text-center ${isAwayFavorite ? 'text-yellow-400' : ''}`}>{game.awayTeam}</span>
                <FavoriteStar isFavorite={isAwayFavorite} onToggle={() => toggleFavorite(game.awayTeam)} />
              </div>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="py-24 text-center space-y-6">
          <div className="relative inline-block">
             <div className="animate-spin h-16 w-16 border-4 border-gray-800 border-t-green-500 dark:border-t-blue-500 rounded-full" />
          </div>
          <p className="font-bold text-green-500 dark:text-blue-500 animate-pulse uppercase text-[10px] tracking-widest">Searching latest injury reports & form...</p>
        </div>
      ) : (
        <>
          <section className="space-y-3">
            <h3 className="text-sm font-black text-white opacity-60 uppercase tracking-widest px-1">Search Grounded Intel</h3>
            <div className="bg-[var(--card-bg)] rounded-3xl border border-[var(--border-color)] p-6 shadow-sm space-y-4 theme-transition">
              {analysis?.quickTakes?.map((take, idx) => (
                <div key={idx} className="flex items-start space-x-3 text-sm text-white leading-relaxed">
                  <span className="mt-1 w-2 h-2 rounded-full bg-green-500 dark:bg-blue-500 shrink-0"></span>
                  <p>{take}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-4">
            <h3 className="text-sm font-black text-white opacity-60 uppercase tracking-widest px-1">AI Betting Angles</h3>
            <div className="grid gap-4">
              {analysis?.angles?.map((angle, idx) => (
                <div key={idx} className="bg-[var(--card-bg)] rounded-[2rem] border border-[var(--border-color)] shadow-sm overflow-hidden theme-transition">
                  <div className="aspect-video w-full bg-black relative">
                    {angleImages[idx] ? (
                      <img src={angleImages[idx]} className="w-full h-full object-cover animate-fadeIn" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center p-6 space-y-3">
                        <div className="w-24 h-1 bg-gray-900 rounded-full overflow-hidden">
                           <div className="h-full bg-green-500 dark:bg-blue-500 animate-progressBar" />
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="p-6 space-y-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-black text-white text-lg leading-tight uppercase tracking-tighter pr-4">{angle.title}</h4>
                      <span className={`text-[8px] font-black px-2 py-1 rounded uppercase text-white ${
                        angle.riskLevel === 'Low' ? 'bg-green-600' : angle.riskLevel === 'Medium' ? 'bg-orange-600' : 'bg-red-600'
                      }`}>
                        {angle.riskLevel} Risk
                      </span>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm text-white opacity-80 leading-snug"><span className="font-bold text-green-500 dark:text-blue-500 uppercase text-[9px]">Insight:</span> {angle.why}</p>
                      <p className="text-xs text-red-400 italic"><span className="font-bold text-red-500 uppercase text-[9px]">Watch:</span> {angle.risk}</p>
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
