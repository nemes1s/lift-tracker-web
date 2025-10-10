// One Rep Max calculation formulas

export const OneRMFormula = {
  Epley: 'epley',
  Brzycki: 'brzycki',
} as const;

export type OneRMFormula = typeof OneRMFormula[keyof typeof OneRMFormula];

export function estimate1RM(weight: number, reps: number, formula: OneRMFormula = 'epley'): number {
  if (reps === 1) return weight;

  switch (formula) {
    case 'epley':
      return weight * (1 + reps / 30);
    case 'brzycki':
      return weight * (36 / (37 - reps));
    default:
      return weight * (1 + reps / 30);
  }
}

export function calculateWorkingWeight(oneRM: number, percentage: number): number {
  return Math.round((oneRM * percentage) / 2.5) * 2.5; // Round to nearest 2.5kg
}
