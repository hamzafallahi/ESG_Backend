class RsciDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};

    if (attributes.code !== undefined) result.code = attributes.code;
    if (attributes.title !== undefined) result.title = attributes.title;

    return result;
  }
}

module.exports = RsciDeserializer;
