const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const CategorySerializer = new JSONAPISerializer("categories", {
    id: "category_id",
    attributes: ["name", "description", "created_at", "updated_at", "sections"],
    keyForAttribute: 'snake_case',
    sections: {
        ref: (section, category) => section.section_id,
        attributes: ["title", "content"]
    }
});

module.exports = CategorySerializer;
