class CategoryDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    if (attributes.category_id !== undefined) result.id = attributes.category_id;
    if (attributes.name !== undefined) result.name = attributes.name;
    if (attributes.description !== undefined) result.description = attributes.description;

    return result;
  }
}

module.exports = CategoryDeserializer;
