class AuthDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.organization_name !== undefined) result.organization_name = attributes.organization_name;
    if (attributes.phone_number !== undefined) result.phone_number = attributes.phone_number;
    if (attributes.email !== undefined) result.email = attributes.email;
    if (attributes.password !== undefined) result.password = attributes.password;
    
    return result;
  }
}

module.exports = AuthDeserializer;