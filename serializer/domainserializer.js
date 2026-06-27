const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const DomainSerializer = new JSONAPISerializer('domains', {
  attributes: ['code', 'pillar', 'label', 'created_at', 'updated_at'],
  keyForAttribute: 'snake_case',
});

module.exports = DomainSerializer;
