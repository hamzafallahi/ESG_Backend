class InboxMessageDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.sent_by_user_id !== undefined) result.sent_by_user_id = attributes.sent_by_user_id;
    if (attributes.sent_by_admin_id !== undefined) result.sent_by_admin_id = attributes.sent_by_admin_id;
    if (attributes.sent_by_super_admin_id !== undefined) result.sent_by_super_admin_id = attributes.sent_by_super_admin_id;
    if (attributes.type !== undefined) result.type = attributes.type;
    if (attributes.payload !== undefined) result.payload = attributes.payload;
    if (attributes.status !== undefined) result.status = attributes.status;
    
    return result;
  }
}

module.exports = InboxMessageDeserializer;
