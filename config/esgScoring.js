'use strict';

/**
 * ESG scoring configuration.
 *
 * - DOMAIN codes map each of the 19 evaluation sections to a pillar domain
 *   (E1-E5 Environment, S1-S7 Social, G1-G7 Governance).
 * - SUBSECTOR_WEIGHTS hold the per-domain weights for each automotive
 *   sub-sector. Every sub-sector's weights sum to TOTAL_WEIGHT (955).
 * - The global score (SG) is the weighted average of the per-domain ratios:
 *       SG = ( Σ weight[domain] * ratio[domain] / TOTAL_WEIGHT ) * 100
 * - Maturity level is derived purely from a percentage score.
 */

const TOTAL_WEIGHT = 955;

// Map English section title -> domain code.
const SECTION_TITLE_TO_CODE = {
  // Governance
  'The vision, strategy and governance of the CSR approach': 'G1',
  'Ethical approach: Anti-corruption policy and business ethics / Due diligence': 'G2',
  'Relationship with clients and consumers': 'G3',
  'Transparency: Executive Compensation': 'G4',
  'Governance: Independence of the Board of Directors': 'G5',
  'Feminization of management': 'G6',
  'Data confidentiality and privacy protection': 'G7',
  // Social
  'Working conditions: Compliance with regulatory standards in labor matters': 'S1',
  'Working conditions: health and safety at work': 'S2',
  'Working conditions: Equal pay': 'S3',
  'Working conditions: Employee training': 'S4',
  'Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people': 'S5',
  'Community engagement and commitment to local communities': 'S6',
  'Social dialogue: Relationship with unions and staff representatives': 'S7',
  // Environment
  'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint': 'E1',
  'Energy Management': 'E2',
  'Pollution: water use/pollution, waste management': 'E3',
  'Circular economy': 'E4',
  'Impact on biodiversity': 'E5',
};

// Domain code -> pillar (category) English name.
const CODE_TO_PILLAR = {
  E: 'Environment',
  S: 'Social',
  G: 'Governance',
};

const pillarForCode = (code) => CODE_TO_PILLAR[code?.charAt(0)] || null;

// Per-subsector domain weights. Each object sums to TOTAL_WEIGHT (955).
const SUBSECTOR_WEIGHTS = {
  TS: {
    E1: 39.9, E2: 49.5, E3: 63.2, E4: 57.7, E5: 37.9,
    S1: 54.9, S2: 80.4, S3: 54.9, S4: 54.9, S5: 90.1, S6: 47.2, S7: 30,
    G1: 49.9, G2: 39.9, G3: 49.9, G4: 27, G5: 37.9, G6: 44.9, G7: 44.9,
  },
  FF: {
    E1: 44.8, E2: 60.3, E3: 56.2, E4: 56.2, E5: 37,
    S1: 53.6, S2: 81.8, S3: 53.6, S4: 58.9, S5: 87.9, S6: 48.2, S7: 29.2,
    G1: 48.7, G2: 39, G3: 48.7, G4: 26.3, G5: 37, G6: 43.8, G7: 43.8,
  },
  PL: {
    E1: 41.3, E2: 52.6, E3: 54.1, E4: 74.8, E5: 37.4,
    S1: 54.1, S2: 68.9, S3: 54.1, S4: 54.1, S5: 93.5, S6: 44.6, S7: 29.7,
    G1: 49.4, G2: 45.5, G3: 49.4, G4: 28.2, G5: 39.5, G6: 48.9, G7: 62.3,
  },
  CA: {
    E1: 31.6, E2: 35.1, E3: 40.8, E4: 57.1, E5: 37.6,
    S1: 59.8, S2: 72.7, S3: 62.5, S4: 57.1, S5: 103.3, S6: 44.6, S7: 29.7,
    G1: 49.4, G2: 45.5, G3: 49.4, G4: 28.2, G5: 39.5, G6: 48.9, G7: 62.3,
  },
  EE: {
    E1: 32, E2: 22.5, E3: 35.8, E4: 66, E5: 36,
    S1: 49.5, S2: 63, S3: 57.8, S4: 68.8, S5: 95, S6: 40.5, S7: 30,
    G1: 50, G2: 46, G3: 50, G4: 28.5, G5: 40, G6: 47.3, G7: 96.3,
  },
  MP: {
    E1: 35.6, E2: 44, E3: 59.8, E4: 57.1, E5: 37.6,
    S1: 54.4, S2: 76.1, S3: 54.4, S4: 59.8, S5: 89.1, S6: 44.5, S7: 29.7,
    G1: 49.4, G2: 39.5, G3: 61.8, G4: 26.7, G5: 37.6, G6: 44.5, G7: 53.4,
  },
};

// All 19 domain codes (used for the uniform fallback when a sub-sector is unknown).
const ALL_CODES = Object.keys(SUBSECTOR_WEIGHTS.TS);

/**
 * Resolve the weight map for a given sub-sector.
 * Falls back to uniform weights (every domain = 1) when the sub-sector is
 * missing or unknown, so scoring still works.
 *
 * @param {string|null|undefined} subSector
 * @returns {{ weights: Record<string, number>, total: number }}
 */
const getWeightConfig = (subSector) => {
  const key = (subSector || '').toUpperCase();
  if (SUBSECTOR_WEIGHTS[key]) {
    return { weights: SUBSECTOR_WEIGHTS[key], total: TOTAL_WEIGHT };
  }
  const weights = {};
  ALL_CODES.forEach((code) => { weights[code] = 1; });
  return { weights, total: ALL_CODES.length };
};

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

/**
 * Convert a percentage (0-100) to a maturity level code.
 * @param {number} pct
 * @returns {'S0'|'N1'|'N2'|'N3'|'N4'|'N4+'}
 */
const percentageToLevel = (pct) => {
  const value = Number.isFinite(pct) ? pct : 0;
  const match = LEVEL_THRESHOLDS.find((t) => value >= t.min && value <= t.max);
  return match ? match.code : 'S0';
};

/**
 * Apply the Core-domain gate: a company can only reach N4 / N4+ (Leadership)
 * when the aggregate Core-domain score is at least 60%. Otherwise the level is
 * capped at N3.
 *
 * @param {string} level     - Level derived from the global score.
 * @param {number} coreScore - Aggregate Core-domain percentage (0-100).
 * @returns {string}
 */
const applyCoreCap = (level, coreScore) => {
  if ((level === 'N4' || level === 'N4+') && coreScore < CORE_MIN_FOR_TOP_LEVEL) {
    return 'N3';
  }
  return level;
};

module.exports = {
  TOTAL_WEIGHT,
  SECTION_TITLE_TO_CODE,
  CODE_TO_PILLAR,
  SUBSECTOR_WEIGHTS,
  LEVEL_THRESHOLDS,
  CORE_MIN_FOR_TOP_LEVEL,
  pillarForCode,
  getWeightConfig,
  percentageToLevel,
  applyCoreCap,
};
