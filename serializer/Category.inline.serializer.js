const { createInlineSerializer } = require('../utils/inlineSerializer');

const CategoryInlineSerializer = createInlineSerializer('category', {
  attributes: [
    'name',
    'name_fr', 
    'description', 
    'created_at', 
    'updated_at', 
    'deleted_at'
  ],
  relationships: {
    sections: {
      type: 'section',
      attributes: ['category_id', 'title', 'title_fr', 'description', 'created_at', 'updated_at']
    },
    result_categories: {
      type: 'result_category',
      attributes: [    'result_id', 'category_id',  'score', 'level', 'created_at', 'updated_at']
    }
  }
});

module.exports = CategoryInlineSerializer;