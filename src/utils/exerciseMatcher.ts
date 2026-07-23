import { getAllDefinitionNames } from './exerciseLibrary';

export const CONFIDENT_THRESHOLD = 0.75;
export const POSSIBLE_THRESHOLD = 0.55;

function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function trigrams(s: string): Set<string> {
  const padded = `  ${s}  `;
  const result = new Set<string>();
  for (let i = 0; i < padded.length - 2; i++) {
    result.add(padded.slice(i, i + 3));
  }
  return result;
}

function trigramScore(a: string, b: string): number {
  const ta = trigrams(a);
  const tb = trigrams(b);
  let intersection = 0;
  for (const t of ta) {
    if (tb.has(t)) intersection++;
  }
  return (2 * intersection) / (ta.size + tb.size);
}

function wordScore(a: string, b: string): number {
  const wa = new Set(a.split(' ').filter(Boolean));
  const wb = new Set(b.split(' ').filter(Boolean));
  let intersection = 0;
  for (const w of wa) {
    if (wb.has(w)) intersection++;
  }
  return (2 * intersection) / (wa.size + wb.size);
}

let _canonicalNormalized: { name: string; normalized: string }[] | null = null;

function getCanonicalNormalized() {
  if (!_canonicalNormalized) {
    _canonicalNormalized = getAllDefinitionNames().map(name => ({
      name,
      normalized: normalize(name),
    }));
  }
  return _canonicalNormalized;
}

export function findBestMatch(
  userExerciseName: string
): { canonical: string; score: number } | null {
  const normUser = normalize(userExerciseName);
  if (!normUser) return null;

  let bestScore = 0;
  let bestName = '';

  for (const { name, normalized } of getCanonicalNormalized()) {
    // Exact match short-circuit
    if (normalized === normUser) return { canonical: name, score: 1 };

    const score = Math.max(trigramScore(normUser, normalized), wordScore(normUser, normalized) * 0.9);
    if (score > bestScore) {
      bestScore = score;
      bestName = name;
    }
  }

  if (bestScore < POSSIBLE_THRESHOLD) return null;
  return { canonical: bestName, score: bestScore };
}

export function findTopMatches(
  userExerciseName: string,
  n = 5
): { canonical: string; score: number }[] {
  const normUser = normalize(userExerciseName);
  if (!normUser) return [];

  const scored: { canonical: string; score: number }[] = [];

  for (const { name, normalized } of getCanonicalNormalized()) {
    if (normalized === normUser) return [{ canonical: name, score: 1 }];
    const score = Math.max(trigramScore(normUser, normalized), wordScore(normUser, normalized) * 0.9);
    if (score >= POSSIBLE_THRESHOLD) {
      scored.push({ canonical: name, score });
    }
  }

  scored.sort((a, b) => b.score - a.score);
  return scored.slice(0, n);
}
