
export type Sport = 'Soccer' | 'Basketball' | 'Football' | 'Hockey' | 'Baseball';

export interface League {
  id: string;
  name: string;
  sport: Sport;
  shortName: string;
  region: string;
  logoUrl?: string;
}

export interface Team {
  id: string;
  name: string;
  shortName: string;
  leagueId: string;
  sportId: Sport;
  logoUrl?: string;
  venue?: string;
}

export interface Player {
  id: string;
  sportId: Sport;
  leagueId: string;
  teamId: string;
  name: string;
  shortName: string;
  position?: string;
  headshotUrl?: string;
  stats?: Record<string, string | number>;
}

export interface GroundingSource {
  title: string;
  uri: string;
}

export interface Game {
  id: string;
  sport: Sport;
  league: string;
  homeTeam: string;
  awayTeam: string;
  homeLogoUrl?: string;
  awayLogoUrl?: string;
  startTime: string;
  insights: string[];
  groundingSources?: GroundingSource[];
}

export interface BettingAngle {
  title: string;
  why: string;
  risk: string;
  riskLevel: 'Low' | 'Medium' | 'High';
  market: string;
  selection: string;
  confidence: number;
}

export interface SavedBet {
  id: string;
  gameId: string;
  gameTitle: string;
  market: string;
  selection: string;
  odds: string;
  valueRating: 'Good' | 'Fair' | 'Bad';
  status: 'Pending' | 'Won' | 'Lost';
  timestamp: number;
}

export interface ValueCheckResult {
  rating: 'Good value' | 'Fair price' | 'Not worth it';
  appProb: number;
  impliedProb: number;
  fairOdds: string;
  edge: number;
  explanation: string[];
  risks: string[];
}
