const { createInlineSerializer } = require('../utils/inlineSerializer');

const ResultSectionInlineSerializer = createInlineSerializer('result_section', {
  attributes: [
    'result_id', 
    'section_id', 
    'score', 
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
      attributes: ['title', 'title_fr', 'description', 'core', 'created_at', 'updated_at']
    }
  }
});

module.exports = ResultSectionInlineSerializer;