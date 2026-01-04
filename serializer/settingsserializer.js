const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const SettingsSerializer = new JSONAPISerializer("settings", {
    attributes: ["key", "value", "created_at", "updated_at"],
    keyForAttribute: 'snake_case'
});

module.exports = SettingsSerializer;
