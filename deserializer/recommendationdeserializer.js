class RecommendationDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    if (attributes.recommendation_id !== undefined) result.id = attributes.recommendation_id;
    if (attributes.category_id !== undefined) result.category_id = attributes.category_id;
    if (attributes.level !== undefined) result.level = attributes.level;
    if (attributes.name !== undefined) result.name = attributes.name;
    if (attributes.name_fr !== undefined) result.name_fr = attributes.name_fr;
    if (attributes.image !== undefined && attributes.image !== null) {
      // Expect base64 string; convert to Buffer
      try {
        // If data URL prefix, strip it
        const base64 = attributes.image.includes(',') ? attributes.image.split(',').pop() : attributes.image;
        result.image = Buffer.from(base64, 'base64');
      } catch (e) {
        // If conversion fails, ignore so validation layer has already ensured base64
      }
    }
    return result;
  }
}

module.exports = RecommendationDeserializer;
