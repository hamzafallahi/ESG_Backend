const { Serializer } = require('jsonapi-serializer');

const MessageReadSerializer = new Serializer('message_reads', {
  attributes: [
    'message_id',
    'admin_id',
    'super_admin_id',
    'created_at',
    'updated_at',
    'message',
    'reader_admin',
    'reader_super_admin'
  ],
  keyForAttribute: 'underscore_case',
  pluralizeType: true,
  message: {
    ref: 'id',
    included: false,
    attributes: ['type', 'payload', 'sent_by_user_id', 'sent_by_admin_id', 'sent_by_super_admin_id', 'created_at']
  },
  reader_admin: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  },
  reader_super_admin: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  }
});

module.exports = MessageReadSerializer;
