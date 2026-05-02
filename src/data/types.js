/**
 * @typedef {Object} Achievement
 * @property {number} id - Unique identifier for the achievement
 * @property {string} name - Display name of the achievement
 * @property {number} projectionRate - XP value awarded for completing the achievement
 * @property {string} group - Category group (Collection, Clears, Loadout, Shop, Combat, Adversity - EXTREME, Completionist, Hidden)
 * @property {string[]} keywords - Array of keywords for filtering and searching
 * @property {boolean} completed - Whether the achievement has been completed
 */

export const ACHIEVEMENT_GROUPS = [
  'Collection',
  'Clears',
  'Loadout',
  'Shop',
  'Combat',
  'Adversity - EXTREME',
  'Completionist',
  'Hidden'
];
