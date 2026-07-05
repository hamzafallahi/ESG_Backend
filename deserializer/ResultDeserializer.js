class ResultDeserializer {
  static async deserialize(payload) {
    
    const { attributes } = payload.data;
    const result = {};
    
    // Handle Result attributes
    if (attributes.id !== undefined) 
      result.id = attributes.id;
    if (attributes.user_id !== undefined) 
      result.user_id = attributes.user_id;
    if (attributes.total_score !== undefined) 
      result.total_score = attributes.total_score;
    if (attributes.global_feedback !== undefined) 
      result.global_feedback = attributes.global_feedback;
    if (attributes.current_rank !== undefined) 
      result.current_rank = attributes.current_rank;

    // Submission data for level calculation (not persisted directly on Result)
    if (attributes.category_scores !== undefined)
      result.category_scores = attributes.category_scores;
    if (attributes.subcategory_scores !== undefined)
      result.subcategory_scores = attributes.subcategory_scores;
    if (attributes.answers !== undefined)
      result.answers = attributes.answers;

    return result;
  }
}

module.exports = ResultDeserializer;
