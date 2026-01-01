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
    },
    sent_messages: {
      type: 'inbox_message',
      attributes: ['type', 'payload', 'created_at', 'updated_at']
    },
    read_messages: {
      type: 'message_read',
      attributes: ['message_id', 'created_at', 'updated_at']
    }
  }
});

module.exports = AdminInlineSerializer;
