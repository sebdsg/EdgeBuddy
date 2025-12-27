
import { Sport, League, Team, Player, Game } from './types';

export const LEAGUES: League[] = [
  { id: 'epl', name: 'English Premier League', shortName: 'EPL', sport: 'Soccer', region: 'England' },
  { id: 'laliga', name: 'La Liga', shortName: 'LAL', sport: 'Soccer', region: 'Spain' },
  { id: 'seriea', name: 'Serie A', shortName: 'SEA', sport: 'Soccer', region: 'Italy' },
  { id: 'bundesliga', name: 'Bundesliga', shortName: 'BUN', sport: 'Soccer', region: 'Germany' },
  { id: 'ligue1', name: 'Ligue 1', shortName: 'L1', sport: 'Soccer', region: 'France' },
  { id: 'nba', name: 'National Basketball Association', shortName: 'NBA', sport: 'Basketball', region: 'USA' },
  { id: 'nfl', name: 'National Football League', shortName: 'NFL', sport: 'Football', region: 'USA' },
  { id: 'mlb', name: 'Major League Baseball', shortName: 'MLB', sport: 'Baseball', region: 'USA' },
  { id: 'nhl', name: 'National Hockey League', shortName: 'NHL', sport: 'Hockey', region: 'USA' },
];

export const TEAMS: Team[] = [
  { id: 'ars', name: 'Arsenal', shortName: 'ARS', leagueId: 'epl', sportId: 'Soccer' },
  { id: 'mci', name: 'Manchester City', shortName: 'MCI', leagueId: 'epl', sportId: 'Soccer' },
  { id: 'liv', name: 'Liverpool', shortName: 'LIV', leagueId: 'epl', sportId: 'Soccer' },
  { id: 'rma', name: 'Real Madrid', shortName: 'RMA', leagueId: 'laliga', sportId: 'Soccer' },
  { id: 'bar', name: 'FC Barcelona', shortName: 'BAR', leagueId: 'laliga', sportId: 'Soccer' },
  { id: 'int', name: 'Inter Milan', shortName: 'INT', leagueId: 'seriea', sportId: 'Soccer' },
  { id: 'juv', name: 'Juventus', shortName: 'JUV', leagueId: 'seriea', sportId: 'Soccer' },
  { id: 'bay', name: 'Bayern Munich', shortName: 'BAY', leagueId: 'bundesliga', sportId: 'Soccer' },
  { id: 'dor', name: 'Borussia Dortmund', shortName: 'BVB', leagueId: 'bundesliga', sportId: 'Soccer' },
  { id: 'psg', name: 'Paris Saint-Germain', shortName: 'PSG', leagueId: 'ligue1', sportId: 'Soccer' },
  { id: 'lal', name: 'Los Angeles Lakers', shortName: 'LAL', leagueId: 'nba', sportId: 'Basketball' },
  { id: 'gsw', name: 'Golden State Warriors', shortName: 'GSW', leagueId: 'nba', sportId: 'Basketball' },
  { id: 'bos', name: 'Boston Celtics', shortName: 'BOS', leagueId: 'nba', sportId: 'Basketball' },
  { id: 'kc', name: 'Kansas City Chiefs', shortName: 'KC', leagueId: 'nfl', sportId: 'Football' },
  { id: 'sf', name: 'San Francisco 49ers', shortName: 'SF', leagueId: 'nfl', sportId: 'Football' },
  { id: 'nyy', name: 'New York Yankees', shortName: 'NYY', leagueId: 'mlb', sportId: 'Baseball' },
  { id: 'lad', name: 'Los Angeles Dodgers', shortName: 'LAD', leagueId: 'mlb', sportId: 'Baseball' },
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
    startTime: '2025-05-20T15:00:00Z',
    insights: ['Tactical deadlock likely', 'City strong late', 'Low scoring history']
  },
  {
    id: 'g2',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Celtics',
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
