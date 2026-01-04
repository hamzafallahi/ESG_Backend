const { createInlineSerializer } = require('../utils/inlineSerializer');

const SettingsInlineSerializer = createInlineSerializer('settings', {
  attributes: [
    'key',
    'value', 
    'created_at', 
    'updated_at'
  ],
  relationships: {}
});

module.exports = SettingsInlineSerializer;
