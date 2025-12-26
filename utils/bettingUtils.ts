
export const americanToImplied = (american: number): number => {
  if (american > 0) {
    return 100 / (american + 100);
  } else {
    const abs = Math.abs(american);
    return abs / (abs + 100);
  }
};

export const decimalToImplied = (decimal: number): number => {
  return 1 / decimal;
};

export const impliedToAmerican = (implied: number): string => {
  if (implied >= 0.5) {
    const odds = Math.round((implied / (1 - implied)) * -100);
    return odds.toString();
  } else {
    const odds = Math.round(((1 - implied) / implied) * 100);
    return `+${odds}`;
  }
};

export const getProbabilityMock = (gameTitle: string, selection: string): number => {
  // A pseudo-random but stable probability for mock purposes
  const str = gameTitle + selection;
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const normalized = Math.abs(hash % 100) / 100;
  // Keep it within a realistic 10-90% range
  return 0.1 + (normalized * 0.8);
};
