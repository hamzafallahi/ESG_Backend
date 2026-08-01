const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const RsciSerializer = new JSONAPISerializer('rscis', {
  attributes: ['code', 'title', 'title_fr', 'created_at', 'updated_at'],
  keyForAttribute: 'snake_case',
});

module.exports = RsciSerializer;
