'use strict';

/**
 * Helpers for the normalized assessment progress answers.
 *
 * The public API keeps exposing/accepting `answers` as a JSON object
 * ({ [questionId]: { type, nac_percentage?, justification? } }), but answers
 * are persisted as rows in `assessment_progress_answers`.
 */
const db = require('../models');

const ProgressAnswer = db.assessment_progress_answer;
const Justification = db.justification;
const ANSWER_TYPES = ['YES', 'NN', 'NA', 'NAC'];

const hasCompleteJustification = (answer) => {
  const j = answer?.justification;
  return Boolean(
    answer?.type === 'YES' &&
    j &&
    j.proof_type &&
    j.description &&
    j.description.length >= 50 &&
    j.document_date
  );
};

const upsertJustification = async (questionId, answer, existingJustificationId, transaction) => {
  if (!hasCompleteJustification(answer)) {
    return null;
  }

  const j = answer.justification;
  const payload = {
    question_id: questionId,
    proof_type: j.proof_type,
    description: j.description,
    document_date: j.document_date,
    reference_number: j.reference_number || null,
    evaluator_comment: j.evaluator_comment || null,
    attachments: j.attachment_urls || [],
  };

  if (existingJustificationId) {
    const existing = await Justification.findByPk(existingJustificationId, { transaction });
    if (existing) {
      await existing.update(payload, { transaction });
      return existing.id;
    }
  }

  const created = await Justification.create(payload, { transaction });
  return created.id;
};

const deleteOrphanJustifications = async (justificationIds, transaction) => {
  const uniqueIds = [...new Set((justificationIds || []).filter(Boolean))];
  if (uniqueIds.length === 0) return;

  for (const id of uniqueIds) {
    const refs = await ProgressAnswer.count({
      where: { justification_id: id },
      transaction
    });
    if (refs === 0) {
      await Justification.destroy({ where: { id }, transaction });
    }
  }
};

/**
 * Load all answer rows for a progress record and compose the legacy-shaped
 * answers object.
 */
const composeAnswers = async (progressId, options = {}) => {
  const rows = await ProgressAnswer.findAll({
    where: { assessment_progress_id: progressId },
    include: [{ model: Justification, as: 'justification_record', required: false }],
    ...options
  });

  const answers = {};
  rows.forEach((row) => {
    answers[row.question_id] = row.toAnswerValue();
  });
  return answers;
};

/**
 * Full-sync the answer rows of a progress record with the provided answers
 * object (rows missing from the payload are removed, existing ones are
 * updated, new ones are inserted).
 *
 * @returns {Promise<number>} the number of answers after the sync
 */
const syncAnswers = async (progress, answersObject = {}, transaction = null) => {
  const existingRows = await ProgressAnswer.findAll({
    where: { assessment_progress_id: progress.id },
    include: [{ model: Justification, as: 'justification_record', required: false }],
    transaction
  });

  const existingByQuestion = new Map(existingRows.map((row) => [row.question_id, row]));

  const validEntries = Object.entries(answersObject || {}).filter(
    ([, answer]) => answer && typeof answer === 'object' && ANSWER_TYPES.includes(answer.type)
  );
  const incomingQuestionIds = new Set(validEntries.map(([questionId]) => questionId));

  // Remove answers no longer present in the payload
  const idsToDelete = existingRows
    .filter((row) => !incomingQuestionIds.has(row.question_id))
    .map((row) => row.id);

  const justificationsToMaybeDelete = existingRows
    .filter((row) => !incomingQuestionIds.has(row.question_id))
    .map((row) => row.justification_id)
    .filter(Boolean);

  if (idsToDelete.length > 0) {
    await ProgressAnswer.destroy({ where: { id: idsToDelete }, transaction });
    await deleteOrphanJustifications(justificationsToMaybeDelete, transaction);
  }

  // Upsert incoming answers
  for (const [questionId, answer] of validEntries) {
    const existing = existingByQuestion.get(questionId);
    const justificationId = await upsertJustification(
      questionId,
      answer,
      existing?.justification_id || null,
      transaction
    );

    if (!justificationId && existing?.justification_id) {
      await deleteOrphanJustifications([existing.justification_id], transaction);
    }

    const payload = {
      answer_type: answer.type,
      nac_percentage:
        answer.type === 'NAC' && answer.nac_percentage !== undefined && answer.nac_percentage !== null
          ? Math.round(Number(answer.nac_percentage))
          : null,
      justification_id: justificationId
    };

    if (existing) {
      await existing.update(payload, { transaction });
    } else {
      await ProgressAnswer.create(
        {
          assessment_progress_id: progress.id,
          question_id: questionId,
          ...payload
        },
        { transaction }
      );
    }
  }

  return validEntries.length;
};

/**
 * Compute the progress metric fields from an answer count.
 */
const computeMetrics = (answeredCount, totalQuestions) => {
  const total = Number(totalQuestions) || 0;
  return {
    answered_questions: answeredCount,
    completion_percentage:
      total > 0 ? Math.min(100, Number(((answeredCount / total) * 100).toFixed(2))) : 0
  };
};

module.exports = {
  composeAnswers,
  syncAnswers,
  computeMetrics
};
