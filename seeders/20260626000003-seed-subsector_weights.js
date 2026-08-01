'use strict';

const { v4: uuidv4 } = require('uuid');

const normalizeText = (value) =>
  (value || '')
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/['’]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, ' ')
    .trim()
    .toLowerCase();

const SECTION_WEIGHT_MATRIX = {
  TS: {
    'Management Énergétique': 49.5,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 63.2,
    'Economie circulaire': 57.7,
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 39.9,
    'Impact sur la biodiversité': 37.9,
    'Engagement communautaire et engagement sur les communautés locales': 47.2,
    "Gouvernance : Indépendance du conseil d'administration": 37.9,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 54.9,
    'Condition de travail : santé et sécurité au travail': 80.4,
    'Condition de travail :égalité des salaires': 54.9,
    'Condition de travail :Formation des employés': 54.9,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 90.1,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 30,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 49.9,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 39.9,
    'Relation avec les clients et les consommateurs': 49.9,
    'Transparence : Rémunération des dirigeants': 27,
    'Féminisation de la direction': 44.9,
    'Confidentialité des données et protection de la vie privée': 44.9,
  },
  FF: {
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 44.8,
    'Management Énergétique': 60.3,
    'Economie circulaire': 56.2,
    'Impact sur la biodiversité': 37,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 53.6,
    'Condition de travail : santé et sécurité au travail': 81.8,
    'Condition de travail :égalité des salaires': 53.6,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 87.9,
    'Engagement communautaire et engagement sur les communautés locales': 48.2,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 29.2,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 48.7,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 39,
    'Transparence : Rémunération des dirigeants': 26.3,
    "Gouvernance : Indépendance du conseil d'administration": 37,
    'Féminisation de la direction': 43.8,
    'Confidentialité des données et protection de la vie privée': 43.8,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 56.2,
    'Condition de travail :Formation des employés': 58.9,
    'Relation avec les clients et les consommateurs': 48.7,
  },
  CA: {
    'Impact sur la biodiversité': 37.6,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 40.8,
    'Economie circulaire': 57.1,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 103.3,
    'Transparence : Rémunération des dirigeants': 28.2,
    "Gouvernance : Indépendance du conseil d'administration": 39.5,
    'Confidentialité des données et protection de la vie privée': 62.3,
    'Condition de travail : santé et sécurité au travail': 72.7,
    'Condition de travail :égalité des salaires': 62.5,
    'Condition de travail :Formation des employés': 57.1,
    'Engagement communautaire et engagement sur les communautés locales': 44.5,
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 31.6,
    'Management Énergétique': 35.1,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 49.4,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 45.5,
    'Relation avec les clients et les consommateurs': 49.4,
    'Féminisation de la direction': 48.9,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 59.8,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 29.7,
  },
  EE: {
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 32,
    'Management Énergétique': 22.5,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 35.8,
    'Impact sur la biodiversité': 36,
    'Economie circulaire': 66,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 49.5,
    'Condition de travail : santé et sécurité au travail': 63,
    'Condition de travail :égalité des salaires': 57.8,
    'Condition de travail :Formation des employés': 68.8,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 95,
    'Engagement communautaire et engagement sur les communautés locales': 40.5,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 30,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 50,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 46,
    'Relation avec les clients et les consommateurs': 50,
    'Transparence : Rémunération des dirigeants': 28.5,
    "Gouvernance : Indépendance du conseil d'administration": 40,
    'Féminisation de la direction': 47.3,
    'Confidentialité des données et protection de la vie privée': 96.3,
  },
  PL: {
    'Impact sur la biodiversité': 37.4,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 54.1,
    'Economie circulaire': 75.8,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 93.5,
    'Transparence : Rémunération des dirigeants': 26.6,
    "Gouvernance : Indépendance du conseil d'administration": 37.4,
    'Féminisation de la direction': 44.3,
    'Confidentialité des données et protection de la vie privée': 44.3,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 54.1,
    'Condition de travail : santé et sécurité au travail': 68.9,
    'Condition de travail :égalité des salaires': 54.1,
    'Condition de travail :Formation des employés': 54.1,
    'Engagement communautaire et engagement sur les communautés locales': 44.3,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 29.5,
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 41.3,
    'Management Énergétique': 52.6,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 49.2,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 39.4,
    'Relation avec les clients et les consommateurs': 54.1,
  },
  MP: {
    'Le bilan climatique : Emission de CO2 :Bilan carbone /Empreinte carbone': 35.6,
    'Management Énergétique': 44,
    "La pollution : l'utilisation /la pollution de l'eau, la gestion des déchets": 59.8,
    'Economie circulaire': 57.1,
    'Impact sur la biodiversité': 37.6,
    'Condition de travail : Respect des normes règlementaires en matière de travail': 54.4,
    'Condition de travail : santé et sécurité au travail': 76.1,
    'Condition de travail :égalité des salaires': 54.4,
    'Condition de travail :Formation des employés': 59.8,
    "Diversité et inclusion :Intégration de la femme , des personnes à mobilité réduite , en situation d'handicape et des jeunes": 89.1,
    'Engagement communautaire et engagement sur les communautés locales': 44.5,
    'Dialogue sociale: Relation avec les syndicats et représentants du personnel': 29.7,
    'La vision, la stratégie et la gouvernance de la démarche de RSE': 49.4,
    'Démarche éthique:Politique de lutte contre la corruption et éthique des affaires / Devoir de diligence': 39.5,
    'Relation avec les clients et les consommateurs': 61.8,
    'Transparence : Rémunération des dirigeants': 26.7,
    "Gouvernance : Indépendance du conseil d'administration": 37.6,
    'Féminisation de la direction': 44.5,
    'Confidentialité des données et protection de la vie privée': 53.4,
  },
};

/**
 * Seed per-sub-sector, per-section weights.
 *
 * The weight depends on both the section and the sub-sector code. The seeder
 * is idempotent and also corrects existing rows when the weight has changed.
 */
module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    const subSectors = await queryInterface.sequelize.query(
      'SELECT id, code FROM sub_sectors',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const sections = await queryInterface.sequelize.query(
      'SELECT id, title, title_fr FROM sections',
      { type: Sequelize.QueryTypes.SELECT }
    );

    if (subSectors.length === 0 || sections.length === 0) return;

    const sectionsByTitle = new Map();
    sections.forEach((section) => {
      const normalizedTitleFr = normalizeText(section.title_fr);

      if (normalizedTitleFr) {
        sectionsByTitle.set(normalizedTitleFr, section);
      }
    });

    const existing = await queryInterface.sequelize.query(
      'SELECT id, sub_sector_id, section_id, weight FROM subsector_weights',
      { type: Sequelize.QueryTypes.SELECT }
    );
    const existingPairs = new Set(
      existing.map((w) => `${w.sub_sector_id}:${w.section_id}`)
    );
    const existingByPair = new Map(
      existing.map((w) => [`${w.sub_sector_id}:${w.section_id}`, w])
    );

    const rows = [];
    const updates = [];
    const missingSections = new Set();

    subSectors.forEach((sub) => {
      const weightsForSubSector = SECTION_WEIGHT_MATRIX[sub.code];

      if (!weightsForSubSector) {
        return;
      }

      Object.entries(weightsForSubSector).forEach(([sectionTitle, weight]) => {
        const section = sectionsByTitle.get(normalizeText(sectionTitle));

        if (!section) {
          missingSections.add(`${sub.code}: ${sectionTitle}`);
          return;
        }

        const key = `${sub.id}:${section.id}`;

        if (existingPairs.has(key)) {
          const current = existingByPair.get(key);
          if (Number(current.weight) !== Number(weight)) {
            updates.push({
              sub_sector_id: sub.id,
              section_id: section.id,
              weight,
            });
          }
          return;
        }

        rows.push({
          id: uuidv4(),
          sub_sector_id: sub.id,
          section_id: section.id,
          weight,
          created_at: now,
          updated_at: now,
        });
      });
    });

    if (missingSections.size > 0) {
      throw new Error(
        `Missing section title matches for subsector weights: ${Array.from(missingSections).join('; ')}`
      );
    }

    if (rows.length > 0) {
      await queryInterface.bulkInsert('subsector_weights', rows);
    }

    for (const update of updates) {
      await queryInterface.bulkUpdate(
        'subsector_weights',
        {
          weight: update.weight,
          updated_at: now,
        },
        {
          sub_sector_id: update.sub_sector_id,
          section_id: update.section_id,
        }
      );
    }
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('subsector_weights', {}, {});
  },
};
