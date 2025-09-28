class ResultCategoryDeserializer {
  static async deserialize(payload) {
    
    const { attributes } = payload.data;
    const result = {};
    
    // Handle ResultCategory attributes
    if (attributes.id !== undefined) 
      result.id = attributes.id;
    if (attributes.result_id !== undefined) 
      result.result_id = attributes.result_id;
    if (attributes.category_id !== undefined) 
      result.category_id = attributes.category_id;
    if (attributes.score !== undefined) 
      result.score = attributes.score;
    if (attributes.level !== undefined) 
      result.level = attributes.level;

    return result;
  }
}

module.exports = ResultCategoryDeserializer;
