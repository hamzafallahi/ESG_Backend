const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const AuthSerializer = new JSONAPISerializer("users", {
    attributes: ["organization_name", "phone_number", "email", "created_at", "updated_at"],
    keyForAttribute: 'snake_case'
});

module.exports = AuthSerializer;