/**
 * Deserializes the payload used to (re)assign the RSCI items linked to a question.
 *
 * Accepts any of the following shapes for maximum client flexibility:
 *   { data: { rsci_ids: ["..."] } }
 *   { data: { attributes: { rsci_ids: ["..."] } } }
 *   { data: { relationships: { rscis: { data: [{ type: "rscis", id: "..." }] } } } }
 *
 * Always resolves to `{ rsci_ids: string[] }` (possibly empty to clear all links).
 */
class QuestionRsciDeserializer {
  static async deserialize(payload) {
    const data = payload?.data || {};
    let rsciIds = [];

    if (Array.isArray(data.rsci_ids)) {
      rsciIds = data.rsci_ids;
    } else if (data.attributes && Array.isArray(data.attributes.rsci_ids)) {
      rsciIds = data.attributes.rsci_ids;
    } else if (data.relationships?.rscis?.data) {
      const relData = data.relationships.rscis.data;
      rsciIds = Array.isArray(relData)
        ? relData.map((item) => item.id)
        : [relData.id];
    }

    return { rsci_ids: rsciIds.filter(Boolean) };
  }
}

module.exports = QuestionRsciDeserializer;
