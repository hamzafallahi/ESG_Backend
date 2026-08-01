const { Serializer } = require('jsonapi-serializer');

const ResultSerializer = new Serializer('results', {
  attributes: [
    'user_id', 
    'total_score', 
    'global_level',
    'core_score',
    'global_feedback', 
    'current_rank', 
    'scoring_snapshot',
    'created_at', 
    'updated_at', 
    'deleted_at',
    'result_categories',
    'result_sections'
  ],
  keyForAttribute: 'snake_case',
  result_categories: {
    ref: 'id',
    attributes: ['result_id', 'category_id', 'score', 'created_at', 'updated_at']
  },
  result_sections: {
    ref: 'id', 
    attributes: ['result_id', 'section_id', 'score', 'created_at', 'updated_at']
  }
});

module.exports = ResultSerializer;
