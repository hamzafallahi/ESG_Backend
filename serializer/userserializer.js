const { Serializer } = require('jsonapi-serializer');

module.exports = new Serializer('users', {
  attributes: [
    'name',
    'surname',
    'position',
    'sub_sector',
    'website_url',
    'organization_name',
    'organisation_phone_number',
    'organisation_email',
    'phone_number',
    'address',
    'postal_code',
    'city',
    'state',
    'country',
    'description',
    'tax_number',
    'linkedin',
    'facebook',
    'twitter',
    'logo_url',
    'video_url',
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
