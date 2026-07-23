import { db } from '../db/database';
import { findTopMatches, CONFIDENT_THRESHOLD, POSSIBLE_THRESHOLD } from './exerciseMatcher';

export interface MigrationMatch {
  original: string;
  canonical: string;
  score: number;
  confidence: 'high' | 'medium' | 'none';
  alternatives: string[];
}

export async function previewMigration(): Promise<MigrationMatch[]> {
  const allTemplates = await db.exerciseTemplates.toArray();
  const allInstances = await db.exerciseInstances.toArray();

  const nameSet = new Set<string>();
  for (const t of allTemplates) nameSet.add(t.name);
  for (const i of allInstances) nameSet.add(i.name);

  const results: MigrationMatch[] = [];

  for (const name of nameSet) {
    const tops = findTopMatches(name, 6);
    if (tops.length === 0) continue;

    const best = tops[0];
    if (best.canonical === name) continue;

    const confidence: MigrationMatch['confidence'] =
      best.score >= CONFIDENT_THRESHOLD
        ? 'high'
        : best.score >= POSSIBLE_THRESHOLD
        ? 'medium'
        : 'none';

    if (confidence === 'none') continue;

    results.push({
      original: name,
      canonical: best.canonical,
      score: best.score,
      confidence,
      alternatives: tops.slice(1).map(t => t.canonical),
    });
  }

  // Sort: high confidence first, then by score desc
  results.sort((a, b) => {
    if (a.confidence !== b.confidence) {
      return a.confidence === 'high' ? -1 : 1;
    }
    return b.score - a.score;
  });

  // Deduplicate by original (should already be unique from Set, but be safe)
  const seen = new Set<string>();
  return results.filter(r => {
    if (seen.has(r.original)) return false;
    seen.add(r.original);
    return true;
  });
}

export async function applyMigration(renames: Map<string, string>): Promise<void> {
  if (renames.size === 0) return;

  await db.transaction(
    'rw',
    [db.exerciseTemplates, db.exerciseInstances, db.personalRecords, db.settings],
    async () => {
      // Update exerciseTemplates
      const templates = await db.exerciseTemplates.toArray();
      for (const t of templates) {
        const newName = renames.get(t.name);
        if (newName) await db.exerciseTemplates.update(t.id, { name: newName });
      }

      // Update exerciseInstances
      const instances = await db.exerciseInstances.toArray();
      for (const i of instances) {
        const newName = renames.get(i.name);
        if (newName) await db.exerciseInstances.update(i.id, { name: newName });
      }

      // Update personalRecords
      const prs = await db.personalRecords.toArray();
      for (const pr of prs) {
        const newName = renames.get(pr.exerciseName);
        if (newName) await db.personalRecords.update(pr.id, { exerciseName: newName });
      }

      // Mark migration complete in settings
      const settings = await db.settings.toCollection().first();
      if (settings) {
        await db.settings.update(settings.id, { exerciseMigrationComplete: true });
      }
    }
  );
}
