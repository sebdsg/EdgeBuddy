
import { Sport, League, Game } from './types';

export const LEAGUES: League[] = [
  { id: 'epl', name: 'EPL', sport: 'Soccer' },
  { id: 'laliga', name: 'La Liga', sport: 'Soccer' },
  { id: 'nba', name: 'NBA', sport: 'Basketball' },
  { id: 'nfl', name: 'NFL', sport: 'Football' },
  { id: 'mlb', name: 'MLB', sport: 'Baseball' },
  { id: 'nhl', name: 'NHL', sport: 'Hockey' },
];

export const MOCK_GAMES: Game[] = [
  {
    id: 'g1',
    sport: 'Soccer',
    league: 'EPL',
    homeTeam: 'Arsenal',
    awayTeam: 'Man City',
    startTime: 'Today, 15:00',
    insights: ['Tactical deadlock likely', 'City strong late', 'Low scoring history']
  },
  {
    id: 'g2',
    sport: 'Basketball',
    league: 'NBA',
    homeTeam: 'Lakers',
    awayTeam: 'Celtics',
    startTime: 'Tonight, 19:30',
    insights: ['Fast pace expected', 'LeBron dominant at home', 'Celtics defense rotation issues']
  },
  {
    id: 'g3',
    sport: 'Football',
    league: 'NFL',
    homeTeam: 'Chiefs',
    awayTeam: '49ers',
    startTime: 'Sun, 18:00',
    insights: ['High-flying offenses', 'Weather may impact field goals', 'Underdog keeps it close']
  },
  {
    id: 'g4',
    sport: 'Soccer',
    league: 'La Liga',
    homeTeam: 'Real Madrid',
    awayTeam: 'Barcelona',
    startTime: 'Tomorrow, 20:00',
    insights: ['Midfield battle key', 'Home crowd advantage', 'Injuries on both sides']
  }
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
    content: 'Value happens when the chances of something happening are better than what the sportsbook odds suggest. It\'s like finding a $10 bill for sale for $8.'
  },
  {
    id: 't3',
    title: 'Why being right isn’t everything',
    content: 'You can be "right" about a favorite winning, but if they only win 60% of the time and the odds suggest 80%, you\'re losing money long-term.'
  },
  {
    id: 't4',
    title: 'Low risk vs high upside',
    content: 'Low risk bets usually have small payouts (favorites). High upside bets are long shots (underdogs) that pay a lot but happen less often.'
  }
];

export const GLOSSARY = [
  { term: 'Moneyline', definition: 'A simple bet on which team will win the game.' },
  { term: 'Spread', definition: 'A bet on the margin of victory. One team is "given" points to even the playing field.' },
  { term: 'Total (Over/Under)', definition: 'A bet on whether the total points scored by both teams will be above or below a certain number.' },
  { term: 'Edge', definition: 'The difference between the actual probability of an event and the implied probability of the odds.' },
  { term: 'Implied Probability', definition: 'The percentage chance of winning suggested by the sportsbook odds.' }
];
