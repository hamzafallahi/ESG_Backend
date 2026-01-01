const { Serializer } = require('jsonapi-serializer');

const AdminSerializer = new Serializer('admins', {
  attributes: [
    'username',
    'email',
    'first_name',
    'last_name',
    'is_active',
    'created_by',
    'created_at',
    'updated_at',
    'creator',
    'sent_messages',
    'read_messages'
  ],
  keyForAttribute: 'underscore_case',
  pluralizeType: true,
  creator: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  },
  sent_messages: {
    ref: 'id',
    included: false,
    attributes: ['type', 'payload', 'created_at', 'updated_at']
  },
  read_messages: {
    ref: 'id',
    included: false,
    attributes: ['message_id', 'created_at', 'updated_at']
  }
});

module.exports = AdminSerializer;
