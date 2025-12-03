class SettingsDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.setting_id !== undefined) result.id = attributes.setting_id;
    if (attributes.key !== undefined) result.key = attributes.key;
    if (attributes.value !== undefined) result.value = attributes.value;

    return result;
  }
}

module.exports = SettingsDeserializer;
