const { Deserializer } = require('jsonapi-serializer');

module.exports = new Deserializer({
  keyForAttribute: 'snake_case',
  admins: {
    valueForRelationship: function (relationship) {
      return {
        id: relationship.id,
        type: relationship.type
      };
    }
  }
});
