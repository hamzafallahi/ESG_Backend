const JSONAPISerializer = require('jsonapi-serializer').Serializer;

const MailSerializer = new JSONAPISerializer("mail", {
    attributes: ["success", "message", "organization_name", "email", "sent_at"],
    keyForAttribute: 'snake_case',
});

module.exports = MailSerializer;
