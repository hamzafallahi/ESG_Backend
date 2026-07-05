const { createInlineSerializer } = require('../utils/inlineSerializer');

const SubSectorInlineSerializer = createInlineSerializer('sub_sector', {
  attributes: ['code', 'label', 'active', 'created_at', 'updated_at'],
  relationships: {
    subsector_weights: {
      type: 'subsector_weight',
      attributes: ['sub_sector_id', 'section_id', 'weight', 'created_at', 'updated_at'],
    },
  },
});

module.exports = SubSectorInlineSerializer;
