
export type Sport = 'Soccer' | 'Basketball' | 'Football' | 'Hockey' | 'Baseball';

// Added League interface to fix compilation error in constants.ts
export interface League {
  id: string;
  name: string;
  sport: Sport;
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
