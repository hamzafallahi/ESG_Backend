'use strict';

const { v4: uuidv4 } = require('uuid');

const RSCIS = [
  { code: 'A.1', title: "Autorisation d'exploiter et Code de conduite" },
  { code: 'B.1', title: 'Travailleurs mineurs (interdiction du travail des enfants)' },
  { code: 'C.1', title: 'Travail librement consenti (interdiction du travail forcé)' },
  { code: 'D.1', title: 'Harcèlement, pratiques abusives et discriminatoires' },
  { code: 'D.2', title: 'Contrats de travail (ou accords équivalents)' },
  { code: 'D.3', title: "Agences de placement / Recours à l'intérim" },
  { code: 'E.1', title: 'Syndicats, représentation des salariés et négociation collective' },
  { code: 'E.2', title: 'Mécanisme de traitement des doléances (alerte)' },
  { code: 'F.1', title: 'Enregistrement du temps de travail' },
  { code: 'F.2', title: 'Heures normales et heures supplémentaires' },
  { code: 'F.3', title: 'Tenue des registres de paie' },
  { code: 'F.4', title: 'Conformité des paiements (salaires et avantages)' },
  { code: 'G.1', title: 'Organisation de la sécurité incendie' },
  { code: 'G.2', title: "Issues de secours et voies d'évacuation" },
  { code: 'G.3', title: 'Éclairage de secours' },
  { code: 'G.4', title: "Plans d'évacuation" },
  { code: 'G.5', title: "Exercices d'évacuation" },
  { code: 'G.6', title: 'Alarmes incendie' },
  { code: 'G.7', title: 'Détection incendie' },
  { code: 'G.8', title: 'Extincteurs' },
  { code: 'G.9', title: 'Systèmes de suppression du feu' },
  { code: 'H.1', title: 'Organisation de la santé et sécurité au travail' },
  { code: 'H.2', title: 'Sécurité électrique' },
  { code: 'H.3', title: 'Sécurité des machines et équipements' },
  { code: 'H.4', title: 'Équipements de protection individuelle (EPI)' },
  { code: 'H.5', title: 'Risques liés aux zones de travail' },
  { code: 'H.6', title: 'Premiers secours' },
  { code: 'I.1', title: 'Étiquetage et identification des produits chimiques' },
  { code: 'I.2', title: 'Stockage des produits chimiques et substances dangereuses' },
  { code: 'I.3', title: "Exposition et intervention en cas d'incident chimique" },
  { code: 'J.1', title: 'Organisation environnementale (conformité, permis, gestion)' },
  { code: 'J.2', title: 'Gestion des déchets dangereux et non dangereux' },
  { code: 'J.3', title: 'Gestion des eaux usées' },
  { code: 'K.1', title: "Gestion de la chaîne d'approvisionnement (cascade RSE)" }
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
