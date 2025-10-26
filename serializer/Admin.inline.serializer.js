const { createInlineSerializer } = require('../utils/inlineSerializer');

const AdminInlineSerializer = createInlineSerializer('admin', {
  attributes: [
    'username',
    'email',
    'first_name', 
    'last_name',
    'is_active',
    'created_by',
    'created_at', 
    'updated_at'
  ],
  relationships: {
    creator: {
      type: 'super_admin',
      attributes: ['username', 'email', 'first_name', 'last_name']
    }
  }
});

module.exports = AdminInlineSerializer;
