const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const SectionSerializer = new JSONAPISerializer("sections", {
    attributes: ["title","title_fr", "description", "core", "code", "category_id", "domain_id", "created_at", "updated_at"],
    keyForAttribute: 'snake_case',
});

module.exports = SectionSerializer;
