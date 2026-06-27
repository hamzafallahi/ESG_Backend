const { createInlineSerializer } = require('../utils/inlineSerializer');

const DomainInlineSerializer = createInlineSerializer('domain', {
  attributes: ['code', 'pillar', 'label', 'created_at', 'updated_at'],
  relationships: {
    sections: {
      type: 'section',
      attributes: ['category_id', 'domain_id', 'title', 'title_fr', 'core', 'created_at', 'updated_at'],
    },
  },
});

module.exports = DomainInlineSerializer;
