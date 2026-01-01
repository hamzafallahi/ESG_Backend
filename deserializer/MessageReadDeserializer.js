class MessageReadDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.message_id !== undefined) result.message_id = attributes.message_id;
    if (attributes.admin_id !== undefined) result.admin_id = attributes.admin_id;
    if (attributes.super_admin_id !== undefined) result.super_admin_id = attributes.super_admin_id;
    
    return result;
  }
}

module.exports = MessageReadDeserializer;
