class QuestionDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.text !== undefined) result.text = attributes.text;
    if (attributes.text_fr !== undefined) result.text_fr = attributes.text_fr;
    if (attributes.score_value !== undefined) result.score_value = attributes.score_value;
    if (attributes.level !== undefined) result.level = attributes.level;
    if (attributes.section_id !== undefined) result.section_id = attributes.section_id;

    return result;
  }
}

module.exports = QuestionDeserializer;
