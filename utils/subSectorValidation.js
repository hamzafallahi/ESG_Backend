const db = require('../models');
const SubSector = db.sub_sector;

/**
 * Returns the set of active sub-sector codes (upper-cased) from the DB.
 * @returns {Promise<string[]>}
 */
const getActiveSubSectorCodes = async () => {
  const rows = await SubSector.findAll({
    where: { active: true },
    attributes: ['code'],
  });
  return rows.map((r) => String(r.code).toUpperCase());
};

/**
 * Whether the given code matches an active sub-sector. Empty/null is treated as
 * valid (sub_sector is optional in most flows) — callers that require it should
 * check presence separately.
 * @param {string|null|undefined} code
 * @returns {Promise<boolean>}
 */
const isValidSubSector = async (code) => {
  if (code === null || code === undefined || code === '') return true;
  const codes = await getActiveSubSectorCodes();
  return codes.includes(String(code).toUpperCase());
};

module.exports = {
  getActiveSubSectorCodes,
  isValidSubSector,
};
