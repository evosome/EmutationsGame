/**
 * Calculate the luck drift value.
 * The drift is a random number in the range [-luck/2, 0.85-luck].
 * This value will be added to the player's luck to create variation.
 * 
 * @param luck - Current luck multiplier (0 to 1)
 * @returns The luck drift value (can be positive or negative)
 */
export function calculateLuckDrift(luck: number = 0): number {
  // Calculate the range boundaries
  const minDrift = -luck / 2;
  const maxDrift = 0.965 - luck;
  
  // Generate random drift within the range
  const drift = minDrift + Math.random() * (maxDrift - minDrift);
  
  return drift;
}