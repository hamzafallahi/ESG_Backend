const { createInlineSerializer } = require('../utils/inlineSerializer');

const RsciInlineSerializer = createInlineSerializer('rsci', {
  attributes: ['code', 'title', 'created_at', 'updated_at'],
  relationships: {
    questions: {
      type: 'question',
      attributes: ['section_id', 'text', 'text_fr', 'score_value', 'created_at', 'updated_at'],
    },
  },
});

module.exports = RsciInlineSerializer;
