const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const CategorySerializer = new JSONAPISerializer("categories", {
    
    attributes: ["name", "description", "created_at", "updated_at", "sections"],
    keyForAttribute: 'snake_case'
});

module.exports = CategorySerializer;
