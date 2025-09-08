const { Serializer } = require('jsonapi-serializer');

const ResultCategorySerializer = new Serializer('result_categories', {
  attributes: ['result_id', 'category_id', 'score', 'level', 'created_at', 'updated_at', 'deleted_at'],
  keyForAttribute: 'snake_case',
});

module.exports = ResultCategorySerializer;
