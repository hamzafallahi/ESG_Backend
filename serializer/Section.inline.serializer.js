const { createInlineSerializer } = require('../utils/inlineSerializer');

const SectionInlineSerializer = createInlineSerializer('section', {
  attributes: [
    'category_id',
    'title',
    'title_fr', 
    'description', 
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    category: {
      type: 'category',
      attributes: ['name', 'name_fr', 'description', 'created_at', 'updated_at']
    },
    questions: {
      type: 'question',
      attributes: ['section_id', 'text', 'text_fr', 'score_value', 'level', 'created_at', 'updated_at']
    },
    result_sections: {
      type: 'result_section',
      attributes: ['result_id', 'section_id', 'score', 'level', 'created_at', 'updated_at']
    }
  }
});

module.exports = SectionInlineSerializer;