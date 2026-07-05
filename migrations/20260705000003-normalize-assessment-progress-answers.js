'use strict';

/**
 * Normalizes assessment progress answers:
 * 1. Creates the `assessment_progress_answers` table (one row per answered question,
 *    including the justification payload).
 * 2. Adds `status` (DRAFT | SUBMITTED) and `result_id` to `assessment_progress`.
 * 3. Backfills existing JSONB answers into the new table.
 * 4. Replaces the unique constraint on `user_id` with a partial unique index so a
 *    user can only have ONE DRAFT progress but many SUBMITTED (historical) rows.
 * 5. Drops the legacy `answers` JSONB column.
 */

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // 1. New normalized answers table
      await queryInterface.createTable('assessment_progress_answers', {
        id: {
          allowNull: false,
          primaryKey: true,
          type: Sequelize.UUID,
          defaultValue: Sequelize.UUIDV4
        },
        assessment_progress_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'assessment_progress',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        question_id: {
          type: Sequelize.UUID,
          allowNull: false,
          references: {
            model: 'questions',
            key: 'id'
          },
          onDelete: 'CASCADE'
        },
        answer_type: {
          type: Sequelize.ENUM('YES', 'NN', 'NA', 'NAC'),
          allowNull: false
        },
        nac_percentage: {
          type: Sequelize.INTEGER,
          allowNull: true
        },
        justification: {
          type: Sequelize.JSONB,
          allowNull: true,
          defaultValue: null
        },
        created_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        },
        updated_at: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('NOW()')
        }
      }, { transaction });

      await queryInterface.addIndex('assessment_progress_answers',
        ['assessment_progress_id', 'question_id'],
        {
          name: 'uq_progress_answers_progress_question',
          unique: true,
          transaction
        }
      );

      await queryInterface.addIndex('assessment_progress_answers',
        ['assessment_progress_id'],
        { name: 'idx_progress_answers_progress_id', transaction }
      );

      // 2. Lifecycle columns on assessment_progress
      await queryInterface.addColumn('assessment_progress', 'status', {
        type: Sequelize.ENUM('DRAFT', 'SUBMITTED'),
        allowNull: false,
        defaultValue: 'DRAFT'
      }, { transaction });

      await queryInterface.addColumn('assessment_progress', 'result_id', {
        type: Sequelize.UUID,
        allowNull: true,
        defaultValue: null,
        references: {
          model: 'results',
          key: 'id'
        },
        onDelete: 'SET NULL'
      }, { transaction });

      await queryInterface.addIndex('assessment_progress', ['result_id'], {
        name: 'idx_assessment_progress_result_id',
        transaction
      });

      // 3. Backfill: convert existing JSONB answers into normalized rows.
      //    Only well-formed answers ({ type: YES|NN|NA|NAC }) whose keys are
      //    valid UUIDs of existing questions are migrated.
      await queryInterface.sequelize.query(`
        INSERT INTO assessment_progress_answers
          (id, assessment_progress_id, question_id, answer_type, nac_percentage, justification, created_at, updated_at)
        SELECT
          gen_random_uuid(),
          ap.id,
          (kv.key)::uuid,
          (kv.value->>'type')::"enum_assessment_progress_answers_answer_type",
          CASE
            WHEN kv.value->>'nac_percentage' ~ '^[0-9]+(\\.[0-9]+)?$'
            THEN ROUND((kv.value->>'nac_percentage')::numeric)::int
            ELSE NULL
          END,
          NULLIF(kv.value->'justification', 'null'::jsonb),
          NOW(),
          NOW()
        FROM assessment_progress ap
        CROSS JOIN LATERAL jsonb_each(ap.answers) AS kv(key, value)
        WHERE jsonb_typeof(ap.answers) = 'object'
          AND jsonb_typeof(kv.value) = 'object'
          AND kv.value->>'type' IN ('YES', 'NN', 'NA', 'NAC')
          AND kv.key ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND EXISTS (SELECT 1 FROM questions q WHERE q.id = (kv.key)::uuid)
        ON CONFLICT DO NOTHING;
      `, { transaction });

      // 4. Allow multiple progress rows per user (history), but a single DRAFT.
      await queryInterface.sequelize.query(`
        ALTER TABLE assessment_progress
        DROP CONSTRAINT IF EXISTS assessment_progress_user_id_key;
      `, { transaction });

      await queryInterface.sequelize.query(`
        CREATE UNIQUE INDEX IF NOT EXISTS uq_assessment_progress_user_draft
        ON assessment_progress (user_id)
        WHERE status = 'DRAFT';
      `, { transaction });

      // 5. Drop the legacy JSONB answers column
      await queryInterface.removeColumn('assessment_progress', 'answers', { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  },

  async down(queryInterface, Sequelize) {
    const transaction = await queryInterface.sequelize.transaction();
    try {
      // Restore the JSONB answers column
      await queryInterface.addColumn('assessment_progress', 'answers', {
        type: Sequelize.JSONB,
        allowNull: false,
        defaultValue: {}
      }, { transaction });

      // Re-aggregate normalized rows back into the JSONB column
      await queryInterface.sequelize.query(`
        UPDATE assessment_progress ap
        SET answers = sub.answers
        FROM (
          SELECT
            assessment_progress_id,
            jsonb_object_agg(
              question_id::text,
              jsonb_strip_nulls(jsonb_build_object(
                'type', answer_type,
                'nac_percentage', nac_percentage,
                'justification', justification
              ))
            ) AS answers
          FROM assessment_progress_answers
          GROUP BY assessment_progress_id
        ) sub
        WHERE sub.assessment_progress_id = ap.id;
      `, { transaction });

      await queryInterface.sequelize.query(`
        DROP INDEX IF EXISTS uq_assessment_progress_user_draft;
      `, { transaction });

      // Remove SUBMITTED history rows so the unique(user_id) constraint can be restored
      await queryInterface.sequelize.query(`
        DELETE FROM assessment_progress a
        USING assessment_progress b
        WHERE a.user_id = b.user_id
          AND a.id <> b.id
          AND (a.status = 'SUBMITTED' AND b.status = 'DRAFT');
      `, { transaction });

      await queryInterface.sequelize.query(`
        DELETE FROM assessment_progress a
        USING assessment_progress b
        WHERE a.user_id = b.user_id
          AND a.id <> b.id
          AND a.updated_at < b.updated_at;
      `, { transaction });

      await queryInterface.sequelize.query(`
        ALTER TABLE assessment_progress
        ADD CONSTRAINT assessment_progress_user_id_key UNIQUE (user_id);
      `, { transaction });

      await queryInterface.removeIndex('assessment_progress', 'idx_assessment_progress_result_id', { transaction });
      await queryInterface.removeColumn('assessment_progress', 'result_id', { transaction });
      await queryInterface.removeColumn('assessment_progress', 'status', { transaction });
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_assessment_progress_status";
      `, { transaction });

      await queryInterface.dropTable('assessment_progress_answers', { transaction });
      await queryInterface.sequelize.query(`
        DROP TYPE IF EXISTS "enum_assessment_progress_answers_answer_type";
      `, { transaction });

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
};
