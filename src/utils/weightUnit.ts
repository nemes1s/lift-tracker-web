// Weight unit conversion and formatting utilities

export type WeightUnit = 'kg' | 'lbs';

const KG_TO_LBS = 2.20462;
const LBS_TO_KG = 1 / KG_TO_LBS;

/**
 * Converts weight from kilograms to the specified unit
 * @param weightInKg Weight in kilograms (database storage format)
 * @param targetUnit Target unit for display
 * @returns Converted weight
 */
export function convertWeight(weightInKg: number, targetUnit: WeightUnit): number {
  if (targetUnit === 'lbs') {
    return weightInKg * KG_TO_LBS;
  }
  return weightInKg;
}

/**
 * Converts weight from the specified unit to kilograms (for database storage)
 * @param weight Weight value
 * @param sourceUnit Source unit
 * @returns Weight in kilograms
 */
export function convertToKg(weight: number, sourceUnit: WeightUnit): number {
  if (sourceUnit === 'lbs') {
    return weight * LBS_TO_KG;
  }
  return weight;
}

/**
 * Formats weight with unit
 * @param weightInKg Weight in kilograms (database storage format)
 * @param unit Unit to display
 * @param decimals Number of decimal places (default: 1 for kg, 0 for lbs)
 * @returns Formatted weight string with unit
 */
export function formatWeight(
  weightInKg: number,
  unit: WeightUnit = 'kg',
  decimals?: number
): string {
  const converted = convertWeight(weightInKg, unit);
  const defaultDecimals = unit === 'lbs' ? 0 : 1;
  const displayDecimals = decimals ?? defaultDecimals;

  return `${converted.toFixed(displayDecimals)}${unit}`;
}

/**
 * Gets the appropriate step value for weight input based on unit
 * @param unit Weight unit
 * @returns Step value for input field
 */
export function getWeightStep(unit: WeightUnit): number {
  return unit === 'lbs' ? 1 : 0.5;
}

/**
 * Gets the unit label for display
 * @param unit Weight unit
 * @returns Unit label string
 */
export function getUnitLabel(unit: WeightUnit): string {
  return unit === 'lbs' ? 'lbs' : 'kg';
}
