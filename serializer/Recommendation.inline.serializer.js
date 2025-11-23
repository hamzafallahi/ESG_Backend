const { createInlineSerializer } = require('../utils/inlineSerializer');

const RecommendationInlineSerializer = createInlineSerializer('recommendation', {
  attributes: [
    'category_id',
    'level',
    'name',
    'name_fr',
    'image',
    'created_at',
    'updated_at',
    'deleted_at'
  ],
  relationships: {
    category: {
      type: 'category',
      attributes: ['name', 'name_fr', 'description', 'created_at', 'updated_at']
    }
  }
});

module.exports = RecommendationInlineSerializer;
