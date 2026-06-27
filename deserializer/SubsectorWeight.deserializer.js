/**
 * Deserializes the payload used to bulk-set the per-domain weights of a
 * sub-sector.
 *
 * Accepts either of:
 *   { data: { weights: { "E1": 39.9, "E2": 49.5 } } }
 *   { data: { attributes: { weights: { ... } } } }
 *   { data: { weights: [ { domain_code: "E1", weight: 39.9 } ] } }
 *
 * Always resolves to `{ weights: { [domainCode]: number } }`.
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
        if (item && item.domain_code !== undefined) {
          weights[item.domain_code] = item.weight;
        }
      });
    } else if (raw && typeof raw === 'object') {
      Object.entries(raw).forEach(([code, weight]) => {
        weights[code] = weight;
      });
    }

    return { weights };
  }
}

module.exports = SubsectorWeightDeserializer;
