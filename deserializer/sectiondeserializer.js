class SectionDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.title !== undefined) result.title = attributes.title;
    if (attributes.description !== undefined) result.description = attributes.description;
    if (attributes.category_id !== undefined) result.category_id = attributes.category_id;

    return result;
  }
}

module.exports = SectionDeserializer;
