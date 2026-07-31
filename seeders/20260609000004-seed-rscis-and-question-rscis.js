'use strict';

const { v4: uuidv4 } = require('uuid');

const RSCIS = [
  { code: 'A.1', title: 'Operating authorization and Code of conduct', title_fr: "Autorisation d'exploiter et Code de conduite" },
  { code: 'B.1', title: 'Minor workers (prohibition of child labor)', title_fr: 'Travailleurs mineurs (interdiction du travail des enfants)' },
  { code: 'C.1', title: 'Freely consented work (prohibition of forced labor)', title_fr: 'Travail librement consenti (interdiction du travail forcé)' },
  { code: 'D.1', title: 'Harassment, abusive and discriminatory practices', title_fr: 'Harcèlement, pratiques abusives et discriminatoires' },
  { code: 'D.2', title: 'Employment contracts (or equivalent agreements)', title_fr: 'Contrats de travail (ou accords équivalents)' },
  { code: 'D.3', title: 'Staffing agencies / Temporary work', title_fr: "Agences de placement / Recours à l'intérim" },
  { code: 'E.1', title: 'Trade unions, employee representation and collective bargaining', title_fr: 'Syndicats, représentation des salariés et négociation collective' },
  { code: 'E.2', title: 'Grievance handling mechanism (alert)', title_fr: 'Mécanisme de traitement des doléances (alerte)' },
  { code: 'F.1', title: 'Working time recording', title_fr: 'Enregistrement du temps de travail' },
  { code: 'F.2', title: 'Regular hours and overtime', title_fr: 'Heures normales et heures supplémentaires' },
  { code: 'F.3', title: 'Payroll records maintenance', title_fr: 'Tenue des registres de paie' },
  { code: 'F.4', title: 'Payment compliance (wages and benefits)', title_fr: 'Conformité des paiements (salaires et avantages)' },
  { code: 'G.1', title: 'Fire safety organization', title_fr: 'Organisation de la sécurité incendie' },
  { code: 'G.2', title: 'Emergency exits and evacuation routes', title_fr: "Issues de secours et voies d'évacuation" },
  { code: 'G.3', title: 'Emergency lighting', title_fr: 'Éclairage de secours' },
  { code: 'G.4', title: 'Evacuation plans', title_fr: "Plans d'évacuation" },
  { code: 'G.5', title: 'Evacuation drills', title_fr: "Exercices d'évacuation" },
  { code: 'G.6', title: 'Fire alarms', title_fr: 'Alarmes incendie' },
  { code: 'G.7', title: 'Fire detection', title_fr: 'Détection incendie' },
  { code: 'G.8', title: 'Fire extinguishers', title_fr: 'Extincteurs' },
  { code: 'G.9', title: 'Fire suppression systems', title_fr: 'Systèmes de suppression du feu' },
  { code: 'H.1', title: 'Occupational health and safety organization', title_fr: 'Organisation de la santé et sécurité au travail' },
  { code: 'H.2', title: 'Electrical safety', title_fr: 'Sécurité électrique' },
  { code: 'H.3', title: 'Machine and equipment safety', title_fr: 'Sécurité des machines et équipements' },
  { code: 'H.4', title: 'Personal protective equipment (PPE)', title_fr: 'Équipements de protection individuelle (EPI)' },
  { code: 'H.5', title: 'Workplace area-related risks', title_fr: 'Risques liés aux zones de travail' },
  { code: 'H.6', title: 'First aid', title_fr: 'Premiers secours' },
  { code: 'I.1', title: 'Chemical labeling and identification', title_fr: 'Étiquetage et identification des produits chimiques' },
  { code: 'I.2', title: 'Storage of chemicals and hazardous substances', title_fr: 'Stockage des produits chimiques et substances dangereuses' },
  { code: 'I.3', title: 'Exposure and response in case of chemical incident', title_fr: "Exposition et intervention en cas d'incident chimique" },
  { code: 'J.1', title: 'Environmental organization (compliance, permits, management)', title_fr: 'Organisation environnementale (conformité, permis, gestion)' },
  { code: 'J.2', title: 'Hazardous and non-hazardous waste management', title_fr: 'Gestion des déchets dangereux et non dangereux' },
  { code: 'J.3', title: 'Wastewater management', title_fr: 'Gestion des eaux usées' },
  { code: 'K.1', title: 'Supply chain management (CSR cascade)', title_fr: "Gestion de la chaîne d'approvisionnement (cascade RSE)" }
];

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();
    const codes = RSCIS.map((rsci) => rsci.code);
    const existingRscis = await queryInterface.sequelize.query(
      'SELECT code FROM rscis WHERE code IN (:codes)',
      {
        replacements: { codes },
        type: Sequelize.QueryTypes.SELECT
      }
    );
    const existingCodes = new Set(existingRscis.map((rsci) => rsci.code));
    const rscisToInsert = RSCIS
      .filter((rsci) => !existingCodes.has(rsci.code))
      .map((rsci) => ({
        id: uuidv4(),
        code: rsci.code,
        title: rsci.title,
        title_fr: rsci.title_fr,
        created_at: now,
        updated_at: now
      }));

    if (rscisToInsert.length > 0) {
      await queryInterface.bulkInsert('rscis', rscisToInsert);
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('rscis', {
      code: {
        [Sequelize.Op.in]: RSCIS.map((rsci) => rsci.code)
      }
    }, {});
  }
};
