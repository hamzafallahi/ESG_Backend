const { createInlineSerializer } = require('../utils/inlineSerializer');

const ResultSectionInlineSerializer = createInlineSerializer('result_section', {
  attributes: [
    'result_id', 
    'section_id', 
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
    section: {
      type: 'section',
      attributes: ['name', 'description', 'created_at', 'updated_at']
    }
  }
});

module.exports = ResultSectionInlineSerializer;