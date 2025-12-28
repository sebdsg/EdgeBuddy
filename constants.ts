
import { Sport, League, Team, Player, Game } from './types';

export const LEAGUES: League[] = [
  { id: 'epl', name: 'EPL', shortName: 'EPL', sport: 'Soccer', region: 'England' },
  { id: 'laliga', name: 'La Liga', shortName: 'LAL', sport: 'Soccer', region: 'Spain' },
  { id: 'seriea', name: 'Serie A', shortName: 'SEA', sport: 'Soccer', region: 'Italy' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BUN', sport: 'Soccer', region: 'Germany' },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'L1', sport: 'Soccer', region: 'France' },
  { id: 'nba', name: 'NBA', shortName: 'NBA', sport: 'Basketball', region: 'USA' },
  { id: 'nfl', name: 'NFL', shortName: 'NFL', sport: 'Football', region: 'USA' },
  { id: 'mlb', name: 'MLB', shortName: 'MLB', sport: 'Baseball', region: 'USA' },
  { id: 'nhl', name: 'NHL', shortName: 'NHL', sport: 'Hockey', region: 'USA' },
];

export const TEAMS: Team[] = [
  { id: 'ars', name: 'Arsenal', shortName: 'ARS', leagueId: 'epl', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png' },
  { id: 'mci', name: 'Manchester City', shortName: 'MCI', leagueId: 'epl', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png' },
  { id: 'liv', name: 'Liverpool', shortName: 'LIV', leagueId: 'epl', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/0c/Liverpool_FC.svg/1200px-Liverpool_FC.svg.png' },
  { id: 'rma', name: 'Real Madrid', shortName: 'RMA', leagueId: 'laliga', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/56/Real_Madrid_CF.svg/1200px-Real_Madrid_CF.svg.png' },
  { id: 'bar', name: 'FC Barcelona', shortName: 'BAR', leagueId: 'laliga', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/4/47/FC_Barcelona_%28logo%29.svg/1200px-FC_Barcelona_%28logo%29.svg.png' },
  { id: 'int', name: 'Inter Milan', shortName: 'INT', leagueId: 'seriea', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/05/Inter_Milan_2021_logo.svg/1200px-Inter_Milan_2021_logo.svg.png' },
  { id: 'juv', name: 'Juventus', shortName: 'JUV', leagueId: 'seriea', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/15/Juventus_FC_2017_logo.svg/1200px-Juventus_FC_2017_logo.svg.png' },
  { id: 'bay', name: 'Bayern Munich', shortName: 'BAY', leagueId: 'bundesliga', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg/1200px-FC_Bayern_M%C3%BCnchen_logo_%282017%29.svg.png' },
  { id: 'dor', name: 'Borussia Dortmund', shortName: 'BVB', leagueId: 'bundesliga', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/6/67/Borussia_Dortmund_logo.svg/1200px-Borussia_Dortmund_logo.svg.png' },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', leagueId: 'ligue1', sportId: 'Soccer', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/a/a7/Paris_Saint-Germain_F.C..svg/1200px-Paris_Saint-Germain_F.C..svg.png' },
  { id: 'lal', name: 'Los Angeles Lakers', shortName: 'LAL', leagueId: 'nba', sportId: 'Basketball', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png' },
  { id: 'gsw', name: 'Golden State Warriors', shortName: 'GSW', leagueId: 'nba', sportId: 'Basketball', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/0/01/Golden_State_Warriors_logo.svg/1200px-Golden_State_Warriors_logo.svg.png' },
  { id: 'bos', name: 'Boston Celtics', shortName: 'BOS', leagueId: 'nba', sportId: 'Basketball', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png' },
  { id: 'kc', name: 'Kansas City Chiefs', shortName: 'KC', leagueId: 'nfl', sportId: 'Football', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Kansas_City_Chiefs_logo.svg/1200px-Kansas_City_Chiefs_logo.svg.png' },
  { id: 'sf', name: 'San Francisco 49ers', shortName: 'SF', leagueId: 'nfl', sportId: 'Football', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3a/San_Francisco_49ers_logo.svg/1200px-San_Francisco_49ers_logo.svg.png' },
  { id: 'nyy', name: 'New York Yankees', shortName: 'NYY', leagueId: 'mlb', sportId: 'Baseball', logoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/2/25/New_York_Yankees_logo.svg/1200px-New_York_Yankees_logo.svg.png' },
  { id: 'lad', name: 'Los Angeles Dodgers', shortName: 'LAD', leagueId: 'mlb', sportId: 'Baseball', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/0/0e/Los_Angeles_Dodgers_logo.svg/1200px-Los_Angeles_Dodgers_logo.svg.png' },
];

export const PLAYERS: Player[] = [
  { 
    id: 'p1', 
    name: 'Bukayo Saka', 
    shortName: 'Saka', 
    sportId: 'Soccer', 
    leagueId: 'epl', 
    teamId: 'ars', 
    position: 'Forward',
    stats: { 'Season Goals': 18, 'Assists': 11, 'Key Passes': 74 }
  },
  { 
    id: 'p2', 
    name: 'Erling Haaland', 
    shortName: 'Haaland', 
    sportId: 'Soccer', 
    leagueId: 'epl', 
    teamId: 'mci', 
    position: 'Striker',
    stats: { 'Season Goals': 32, 'Assists': 4, 'SOT/90': 2.1 }
  },
  { 
    id: 'p3', 
    name: 'LeBron James', 
    shortName: 'LeBron', 
    sportId: 'Basketball', 
    leagueId: 'nba', 
    teamId: 'lal', 
    position: 'Forward',
    stats: { 'PPG': 24.5, 'RPG': 7.8, 'APG': 8.1 }
  },
  { 
    id: 'p4', 
    name: 'Stephen Curry', 
    shortName: 'Curry', 
    sportId: 'Basketball', 
    leagueId: 'nba', 
    teamId: 'gsw', 
    position: 'Guard',
    stats: { 'PPG': 27.1, '3PM': 4.8, 'FT%': '92.1%' }
  },
  { 
    id: 'p5', 
    name: 'Patrick Mahomes', 
    shortName: 'Mahomes', 
    sportId: 'Football', 
    leagueId: 'nfl', 
    teamId: 'kc', 
    position: 'QB',
    stats: { 'Pass Yds': 4400, 'TDs': 31, 'Rating': 101.2 }
  },
  { 
    id: 'p6', 
    name: 'Shohei Ohtani', 
    shortName: 'Ohtani', 
    sportId: 'Baseball', 
    leagueId: 'mlb', 
    teamId: 'lad', 
    position: 'DH',
    stats: { 'HR': 52, 'SB': 55, 'AVG': '.310' }
  },
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'g1',
    sport: 'Soccer',
    league: 'EPL',
    homeTeam: 'Arsenal',
    awayTeam: 'Man City',
    homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/5/53/Arsenal_FC.svg/1200px-Arsenal_FC.svg.png',
    awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/e/eb/Manchester_City_FC_badge.svg/1200px-Manchester_City_FC_badge.svg.png',
    startTime: '2025-05-20T15:00:00Z',
    insights: ['Tactical deadlock likely', 'City strong late', 'Low scoring history']
  },
  {
    id: 'g2',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Celtics',
    homeLogoUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Los_Angeles_Lakers_logo.svg/1200px-Los_Angeles_Lakers_logo.svg.png',
    awayLogoUrl: 'https://upload.wikimedia.org/wikipedia/en/thumb/8/8f/Boston_Celtics.svg/1200px-Boston_Celtics.svg.png',
    startTime: '2025-05-20T19:30:00Z',
    insights: ['Fast pace expected', 'LeBron dominant at home', 'Celtics defense rotation issues']
  },
];

export const LEARN_TOPICS = [
  {
    id: 't1',
    title: 'What does +150 mean?',
    content: 'American odds show how much you win on a $100 bet (+150 wins $150) or how much you need to bet to win $100 (-110 means bet $110 to win $100).'
  },
  {
    id: 't2',
    title: 'What is good value?',
    content: 'Value happens when the chances of something happening are better than what the sportsbook odds suggest.'
  }
];

export const GLOSSARY = [
  { term: 'Moneyline', definition: 'A simple bet on which team will win the game.' },
  { term: 'Spread', definition: 'A bet on the margin of victory.' },
  { term: 'Edge', definition: 'The difference between actual probability and implied probability.' }
];
