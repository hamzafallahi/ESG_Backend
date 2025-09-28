const { createInlineSerializer } = require('../utils/inlineSerializer');

const QuestionInlineSerializer = createInlineSerializer('question', {
  attributes: [
    'section_id',
    'text',
    'text_fr', 
    'score_value',
    'level', 
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    section: {
      type: 'section',
      attributes: ['category_id', 'title', 'title_fr', 'description', 'created_at', 'updated_at'],
    }
  }
});

module.exports = QuestionInlineSerializer;