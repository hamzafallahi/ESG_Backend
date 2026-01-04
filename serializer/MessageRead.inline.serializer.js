const { createInlineSerializer } = require('../utils/inlineSerializer');

const MessageReadInlineSerializer = createInlineSerializer('message_read', {
  attributes: [
    'message_id',
    'admin_id',
    'super_admin_id',
    'created_at',
    'updated_at'
  ],
  relationships: {
    message: {
      type: 'inbox_message',
      attributes: ['type', 'payload', 'sent_by_user_id', 'sent_by_admin_id', 'sent_by_super_admin_id', 'created_at']
    },
    reader_admin: {
      type: 'admin',
      attributes: ['username', 'email', 'first_name', 'last_name']
    },
    reader_super_admin: {
      type: 'super_admin',
      attributes: ['username', 'email', 'first_name', 'last_name']
    }
  }
});

module.exports = MessageReadInlineSerializer;
