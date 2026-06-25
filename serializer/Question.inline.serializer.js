const { createInlineSerializer } = require('../utils/inlineSerializer');

const QuestionInlineSerializer = createInlineSerializer('question', {
  attributes: [
    'section_id',
    'text',
    'text_fr', 
    'score_value',
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    section: {
      type: 'section',
      attributes: ['category_id', 'title', 'title_fr', 'description', 'core', 'created_at', 'updated_at'],
    },
    justifications: {
      type: 'justification',
      attributes: ['question_id', 'proof_type', 'description', 'attachments', 'document_date', 'reference_number', 'evaluator_comment', 'created_at', 'updated_at']
    },
    rscis: {
      type: 'rsci',
      attributes: ['code', 'title', 'created_at', 'updated_at']
    }
  }
});

module.exports = QuestionInlineSerializer;