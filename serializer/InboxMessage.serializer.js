const { Serializer } = require('jsonapi-serializer');

const InboxMessageSerializer = new Serializer('inbox_messages', {
  attributes: [
    'sent_by_user_id',
    'sent_by_admin_id',
    'sent_by_super_admin_id',
    'type',
    'payload',
    'status',
    'created_at',
    'updated_at',
    'sender_user',
    'sender_admin',
    'sender_super_admin',
    'reads'
  ],
  keyForAttribute: 'underscore_case',
  pluralizeType: true,
  sender_user: {
    ref: 'id',
    included: false,
    attributes: ['organization_name', 'email', 'phone_number']
  },
  sender_admin: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  },
  sender_super_admin: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  },
  reads: {
    ref: 'id',
    included: false,
    attributes: ['message_id', 'admin_id', 'super_admin_id', 'created_at']
  }
});

module.exports = InboxMessageSerializer;
