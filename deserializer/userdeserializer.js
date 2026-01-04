class UserDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.organization_name !== undefined) result.organization_name = attributes.organization_name;
    if (attributes.phone_number !== undefined) result.phone_number = attributes.phone_number;
    if (attributes.email !== undefined) result.email = attributes.email;
    if (attributes.password !== undefined) result.password = attributes.password;
    if (attributes.next_allowed_assessment_date !== undefined) result.next_allowed_assessment_date = attributes.next_allowed_assessment_date;
    
    return result;
  }
}

module.exports = UserDeserializer;
