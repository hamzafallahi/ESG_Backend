const { createInlineSerializer } = require('../utils/inlineSerializer');

const ResultInlineSerializer = createInlineSerializer('result', {
  attributes: [
    'user_id', 
    'total_score', 
    'global_feedback', 
    'current_rank', 
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    result_categories: {
      type: 'result_category',
      attributes: ['result_id', 'category_id', 'score', 'level', 'created_at', 'updated_at']
    },
    result_sections: {
      type: 'result_section', 
      attributes: ['result_id', 'section_id', 'score', 'level', 'created_at', 'updated_at']
    }
  }
});

module.exports = ResultInlineSerializer;
