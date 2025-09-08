/**
 * Custom inline serializer that creates modified JSON:API format
 * with relationships containing full attributes instead of separate included array
 */

// Simple pluralization function
const pluralize = (word) => {
  if (word.endsWith('y')) {
    return word.slice(0, -1) + 'ies';
  }
  if (word.endsWith('s') || word.endsWith('sh') || word.endsWith('ch') || word.endsWith('x') || word.endsWith('z')) {
    return word + 'es';
  }
  return word + 's';
};

/**
 * Serialize data in inline format
 * @param {string} type - The resource type
 * @param {Object|Array} data - The data to serialize
 * @param {Object} options - Serialization options
 * @param {Array} options.attributes - Attributes to include
 * @param {Object} options.relationships - Relationship configurations
 * @param {Object} options.meta - Meta information to include
 * @returns {Object} Serialized data in inline format
 */
const serializeInline = (type, data, options = {}) => {
  const { attributes = [], relationships = {}, meta } = options;
  
  // Handle array vs single item
  const isArray = Array.isArray(data);
  const items = isArray ? data : [data];
  
  const serializedItems = items.map(item => serializeItem(type, item, attributes, relationships));
  
  const result = {
    data: isArray ? serializedItems : serializedItems[0]
  };
  
  if (meta) {
    result.meta = meta;
  }
  
  return result;
};

/**
 * Serialize a single item
 * @param {string} type - The resource type
 * @param {Object} item - The item to serialize
 * @param {Array} attributes - Attributes to include
 * @param {Object} relationships - Relationship configurations
 * @returns {Object} Serialized item
 */
const serializeItem = (type, item, attributes, relationships) => {
  if (!item) return null;
  
  const serialized = {
    type: pluralize(type.toLowerCase()),
    id: item.id.toString(),
    attributes: {}
  };
  
  // Add attributes
  attributes.forEach(attr => {
    if (attr !== 'id') {
      // Handle Sequelize models and plain objects
      const value = item.dataValues ? item.dataValues[attr] : item[attr];
      if (value !== undefined) {
        serialized.attributes[attr] = value;
      }
    }
  });
  
  // Add relationships if they exist
  const relationshipData = {};
  Object.keys(relationships).forEach(relationName => {
    if (item[relationName]) {
      const relationConfig = relationships[relationName];
      const relatedData = item[relationName];
      
      if (Array.isArray(relatedData)) {
        // Handle array relationships
        relationshipData[relationName] = relatedData.map(relatedItem => 
          serializeRelatedItem(relatedItem, relationConfig)
        );
      } else {
        // Handle single relationships
        relationshipData[relationName] = serializeRelatedItem(relatedData, relationConfig);
      }
    }
  });
  
  if (Object.keys(relationshipData).length > 0) {
    serialized.relationships = relationshipData;
  }
  
  return serialized;
};

/**
 * Serialize a related item
 * @param {Object} item - The related item to serialize
 * @param {Object} config - Relationship configuration
 * @returns {Object} Serialized related item
 */
const serializeRelatedItem = (item, config) => {
  if (!item) return null;
  
  const { type, attributes = [], relationships: nestedRelationships = {} } = config;
  
  const serialized = {
    id: item.id.toString(),
    type: pluralize(type.toLowerCase()),
    attributes: {}
  };
  
  // Add attributes
  attributes.forEach(attr => {
    if (attr !== 'id') {
      // Handle Sequelize models and plain objects
      const value = item.dataValues ? item.dataValues[attr] : item[attr];
      if (value !== undefined) {
        serialized.attributes[attr] = value;
      }
    }
  });
  
  // Handle nested relationships if they exist
  Object.keys(nestedRelationships).forEach(relationName => {
    if (item[relationName]) {
      const relationConfig = nestedRelationships[relationName];
      const relatedData = item[relationName];
      
      if (Array.isArray(relatedData)) {
        serialized[relationName] = relatedData.map(relatedItem => 
          serializeRelatedItem(relatedItem, relationConfig)
        );
      } else {
        serialized[relationName] = serializeRelatedItem(relatedData, relationConfig);
      }
    }
  });
  
  return serialized;
};

/**
 * Create an inline serializer class
 * @param {string} type - The resource type
 * @param {Object} options - Serializer options
 * @returns {Object} Serializer with serialize method
 */
const createInlineSerializer = (type, options = {}) => {
  return {
    serialize: (data, meta = null) => {
      const serializationOptions = { ...options };
      if (meta) {
        serializationOptions.meta = meta;
      }
      return serializeInline(type, data, serializationOptions);
    }
  };
};

module.exports = {
  serializeInline,
  createInlineSerializer
};
