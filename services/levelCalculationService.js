const db = require('../models');
const Question = db.question;
const Section = db.section;
const Category = db.category;

/**
 * Compute the maturity level for a single section (subcategory).
 * 
 * Questions in a section have levels (1, 2, 3, 4 corresponding to N1-N4).
 * A level is "achieved" only when ALL questions at that level have a positive score (> 0).
 * Levels are evaluated sequentially: if any question at level N2 scores 0, 
 * the section stops at N1 even if N3/N4 are fully scored.
 * 
 * @param {Array} questions - Array of question objects with { id, level, score_value }
 * @param {Record<string, number>} questionScores - Map of question_id -> user's score for that question
 * @returns {number} The highest achieved level (1-4), or 0 if N/A
 */
const computeSectionLevel = (questions, questionScores) => {
  if (!questions || questions.length === 0) return 0;

  // Check if any questions have been answered
  const hasAnyAnswer = questions.some(q => questionScores[q.id] !== undefined);
  if (!hasAnyAnswer) return 0;

  // Group questions by level
  const questionsByLevel = {};
  questions.forEach(q => {
    const level = q.level;
    if (!questionsByLevel[level]) {
      questionsByLevel[level] = [];
    }
    questionsByLevel[level].push(q);
  });

  // Sort levels ascending (1, 2, 3, 4)
  const levels = Object.keys(questionsByLevel)
    .map(Number)
    .sort((a, b) => a - b);

  // Find the highest level where ALL questions have a positive score (> 0)
  let highestLevel = levels[0] || 1; // Start with the lowest available level
  for (const level of levels) {
    const levelQuestions = questionsByLevel[level];
    const allAchieved = levelQuestions.every(
      q => questionScores[q.id] !== undefined && questionScores[q.id] > 0
    );

    if (allAchieved) {
      highestLevel = level;
    } else {
      // Stop at the first level that's not fully achieved
      break;
    }
  }

  return highestLevel;
};

/**
 * Compute the maturity level for a category.
 * Category level = minimum level among all its sections.
 * If any section is 0 (N/A), the entire category is 0 (N/A).
 * 
 * @param {Array<number>} sectionLevels - Array of section level numbers
 * @returns {number} The category level (min of all section levels)
 */
const computeCategoryLevel = (sectionLevels) => {
  if (!sectionLevels || sectionLevels.length === 0) return 0;

  // If any section is N/A (0), the whole category is N/A
  if (sectionLevels.some(level => level === 0)) return 0;

  return Math.min(...sectionLevels);
};

/**
 * Calculate levels for all sections and categories given user answers.
 * 
 * Fetches questions from the database grouped by section/category,
 * then computes levels based on the user's answer scores.
 * 
 * @param {Record<string, Record<string, number>>} subcategoryScores - Scores per subcategory: { categoryName: { sectionName: score } }
 * @param {Record<string, number>} questionScores - Map of question_id -> user's score. If not provided, falls back to flat answer mapping.
 * @returns {Promise<{ categoryLevels: Record<string, number>, sectionLevels: Record<string, Record<string, number>> }>}
 */
const calculateAllLevels = async (subcategoryScores, questionScores = {}) => {
  // Fetch all sections with their questions and parent categories
  const sections = await Section.findAll({
    include: [
      {
        model: Question,
        as: 'questions',
        attributes: ['id', 'level', 'score_value'],
      },
      {
        model: Category,
        as: 'category',
        attributes: ['id', 'name', 'name_fr'],
      },
    ],
  });

  // Build section name -> id mapping and category name -> id mapping
  const sectionLevelsResult = {}; // { categoryName: { sectionName: levelNumber } }
  const categoryLevelsResult = {}; // { categoryName: levelNumber }

  // Group sections by category
  const sectionsByCategory = {};
  sections.forEach(section => {
    const categoryName = section.category?.name;
    const categoryNameFr = section.category?.name_fr;
    if (!categoryName) return;

    if (!sectionsByCategory[categoryName]) {
      sectionsByCategory[categoryName] = [];
    }
    sectionsByCategory[categoryName].push(section);

    // Also map French name for lookup
    if (categoryNameFr && categoryNameFr !== categoryName) {
      if (!sectionsByCategory[categoryNameFr]) {
        sectionsByCategory[categoryNameFr] = [];
      }
      sectionsByCategory[categoryNameFr].push(section);
    }
  });

  // Calculate level for each section
  for (const section of sections) {
    const categoryName = section.category?.name;
    const categoryNameFr = section.category?.name_fr;
    if (!categoryName) continue;

    const sectionTitle = section.title;
    const sectionTitleFr = section.title_fr;
    const questions = section.questions || [];

    const level = computeSectionLevel(questions, questionScores);

    // Store under English category name
    if (!sectionLevelsResult[categoryName]) {
      sectionLevelsResult[categoryName] = {};
    }
    sectionLevelsResult[categoryName][sectionTitle] = level;

    // Also store by French section title under English category
    if (sectionTitleFr && sectionTitleFr !== sectionTitle) {
      sectionLevelsResult[categoryName][sectionTitleFr] = level;
    }

    // Also store under French category name (so lookups from either locale work)
    if (categoryNameFr && categoryNameFr !== categoryName) {
      if (!sectionLevelsResult[categoryNameFr]) {
        sectionLevelsResult[categoryNameFr] = {};
      }
      sectionLevelsResult[categoryNameFr][sectionTitle] = level;
      if (sectionTitleFr && sectionTitleFr !== sectionTitle) {
        sectionLevelsResult[categoryNameFr][sectionTitleFr] = level;
      }
    }
  }

  // Calculate category levels (min of all section levels).
  // Duplicate values (from EN/FR section titles under the same category) are safe
  // because computeCategoryLevel uses Math.min, which is idempotent for duplicates.
  Object.keys(sectionLevelsResult).forEach(categoryName => {
    const sectionLevels = Object.values(sectionLevelsResult[categoryName]);
    categoryLevelsResult[categoryName] = computeCategoryLevel(sectionLevels);
  });

  return {
    categoryLevels: categoryLevelsResult,
    sectionLevels: sectionLevelsResult,
  };
};

module.exports = {
  computeSectionLevel,
  computeCategoryLevel,
  calculateAllLevels,
};
