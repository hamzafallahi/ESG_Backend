const { createInlineSerializer } = require('../utils/inlineSerializer');

const InboxMessageInlineSerializer = createInlineSerializer('inbox_message', {
  attributes: [
    'sent_by_user_id',
    'sent_by_admin_id',
    'sent_by_super_admin_id',
    'type',
    'payload',
    'status',
    'created_at',
    'updated_at'
  ],
  relationships: {
    sender_user: {
      type: 'user',
      attributes: ['organization_name', 'email', 'phone_number']
    },
    sender_admin: {
      type: 'admin',
      attributes: ['username', 'email', 'first_name', 'last_name']
    },
    sender_super_admin: {
      type: 'super_admin',
      attributes: ['username', 'email', 'first_name', 'last_name']
    },
    reads: {
      type: 'message_read',
      attributes: ['message_id', 'admin_id', 'super_admin_id', 'created_at']
    }
  }
});

module.exports = InboxMessageInlineSerializer;
