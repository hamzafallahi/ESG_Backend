'use strict';

const resultsIntroContent = {
  en: {
    title: 'Automotive ESG Maturity Assessment',
    first_paragraph: "In the context of continuous market transformations and our evolving legislative environment, economic changes and new regulations require constant adaptation of our strategies. True to its mission of uniting, representing, and supporting automotive industry stakeholders in Tunisia, TAA works to provide concrete tools to anticipate these changes and strengthen the sector's competitiveness.",
    second_paragraph: "It is with this vision that an ESG self-assessment tool has been made available to companies. This self-assessment, completed directly by the company, aims to provide a clear and objective overview of its positioning in environmental, social, and governance matters. The company remains responsible for the accuracy of the information provided, and the results, strictly confidential, help highlight both strengths and areas for improvement. This positioning constitutes an essential first step in establishing a coherent ESG strategy, aligned with international standards and market requirements. TAA remains committed to supporting you in this strategic approach by offering tailored support through targeted training, personalized consulting, and the backing of its expertise center dedicated to ESG and sustainable development."
  },
  fr: {
    title: 'Évaluation de la maturité ESG dans le secteur automobile',
    first_paragraph: "Dans un contexte de transformations continues du marché et d'évolution de notre environnement législatif, les changements économiques et les nouvelles réglementations imposent une adaptation constante de nos stratégies. Fidèle à sa mission de fédérer, représenter et accompagner les acteurs de la filière automobile en Tunisie, la TAA œuvre pour fournir des outils concrets permettant d'anticiper ces évolutions et de renforcer la compétitivité du secteur.",
    second_paragraph: "C'est dans cette vision qu'un outil d'auto-évaluation ESG a été mis à disposition des entreprises. Cette auto-évaluation, renseignée directement par l'entreprise, vise à offrir une vision claire et objective de son positionnement sur les plans environnemental, social et de gouvernance. L'entreprise reste responsable de l'exactitude des informations fournies, et les résultats, strictement confidentiels, permettent de mettre en lumière aussi bien les points forts que les axes d'amélioration. Ce positionnement constitue une première étape essentielle pour l'établissement d'une stratégie ESG cohérente, alignée sur les standards internationaux et les exigences du marché. La TAA reste mobilisée pour vous accompagner dans cette démarche stratégique en proposant un soutien sur mesure, au travers de formations ciblées, de conseils personnalisés et de l'appui de son centre d'expertise dédié à l'ESG et au développement durable."
  }
};

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.bulkInsert('settings', [
      {
        id: Sequelize.literal('gen_random_uuid()'),
        key: 'results_intro_content',
        value: JSON.stringify(resultsIntroContent),
        created_at: new Date(),
        updated_at: new Date()
      }
    ], {});
  },

  down: async (queryInterface) => {
    await queryInterface.bulkDelete('settings', { key: 'results_intro_content' }, {});
  }
};