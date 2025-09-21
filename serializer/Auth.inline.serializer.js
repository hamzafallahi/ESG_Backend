const { createInlineSerializer } = require('../utils/inlineSerializer');

const AuthInlineSerializer = createInlineSerializer('user', {
  attributes: [
    'organization_name',
    'phone_number', 
    'email', 
    'created_at', 
    'updated_at'
  ]
});

module.exports = AuthInlineSerializer;