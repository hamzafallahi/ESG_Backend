const db = require('../models');
const {
  percentageToLevel,
  applyCoreCap,
} = require('../config/esgScoring');
const { getWeightConfig } = require('./weightConfigService');

const Question = db.question;
const Section = db.section;
const Category = db.category;

const normalizeQuestionId = (id) => String(id || '').trim().replace(/[{}]/g, '').toLowerCase();

const normalizeAnswerValue = (value) => {
  if (typeof value === 'string') {
    return { type: value.toUpperCase() };
  }
  if (value && typeof value === 'object') {
    const normalized = { ...value };
    if (typeof normalized.type === 'string') {
      normalized.type = normalized.type.toUpperCase();
    }
    return normalized;
  }
  return value;
};

const buildNormalizedAnswersMap = (answers) => {
  const map = new Map();
  Object.entries(answers || {}).forEach(([questionId, value]) => {
    const normalizedId = normalizeQuestionId(questionId);
    if (!normalizedId) return;
    map.set(normalizedId, normalizeAnswerValue(value));
  });
  return map;
};

/**
 * Calculate every score (as a percentage) and the single global maturity level
 * from a structured answer map, weighted per section by the company's
 * sub-sector.
 *
 * Answer format per question:
 *   { type: 'YES'|'NN'|'NA'|'NAC', nac_percentage?: number }
 *
 * Per-question contribution to a section ratio:
 *   YES  -> full score_value, included in denominator
 *   NN   -> 0 achieved, included in denominator
 *   NA   -> excluded from denominator (non-core). In a core section, NA is
 *           treated as NN (0 achieved, kept in denominator).
 *   NAC  -> round(score_value * nac_percentage / 100), included in denominator
 *
 * Aggregation (weights are per (sub_sector, section)):
 *   sectionRatio = achieved / denominator                                  (0-1)
 *   sectionPct   = round(sectionRatio * 100)                                (0-100)
 *   pillarPct    = Σ(weight * ratio) / Σ(weight) over sections in category (0-100)
 *   globalScore  = Σ(weight * ratio) / totalWeight * 100                    (0-100)
 *   coreScore    = Σ(weight * ratio) / Σ(weight) over sections where core   (0-100)
 *
 * The global maturity level is derived from globalScore, then capped at N3
 * unless the Core aggregate reaches 60%.
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

  const { weights, total } = await getWeightConfig(subSector);
  const normalizedAnswers = buildNormalizedAnswersMap(answers);

  let unansweredCount = 0;

  // Per-section achieved/denominator totals keyed by section id.
  const sectionTotals = {};
  const coreSectionIds = new Set();
  // categoryName -> [sectionId]
  const sectionsByCategory = {};

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
    const questions = section.questions || [];

    let sectionAchieved = 0;
    let sectionDenominator = 0;

    for (const q of questions) {
      const answer = normalizedAnswers.get(normalizeQuestionId(q.id));

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

    sectionTotals[section.id] = { achieved: sectionAchieved, denominator: sectionDenominator };
    if (isCore) coreSectionIds.add(section.id);
    if (!sectionsByCategory[catName]) sectionsByCategory[catName] = [];
    sectionsByCategory[catName].push(section.id);

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

  // Weighted percentage over a set of section ids.
  const weightedPct = (sectionIds) => {
    let weightedSum = 0;
    let weightSum = 0;
    sectionIds.forEach((id) => {
      const w = weights[id] || 0;
      const totals = sectionTotals[id];
      const r = totals && totals.denominator > 0 ? totals.achieved / totals.denominator : 0;
      weightedSum += w * r;
      weightSum += w;
    });
    return weightSum > 0 ? (weightedSum / weightSum) * 100 : 0;
  };

  // Category (pillar) percentages, mapped onto both EN and FR names.
  const allCategories = await Category.findAll({ attributes: ['name', 'name_fr'] });
  allCategories.forEach((cat) => {
    const sectionIds = sectionsByCategory[cat.name] || [];
    const pct = Math.round(weightedPct(sectionIds));
    categoryScores[cat.name] = pct;
    if (cat.name_fr) categoryScores[cat.name_fr] = pct;
  });

  // Global weighted score (SG) over all sections using the sub-sector total.
  let globalWeightedSum = 0;
  Object.keys(sectionTotals).forEach((id) => {
    const totals = sectionTotals[id];
    const ratio = totals && totals.denominator > 0 ? totals.achieved / totals.denominator : 0;
    globalWeightedSum += (weights[id] || 0) * ratio;
  });
  const globalScoreExact = total > 0 ? (globalWeightedSum / total) * 100 : 0;
  const globalScore = Math.round(globalScoreExact);

  // Aggregate Core-section score and the level gate.
  const coreScoreExact = weightedPct([...coreSectionIds]);
  const coreScore = Math.round(coreScoreExact);

  const rawGlobalLevel = percentageToLevel(globalScoreExact);
  const globalLevel = applyCoreCap(rawGlobalLevel, coreScoreExact);

  // Pillar scores as a flat EN-only shape (kept for backwards compatibility
  // with any caller that still reads pillarScores.Environment/Social/Governance).
  const pillarScores = {
    Environment: categoryScores.Environment ?? 0,
    Social: categoryScores.Social ?? 0,
    Governance: categoryScores.Governance ?? 0,
  };

  return {
    globalScore,
    globalLevel,
    rawGlobalLevel,
    coreScore,
    pillarScores,
    categoryScores,
    subcategoryScores,
    unansweredCount,
    // Resolved weight set used for this calculation — persisted on the Result
    // so historical scores remain reproducible if weights are later edited.
    scoringSnapshot: {
      sub_sector: subSector || null,
      total,
      weights,
    },
  };
};

module.exports = {
  percentageToLevel,
  applyCoreCap,
  calculateAllScoresAndLevels,
};
