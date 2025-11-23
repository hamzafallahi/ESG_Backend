const JSONAPISerializer = require('jsonapi-serializer').Serializer;

// Pre-serialization transform to convert Buffer image to base64 string
function transformImage(record) {
  if (record && record.image && Buffer.isBuffer(record.image)) {
    record.image = record.image.toString('base64');
  }
  return record;
}

const RecommendationSerializer = new JSONAPISerializer('recommendations', {
  attributes: ['category_id', 'level', 'name', 'name_fr', 'image', 'created_at', 'updated_at'],
  keyForAttribute: 'snake_case',
  transform: transformImage
});

module.exports = RecommendationSerializer;
