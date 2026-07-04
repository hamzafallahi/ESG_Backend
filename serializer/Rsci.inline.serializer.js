const { createInlineSerializer } = require('../utils/inlineSerializer');

const RsciInlineSerializer = createInlineSerializer('rsci', {
  attributes: ['code', 'title', 'title_fr', 'created_at', 'updated_at'],
  relationships: {
    questions: {
      type: 'question',
      attributes: ['section_id', 'text', 'text_fr', 'score_value', 'level', 'created_at', 'updated_at'],
    },
  },
});

module.exports = RsciInlineSerializer;
