const { Serializer } = require('jsonapi-serializer');

const ResultCategorySerializer = new Serializer('result_categories', {
  attributes: ['result_id', 'category_id', 'score', 'level', 'created_at', 'updated_at', 'deleted_at', "category", "results"],
  keyForAttribute: 'snake_case',
  category: {
    ref: 'id',
    attributes: ["name", "description", "created_at", "updated_at", "sections"]
  },
  results: {
    ref: 'id', 
    attributes: [    'user_id', 'total_score', 'global_feedback', 'current_rank', 'created_at', 'updated_at']
  }
});

module.exports = ResultCategorySerializer;
