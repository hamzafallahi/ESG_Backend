const { Serializer } = require('jsonapi-serializer');

const ResultSectionSerializer = new Serializer('result_sections', {
  attributes: ['result_id', 'section_id', 'score', 'level', 'created_at', 'updated_at', 'deleted_at'],
  keyForAttribute: 'snake_case',
});

module.exports = ResultSectionSerializer;
