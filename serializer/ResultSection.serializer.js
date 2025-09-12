const { Serializer } = require('jsonapi-serializer');
const ResultSectionSerializer = new Serializer('result_sections', {
  attributes: ['result_id', 'section_id', 'score', 'level', 'created_at', 'updated_at', 'deleted_at', "section", "results"],
  keyForAttribute: 'snake_case',
    results: {
    ref: 'id', 
    attributes: [    'user_id', 'total_score', 'global_feedback', 'current_rank', 'created_at', 'updated_at']
  },
  section: {
    ref: 'id',
    attributes: ["title", "description", "category_id", "created_at", "updated_at"]
  }
});

module.exports = ResultSectionSerializer;
