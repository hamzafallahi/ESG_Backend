'use strict';

const { v4: uuidv4 } = require('uuid');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // First, get the section IDs from the database with their titles
    const sections = await queryInterface.sequelize.query(
      `SELECT s.id, s.title, s.title_fr, c.name as category_name 
       FROM sections s 
       JOIN categories c ON s.category_id = c.id`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    // Create a map of section titles to IDs for easier lookup
    const sectionMap = {};
    sections.forEach(section => {
      sectionMap[section.title] = section.id;
      if (section.title_fr) {
        sectionMap[section.title_fr] = section.id;
      }
    });

    // Helper function to convert niveau to level number
    const parseLevel = (niveau) => {
      if (niveau.includes('N1')) return 1;
      if (niveau.includes('N2')) return 2;
      if (niveau.includes('N3')) return 3;
      if (niveau.includes('N4')) return 4;
      return 1; // default
    };

    const questions = [];

    // GOVERNANCE QUESTIONS
    // 1. The vision, strategy and governance of the CSR approach
    const visionSectionId = sectionMap['The vision, strategy and governance of the CSR approach'];
    if (visionSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The CSR policy has been established based on relevant analysis and on the basis of a CSR framework examples:\nExistence of a roadmap that translates CSR commitments\nExistence of a business policy that integrates sustainable development values',
          text_fr: 'La politique RSE a été établie sur la base d\'une analyse pertinente et sur la base d\'un référentiel RSE exemples :\nExistence d\'une feuille de route qui traduit les engagements RSE \nExistence d\'une politique d\'entreprise qui intègre les valeurs de développement durable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Leadership commitment is demonstrated through codes of conduct, a business policy, strategic vision that integrates CSR values and/or preserves the sustainability of the company',
          text_fr: 'L\'engagement du leadership est démontré à travers des codes de conduite, une politique d\'entreprise, vision stratégique qui intègre les valeurs RSE et ou préserve la durabilité de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Existence of an ethical code and/or charter that translates the company\'s commitment to CSR',
          text_fr: 'Existence d\'un code éthique et ou charte qui traduisent l\'engagement de l\'entreprise en matière de RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Communication tools and supports are put in place and deployed for staff awareness purposes regarding the importance of CSR and the company\'s commitment in this direction. Examples: posters, videos, organization of training sessions, focus groups...',
          text_fr: 'Des outils et supports de communication sont mis en place et déployés à des fins de sensibilisation du personnel quant à l\'importance de la RSE et l\'engagement de l\'entreprise dans ce sens. Exemples : affiches, vidéos, organisation de séances de formation, focus groupe…',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The company\'s CSR issues are well identified and analyzed, examples: materiality matrix available',
          text_fr: 'Les enjeux de l\'entreprise en matière de RSE sont bien identifiés et analysés, exemples : matrice de matérialité disponible',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The company involves its internal and external stakeholders in its medium and long-term strategy example: charter and/or ethical codes communicated and signed by stakeholders, sustainability indicators are set for managers and/or departments',
          text_fr: 'L\'entreprise implique ses parties prenantes internes et externes dans sa stratégie à moyen et long terme exemple : charte et ou codes éthiques communiqués et signés par les parties prenantes, des indicateurs de durabilité sont fixés pour les managers et ou départements',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'A CSR policy evaluation system is in place, example: internal audit by managers, CSR officer',
          text_fr: 'Un dispositif d\'évaluation de la politique RSE est en place, exemple : audit interne par les responsables, chargé RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The business model is established in compliance with sustainable development requirements',
          text_fr: 'Le modèle d\'affaire est établi dans le respect des exigences du développement durable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Relevant decision-making process and involves all stakeholders examples: existence of consultation tools with stakeholders',
          text_fr: 'Processus de prise de décision pertinent et implique toutes les parties prenantes exemples : existence d\'outil de concertation avec les parties prenantes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Deployment of sustainable development standards in all company processes',
          text_fr: 'Déploiement des normes de développement durable dans tous les processus de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 2. Ethical approach: Anti-corruption policy and business ethics / Due diligence
    const ethicalSectionId = sectionMap['Ethical approach: Anti-corruption policy and business ethics / Due diligence'];
    if (ethicalSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company\'s practices comply with current regulations and legislation',
          text_fr: 'Les pratiques de l\'entreprise sont conformes à la réglementation et législation en vigueur',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company implements a system to ensure ethical practices by its employees, examples: commitments signed by the parties concerned, continuous monitoring...',
          text_fr: 'L\'entreprise met en place un dispositif pour s\'assurer des pratiques éthiques par ses salariés, exemples engagements signés par les parties concernées, contrôle continu …',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company formalizes its ethical commitment and communicates it to all its stakeholders, example: business ethics and anti-corruption principles are integrated into internal policy, existence of a code or ethical charter that addresses anti-corruption and business ethics principles, existence of anti-corruption and business ethics policy',
          text_fr: 'L\'entreprise formalise son engagement éthique et le communique à toutes ses parties prenantes, exemple : les principes d\'éthique des affaires et de lutte contre la corruption sont intégrés dans la politique interne, existence d\'un code ou charte éthique qui aborde les principes de lutte contre la corruption et l\'éthique des affaires, existence de politique de lutte contre la corruption et de l\'éthique des affaires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company implements a communication and awareness system on business ethics and anti-corruption',
          text_fr: 'L\'entreprise met en place un dispositif de communication et de sensibilisation sur l\'éthique des affaires et la lutte contre la corruption',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'Anti-corruption programs for all stakeholders are in place, examples: employee training, information and awareness sessions by experts, implementation of an alert system, internal and external investigations...',
          text_fr: 'Des programmes de lutte contre la corruption, destinés à toutes les parties prenantes sont en place exemples : formation des salariés, séances d\'information et de sensibilisation par des experts, mise en place d\'un système d\'alerte, enquêtes internes et externes…',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'Internal audits are frequently conducted to ensure compliance with business ethics practices',
          text_fr: 'Des audits internes sont fréquemment effectués afin de s\'assurer de la conformité des pratiques en matière d\'éthique des affaires.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The entire due diligence process is in place and is mastered with:\nRisk mapping developed\nRegular assessments of the situations of subsidiaries, subcontractors and suppliers are in place and monitored\nAn independent evaluation system is in place (external audit)\nA reporting system is in place and is communicated',
          text_fr: 'L\'intégralité du processus de diligence est en place et est maîtrisé avec :\nLa cartographie des risques élaborée\nDes évaluations régulières des situations des filiales, sous-traitant et fournisseurs sont en place et contrôlées\nUn système d\'évaluation indépendant est en place (audit externe)\nUn reporting est en place et est communiqué',
          score_value: 10,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 3. Relationship with clients and consumers
    const clientRelationSectionId = sectionMap['Relationship with clients and consumers'];
    if (clientRelationSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company respects its contractual commitment to its clients/consumers in compliance with regulations in favor of their rights, examples: compliance with health and safety instructions for clients/consumers, compliance of marketed and sold products',
          text_fr: 'L\'entreprise respecte son engagement contractuel vis-à-vis de ses clients /consommateurs et ce dans le respect de la réglementation en faveur de leurs droits exemples : conformité des consignes de santé de sécurité des clients : consommateurs, conformité des produits commercialisés, vendus',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company integrates client or consumer protection principles into its code and/or ethical charter while emphasizing its responsibility towards them within the framework of their contractual relationship',
          text_fr: 'L\'entreprise intègre les principes de protection des clients ou consommateurs dans son code et ou charte éthique tout en insistant sur sa responsabilité vis-à-vis de ces derniers et ce dans le cadre de leur relation contractuelle',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company aims to be a responsible company by banning all misleading advertising and greenwashing',
          text_fr: 'L\'entreprise se veut être une entreprise responsable en bannissant toute le publicité mensongère et greenwashing',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company shows that it listens to its clients and consumers by implementing a client listening system, example: satisfaction survey',
          text_fr: 'L\'entreprise se montre à l\'écoute de ses clients et consommateurs avec la mise en place d\'un dispositif d\'écoute client exemple : enquête de satisfaction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company develops an action plan in response to client complaints and proposals',
          text_fr: 'L\'entreprise élabore un plan d\'action en réponse aux réclamations, propositions des clients',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company respects the announced deadlines in handling complaints and/or disputes with clients/consumers',
          text_fr: 'L\'entreprise respecte les délais annoncés dans le traitement des réclamations et ou litiges avec les clients consommateurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company implements a monitoring system allowing it to propose solutions best suited to meet the social and environmental needs of its clients to strengthen their responsibility in terms of sustainability, example: sharing of good CSR practices, proposal of \'CSR\' suppliers particularly if they are part of their territories, support in adapting sustainable processes...',
          text_fr: 'L\'entreprise met en place un système de veille lui permettant de proposer les solutions les mieux à même de satisfaire aux besoins de ses clients au niveau social et environnemental pour renforcer ainsi leur responsabilité en matière de durabilité exemple : partage de bonne pratiques RSE , proposition de fournisseur « RSE » particulièrement s\'il font partie de leur territoires accompagnement dans l\'adaptation de processus durable…',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company encourages clients and consumers to adopt responsible consumption, example: communication and awareness campaigns aimed at fighting against planned obsolescence, on the benefits of reuse and reemployment...',
          text_fr: 'L\'entreprise encourage des clients et consommateurs à adopter une consommation responsable exemple : campagne de communication et de sensibilisation ayant pour objectif la lutte contre l\'obsolescence programmée, sur les bénéficies de la réutilisation et le réemploi …',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company invests in innovative processes to strengthen the consumer protection system against risks to their health and safety when using the marketed product',
          text_fr: 'L\'entreprise investit dans des processus innovants afin de renforcer le dispositif de protection des consommateurs contre les risques pour leur santé et leur sécurité lors de l\'utilisation du produit commercialisé.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company encourages its clients/consumers towards responsible consumption by investing in:\nAwareness actions on the benefits of reuse or reemployment\nActions to fight against planned obsolescence\nAcquisition of used product collection systems',
          text_fr: 'L\'entreprise encourage ses client consommateurs à la consommation responsable en investissant dans :\nDes actions de sensibilisation sur les bénéfices de la réutilisation ou réemploi\nDes actions de lutte contre l\'obsolescence programmée\nAcquisition de dispositif de collecte des produits usagés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 4. Transparency: Executive Compensation
    const transparencySectionId = sectionMap['Transparency: Executive Compensation'];
    if (transparencySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Financial data related to compensation is available for all company employees including executives',
          text_fr: 'Les données financières relatives à la rémunération sont disponibles et ce pour tous les salariés de l\'entreprise y compris les dirigeants',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'The company publishes the remuneration and benefits in kind of executives/corporate officers in its annual reports',
          text_fr: 'L\'entreprise publie dans ses rapports annuels la rémunération et les avantages en toute nature des dirigeants / mandataires sociaux',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Internal stakeholders (staff representatives) contribute to the development or adjustment of the salary policy',
          text_fr: 'Les parties prenantes internes (représentants du personnel) contribue à l\'élaboration ou ajustement de la politique salariale',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Annual reports detail the remuneration of all executives and officers',
          text_fr: 'Les rapports annuels font état de la rémunération de tous les dirigeants et mandataires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'The company favors or encourages investment of part of the executives\' remuneration (mainly variables) in sustainable projects and/or territorial anchoring',
          text_fr: 'L\'entreprise privilégie ou encourage l\'investissement d\'une partie de la rémunération des dirigeants (essentiellement les variables) dans des projets durables et ou d\'ancrage territorial.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Reporting that includes executive compensation is verified by third parties',
          text_fr: 'Le reporting qui intègre la rémunération des dirigeants est vérifié par des tiers',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 5. Governance: Independence of the Board of Directors
    const boardIndependenceSectionId = sectionMap['Governance: Independence of the Board of Directors'];
    if (boardIndependenceSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The missions and activities of executives as defined within the board or management committee reflect their independence and this in compliance with CSR requirements',
          text_fr: 'Les missions et activités des dirigeants tels que définis au sein du conseil ou comité de direction traduisent leur indépendance et ce dans le respect des exigences RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The members of the board of directors or management committee are trained on CSR principles and commit to adopting them',
          text_fr: 'Les membres du conseil d\'administration ou comité de direction sont formés sur les principes de la RSE et s\'engage à les adopter.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'Existence of protocol and/or charter reflecting the principle of independence of the members of the board of directors or management',
          text_fr: 'Existence de protocole et ou charte traduisant le principe d\'indépendance des membres du conseil d\'administration ou de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The members of the board of directors demonstrate their independence with respect to strategic decisions, the members of the management committee demonstrate their impartiality with respect to strategic decisions, independent third-party members have a role and decision-making power in the board of directors',
          text_fr: 'Les membres du conseil d\'administration démontrent leurs indépendances vis-à-vis des décisions stratégiques, les membres du comité de direction démontrent leur impartialité vis-à-vis des décisions stratégiques, des membres tiers indépendants ont un rôle et un pouvoir décisionnaire dans le conseil d\'administration.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The decisions taken are communicated and shared with internal and external stakeholders',
          text_fr: 'Les décisions prises sont communiquées et partagées avec les parties prenantes internes et externes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'Internal audits are frequently conducted to assess the independence of board members and impartiality of the management committee',
          text_fr: 'Des audits en internes sont fréquemment réalisés afin d\'évaluer l\'indépendance des membres du conseil d\'administration et impartialité du comité de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'A third-party evaluation system is in place to assess the independence of board members and the decisions made in the exercise of their mission',
          text_fr: 'Un système d\'évaluation par des tiers est en place pour évaluer l\'indépendance des membres du conseil d\'administration et les décisions prises dans l\'exercice de leur mission',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'An alert system is implemented to report any risky situations',
          text_fr: 'Un système d\'alerte est mis en place pour signaler toute situation à risque',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 6. Transparency: Executive Compensation - Already added above
    
    // 7. Feminization of management
    const feminizationSectionId = sectionMap['Feminization of management'];
    if (feminizationSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The feminization of the management board or committee is part of the company\'s strategic objectives and is integrated into the HR roadmap',
          text_fr: 'La féminisation du conseil ou comité d direction fait partie des objectifs stratégiques de l\'entreprise et est intégrée à la feuille de route RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The charter and protocols for selecting management executives and shareholders\' rights favor appointments and promotions based on skills and reflect the principle of equal opportunity',
          text_fr: 'La charte et Protocoles de sélection des cadres de directions et des droits des actionnaires favorisent les nominations et promotions basés sur les compétences et traduisent le principe de l\'égalité des chances',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company listens to internal stakeholders to identify the needs and levers that help promote the feminization of management positions',
          text_fr: 'L\'entreprise est à l\'écoute des parties prenantes internes afin d\'identifier les besoins et leviers qui permettent de favoriser la féminisation des postes de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company allocates the necessary resources to develop women\'s skills with a view to career development and integration into positions of responsibility',
          text_fr: 'L\'entreprise alloue les moyens nécessaires afin de développer les compétences des femmes dans une optique d\'évolution de carrière et d\'intégration dans les postes à responsabilité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company measures the satisfaction of internal stakeholders regarding actions promoting the feminization of management positions',
          text_fr: 'L\'entreprise mesure la satisfaction des parties prenantes internes quant aux actions favorisant la féminisation des postes de management',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The approach to feminizing management positions is frequently reviewed and adjusted',
          text_fr: 'La démarche de féminisation des postes de management est fréquemment revue et ajustée',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company invests in actions that promote women in positions of responsibility',
          text_fr: 'L\'entreprise investit dans des actions qui favorise la promotion de la femme dans les postes de responsabilité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company reserves the right to adjust the means and working conditions to promote the integration of women into positions of responsibility',
          text_fr: 'L\'entreprise s\'accorde le droit d\'ajuster les moyens et conditions de travail afin de favoriser l\'intégration des femmes dans les postes à responsabilité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'Career plans for potential women are put in place to promote the feminization of management',
          text_fr: 'Des plans de carrière pour les potentiels femmes sont mis en place afin de favoriser la féminisation de la direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 8. Data confidentiality and privacy protection
    const dataPrivacySectionId = sectionMap['Data confidentiality and privacy protection'];
    if (dataPrivacySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has procedures aimed at protecting personal data',
          text_fr: 'L\'entreprise dispose de procédures ayant pour objectif la protection des données à caractère personnel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has procedures aimed at protecting customer data',
          text_fr: 'L\'entreprise dispose de procédures ayant pour objectif la protection des données client',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has policies aimed at data protection throughout the management process (collection, retention and destruction)',
          text_fr: 'L\'entreprise dispose de politique ayant pour objectif la protection des données et ce au niveau de tout le processus de gestion (collecte , rétention et destruction)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company continuously raises awareness among its employees about data protection issues',
          text_fr: 'L\'entreprise sensibilise en continue ses collaborateurs aux enjeux de la protection des données',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company communicates about its data protection and management strategy with its customers and suppliers',
          text_fr: 'L\'entreprise communique sur sa stratégie de protection et de gestion des données avec ses clients et fournisseurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company assesses risks in customer and personal data management',
          text_fr: 'L\'entreprise évalue les risques en matière de gestion des données client et à caractère personnel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has a risk prevention and mitigation plan',
          text_fr: 'L\'entreprise dispose d\'un plan de prévention et d\'atténuation des risques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company actively monitors the implementation of its data protection policies: conducting internal audits',
          text_fr: 'L\'entreprise surveille activement la mise en application de ses politiques en matière de protection des données : réalisation d\'audit interne',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'Availability of data relating to data management in annual reports',
          text_fr: 'Disponibilité des données relatives à la gestion des données dans les rapports annuels',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company uses third parties to conduct audits to ensure compliance with practices',
          text_fr: 'L\'entreprise fait appel à des tiers afin de réaliser des audits pour s\'assurer de la conformité des pratiques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company extends its data protection policy to its suppliers and subcontractors',
          text_fr: 'L\'entreprise étend sa politique de protection des données à ses fournisseurs et sous-traitants',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has obtained its 27701 certification or any other standard that attests to its compliance in this matter',
          text_fr: 'L\'entreprise a obtenu sa certification 27701 ou tout autre norme qui atteste de sa conformité en la matière',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // SOCIAL QUESTIONS
    // 1. Working conditions: Compliance with regulatory standards in labor matters
    const laborStandardsSectionId = sectionMap['Working conditions: Compliance with regulatory standards in labor matters'];
    if (laborStandardsSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The company formalizes all contractual relationships with its employees through a duly established employment contract: type of contract, hourly volume, rights of the parties, child labor...',
          text_fr: 'L\'entreprise formalise toutes relations contractuelles avec ses salariés par un contrat de travail dûment établi : type de contrat, volume horaire, droit des parties, travail des enfants …',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The company has a social balance sheet when its workforce is equal to or exceeds 300 employees, for those with a workforce of less than 300 employees, it has the necessary data relating to each employee and everything is well archived',
          text_fr: 'L\'entreprise dispose d\'un bilan social lorsque son effectif est égal ou dépasse les 300 salariés, pour celle dont l\'effectif est de moins de 300 salariés, elle dispose des données nécessaires relatives à chaque salarié et le tout est bien archivés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Social declarations are made by the company on time',
          text_fr: 'Les déclarations sociales sont faites par l\'entreprise à temps',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Existence of personnel administrative management procedures with documentation and traceability of all actions relating to these procedures',
          text_fr: 'Existence de procédures de gestion administrative du personnel avec documentation et traçabilité de toutes les actions relatives à ces procédures',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The social balance sheet is in place, communicated and followed by an action plan',
          text_fr: 'Le bilan social est en place, communiqué et suivi de plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'In case of dysfunction reported internally or by a third party and relating to compliance with a standard related to human rights and compliance with regulations, the company must justify the measures taken regarding these involuntary excesses',
          text_fr: 'En cas de dysfonctionnement signalé en interne ou par un tiers et relatif au respect d\'une norme en lien avec les droits de l\"homme et le respect de la règlementation , l\'entreprise doit justifier des mesures entreprises à l\'égard de ces dépassements involontaires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'An employee satisfaction survey is deployed to measure employee satisfaction regarding personnel administrative management procedures, the survey results lead to an action plan',
          text_fr: 'Une enquête de satisfaction salariés est déployée afin de mesurer la satisfaction des salariés quantaux procédures de gestion administrative du personnel, les résultats de l\'enquête donnent lieu à un plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Internal audits are frequently carried out to ensure compliance with practices related to personnel administrative management and respect for human rights, the results of these audits lead to action plans',
          text_fr: 'Des audits internes sont fréquemment effectués afin de s\'assurer de la conformité des pratiques liées à la gestion administrative du personnel et du respect des droits de l\'homme, les résultats de ces audits donnent lieu à des plans d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The company engages in awareness actions for its internal stakeholders regarding risks related to respect for human rights',
          text_fr: 'L\'entreprise engage des actions de sensibilisations pour ses parties prenantes internes et qui portent sur les risques liés au respect des droits de l\'homme',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'A due diligence process that enshrines the principle of respect for human rights is in place with:\nRisk mapping related to human rights\nRegular assessment procedures for subsidiaries, subcontractors or suppliers to control their respect for human rights and working conditions\nAwareness actions for external stakeholders regarding risks related to respect for human rights\nA human rights risk mitigation or prevention plan\nAn evaluation and monitoring system is in place',
          text_fr: 'Un processus de diligence qui consacre le principe de respect des droits de l\'homme est en place avec l\'existence de :\nLa cartographie des risques liés aux droits de l\'homme\nDes procédures d\'évaluation régulière de la situation des filiales, et des sous-traitants ou fournisseurs pour contrôler leur respect des droits de l\'homme et des conditions de travail \nActions de sensibilisation pour ses parties prenantes externes et qui portent sur les risques liés au respect des droits de l\'homme.\nUn plan d\'atténuation des risques lié aux droits de l\'homme ou de prévention                                                  Un système d\'évaluation et de suivi mis en place',
          score_value: 10,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 2. Working conditions: health and safety at work
    const healthSafetySectionId = sectionMap['Working conditions: health and safety at work'];
    if (healthSafetySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Existence of a health and safety at work committee for companies with 40 or more employees, existence of work safety procedures for companies with less than 40 employees',
          text_fr: 'Existence d\'un comité de santé et de sécurité au travail pour les entreprises de 40 salariés et plus, existence de procédure de sécurité de travail pour les entreprises de moins de 40 salariés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Risk prevention procedures related to health and safety at work are well mastered',
          text_fr: 'Les procédures de prévention des risques liés à la santé et la sécurité au travail sont bien maîtrisées',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: '45001 certification in the process of being implemented',
          text_fr: 'La certification 45001 en cours de mise en place',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'The company\'s management system is in line with ISO 9001 requirements',
          text_fr: 'Système de management de l\'entreprise est en phase avec les exigences de l\'ISO 9001',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Employees are involved in health and safety management at work example:\nWorker consultation/participation mechanisms are in place and initiated\nAn alert system by all employees regarding risks related to health and safety at work is in place',
          text_fr: 'Les salariés sont impliqués dans la gestion de la santé et sécurité au travail exemple :\nLes mécanismes de la consultation / participation des travailleurs est en place et initiés\nUn système d\'alerte par tous les salariés quant aux risques liés à la santé et sécurité au travail est mis en place',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'The company has a best practices guide that integrates all rules related to health and safety at work. This same guide is communicated to all employees',
          text_fr: 'L\'entreprise dispose d\'un guide de bonnes pratiques qui intègre toutes les règles liées à la santé et la sécurité au travail. Ce même guide est communiqué à tous les salariés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: '45001 Certification Obtained',
          text_fr: 'Certification 45001 Obtenue',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Practices related to health and safety are constantly evaluated',
          text_fr: 'Les pratiques en lien avec la santé et la sécurité sont constamment évaluées',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Psychosocial risks are included in the company\'s risk mapping',
          text_fr: 'Les Risques psychosociaux figurent dans la cartographie des risques de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'All internal stakeholders are involved in health and safety at work risk prevention plans example managers are trained on their role in health and safety at work and have objectives on it, the skills matrix integrates those related to health and safety at work',
          text_fr: 'Toutes les parties prenantes internes sont impliquées dans les plans de prévention des risques sur la santé et sécurité au travail exemple les managers sont formés sur le rôle en matière de santé et de sécurité au travail et ont des objectifs dessus, la matrice des compétences intègre celles en lien avec la santé et la sécurité au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Existence of a label on health and safety at work standards',
          text_fr: 'Existence de Label portant sur les normes de santé et sécurité au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Taking into account all health and safety at work indicators including psychosocial risks in the annual report',
          text_fr: 'Prise en compte de tous les indicateurs de la santé et sécurité au travail y comrpis les RPS dans le rapport annuel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'All internal and external stakeholders are involved in health and safety at work risk prevention plans examples: agreements with health or safety at work organizations',
          text_fr: 'Toutes les parties prenantes internes et externes sont impliquées dans les plans de prévention des risques sur la santé et sécurité au travail exemples : convention avec des organismes de santé ou de sécurité au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Quality of Life and Working Conditions action plans are defined, deployed and managed',
          text_fr: 'Des plans d\'action Qualité de Vie et Condition de Travail sont définis déployés et pilotés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 3. Working conditions: Equal pay
    const salaryEqualitySectionId = sectionMap['Working conditions: Equal pay'];
    if (salaryEqualitySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The company respects the conventional salary grid as defined',
          text_fr: 'L\'entreprise respecte la grille conventionnelle telle que définie',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'An internal salary grid is in place taking into account the difference between different socio-professional categories and seniority',
          text_fr: 'Une grille de salaire interne est en place tient compte de la différence entre les différentes catégories socio-professionnelle et de l\'ancienneté',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Existence of a remuneration system',
          text_fr: 'Existence d\'un système de rétribution',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Internal satisfaction surveys address the issue of remuneration, the company takes into account feedback to adjust its remuneration policy',
          text_fr: 'Des enquêtes de satisfaction internes abordent la question de la rémunération, l\'entreprise tient compte de ses retours afin d\'ajuster sa politique de rémunération',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The company\'s salary grid respects internal and external equity',
          text_fr: 'La grille de salaire de l\'entreprise est respectueuse de l\'équité interne et externe',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'A fixed and variable remuneration policy is in place and is compliant',
          text_fr: 'Une politique de rémunération fixe et variable est en place et est conforme',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The internal remuneration system is built according to a participatory approach with representatives of all internal stakeholders',
          text_fr: 'Le système de rémunération interne est construit selon une approche participative avec des représentant de toutes les parties prenantes internes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Internal satisfaction surveys on remuneration policy are in place to measure their satisfaction',
          text_fr: 'Des enquêtes de satisfaction interne sur la politique de rémunération sont en place afin de mesurer leur satisfaction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'In case of non-compliance with survey results, an action plan is well established',
          text_fr: 'En cas de non-conformité des résultats de l\'enquête un plan d\'action est bien établi',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'A social benefits grid is in place and respects the principle of equity',
          text_fr: 'Une grille d\'avantage sociaux est en place et respecte le principe de l\'équité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The company ensures that its service providers (temporary agencies) respect conventional standards regarding remuneration and ensures that salary gaps are not detrimental to temporary workers and do not exceed 10%',
          text_fr: 'L\'entreprise veille à ce que ses prestataires ( société d\'intérim) respectent les normes conventionnelles en matière de rémunération et s\'assure que les écarts de salaires ne sont pas préjudiciables aux intérimaires et ne dépasse pas 10%',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 4. Working conditions: Employee training
    const employeeTrainingSectionId = sectionMap['Working conditions: Employee training'];
    if (employeeTrainingSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'All employees have received at least one skills development action per year',
          text_fr: 'Tous les salariés ont reçu au moins une action de montée en compétence par an',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Initial training is planned to guarantee a minimum level of job mastery by each collaborator in their position',
          text_fr: 'Des formations initiales sont prévues afin de garantir un minimum de maîtrise du métier par chaque collaborateur dans son poste de travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'The level of skill mastery is measured post-training',
          text_fr: 'Le niveau de maîtrise des compétences est mesuré en post formation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are defined and deployed for collaborators needing skill enhancement',
          text_fr: 'Des plans de développement de compétence sont définis et déployés pour les collaborateurs en besoin de montée en compétence',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'A system for identifying training needs is in place',
          text_fr: 'Un dispositif d\'identification des besoins en formation est en place',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Employees are questioned about their training needs',
          text_fr: 'Les salariés sont questionnés sur leur besoin en formation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are defined and deployed for all employees and are integrated into a career development plan',
          text_fr: 'Des plans de développement de compétence sont définis et déployés pour tous les salariés et sont intégré dans un plan de développement de carrière',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are annually evaluated and revisited',
          text_fr: 'Les plans de développement de compétence sont annuellement évalués et revisités',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'The company has a policy for managing potential and talent',
          text_fr: 'L\'entreprise dispose d\'une politique de gestion des potentiels et des talents',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are subject to internal satisfaction surveys whose results are systematically followed by adjustment plans',
          text_fr: 'Les plans de développement des compétences font l\'objet d\'enquête de satisfaction interne dont les résultats sont systématiquement suivis de plan d\'ajustement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'The company offers innovative, customized training in line with the company\'s CSR strategy',
          text_fr: 'L\'entreprise propose des formations innovantes, à la carte et en cohérence avec la stratégie RSE de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 5. Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people
    const diversityInclusionSectionId = sectionMap['Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people'];
    if (diversityInclusionSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The company respects the regulations in force regarding diversity and inclusion example: equality of remuneration, inclusion of people with disabilities',
          text_fr: 'L\'entreprise respecte la règlementation en vigueur au sujet de la diversité et de l\'inclusion exemple : égalité de la rémunération, inclusion des personnes en situations d\'handicape',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The company justifies requests for exemption when it is not able to integrate the % of people with disabilities as stipulated by law (2% for companies with more than 100 employees and 1% for companies with less than 100 employees)',
          text_fr: 'L\'entreprise justifie de demandes de dérogation lorsqu\'elle n\'est pas en mesure d\'intégrer le % de personnes en situation d\'handicape tel que stipulé par la loi ( 2% pour les entreprises de plus de 100 salarié et 1% pour les entreprises de moins de 100 salariés )',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Diversity and inclusion indicators are integrated into the social balance sheet',
          text_fr: 'Les indicateurs de la diversité et de l\'inclusion sont intégrés dans le bilan social',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Inclusion objectives are set, monitored and achieved',
          text_fr: 'Les objectifs d\'inclusion sont fixés, suivis et atteints',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Actors working on diversity and inclusion policy are trained in implementation tools and approaches',
          text_fr: 'Les acteurs agissant sur la politique de la diversité et de l\'inclusion sont formés aux outils et démarche de mise en œuvre',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The company invests in facilities and spaces adapted to people with reduced mobility and specific needs',
          text_fr: 'L\'entreprise investit dans des installations et espaces adaptés aux personnes à mobilités réduites et besoins spécifiques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The principles of equal opportunity, diversity and inclusion are integrated into the ethical code and/or ethical charter',
          text_fr: 'Les principes de l\'égalité des chances, de la diversité et de l\'inclusion sont intégrés dans le code éthique et ou charte éthique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The diversity and inclusion policy is well formalized',
          text_fr: 'La politique de la diversité et de l\'inclusion est bien formalisée',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Internal communication, training and awareness of employees are established',
          text_fr: 'La communication interne, la formation et sensibilisation des salariés sont établis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Diversity and inclusion aspects are taken into account in HR management processes',
          text_fr: 'Les aspects de la diversité et de l\'inclusion sont pris en compte dans les processus de gestion RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity and inclusion evaluation system with action improvement plans',
          text_fr: 'Existence d\'un système d\'évaluation de la diversité et de l\'inclusion avec des plans d\'amélioration des actions',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'An annual report on diversity and inclusion actions is established and communicated',
          text_fr: 'Un bilan annuel des actions de la diversité et de l\'inclusion est établi et communiqué',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Internal stakeholders are involved in the proper deployment of the policy',
          text_fr: 'Les parties prenantes internes sont impliqués dans le bon déploiement de la politique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a structured and recognized Diversity and inclusion approach (Label or certification)',
          text_fr: 'Existence d\'une démarche Diversité et inclusion structurée et reconnue (Label ou certification)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Integration of diversity and inclusion policy into the company strategy',
          text_fr: 'Intégration de la politique diversité et inclusion dans la stratégie de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Taking diversity indicators into account in all HR management processes',
          text_fr: 'Prise en compte des indicateurs de la diversité dans tous les processus de gestion RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'External communication and involvement of external stakeholders namely customers, suppliers and local community and institutions specialized in actions that promote gender diversity',
          text_fr: 'Communication externe et implication des parties prenantes externes à savoir client fournisseurs et communauté locale et institutions spécialisées dans des actions qui favorise le genre en la diversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity risk assessment system internally and at the level of concerned external stakeholders',
          text_fr: 'Existence d\'un système d\'évaluation des risques à la diversité en interne et au niveau des parties prenantes externes concernées',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity practices evaluation system with an improvement and innovation system',
          text_fr: 'Existence d\'un système d\'évaluation des pratiques de la diversité avec un dispositif d\'amélioration et d\'innovation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 6. Community engagement and commitment to local communities
    const communityEngagementSectionId = sectionMap['Community engagement and commitment to local communities'];
    if (communityEngagementSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company ensures compliance with current standards and regulations and limits itself to the right to operate in its region',
          text_fr: 'L\'entreprise veille au respect des normes et règlementations en vigueur et se limite au droit d\'exercice dans sa région',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company adopts practices that comply with the culture and tradition of the region',
          text_fr: 'L\'entreprise adopte des pratiques conforment à la culture et tradition de la région',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company undertakes awareness actions regarding its role in local and regional development and communicates about actions undertaken in this direction',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation quant à son rôle dans le développement local et régional et communique sur les actions entreprises dans ce sens',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company adapts production tools to local needs as much as possible',
          text_fr: 'L\'entreprise adopte les outils de production aux besoins locaux et ce dans la mesure du possible',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company promotes wealth creation in local communities through its actions example: choice of local suppliers',
          text_fr: 'L\'entreprise favorise par ses actions la création de richesse chez les communautés locales exemple : choix de fournisseurs locaux',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company engages in actions with local communities favoring win-win relationships examples: agreements with local institutions, internships, open days',
          text_fr: 'L\'entreprise engage des actions avec les communautés locales en favorisant les relations gagnant-gagnant exemples : convention avec les institutions locales, stages, journées portes ouvertes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company involves its employees in volunteer actions',
          text_fr: 'L\'entreprise implique ses salariés dans des actions de bénévolat',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company implements a system to measure its local anchoring and impact (internal and external survey)',
          text_fr: 'L\'entreprise met en place un dispositif pour mesurer son ancrage local et son impact (enquête interne et externe)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company invests in projects that promote local development by involving local actors, example R&D project',
          text_fr: 'L\'entreprise investit dans des projets qui favorise le développement local en impliquant les acteurs locaux , exemple projet R&D',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 7. Social dialogue: Relations with unions and staff representatives
    const socialDialogueSectionId = sectionMap['Social dialogue: Relationship with unions and staff representatives'];
    if (socialDialogueSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'The company respects the regulations in force regarding social dialogue namely the existence of a CCE for companies with more than 40 employees for those with fewer availability of meeting minutes with company employees',
          text_fr: 'L\'entreprise respecte la règlementation en vigueur en matière de dialogue social à savoir l\'existence d\'un CCE pour les entreprises de plus de 40 salarié pour celle qui en ont moins disponibilité des PV de réunion avec les salariés de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Social partners are strongly involved in decisions and tend to impose their opinion',
          text_fr: 'Les partenaires sociaux sont fortement impliqués dans les décisions et ont tendance à imposer leur avis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Decisions affecting the social aspect are the result of collective bargaining with social partners with a final tendency towards compromise',
          text_fr: 'Les décisions touchant le volet social sont la résultante de négociation collective avec les partenaires sociaux avec vers la fin une tendance au compromis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Staff delegates are considered as true partners and contribute to the development of relevant solutions even on operational aspects which has a positive impact on performance',
          text_fr: 'Les délégués du personnel sont considérés comme de vrais partenaires et contribuent à l\'élaboration de solutions pertinentes même sur des volets opérationnels ce qui a un impact positif sur la performance',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Social partners are stakeholders in all social or territorial initiatives and involved in the deployment of any strategic project of the company and position themselves as ambassadors',
          text_fr: 'Les partenaires sociaux sont parties prenantes à toutes initiative sociale ou territoriale et impliqués dans le déploiement de tout projet stratégique de l\'entreprise et se positionnent en ambassadeurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Stakeholders in social dialogue succeed in establishing a healthy social climate and a co-responsible action framework: absence of social crisis',
          text_fr: 'Les parties prenantes au dialogue social et aboutit à instaurer un climat social sain et un cadre d\'action Co responsabilisant : absence de crise sociale',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // ENVIRONMENTAL QUESTIONS
    // 1. Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint
    const carbonFootprintSectionId = sectionMap['Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint'];
    if (carbonFootprintSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The project planning stage is validated following an assessment with the definition of a prioritized action plan, identification of resources to be made available and designation of a project manager...',
          text_fr: 'L\'étape de planification du projet est validée à la suite d\'un état des lieux avec la définition d\'un plan d\'action priorisé, l\'identification des ressources à mettre à disposition et la désignation d\'un chef de projet…',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The organization phase is validated with: resources made available, action plan being implemented: data collection done completely and reliably',
          text_fr: 'La phase d\'organisation est validée avec :  la mise à disposition des ressources faite, plan d\'action en cours de réalisation : collecte des données faite de façon complète et fiable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Employees are made aware of climate issues and CO2 emissions',
          text_fr: 'Les salariés sont sensibilisés aux questions climatiques et émissions de C02',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Effective implementation of the action plan is in place: Carbon footprint or carbon footprint calculation carried out, validated quantification',
          text_fr: 'La mise en œuvre effective du plan d\'action est en place : Calcul du bilan ou empreinte carbone effectué, quantification validée',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Emission reduction objectives defined and communicated',
          text_fr: 'Des objectifs de réduction des émissions définis et communiqués',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The evaluation and control phase is in place with: exploitation of results and advantages for organizational and operational consolidation and improvement',
          text_fr: 'La phase d\'évaluation et de contrôle est en place avec : l\'exploitation des résultats et des avantages pour la consolidation et l\'amélioration organisationnelle et opérationnelle',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The company deploys its climate transition plan in coherence with its deployment at all levels of the organization',
          text_fr: 'L\'entreprise déploie son plan de transition climat en cohérence avec sa déployée à tous les niveaux de l\'organisation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Decarbonization objectives validated by third party (Ex, SBTI)',
          text_fr: 'Les objectifs de décarbonations validés par tierce partie (Ex, SBTI)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 2. Energy Management
    const energyManagementSectionId = sectionMap['Energy Management'];
    if (energyManagementSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The project planning phase is validated following an assessment with: definition of an action plan, resources made available, audit report available...',
          text_fr: 'La phase de planification du projet est validée à la suite d\'un état des lieux avec :  la définition d\'un plan d\'action, ressources mises à disposition, rapport d\'audit disponible…',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The organization phase is completed: resources made available, action plan being implemented with an energy monitoring system in place: data collection done completely and reliably',
          text_fr: 'La phase d\'organisation est clôturée : la mise à disposition des ressources faite, plan d\'action en cours de réalisation avec un système de monitoring de l\'énergie mis en place : collecte des données faite de façon complète et fiable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'Operational mastery demonstrated by supervising staff',
          text_fr: 'Maîtrise opérationnelle démontrée par le personnel encadrant',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company undertakes employee awareness actions regarding energy consumption',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation des salariés au sujet de la consommation énergétique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The effective implementation phase of the action plan is being realized (progress between 50 and 80%) and energy efficiency indicators are mastered and well managed',
          text_fr: 'La phase de mise en œuvre effective du plan d\'action est en cours de réalisation (avancement entre 50 et à 80%) et les Indicateurs d\'efficacité énergétique sont maîtrisés et bien pilotés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company has defined a code of conduct on energy efficiency and communicates about it with its internal stakeholders',
          text_fr: 'L\'entreprise a défini un code de conduite en matière d\'efficacité énergétique et communique dessus avec ses parties prenantes internes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company has implemented a continuous improvement strategy for its energy efficiency actions to achieve previously set objectives: energy audits are frequently carried out with definition of adjustment plans',
          text_fr: 'L\'entreprise a mis en place une stratégie d\'amélioration continue de ses actions d\'efficacité énergétique afin d\'atteindre les objectifs préalablement fixés : des audits énergétiques sont fréquemment réalisés avec définition de plan d\'ajustement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: '50001 Certification obtained',
          text_fr: 'Certification 50001 obtenue',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company undertakes external communication actions to raise awareness among its external stakeholders about the importance of energy saving and encourage them to pursue energy efficiency approaches and/or adopt responsible behaviors',
          text_fr: 'L\'entreprise entreprend des actions de communication à l\'externe afin de sensibiliser ses parties prenantes externes à l\'importance de l\'économie d\'énergie et les inciter à aller dans une démarche d\'efficacité énergétique et ou adopter des comportements responsables',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 3. Pollution: water use/pollution, waste management
    const pollutionSectionId = sectionMap['Pollution: water use/pollution, waste management'];
    if (pollutionSectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Project planning is validated with:\nIdentification of environmental aspects carried out and their significance is evaluated\nEstablishment of an action plan for the control of environmental aspects\nProvision of resources (human and material) necessary for the validated and initiated project',
          text_fr: 'La planification du projet est validée avec :                                                                                             L\'identification des aspects environnementaux effectuée et leur significativité est évaluée  \nL\'établissement d\'un plan d\'action pour la maîtrise des aspects environnementaux. \nLa mise à disposition des ressources (humaines et matérielles) nécessaires au projet validé et initiée',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Actions related to identified environmental aspects are carried out including investment in environmentally friendly technologies',
          text_fr: 'Les actions liées aux aspects environnementaux identifiées sont réalisées y compris l\'investissement dans des technologies respectueuse de l\'environnement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Internal actors in charge of implementing actions are trained in the fundamentals of environmental operational control',
          text_fr: 'Les acteurs internes en charge de la mise en œuvre des actions sont formés aux fondamentaux de la maîtrise opérationnelle environnementale',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Performance monitoring launched with development and implementation of actions: The company has defined environmental sustainability indicators and involves its employees in achieving them',
          text_fr: 'Suivi des performances lancées avec élaboration et mise en œuvre des actions : L\'entreprise a défini des indicateurs de durabilité environnementale et implique ses collaborateurs dans leur atteinte',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company undertakes employee awareness actions regarding respect for the environment and risks related to pollution',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation des salariés au sujet du respect de l\'environnement et des risques liés à la pollution',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The implementation and deployment phase is confirmed and effective: 14001 Certification recently obtained',
          text_fr: 'La phase de mise en œuvre et déploiement est confirmée et est effective : Certification 14001 récemment obtenue',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company has implemented a continuous improvement strategy for its environmental sustainability actions: a monitoring system is in place for this purpose',
          text_fr: 'L\'entreprise a mis en place une stratégie d\'amélioration continue de ses actions de durabilité environnementale : un système de surveillance est mis en place à cet effet',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The monitoring, control and evaluation phase is effectively in place to ensure system stability and performance',
          text_fr: 'La phase suivi , contrôle et évaluation est effectivement en place afin de s\'assurer de la stabilité du système et sa performance',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company structures an environmental management strategy and policy that allows it to position itself as a leader',
          text_fr: 'L\'entreprise structure une stratégie et une politique de gestion de l\'environnement qui lui permet de se positionner comme leader',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company has defined a policy and/or code of conduct regarding respect for the environment and communicates about it with its internal and external stakeholders',
          text_fr: 'L\'entreprise a défini une politique et ou code de conduite en matière de respect de l\'environnement et communique dessus avec ses parties prenantes internes et externes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company invests in awareness actions for its external stakeholders (local community, suppliers and customers) to engage them to be respectful of the environment and adopt responsible behaviors',
          text_fr: 'L\'entreprise investit dans des actions de sensibilisation de ses parties prenantes externes (communauté locale, fournisseurs et client) pour les engager à être respectueux de l\'environnement et adopter des comportements responsables',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 4. Circular economy
    const circularEconomySectionId = sectionMap['Circular economy'];
    if (circularEconomySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The planning phase is validated with:\nDesign and development processes oriented towards the circular economy established, provision of resources (human and material), availability of stakeholder mapping for circular economy processes',
          text_fr: 'La phase de planification est validée avec :                                                                                                   Des processus de conception et de développement orientés vers l\'économie circulaire établis, mise à disposition des ressources (humaines et matérielles) , disponibilité de la cartographie des parties prenantes aux processus de l\'économie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'Partners to be involved in the process are informed and have validated the process',
          text_fr: 'Les partenaires à impliquer dans le processus sont informés et ont validé le processus',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The organization phase is validated and confirmed: The company formalizes its commitment to the environment through a circular economy policy whether at the level of its purchasing, production or valorization policy',
          text_fr: 'La phase d\'organisation est validée et confirmée :  L\'entreprise formalise son engagement vis-à-vis de l\'environnement et ce à travers une politique d\'économie circulaire que ce soit au niveau de sa politique d\'achat, de production ou de valorisation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company raises awareness among its internal stakeholders about the importance of the circular economy and encourages them to use recycled products',
          text_fr: 'L\'entreprise sensibilise ses parties prenantes internes sur l\'importance de l\'économie circulaire et les encourage à utiliser les produits recyclés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company favors the consumption and purchase of recycled products by favoring agreements and transactions with suppliers who are adepts of the circular economy or who provide recycled products',
          text_fr: 'L\'entreprise privilégie la consommation et achat de produits recyclé en favorisant les conventions et transactions avec des fournisseurs adeptes de l\'économie circulaire ou qui fournissent des produits recyclés',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The effective implementation phase is in place with a positive trend for the use of internal resources for circular economy purposes',
          text_fr: 'La phase de mise en œuvre effective est en place avec une Tendance positive pour l\'utilisation des ressources internes à des fins d\'économie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company encourages its external stakeholders to use products from the circular economy by promoting processes or products based on this principle (offers recycled products, uses recycled products in its transactions...)',
          text_fr: 'L\'entreprise encourage ses parties prenantes externes à utiliser des produits issus de l\'économie circulaire en faisant la promotion des processus ou produits issue de ce principe (offre des produits recyclés, utilise dans ses transactions des produits recyclés ...)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'Innovations and projects are implemented integrating the circular economy',
          text_fr: 'Des innovations et des projets sont mis en œuvre intégrant l\'économie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company systematically integrates eco-design principles into its design, development and production processes, based for example on the life cycle analysis (LCA) methodology',
          text_fr: 'L\'entreprise intègre systématiquement dans ses process de conception, développement et production les principes de l\'éco conception, basé par exemple sur la méthodologie de l\'analyse du cycle de vie (ACV)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company adopts production practices, on its sites and with its implementation territories, that are inspired by the principles of the circular economy in order to minimize impacts on the environment',
          text_fr: 'L\'entreprise adopte des pratiques de production, sur ses sites et avec ses territoires d\'implantation, qui s\'inspirent des principes de l\'économie circulaire en vue de minimiser les impacts sur l\'environnement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The monitoring, control and evaluation phase is in place with organizational surveillance properly carried out (Inspections, audits, activity reviews)',
          text_fr: 'La phase de suivi, contrôle et évaluation est en place avec une surveillance de l\'organisation bel et bien effectuée (Inspections, audits, revues d\'activités,)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // 5. Impact on biodiversity
    const biodiversitySectionId = sectionMap['Impact on biodiversity'];
    if (biodiversitySectionId) {
      questions.push(
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The planning phase is well validated: biodiversity issues at the territory level identified as well as the impact of activity, products and services on biodiversity, stakeholder mapping established as well as the action plan for biodiversity preservation',
          text_fr: 'La phase de planification est bien validée : les enjeux de la biodiversité au niveau du territoire identifiés ainsi que l\'impact de l\'activité, produits et service sur la biodiversité, cartographie des parties prenantes établie ainsi que le plan d\'action pour la préservation de la biodiversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The implementation phase is started: employee awareness of the importance of biodiversity and the impact of their non-compliant practices on nature, stakeholder training on the action plan',
          text_fr: 'La phase de mise en œuvre est entamée : sensibilisation des collaborateurs à l\'importance de la biodiversité et l\'impact de leur pratiques non conformes sur la nature, formation des parties prenantes au plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company implements an action plan in line with established national plans',
          text_fr: 'L\'entreprise met en œuvre un plan d\'action en adéquation avec les plans nationaux établis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company involves its external and internal stakeholders in its commitments towards nature and respect for biodiversity by communicating about its actions and inviting them to take part in field actions',
          text_fr: 'L\'entreprise implique ses parties prenantes externes et internes dans ses engagements vis-à-vis de la nature et respect de la biodiversité en communiquant sur ses actions et en les invitant à prendre part aux actions terrains',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company engages in partnerships with territorial actors involved in biodiversity-related subjects',
          text_fr: 'L\'entreprise s\'engage dans des partenariats avec les acteurs du territoire impliqués dans des sujets en lien avec la biodiversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company participates in national and international initiatives aimed at protecting biodiversity',
          text_fr: 'L\'entreprise participe à des initiatives nationales et internationales ayant pour objectif la protection de la biodiversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company implements a system to evaluate the effectiveness of its actions on biodiversity',
          text_fr: 'L\'entreprise met en place un dispositif d\'évaluation de l\'efficacité de ses actions sur la biodiversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company invests in research actions with specialized structures to encourage respect for biodiversity and limit the impact of risks: it wants to be a leader in ecosystem restoration and biodiversity preservation actions',
          text_fr: 'L\'entreprise investit dans actions de recherche avec des structures spécialisées afin d\'encourager le respect de la biodiversité et limiter l\'impact des risques : elle se veut leader en matière d\'action de restauration de l\'écosystème et préservation de la biodiversité',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        }
      );
    }

    // Insert all questions into the database
    if (questions.length > 0) {
      await queryInterface.bulkInsert('questions', questions);
    }
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all questions
    await queryInterface.bulkDelete('questions', {}, {});
  }
};
