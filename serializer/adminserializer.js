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
    'creator'
  ],
  keyForAttribute: 'underscore_case',
  pluralizeType: true,
  creator: {
    ref: 'id',
    included: false,
    attributes: ['username', 'email', 'first_name', 'last_name']
  }
});

module.exports = AdminSerializer;
