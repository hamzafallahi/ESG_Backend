'use strict';

/**
 * ESG scoring configuration.
 *
 * Domain codes have been removed; weights are now stored per (sub_sector,
 * section) in the database (see services/weightConfigService). This file now
 * only exposes the level thresholds and the Core-cap rule.
 */

/**
 * Maturity level thresholds, evaluated on a percentage score (0-100).
 *   S0  : 0-19   Unstructured
 *   N1  : 20-39  Initial
 *   N2  : 40-59  Structured
 *   N3  : 60-79  Mastered
 *   N4  : 80-84  Mature
 *   N4+ : >= 85  Leadership
 */
const LEVEL_THRESHOLDS = [
  { code: 'S0', min: 0, max: 19.999999 },
  { code: 'N1', min: 20, max: 39.999999 },
  { code: 'N2', min: 40, max: 59.999999 },
  { code: 'N3', min: 60, max: 79.999999 },
  { code: 'N4', min: 80, max: 84.999999 },
  { code: 'N4+', min: 85, max: 100 },
];

const CORE_MIN_FOR_TOP_LEVEL = 60; // Core aggregate must reach 60% for N4 / N4+.

/** Convert a percentage (0-100) to a maturity level code. */
const percentageToLevel = (pct) => {
  const value = Number.isFinite(pct) ? Math.max(0, Math.min(100, pct)) : 0;
  const match = LEVEL_THRESHOLDS.find((t) => value >= t.min && value <= t.max);
  return match ? match.code : 'S0';
};

/**
 * Apply the Core-section gate: cap the level at N3 when the aggregate Core
 * score is below CORE_MIN_FOR_TOP_LEVEL.
 */
const applyCoreCap = (level, coreScore) => {
  if ((level === 'N4' || level === 'N4+') && coreScore < CORE_MIN_FOR_TOP_LEVEL) {
    return 'N3';
  }
  return level;
};

module.exports = {
  LEVEL_THRESHOLDS,
  CORE_MIN_FOR_TOP_LEVEL,
  percentageToLevel,
  applyCoreCap,
};
