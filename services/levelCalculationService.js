const db = require('../models');
const {
  SECTION_TITLE_TO_CODE,
  pillarForCode,
  getWeightConfig,
  percentageToLevel,
  applyCoreCap,
} = require('../config/esgScoring');

const Question = db.question;
const Section = db.section;
const Category = db.category;

/**
 * Resolve the domain code for a section. Prefers an explicit `code` column,
 * then falls back to a mapping on the English/French title.
 */
const resolveSectionCode = (section) => {
  return (
    section.code ||
    SECTION_TITLE_TO_CODE[section.title] ||
    SECTION_TITLE_TO_CODE[section.title_fr] ||
    null
  );
};

/**
 * Calculate every score (as a percentage) and the single global maturity level
 * from a structured answer map, weighted by the company's sub-sector.
 *
 * Answer format per question:
 *   { type: 'YES'|'NN'|'NA'|'NAC', nac_percentage?: number }
 *
 * Per-question contribution to a section ratio:
 *   YES  -> full score_value, included in denominator
 *   NN   -> 0 achieved, included in denominator
 *   NA   -> excluded from denominator (non-core). In a core section NA is
 *           treated as NN (0 achieved, kept in denominator).
 *   NAC  -> round(score_value * nac_percentage / 100), included in denominator
 *
 * Aggregation:
 *   sectionRatio = achieved / denominator                          (0-1)
 *   sectionPct   = round(sectionRatio * 100)                        (0-100)
 *   pillarPct    = Σ(weight * ratio) / Σ(weight) over pillar        (0-100)
 *   globalScore  = Σ(weight * ratio) / TOTAL_WEIGHT * 100           (0-100)
 *   coreScore    = Σ(weight * ratio) / Σ(weight) over core domains  (0-100)
 *
 * The global maturity level is derived from globalScore, then capped at N3
 * unless the Core aggregate reaches 60%.
 *
 * @param {Record<string, { type: string, nac_percentage?: number }>} answers
 * @param {string|null} subSector
 */
const calculateAllScoresAndLevels = async (answers, subSector) => {
  const sections = await Section.findAll({
    include: [
      {
        model: Question,
        as: 'questions',
        attributes: ['id', 'score_value'],
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'name_fr'],
      },
    ],
  });

  const { weights, total } = getWeightConfig(subSector);

  let unansweredCount = 0;

  // Per-domain ratio (0-1), keyed by domain code.
  const domainRatios = {};
  const coreCodes = new Set();

  const categoryScores = {};      // pillar percentage, keyed EN (+ FR)
  const subcategoryScores = {};   // { catName: { secTitle: pct } } EN (+ FR)

  const setNested = (obj, catKey, secKey, value) => {
    if (!obj[catKey]) obj[catKey] = {};
    obj[catKey][secKey] = value;
  };

  for (const section of sections) {
    const catName = section.category?.name;
    const catNameFr = section.category?.name_fr;
    if (!catName) continue;

    const secTitle = section.title;
    const secTitleFr = section.title_fr;
    const isCore = section.core === true;
    const code = resolveSectionCode(section);
    const questions = section.questions || [];

    let sectionAchieved = 0;
    let sectionDenominator = 0;

    for (const q of questions) {
      const answer = answers[q.id];

      if (!answer || !answer.type) {
        unansweredCount++;
        continue;
      }

      const scoreValue = q.score_value || 0;

      switch (answer.type) {
        case 'YES':
          sectionAchieved += scoreValue;
          sectionDenominator += scoreValue;
          break;

        case 'NN':
          sectionDenominator += scoreValue;
          break;

        case 'NA':
          if (isCore) {
            // Core section: NA is not allowed — treat it as NN.
            sectionDenominator += scoreValue;
          }
          break;

        case 'NAC': {
          const pct = Math.min(100, Math.max(0, answer.nac_percentage || 0));
          sectionAchieved += Math.round(scoreValue * pct / 100);
          sectionDenominator += scoreValue;
          break;
        }

        default:
          unansweredCount++;
      }
    }

    const sectionRatio = sectionDenominator > 0 ? sectionAchieved / sectionDenominator : 0;
    const sectionPct = Math.round(sectionRatio * 100);

    if (code) {
      domainRatios[code] = sectionRatio;
      if (isCore) coreCodes.add(code);
    }

    // Section percentage, indexed under EN + FR category / section names.
    setNested(subcategoryScores, catName, secTitle, sectionPct);
    if (secTitleFr && secTitleFr !== secTitle) {
      setNested(subcategoryScores, catName, secTitleFr, sectionPct);
    }
    if (catNameFr && catNameFr !== catName) {
      setNested(subcategoryScores, catNameFr, secTitle, sectionPct);
      if (secTitleFr && secTitleFr !== secTitle) {
        setNested(subcategoryScores, catNameFr, secTitleFr, sectionPct);
      }
    }
  }

  // Weighted percentage over a set of domain codes.
  const weightedPct = (codes) => {
    let weightedSum = 0;
    let weightSum = 0;
    codes.forEach((code) => {
      const w = weights[code] || 0;
      const r = domainRatios[code] || 0;
      weightedSum += w * r;
      weightSum += w;
    });
    return weightSum > 0 ? (weightedSum / weightSum) * 100 : 0;
  };

  // Pillar (category) percentages.
  const pillarCodes = { Environment: [], Social: [], Governance: [] };
  Object.keys(domainRatios).forEach((code) => {
    const pillar = pillarForCode(code);
    if (pillar && pillarCodes[pillar]) pillarCodes[pillar].push(code);
  });

  const pillarScores = {
    Environment: Math.round(weightedPct(pillarCodes.Environment)),
    Social: Math.round(weightedPct(pillarCodes.Social)),
    Governance: Math.round(weightedPct(pillarCodes.Governance)),
  };

  // Map pillar scores onto category names (EN + FR) for result_categories.
  const allCategories = await Category.findAll({ attributes: ['name', 'name_fr'] });
  allCategories.forEach((cat) => {
    const pillarPct = pillarScores[cat.name];
    if (pillarPct !== undefined) {
      categoryScores[cat.name] = pillarPct;
      if (cat.name_fr) categoryScores[cat.name_fr] = pillarPct;
    }
  });

  // Global weighted score (SG) over all domains using the sub-sector total.
  let globalWeightedSum = 0;
  Object.keys(domainRatios).forEach((code) => {
    globalWeightedSum += (weights[code] || 0) * (domainRatios[code] || 0);
  });
  const globalScoreExact = total > 0 ? (globalWeightedSum / total) * 100 : 0;
  const globalScore = Math.round(globalScoreExact);

  // Aggregate Core-domain score and the level gate.
  const coreScoreExact = weightedPct([...coreCodes]);
  const coreScore = Math.round(coreScoreExact);

  const rawGlobalLevel = percentageToLevel(globalScoreExact);
  const globalLevel = applyCoreCap(rawGlobalLevel, coreScoreExact);

  return {
    globalScore,
    globalLevel,
    rawGlobalLevel,
    coreScore,
    pillarScores,
    categoryScores,
    subcategoryScores,
    unansweredCount,
  };
};

module.exports = {
  percentageToLevel,
  applyCoreCap,
  calculateAllScoresAndLevels,
};

