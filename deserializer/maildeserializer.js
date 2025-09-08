class MailDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.organization_name !== undefined) result.organizationName = attributes.organization_name;
    if (attributes.phone_number !== undefined) result.phoneNumber = attributes.phone_number;
    if (attributes.email !== undefined) result.email = attributes.email;
    if (attributes.result_data !== undefined) result.resultData = attributes.result_data;

    return result;
  }
}

module.exports = MailDeserializer;
