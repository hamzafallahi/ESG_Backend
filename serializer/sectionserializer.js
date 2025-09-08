const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const SectionSerializer = new JSONAPISerializer("sections", {
    attributes: ["title", "description", "category_id", "created_at", "updated_at"],
    keyForAttribute: 'snake_case',
});

module.exports = SectionSerializer;
