
import { normalize } from 'path'; // Actually we will implement our own

export const normalizeText = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/[^\w\s]/gi, '') // Remove punctuation
    .replace(/\s+/g, ' ')      // Collapse whitespace
    .trim();
};

/**
 * rankScore(variants, query)
 * Examples:
 * - query "mci" matches "Manchester City" (shortName: MCI) -> High Score
 * - query "prem" matches "Premier League" -> Medium Score
 * - query "ars" matches "Arsenal" -> High Score
 */
export const rankScore = (variants: string[], query: string): number => {
  const normQuery = normalizeText(query);
  if (!normQuery) return 0;

  let maxScore = 0;
  variants.forEach((v, index) => {
    const normV = normalizeText(v);
    let score = 0;

    if (normV === normQuery) {
      score = 100; // Exact match
    } else if (normV.startsWith(normQuery)) {
      score = 50;  // Starts with
    } else if (normV.includes(normQuery)) {
      score = 20;  // Contains
    }

    // Short name bonus (usually variants[1] if passed [fullName, shortName])
    if (index === 1 && score > 0) score += 25;

    if (score > maxScore) maxScore = score;
  });

  return maxScore;
};

import { Team, League, Player, Sport } from '../types';
import { TEAMS, LEAGUES, PLAYERS } from '../constants';

interface SearchOptions {
  sportFilter?: Sport | 'All';
  typeFilter?: 'All' | 'Teams' | 'Leagues' | 'Players';
}

export const searchAll = (query: string, options: SearchOptions) => {
  const { sportFilter = 'All', typeFilter = 'All' } = options;
  const q = normalizeText(query);

  if (!q) return { teams: [], leagues: [], players: [] };

  const results = {
    teams: [] as (Team & { score: number })[],
    leagues: [] as (League & { score: number })[],
    players: [] as (Player & { score: number })[],
  };

  // Search Teams
  if (typeFilter === 'All' || typeFilter === 'Teams') {
    results.teams = TEAMS
      .filter(t => sportFilter === 'All' || t.sportId === sportFilter)
      .map(t => ({ ...t, score: rankScore([t.name, t.shortName], q) }))
      .filter(t => t.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Search Leagues
  if (typeFilter === 'All' || typeFilter === 'Leagues') {
    results.leagues = LEAGUES
      .filter(l => sportFilter === 'All' || l.sport === sportFilter)
      .map(l => ({ ...l, score: rankScore([l.name, l.shortName], q) }))
      .filter(l => l.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  // Search Players
  if (typeFilter === 'All' || typeFilter === 'Players') {
    results.players = PLAYERS
      .filter(p => sportFilter === 'All' || p.sportId === sportFilter)
      .map(p => ({ ...p, score: rankScore([p.name, p.shortName], q) }))
      .filter(p => p.score > 0)
      .sort((a, b) => b.score - a.score);
  }

  return results;
};
