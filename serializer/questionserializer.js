const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const QuestionSerializer = new JSONAPISerializer("questions", {
    attributes: ["text","text_fr", "score_value", "section_id", "created_at", "updated_at"],
    keyForAttribute: 'snake_case',
});

module.exports = QuestionSerializer;
