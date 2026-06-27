class SubSectorDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};

    if (attributes.code !== undefined) result.code = attributes.code;
    if (attributes.label !== undefined) result.label = attributes.label;
    if (attributes.active !== undefined) result.active = attributes.active;

    return result;
  }
}

module.exports = SubSectorDeserializer;
