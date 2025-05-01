/**
 * Validates the competitors array.
 * 
 * @param {Array<{seed: number, name: string}>} competitors - Array of competitors
 * @throws {RangeError} If more than 20 competitors
 * @throws {TypeError} If seeds are not unique or not 1...N
 */
export function validateCompetitors(competitors) {
  if (competitors.length > 20) {
    throw new RangeError("Division cap exceeded");
  }
  
  // Check if seeds are unique and in range 1...N
  const seeds = competitors.map(c => c.seed);
  const uniqueSeeds = new Set(seeds);
  
  if (uniqueSeeds.size !== competitors.length) {
    throw new TypeError("Seeds must be unique");
  }
  
  for (const seed of seeds) {
    if (!Number.isInteger(seed) || seed < 1 || seed > competitors.length) {
      throw new TypeError(`Seeds must be integers from 1 to ${competitors.length}`);
    }
  }
}

/**
 * Generates 32 slots with proper seeding, inserting BYEs where needed.
 * 
 * @param {Array<{seed: number, name: string}>} competitors - Array of competitors
 * @returns {Array<{seed: number|null, name: string|null}>} - 32 slots with competitors or BYEs
 */
export function generateSlots(competitors) {
  validateCompetitors(competitors);

  // Standard 32-slot balanced seeding (bit-reverse order)
  const seedOrder = [
    1, 32, 16, 17, 8, 25, 9, 24, 4, 29, 13, 20, 5, 28, 12, 21,
    2, 31, 15, 18, 7, 26, 10, 23, 3, 30, 14, 19, 6, 27, 11, 22
  ];
  
  // Create a map of seed -> competitor for quick lookup
  const competitorMap = new Map();
  competitors.forEach(c => competitorMap.set(c.seed, c));
  
  // Generate slots based on the seeding order
  const slots = seedOrder.map(seed => {
    if (seed > competitors.length) {
      // This is a BYE
      return { seed: null, name: null };
    } else {
      const competitor = competitorMap.get(seed);
      return { seed: competitor.seed, name: competitor.name };
    }
  });
  
  return slots;
}

/**
 * Generates a tournament bracket with 32 slots, balanced seeding, and automatic BYE insertion.
 * 
 * @param {Array<{seed: number, name: string}>} competitors - Array of competitors (max 20)
 * @returns {Array<{seed: number|null, name: string|null}>} - 32 slots with competitors or BYEs
 */
export function generateBracket(competitors) {
  return { slots: generateSlots(competitors) };
}