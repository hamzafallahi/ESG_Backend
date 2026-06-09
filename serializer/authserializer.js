const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const AuthSerializer = new JSONAPISerializer('users', {
    attributes: [
        'name',
        'surname',
        'position',
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
        'updated_at',
        'deleted_at'
    ],
    keyForAttribute: 'snake_case'
});

module.exports = AuthSerializer;