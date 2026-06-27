'use strict';

/**
 * Weight configuration service.
 *
 * Loads per-sub-sector domain weights from the database (sub_sectors,
 * domains, subsector_weights) and caches them in memory so scoring does not hit
 * the DB for weights on every assessment submission.
 *
 * The cache is keyed by the upper-cased sub-sector code and must be invalidated
 * (clearWeightCache) whenever an admin writes to sub_sectors or
 * subsector_weights.
 *
 * Shape returned by getWeightConfig (mirrors the legacy config helper):
 *   { weights: { [domainCode]: number }, total: number }
 * where `total` is the SUM of the sub-sector's weights (no magic constant).
 */

const db = require('../models');

const SubSector = db.sub_sector;
const Domain = db.domain;
const SubsectorWeight = db.subsector_weight;

// subSectorCode (UPPER) -> { weights, total }
const cache = new Map();

/**
 * Build a uniform fallback (every known domain weighted 1) so scoring still
 * works when a sub-sector is missing/unknown or has no configured weights.
 */
const buildUniformConfig = async () => {
  const domains = await Domain.findAll({ attributes: ['code'] });
  const weights = {};
  domains.forEach((d) => { weights[d.code] = 1; });
  return { weights, total: domains.length || 0 };
};

/**
 * Resolve the weight map for a given sub-sector code, using the in-memory cache.
 * @param {string|null|undefined} subSector
 * @returns {Promise<{ weights: Record<string, number>, total: number }>}
 */
const getWeightConfig = async (subSector) => {
  const key = (subSector || '').toUpperCase();

  if (key && cache.has(key)) {
    return cache.get(key);
  }

  let config = null;

  if (key) {
    const subSectorRow = await SubSector.findOne({
      where: { code: key },
      include: [
        {
          model: SubsectorWeight,
          as: 'subsector_weights',
          include: [{ model: Domain, as: 'domain', attributes: ['code'] }],
        },
      ],
    });

    if (subSectorRow && subSectorRow.subsector_weights?.length) {
      const weights = {};
      let total = 0;
      subSectorRow.subsector_weights.forEach((w) => {
        const code = w.domain?.code;
        if (!code) return;
        const value = Number(w.weight) || 0;
        weights[code] = value;
        total += value;
      });
      config = { weights, total };
    }
  }

  // Unknown sub-sector or no weights configured -> uniform fallback (not cached
  // by sub-sector key so a later seed/config is picked up).
  if (!config) {
    return buildUniformConfig();
  }

  cache.set(key, config);
  return config;
};

/**
 * Invalidate the weight cache. Call after any write to sub_sectors or
 * subsector_weights so scoring reflects the change without a restart.
 * @param {string} [subSector] - optional specific code to evict; clears all when omitted.
 */
const clearWeightCache = (subSector) => {
  if (subSector) {
    cache.delete((subSector || '').toUpperCase());
  } else {
    cache.clear();
  }
};
module.exports = {
  getWeightConfig,
  clearWeightCache,
};
