const { createInlineSerializer } = require('../utils/inlineSerializer');

const ResultCategoryInlineSerializer = createInlineSerializer('result_category', {
  attributes: [
    'result_id', 
    'category_id', 
    'score', 
    'level', 
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    results: {
      type: 'result',
      attributes: ['user_id', 'total_score', 'global_feedback', 'current_rank', 'created_at', 'updated_at']
    },
    category: {
      type: 'category',
      attributes: ['name', 'description', 'created_at', 'updated_at']
    }
  }
});

module.exports = ResultCategoryInlineSerializer;