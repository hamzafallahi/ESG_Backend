const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const SubSectorSerializer = new JSONAPISerializer('sub_sectors', {
  attributes: ['code', 'label', 'active', 'created_at', 'updated_at'],
  keyForAttribute: 'snake_case',
});

module.exports = SubSectorSerializer;
