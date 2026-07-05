/**
 * Deserializes the payload used to bulk-set the per-section weights of a
 * sub-sector.
 *
 * Accepts either of:
 *   { data: { weights: { "<sectionId>": 39.9, ... } } }
 *   { data: { attributes: { weights: { ... } } } }
 *   { data: { weights: [ { section_id: "...", weight: 39.9 } ] } }
 *
 * Always resolves to `{ weights: { [sectionId]: number } }`.
 */
class SubsectorWeightDeserializer {
  static async deserialize(payload) {
    const data = payload?.data || {};
    let raw = data.weights;
    if (raw === undefined && data.attributes) {
      raw = data.attributes.weights;
    }

    const weights = {};

    if (Array.isArray(raw)) {
      raw.forEach((item) => {
        if (item && item.section_id !== undefined) {
          weights[item.section_id] = item.weight;
        }
      });
    } else if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([sectionId, weight]) => {
        weights[sectionId] = weight;
      });
    }

    return { weights };
  }
}

module.exports = SubsectorWeightDeserializer;
