const { Serializer } = require('jsonapi-serializer');

module.exports = new Serializer('users', {
  attributes: [
    'organization_name',
    'phone_number',
    'email',
    'next_allowed_assessment_date',
    'created_at',
    'updated_at'
  ],
  keyForAttribute: 'snake_case',
  transform: (record) => {
    const transformed = { ...record };
    // Remove password from serialized output
    delete transformed.password;
    return transformed;
  }
});
