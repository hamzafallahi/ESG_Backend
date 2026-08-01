'use strict';

/**
 * Weight configuration service.
 *
 * Loads per-sub-sector section weights from the database (sub_sectors,
 * sections, subsector_weights) and caches them in memory so scoring does not
 * hit the DB on every submission.
 *
 * Cache is keyed by the upper-cased sub-sector code. It must be invalidated
 * (clearWeightCache) after any admin write to sub_sectors, subsector_weights
 * or sections.
 *
 * Shape returned by getWeightConfig:
 *   { weights: { [sectionId]: number }, total: number }
 * where `total` is the SUM of the sub-sector's weights.
 */

const db = require('../models');

const SubSector = db.sub_sector;
const Section = db.section;
const SubsectorWeight = db.subsector_weight;

// subSectorCode (UPPER) -> { weights, total }
const cache = new Map();

/** Uniform fallback: every section weighted 1. */
const buildUniformConfig = async () => {
  const sections = await Section.findAll({ attributes: ['id'] });
  const weights = {};
  sections.forEach((s) => { weights[s.id] = 1; });
  return { weights, total: sections.length || 0 };
};

/**
 * Resolve the weight map for a sub-sector, using the in-memory cache.
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
          include: [{ model: Section, as: 'section', attributes: ['id'] }],
        },
      ],
    });

    if (subSectorRow && subSectorRow.subsector_weights?.length) {
      const weights = {};
      let total = 0;
      subSectorRow.subsector_weights.forEach((w) => {
        const sectionId = w.section?.id || w.section_id;
        if (!sectionId) return;
        const value = Number(w.weight) || 0;
        weights[sectionId] = value;
        total += value;
      });
      config = { weights, total };
    }
  }

  if (!config) {
    return buildUniformConfig();
  }

  cache.set(key, config);
  return config;
};

/**
 * Invalidate the weight cache.
 * @param {string} [subSector] - specific code to evict; clears all when omitted.
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
