class SectionDeserializer {
  static async deserialize(payload) {
    const { attributes } = payload.data;
    const result = {};
    
    if (attributes.title !== undefined) result.title = attributes.title;
    if (attributes.title_fr !== undefined) result.title_fr = attributes.title_fr;
    if (attributes.description !== undefined) result.description = attributes.description;
    if (attributes.core !== undefined) result.core = attributes.core;
    if (attributes.category_id !== undefined) result.category_id = attributes.category_id;
    if (attributes.domain_id !== undefined) result.domain_id = attributes.domain_id;  
    if (attributes.code !== undefined) result.code = attributes.code;                  
    return result;
  }
}

module.exports = SectionDeserializer;
