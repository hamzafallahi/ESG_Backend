'use strict';

/**
 * Relaxes the constraints on the `justifications` table so that partial
 * draft justifications (e.g. only a proof_type, only a short description, or
 * no document_date yet) can be persisted by the assessment-progress save flow.
 *
 * Before this migration a justification row REJECTED any insert/update that
 * did not have a non-null proof_type, a 50-500 char description, and a
 * non-null document_date. As a result `progressAnswersHelper.upsertJustification`
 * had to silently drop the whole justification when any of those was missing
 * — the user's description/proof_type/attachments simply disappeared.
 *
 * After this migration only:
 *   - `evaluator_comment` length <= 500 (when not null)
 *   - `attachments` is a JSON array of <= 3 items
 *   - `document_date` cannot be in the future (when not null)
 * still apply. Everything else is allowed to be null/short/empty so the
 * progress save flow persists exactly what the client sent.
 */
module.exports = {
  async up(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ALTER COLUMN proof_type DROP NOT NULL,
        ALTER COLUMN description DROP NOT NULL,
        ALTER COLUMN document_date DROP NOT NULL;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        DROP CONSTRAINT IF EXISTS justifications_description_length_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        DROP CONSTRAINT IF EXISTS justifications_document_date_today_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ADD CONSTRAINT justifications_document_date_today_check
        CHECK (document_date IS NULL OR document_date <= CURRENT_DATE);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ADD CONSTRAINT justifications_description_length_check
        CHECK (description IS NULL OR char_length(description) <= 500);
    `);
  },

  async down(queryInterface) {
    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        DROP CONSTRAINT IF EXISTS justifications_description_length_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ADD CONSTRAINT justifications_description_length_check
        CHECK (char_length(description) BETWEEN 50 AND 500);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        DROP CONSTRAINT IF EXISTS justifications_document_date_today_check;
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ADD CONSTRAINT justifications_document_date_today_check
        CHECK (document_date <= CURRENT_DATE);
    `);

    await queryInterface.sequelize.query(`
      ALTER TABLE justifications
        ALTER COLUMN proof_type SET NOT NULL,
        ALTER COLUMN description SET NOT NULL,
        ALTER COLUMN document_date SET NOT NULL;
    `);
  }
};