class AssessmentProgressDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    // Handle AssessmentProgress attributes
    if (attributes.user_id !== undefined) 
      result.user_id = attributes.user_id;
    if (attributes.answers !== undefined) 
      result.answers = attributes.answers;
    if (attributes.current_page !== undefined) 
      result.current_page = attributes.current_page;
    if (attributes.ui_state !== undefined) 
      result.ui_state = attributes.ui_state;
    if (attributes.total_questions !== undefined) 
      result.total_questions = attributes.total_questions;
    if (attributes.answered_questions !== undefined) 
      result.answered_questions = attributes.answered_questions;
    if (attributes.completion_percentage !== undefined) 
      result.completion_percentage = attributes.completion_percentage;

    return result;
  }
}

module.exports = AssessmentProgressDeserializer;
