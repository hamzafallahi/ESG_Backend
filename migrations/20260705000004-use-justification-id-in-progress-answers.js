'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_progress_answers',
        'justification_id',
        {
          type: Sequelize.UUID,
          allowNull: true,
          references: {
            model: 'justifications',
            key: 'id'
          },
          onDelete: 'SET NULL'
        },
        { transaction }
      );

      await queryInterface.addIndex(
        'assessment_progress_answers',
        ['justification_id'],
        {
          name: 'idx_progress_answers_justification_id',
          transaction
        }
      );

      const rows = await queryInterface.sequelize.query(
        `
          SELECT id, question_id, justification
          FROM assessment_progress_answers
          WHERE justification IS NOT NULL
        `,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      for (const row of rows) {
        const j = row.justification;
        if (!j || typeof j !== 'object') continue;

        const hasCompleteData =
          j.proof_type &&
          j.description &&
          String(j.description).length >= 50 &&
          j.document_date;

        if (!hasCompleteData) continue;

        const [insertedRows] = await queryInterface.sequelize.query(
          `
            INSERT INTO justifications
              (question_id, proof_type, description, attachments, document_date, reference_number, evaluator_comment, created_at, updated_at)
            VALUES
              (:questionId, :proofType, :description, CAST(:attachments AS jsonb), :documentDate, :referenceNumber, :evaluatorComment, NOW(), NOW())
            RETURNING id
          `,
          {
            replacements: {
              questionId: row.question_id,
              proofType: j.proof_type,
              description: j.description,
              attachments: JSON.stringify(j.attachment_urls || []),
              documentDate: j.document_date,
              referenceNumber: j.reference_number || null,
              evaluatorComment: j.evaluator_comment || null,
            },
            transaction,
          }
        );

        const justificationId = insertedRows?.[0]?.id;
        if (justificationId) {
          await queryInterface.sequelize.query(
            `
              UPDATE assessment_progress_answers
              SET justification_id = :justificationId
              WHERE id = :answerId
            `,
            {
              replacements: {
                justificationId,
                answerId: row.id,
              },
              transaction,
            }
          );
        }
      }

      await queryInterface.removeColumn('assessment_progress_answers', 'justification', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      await queryInterface.addColumn(
        'assessment_progress_answers',
        'justification',
        {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: null
        },
        { transaction }
      );

      await queryInterface.sequelize.query(
        `
          UPDATE assessment_progress_answers a
          SET justification = jsonb_build_object(
            'proof_type', j.proof_type,
            'description', j.description,
            'document_date', j.document_date,
            'reference_number', j.reference_number,
            'evaluator_comment', j.evaluator_comment,
            'attachment_urls', j.attachments
          )
          FROM justifications j
          WHERE a.justification_id = j.id
        `,
        { transaction }
      );

      await queryInterface.removeIndex(
        'assessment_progress_answers',
        'idx_progress_answers_justification_id',
        { transaction }
      );

      await queryInterface.removeColumn('assessment_progress_answers', 'justification_id', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
