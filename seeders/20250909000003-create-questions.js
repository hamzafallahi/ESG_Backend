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
          text_fr: 'La politique RSE a Ã©tÃ© Ã©tablie sur la base d\'une analyse pertinente et sur la base d\'un rÃ©fÃ©rentiel RSE exemples :\nExistence d\'une feuille de route qui traduit les engagements RSE \nExistence d\'une politique d\'entreprise qui intÃ¨gre les valeurs de dÃ©veloppement durable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Leadership commitment is demonstrated through codes of conduct, a business policy, strategic vision that integrates CSR values and/or preserves the sustainability of the company',
          text_fr: 'L\'engagement du leadership est dÃ©montrÃ© Ã  travers des codes de conduite, une politique d\'entreprise, vision stratÃ©gique qui intÃ¨gre les valeurs RSE et ou prÃ©serve la durabilitÃ© de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Existence of an ethical code and/or charter that translates the company\'s commitment to CSR',
          text_fr: 'Existence d\'un code Ã©thique et ou charte qui traduisent l\'engagement de l\'entreprise en matiÃ¨re de RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Communication tools and supports are put in place and deployed for staff awareness purposes regarding the importance of CSR and the company\'s commitment in this direction. Examples: posters, videos, organization of training sessions, focus groups...',
          text_fr: 'Des outils et supports de communication sont mis en place et dÃ©ployÃ©s Ã  des fins de sensibilisation du personnel quant Ã  l\'importance de la RSE et l\'engagement de l\'entreprise dans ce sens. Exemples : affiches, vidÃ©os, organisation de sÃ©ances de formation, focus groupeâ€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The company\'s CSR issues are well identified and analyzed, examples: materiality matrix available',
          text_fr: 'Les enjeux de l\'entreprise en matiÃ¨re de RSE sont bien identifiÃ©s et analysÃ©s, exemples : matrice de matÃ©rialitÃ© disponible',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The company involves its internal and external stakeholders in its medium and long-term strategy example: charter and/or ethical codes communicated and signed by stakeholders, sustainability indicators are set for managers and/or departments',
          text_fr: 'L\'entreprise implique ses parties prenantes internes et externes dans sa stratÃ©gie Ã  moyen et long terme exemple : charte et ou codes Ã©thiques communiquÃ©s et signÃ©s par les parties prenantes, des indicateurs de durabilitÃ© sont fixÃ©s pour les managers et ou dÃ©partements',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'A CSR policy evaluation system is in place, example: internal audit by managers, CSR officer',
          text_fr: 'Un dispositif d\'Ã©valuation de la politique RSE est en place, exemple : audit interne par les responsables, chargÃ© RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'The business model is established in compliance with sustainable development requirements',
          text_fr: 'Le modÃ¨le d\'affaire est Ã©tabli dans le respect des exigences du dÃ©veloppement durable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Relevant decision-making process and involves all stakeholders examples: existence of consultation tools with stakeholders',
          text_fr: 'Processus de prise de dÃ©cision pertinent et implique toutes les parties prenantes exemples : existence d\'outil de concertation avec les parties prenantes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: visionSectionId,
          text: 'Deployment of sustainable development standards in all company processes',
          text_fr: 'DÃ©ploiement des normes de dÃ©veloppement durable dans tous les processus de l\'entreprise',
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
          text_fr: 'Les pratiques de l\'entreprise sont conformes Ã  la rÃ©glementation et lÃ©gislation en vigueur',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company implements a system to ensure ethical practices by its employees, examples: commitments signed by the parties concerned, continuous monitoring...',
          text_fr: 'L\'entreprise met en place un dispositif pour s\'assurer des pratiques Ã©thiques par ses salariÃ©s, exemples engagements signÃ©s par les parties concernÃ©es, contrÃ´le continu â€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company formalizes its ethical commitment and communicates it to all its stakeholders, example: business ethics and anti-corruption principles are integrated into internal policy, existence of a code or ethical charter that addresses anti-corruption and business ethics principles, existence of anti-corruption and business ethics policy',
          text_fr: 'L\'entreprise formalise son engagement Ã©thique et le communique Ã  toutes ses parties prenantes, exemple : les principes d\'Ã©thique des affaires et de lutte contre la corruption sont intÃ©grÃ©s dans la politique interne, existence d\'un code ou charte Ã©thique qui aborde les principes de lutte contre la corruption et l\'Ã©thique des affaires, existence de politique de lutte contre la corruption et de l\'Ã©thique des affaires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The company implements a communication and awareness system on business ethics and anti-corruption',
          text_fr: 'L\'entreprise met en place un dispositif de communication et de sensibilisation sur l\'Ã©thique des affaires et la lutte contre la corruption',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'Anti-corruption programs for all stakeholders are in place, examples: employee training, information and awareness sessions by experts, implementation of an alert system, internal and external investigations...',
          text_fr: 'Des programmes de lutte contre la corruption, destinÃ©s Ã  toutes les parties prenantes sont en place exemples : formation des salariÃ©s, sÃ©ances d\'information et de sensibilisation par des experts, mise en place d\'un systÃ¨me d\'alerte, enquÃªtes internes et externesâ€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'Internal audits are frequently conducted to ensure compliance with business ethics practices',
          text_fr: 'Des audits internes sont frÃ©quemment effectuÃ©s afin de s\'assurer de la conformitÃ© des pratiques en matiÃ¨re d\'Ã©thique des affaires.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: ethicalSectionId,
          text: 'The entire due diligence process is in place and is mastered with:\nRisk mapping developed\nRegular assessments of the situations of subsidiaries, subcontractors and suppliers are in place and monitored\nAn independent evaluation system is in place (external audit)\nA reporting system is in place and is communicated',
          text_fr: 'L\'intÃ©gralitÃ© du processus de diligence est en place et est maÃ®trisÃ© avec :\nLa cartographie des risques Ã©laborÃ©e\nDes Ã©valuations rÃ©guliÃ¨res des situations des filiales, sous-traitant et fournisseurs sont en place et contrÃ´lÃ©es\nUn systÃ¨me d\'Ã©valuation indÃ©pendant est en place (audit externe)\nUn reporting est en place et est communiquÃ©',
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
          text_fr: 'L\'entreprise respecte son engagement contractuel vis-Ã -vis de ses clients /consommateurs et ce dans le respect de la rÃ©glementation en faveur de leurs droits exemples : conformitÃ© des consignes de santÃ© de sÃ©curitÃ© des clients : consommateurs, conformitÃ© des produits commercialisÃ©s, vendus',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company integrates client or consumer protection principles into its code and/or ethical charter while emphasizing its responsibility towards them within the framework of their contractual relationship',
          text_fr: 'L\'entreprise intÃ¨gre les principes de protection des clients ou consommateurs dans son code et ou charte Ã©thique tout en insistant sur sa responsabilitÃ© vis-Ã -vis de ces derniers et ce dans le cadre de leur relation contractuelle',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company aims to be a responsible company by banning all misleading advertising and greenwashing',
          text_fr: 'L\'entreprise se veut Ãªtre une entreprise responsable en bannissant toute le publicitÃ© mensongÃ¨re et greenwashing',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company shows that it listens to its clients and consumers by implementing a client listening system, example: satisfaction survey',
          text_fr: 'L\'entreprise se montre Ã  l\'Ã©coute de ses clients et consommateurs avec la mise en place d\'un dispositif d\'Ã©coute client exemple : enquÃªte de satisfaction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company develops an action plan in response to client complaints and proposals',
          text_fr: 'L\'entreprise Ã©labore un plan d\'action en rÃ©ponse aux rÃ©clamations, propositions des clients',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company respects the announced deadlines in handling complaints and/or disputes with clients/consumers',
          text_fr: 'L\'entreprise respecte les dÃ©lais annoncÃ©s dans le traitement des rÃ©clamations et ou litiges avec les clients consommateurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company implements a monitoring system allowing it to propose solutions best suited to meet the social and environmental needs of its clients to strengthen their responsibility in terms of sustainability, example: sharing of good CSR practices, proposal of \'CSR\' suppliers particularly if they are part of their territories, support in adapting sustainable processes...',
          text_fr: 'L\'entreprise met en place un systÃ¨me de veille lui permettant de proposer les solutions les mieux Ã  mÃªme de satisfaire aux besoins de ses clients au niveau social et environnemental pour renforcer ainsi leur responsabilitÃ© en matiÃ¨re de durabilitÃ© exemple : partage de bonne pratiques RSE , proposition de fournisseur Â« RSE Â» particuliÃ¨rement s\'il font partie de leur territoires accompagnement dans l\'adaptation de processus durableâ€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company encourages clients and consumers to adopt responsible consumption, example: communication and awareness campaigns aimed at fighting against planned obsolescence, on the benefits of reuse and reemployment...',
          text_fr: 'L\'entreprise encourage des clients et consommateurs Ã  adopter une consommation responsable exemple : campagne de communication et de sensibilisation ayant pour objectif la lutte contre l\'obsolescence programmÃ©e, sur les bÃ©nÃ©ficies de la rÃ©utilisation et le rÃ©emploi â€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company invests in innovative processes to strengthen the consumer protection system against risks to their health and safety when using the marketed product',
          text_fr: 'L\'entreprise investit dans des processus innovants afin de renforcer le dispositif de protection des consommateurs contre les risques pour leur santÃ© et leur sÃ©curitÃ© lors de l\'utilisation du produit commercialisÃ©.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: clientRelationSectionId,
          text: 'The company encourages its clients/consumers towards responsible consumption by investing in:\nAwareness actions on the benefits of reuse or reemployment\nActions to fight against planned obsolescence\nAcquisition of used product collection systems',
          text_fr: 'L\'entreprise encourage ses client consommateurs Ã  la consommation responsable en investissant dans :\nDes actions de sensibilisation sur les bÃ©nÃ©fices de la rÃ©utilisation ou rÃ©emploi\nDes actions de lutte contre l\'obsolescence programmÃ©e\nAcquisition de dispositif de collecte des produits usagÃ©s',
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
          text_fr: 'Les donnÃ©es financiÃ¨res relatives Ã  la rÃ©munÃ©ration sont disponibles et ce pour tous les salariÃ©s de l\'entreprise y compris les dirigeants',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'The company publishes the remuneration and benefits in kind of executives/corporate officers in its annual reports',
          text_fr: 'L\'entreprise publie dans ses rapports annuels la rÃ©munÃ©ration et les avantages en toute nature des dirigeants / mandataires sociaux',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Internal stakeholders (staff representatives) contribute to the development or adjustment of the salary policy',
          text_fr: 'Les parties prenantes internes (reprÃ©sentants du personnel) contribue Ã  l\'Ã©laboration ou ajustement de la politique salariale',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Annual reports detail the remuneration of all executives and officers',
          text_fr: 'Les rapports annuels font Ã©tat de la rÃ©munÃ©ration de tous les dirigeants et mandataires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'The company favors or encourages investment of part of the executives\' remuneration (mainly variables) in sustainable projects and/or territorial anchoring',
          text_fr: 'L\'entreprise privilÃ©gie ou encourage l\'investissement d\'une partie de la rÃ©munÃ©ration des dirigeants (essentiellement les variables) dans des projets durables et ou d\'ancrage territorial.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: transparencySectionId,
          text: 'Reporting that includes executive compensation is verified by third parties',
          text_fr: 'Le reporting qui intÃ¨gre la rÃ©munÃ©ration des dirigeants est vÃ©rifiÃ© par des tiers',
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
          text_fr: 'Les missions et activitÃ©s des dirigeants tels que dÃ©finis au sein du conseil ou comitÃ© de direction traduisent leur indÃ©pendance et ce dans le respect des exigences RSE',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The members of the board of directors or management committee are trained on CSR principles and commit to adopting them',
          text_fr: 'Les membres du conseil d\'administration ou comitÃ© de direction sont formÃ©s sur les principes de la RSE et s\'engage Ã  les adopter.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'Existence of protocol and/or charter reflecting the principle of independence of the members of the board of directors or management',
          text_fr: 'Existence de protocole et ou charte traduisant le principe d\'indÃ©pendance des membres du conseil d\'administration ou de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The members of the board of directors demonstrate their independence with respect to strategic decisions, the members of the management committee demonstrate their impartiality with respect to strategic decisions, independent third-party members have a role and decision-making power in the board of directors',
          text_fr: 'Les membres du conseil d\'administration dÃ©montrent leurs indÃ©pendances vis-Ã -vis des dÃ©cisions stratÃ©giques, les membres du comitÃ© de direction dÃ©montrent leur impartialitÃ© vis-Ã -vis des dÃ©cisions stratÃ©giques, des membres tiers indÃ©pendants ont un rÃ´le et un pouvoir dÃ©cisionnaire dans le conseil d\'administration.',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'The decisions taken are communicated and shared with internal and external stakeholders',
          text_fr: 'Les dÃ©cisions prises sont communiquÃ©es et partagÃ©es avec les parties prenantes internes et externes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'Internal audits are frequently conducted to assess the independence of board members and impartiality of the management committee',
          text_fr: 'Des audits en internes sont frÃ©quemment rÃ©alisÃ©s afin d\'Ã©valuer l\'indÃ©pendance des membres du conseil d\'administration et impartialitÃ© du comitÃ© de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'A third-party evaluation system is in place to assess the independence of board members and the decisions made in the exercise of their mission',
          text_fr: 'Un systÃ¨me d\'Ã©valuation par des tiers est en place pour Ã©valuer l\'indÃ©pendance des membres du conseil d\'administration et les dÃ©cisions prises dans l\'exercice de leur mission',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: boardIndependenceSectionId,
          text: 'An alert system is implemented to report any risky situations',
          text_fr: 'Un systÃ¨me d\'alerte est mis en place pour signaler toute situation Ã  risque',
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
          text_fr: 'La fÃ©minisation du conseil ou comitÃ© d direction fait partie des objectifs stratÃ©giques de l\'entreprise et est intÃ©grÃ©e Ã  la feuille de route RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The charter and protocols for selecting management executives and shareholders\' rights favor appointments and promotions based on skills and reflect the principle of equal opportunity',
          text_fr: 'La charte et Protocoles de sÃ©lection des cadres de directions et des droits des actionnaires favorisent les nominations et promotions basÃ©s sur les compÃ©tences et traduisent le principe de l\'Ã©galitÃ© des chances',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company listens to internal stakeholders to identify the needs and levers that help promote the feminization of management positions',
          text_fr: 'L\'entreprise est Ã  l\'Ã©coute des parties prenantes internes afin d\'identifier les besoins et leviers qui permettent de favoriser la fÃ©minisation des postes de direction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company allocates the necessary resources to develop women\'s skills with a view to career development and integration into positions of responsibility',
          text_fr: 'L\'entreprise alloue les moyens nÃ©cessaires afin de dÃ©velopper les compÃ©tences des femmes dans une optique d\'Ã©volution de carriÃ¨re et d\'intÃ©gration dans les postes Ã  responsabilitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company measures the satisfaction of internal stakeholders regarding actions promoting the feminization of management positions',
          text_fr: 'L\'entreprise mesure la satisfaction des parties prenantes internes quant aux actions favorisant la fÃ©minisation des postes de management',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The approach to feminizing management positions is frequently reviewed and adjusted',
          text_fr: 'La dÃ©marche de fÃ©minisation des postes de management est frÃ©quemment revue et ajustÃ©e',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company invests in actions that promote women in positions of responsibility',
          text_fr: 'L\'entreprise investit dans des actions qui favorise la promotion de la femme dans les postes de responsabilitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'The company reserves the right to adjust the means and working conditions to promote the integration of women into positions of responsibility',
          text_fr: 'L\'entreprise s\'accorde le droit d\'ajuster les moyens et conditions de travail afin de favoriser l\'intÃ©gration des femmes dans les postes Ã  responsabilitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: feminizationSectionId,
          text: 'Career plans for potential women are put in place to promote the feminization of management',
          text_fr: 'Des plans de carriÃ¨re pour les potentiels femmes sont mis en place afin de favoriser la fÃ©minisation de la direction',
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
          text_fr: 'L\'entreprise dispose de procÃ©dures ayant pour objectif la protection des donnÃ©es Ã  caractÃ¨re personnel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has procedures aimed at protecting customer data',
          text_fr: 'L\'entreprise dispose de procÃ©dures ayant pour objectif la protection des donnÃ©es client',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has policies aimed at data protection throughout the management process (collection, retention and destruction)',
          text_fr: 'L\'entreprise dispose de politique ayant pour objectif la protection des donnÃ©es et ce au niveau de tout le processus de gestion (collecte , rÃ©tention et destruction)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company continuously raises awareness among its employees about data protection issues',
          text_fr: 'L\'entreprise sensibilise en continue ses collaborateurs aux enjeux de la protection des donnÃ©es',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company communicates about its data protection and management strategy with its customers and suppliers',
          text_fr: 'L\'entreprise communique sur sa stratÃ©gie de protection et de gestion des donnÃ©es avec ses clients et fournisseurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company assesses risks in customer and personal data management',
          text_fr: 'L\'entreprise Ã©value les risques en matiÃ¨re de gestion des donnÃ©es client et Ã  caractÃ¨re personnel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has a risk prevention and mitigation plan',
          text_fr: 'L\'entreprise dispose d\'un plan de prÃ©vention et d\'attÃ©nuation des risques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company actively monitors the implementation of its data protection policies: conducting internal audits',
          text_fr: 'L\'entreprise surveille activement la mise en application de ses politiques en matiÃ¨re de protection des donnÃ©es : rÃ©alisation d\'audit interne',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'Availability of data relating to data management in annual reports',
          text_fr: 'DisponibilitÃ© des donnÃ©es relatives Ã  la gestion des donnÃ©es dans les rapports annuels',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company uses third parties to conduct audits to ensure compliance with practices',
          text_fr: 'L\'entreprise fait appel Ã  des tiers afin de rÃ©aliser des audits pour s\'assurer de la conformitÃ© des pratiques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company extends its data protection policy to its suppliers and subcontractors',
          text_fr: 'L\'entreprise Ã©tend sa politique de protection des donnÃ©es Ã  ses fournisseurs et sous-traitants',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: dataPrivacySectionId,
          text: 'The company has obtained its 27701 certification or any other standard that attests to its compliance in this matter',
          text_fr: 'L\'entreprise a obtenu sa certification 27701 ou tout autre norme qui atteste de sa conformitÃ© en la matiÃ¨re',
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
          text_fr: 'L\'entreprise formalise toutes relations contractuelles avec ses salariÃ©s par un contrat de travail dÃ»ment Ã©tabli : type de contrat, volume horaire, droit des parties, travail des enfants â€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The company has a social balance sheet when its workforce is equal to or exceeds 300 employees, for those with a workforce of less than 300 employees, it has the necessary data relating to each employee and everything is well archived',
          text_fr: 'L\'entreprise dispose d\'un bilan social lorsque son effectif est Ã©gal ou dÃ©passe les 300 salariÃ©s, pour celle dont l\'effectif est de moins de 300 salariÃ©s, elle dispose des donnÃ©es nÃ©cessaires relatives Ã  chaque salariÃ© et le tout est bien archivÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Social declarations are made by the company on time',
          text_fr: 'Les dÃ©clarations sociales sont faites par l\'entreprise Ã  temps',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Existence of personnel administrative management procedures with documentation and traceability of all actions relating to these procedures',
          text_fr: 'Existence de procÃ©dures de gestion administrative du personnel avec documentation et traÃ§abilitÃ© de toutes les actions relatives Ã  ces procÃ©dures',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The social balance sheet is in place, communicated and followed by an action plan',
          text_fr: 'Le bilan social est en place, communiquÃ© et suivi de plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'In case of dysfunction reported internally or by a third party and relating to compliance with a standard related to human rights and compliance with regulations, the company must justify the measures taken regarding these involuntary excesses',
          text_fr: 'En cas de dysfonctionnement signalÃ© en interne ou par un tiers et relatif au respect d\'une norme en lien avec les droits de l\"homme et le respect de la rÃ¨glementation , l\'entreprise doit justifier des mesures entreprises Ã  l\'Ã©gard de ces dÃ©passements involontaires',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'An employee satisfaction survey is deployed to measure employee satisfaction regarding personnel administrative management procedures, the survey results lead to an action plan',
          text_fr: 'Une enquÃªte de satisfaction salariÃ©s est dÃ©ployÃ©e afin de mesurer la satisfaction des salariÃ©s quantaux procÃ©dures de gestion administrative du personnel, les rÃ©sultats de l\'enquÃªte donnent lieu Ã  un plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'Internal audits are frequently carried out to ensure compliance with practices related to personnel administrative management and respect for human rights, the results of these audits lead to action plans',
          text_fr: 'Des audits internes sont frÃ©quemment effectuÃ©s afin de s\'assurer de la conformitÃ© des pratiques liÃ©es Ã  la gestion administrative du personnel et du respect des droits de l\'homme, les rÃ©sultats de ces audits donnent lieu Ã  des plans d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'The company engages in awareness actions for its internal stakeholders regarding risks related to respect for human rights',
          text_fr: 'L\'entreprise engage des actions de sensibilisations pour ses parties prenantes internes et qui portent sur les risques liÃ©s au respect des droits de l\'homme',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: laborStandardsSectionId,
          text: 'A due diligence process that enshrines the principle of respect for human rights is in place with:\nRisk mapping related to human rights\nRegular assessment procedures for subsidiaries, subcontractors or suppliers to control their respect for human rights and working conditions\nAwareness actions for external stakeholders regarding risks related to respect for human rights\nA human rights risk mitigation or prevention plan\nAn evaluation and monitoring system is in place',
          text_fr: 'Un processus de diligence qui consacre le principe de respect des droits de l\'homme est en place avec l\'existence de :\nLa cartographie des risques liÃ©s aux droits de l\'homme\nDes procÃ©dures d\'Ã©valuation rÃ©guliÃ¨re de la situation des filiales, et des sous-traitants ou fournisseurs pour contrÃ´ler leur respect des droits de l\'homme et des conditions de travail \nActions de sensibilisation pour ses parties prenantes externes et qui portent sur les risques liÃ©s au respect des droits de l\'homme.\nUn plan d\'attÃ©nuation des risques liÃ© aux droits de l\'homme ou de prÃ©vention                                                  Un systÃ¨me d\'Ã©valuation et de suivi mis en place',
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
          text_fr: 'Existence d\'un comitÃ© de santÃ© et de sÃ©curitÃ© au travail pour les entreprises de 40 salariÃ©s et plus, existence de procÃ©dure de sÃ©curitÃ© de travail pour les entreprises de moins de 40 salariÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Risk prevention procedures related to health and safety at work are well mastered',
          text_fr: 'Les procÃ©dures de prÃ©vention des risques liÃ©s Ã  la santÃ© et la sÃ©curitÃ© au travail sont bien maÃ®trisÃ©es',
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
          text_fr: 'SystÃ¨me de management de l\'entreprise est en phase avec les exigences de l\'ISO 9001',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Employees are involved in health and safety management at work example:\nWorker consultation/participation mechanisms are in place and initiated\nAn alert system by all employees regarding risks related to health and safety at work is in place',
          text_fr: 'Les salariÃ©s sont impliquÃ©s dans la gestion de la santÃ© et sÃ©curitÃ© au travail exemple :\nLes mÃ©canismes de la consultation / participation des travailleurs est en place et initiÃ©s\nUn systÃ¨me d\'alerte par tous les salariÃ©s quant aux risques liÃ©s Ã  la santÃ© et sÃ©curitÃ© au travail est mis en place',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'The company has a best practices guide that integrates all rules related to health and safety at work. This same guide is communicated to all employees',
          text_fr: 'L\'entreprise dispose d\'un guide de bonnes pratiques qui intÃ¨gre toutes les rÃ¨gles liÃ©es Ã  la santÃ© et la sÃ©curitÃ© au travail. Ce mÃªme guide est communiquÃ© Ã  tous les salariÃ©s',
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
          text_fr: 'Les pratiques en lien avec la santÃ© et la sÃ©curitÃ© sont constamment Ã©valuÃ©es',
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
          text_fr: 'Toutes les parties prenantes internes sont impliquÃ©es dans les plans de prÃ©vention des risques sur la santÃ© et sÃ©curitÃ© au travail exemple les managers sont formÃ©s sur le rÃ´le en matiÃ¨re de santÃ© et de sÃ©curitÃ© au travail et ont des objectifs dessus, la matrice des compÃ©tences intÃ¨gre celles en lien avec la santÃ© et la sÃ©curitÃ© au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Existence of a label on health and safety at work standards',
          text_fr: 'Existence de Label portant sur les normes de santÃ© et sÃ©curitÃ© au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Taking into account all health and safety at work indicators including psychosocial risks in the annual report',
          text_fr: 'Prise en compte de tous les indicateurs de la santÃ© et sÃ©curitÃ© au travail y comrpis les RPS dans le rapport annuel',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'All internal and external stakeholders are involved in health and safety at work risk prevention plans examples: agreements with health or safety at work organizations',
          text_fr: 'Toutes les parties prenantes internes et externes sont impliquÃ©es dans les plans de prÃ©vention des risques sur la santÃ© et sÃ©curitÃ© au travail exemples : convention avec des organismes de santÃ© ou de sÃ©curitÃ© au travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: healthSafetySectionId,
          text: 'Quality of Life and Working Conditions action plans are defined, deployed and managed',
          text_fr: 'Des plans d\'action QualitÃ© de Vie et Condition de Travail sont dÃ©finis dÃ©ployÃ©s et pilotÃ©s',
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
          text_fr: 'L\'entreprise respecte la grille conventionnelle telle que dÃ©finie',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'An internal salary grid is in place taking into account the difference between different socio-professional categories and seniority',
          text_fr: 'Une grille de salaire interne est en place tient compte de la diffÃ©rence entre les diffÃ©rentes catÃ©gories socio-professionnelle et de l\'anciennetÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Existence of a remuneration system',
          text_fr: 'Existence d\'un systÃ¨me de rÃ©tribution',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Internal satisfaction surveys address the issue of remuneration, the company takes into account feedback to adjust its remuneration policy',
          text_fr: 'Des enquÃªtes de satisfaction internes abordent la question de la rÃ©munÃ©ration, l\'entreprise tient compte de ses retours afin d\'ajuster sa politique de rÃ©munÃ©ration',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The company\'s salary grid respects internal and external equity',
          text_fr: 'La grille de salaire de l\'entreprise est respectueuse de l\'Ã©quitÃ© interne et externe',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'A fixed and variable remuneration policy is in place and is compliant',
          text_fr: 'Une politique de rÃ©munÃ©ration fixe et variable est en place et est conforme',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The internal remuneration system is built according to a participatory approach with representatives of all internal stakeholders',
          text_fr: 'Le systÃ¨me de rÃ©munÃ©ration interne est construit selon une approche participative avec des reprÃ©sentant de toutes les parties prenantes internes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'Internal satisfaction surveys on remuneration policy are in place to measure their satisfaction',
          text_fr: 'Des enquÃªtes de satisfaction interne sur la politique de rÃ©munÃ©ration sont en place afin de mesurer leur satisfaction',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'In case of non-compliance with survey results, an action plan is well established',
          text_fr: 'En cas de non-conformitÃ© des rÃ©sultats de l\'enquÃªte un plan d\'action est bien Ã©tabli',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'A social benefits grid is in place and respects the principle of equity',
          text_fr: 'Une grille d\'avantage sociaux est en place et respecte le principe de l\'Ã©quitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: salaryEqualitySectionId,
          text: 'The company ensures that its service providers (temporary agencies) respect conventional standards regarding remuneration and ensures that salary gaps are not detrimental to temporary workers and do not exceed 10%',
          text_fr: 'L\'entreprise veille Ã  ce que ses prestataires ( sociÃ©tÃ© d\'intÃ©rim) respectent les normes conventionnelles en matiÃ¨re de rÃ©munÃ©ration et s\'assure que les Ã©carts de salaires ne sont pas prÃ©judiciables aux intÃ©rimaires et ne dÃ©passe pas 10%',
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
          text_fr: 'Tous les salariÃ©s ont reÃ§u au moins une action de montÃ©e en compÃ©tence par an',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Initial training is planned to guarantee a minimum level of job mastery by each collaborator in their position',
          text_fr: 'Des formations initiales sont prÃ©vues afin de garantir un minimum de maÃ®trise du mÃ©tier par chaque collaborateur dans son poste de travail',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'The level of skill mastery is measured post-training',
          text_fr: 'Le niveau de maÃ®trise des compÃ©tences est mesurÃ© en post formation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are defined and deployed for collaborators needing skill enhancement',
          text_fr: 'Des plans de dÃ©veloppement de compÃ©tence sont dÃ©finis et dÃ©ployÃ©s pour les collaborateurs en besoin de montÃ©e en compÃ©tence',
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
          text_fr: 'Les salariÃ©s sont questionnÃ©s sur leur besoin en formation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are defined and deployed for all employees and are integrated into a career development plan',
          text_fr: 'Des plans de dÃ©veloppement de compÃ©tence sont dÃ©finis et dÃ©ployÃ©s pour tous les salariÃ©s et sont intÃ©grÃ© dans un plan de dÃ©veloppement de carriÃ¨re',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'Skill development plans are annually evaluated and revisited',
          text_fr: 'Les plans de dÃ©veloppement de compÃ©tence sont annuellement Ã©valuÃ©s et revisitÃ©s',
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
          text_fr: 'Les plans de dÃ©veloppement des compÃ©tences font l\'objet d\'enquÃªte de satisfaction interne dont les rÃ©sultats sont systÃ©matiquement suivis de plan d\'ajustement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: employeeTrainingSectionId,
          text: 'The company offers innovative, customized training in line with the company\'s CSR strategy',
          text_fr: 'L\'entreprise propose des formations innovantes, Ã  la carte et en cohÃ©rence avec la stratÃ©gie RSE de l\'entreprise',
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
          text_fr: 'L\'entreprise respecte la rÃ¨glementation en vigueur au sujet de la diversitÃ© et de l\'inclusion exemple : Ã©galitÃ© de la rÃ©munÃ©ration, inclusion des personnes en situations d\'handicape',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The company justifies requests for exemption when it is not able to integrate the % of people with disabilities as stipulated by law (2% for companies with more than 100 employees and 1% for companies with less than 100 employees)',
          text_fr: 'L\'entreprise justifie de demandes de dÃ©rogation lorsqu\'elle n\'est pas en mesure d\'intÃ©grer le % de personnes en situation d\'handicape tel que stipulÃ© par la loi ( 2% pour les entreprises de plus de 100 salariÃ© et 1% pour les entreprises de moins de 100 salariÃ©s )',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Diversity and inclusion indicators are integrated into the social balance sheet',
          text_fr: 'Les indicateurs de la diversitÃ© et de l\'inclusion sont intÃ©grÃ©s dans le bilan social',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Inclusion objectives are set, monitored and achieved',
          text_fr: 'Les objectifs d\'inclusion sont fixÃ©s, suivis et atteints',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Actors working on diversity and inclusion policy are trained in implementation tools and approaches',
          text_fr: 'Les acteurs agissant sur la politique de la diversitÃ© et de l\'inclusion sont formÃ©s aux outils et dÃ©marche de mise en Å“uvre',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The company invests in facilities and spaces adapted to people with reduced mobility and specific needs',
          text_fr: 'L\'entreprise investit dans des installations et espaces adaptÃ©s aux personnes Ã  mobilitÃ©s rÃ©duites et besoins spÃ©cifiques',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The principles of equal opportunity, diversity and inclusion are integrated into the ethical code and/or ethical charter',
          text_fr: 'Les principes de l\'Ã©galitÃ© des chances, de la diversitÃ© et de l\'inclusion sont intÃ©grÃ©s dans le code Ã©thique et ou charte Ã©thique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'The diversity and inclusion policy is well formalized',
          text_fr: 'La politique de la diversitÃ© et de l\'inclusion est bien formalisÃ©e',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Internal communication, training and awareness of employees are established',
          text_fr: 'La communication interne, la formation et sensibilisation des salariÃ©s sont Ã©tablis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Diversity and inclusion aspects are taken into account in HR management processes',
          text_fr: 'Les aspects de la diversitÃ© et de l\'inclusion sont pris en compte dans les processus de gestion RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity and inclusion evaluation system with action improvement plans',
          text_fr: 'Existence d\'un systÃ¨me d\'Ã©valuation de la diversitÃ© et de l\'inclusion avec des plans d\'amÃ©lioration des actions',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'An annual report on diversity and inclusion actions is established and communicated',
          text_fr: 'Un bilan annuel des actions de la diversitÃ© et de l\'inclusion est Ã©tabli et communiquÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Internal stakeholders are involved in the proper deployment of the policy',
          text_fr: 'Les parties prenantes internes sont impliquÃ©s dans le bon dÃ©ploiement de la politique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a structured and recognized Diversity and inclusion approach (Label or certification)',
          text_fr: 'Existence d\'une dÃ©marche DiversitÃ© et inclusion structurÃ©e et reconnue (Label ou certification)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Integration of diversity and inclusion policy into the company strategy',
          text_fr: 'IntÃ©gration de la politique diversitÃ© et inclusion dans la stratÃ©gie de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Taking diversity indicators into account in all HR management processes',
          text_fr: 'Prise en compte des indicateurs de la diversitÃ© dans tous les processus de gestion RH',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'External communication and involvement of external stakeholders namely customers, suppliers and local community and institutions specialized in actions that promote gender diversity',
          text_fr: 'Communication externe et implication des parties prenantes externes Ã  savoir client fournisseurs et communautÃ© locale et institutions spÃ©cialisÃ©es dans des actions qui favorise le genre en la diversitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity risk assessment system internally and at the level of concerned external stakeholders',
          text_fr: 'Existence d\'un systÃ¨me d\'Ã©valuation des risques Ã  la diversitÃ© en interne et au niveau des parties prenantes externes concernÃ©es',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: diversityInclusionSectionId,
          text: 'Existence of a diversity practices evaluation system with an improvement and innovation system',
          text_fr: 'Existence d\'un systÃ¨me d\'Ã©valuation des pratiques de la diversitÃ© avec un dispositif d\'amÃ©lioration et d\'innovation',
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
          text_fr: 'L\'entreprise veille au respect des normes et rÃ¨glementations en vigueur et se limite au droit d\'exercice dans sa rÃ©gion',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company adopts practices that comply with the culture and tradition of the region',
          text_fr: 'L\'entreprise adopte des pratiques conforment Ã  la culture et tradition de la rÃ©gion',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company undertakes awareness actions regarding its role in local and regional development and communicates about actions undertaken in this direction',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation quant Ã  son rÃ´le dans le dÃ©veloppement local et rÃ©gional et communique sur les actions entreprises dans ce sens',
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
          text_fr: 'L\'entreprise favorise par ses actions la crÃ©ation de richesse chez les communautÃ©s locales exemple : choix de fournisseurs locaux',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company engages in actions with local communities favoring win-win relationships examples: agreements with local institutions, internships, open days',
          text_fr: 'L\'entreprise engage des actions avec les communautÃ©s locales en favorisant les relations gagnant-gagnant exemples : convention avec les institutions locales, stages, journÃ©es portes ouvertes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company involves its employees in volunteer actions',
          text_fr: 'L\'entreprise implique ses salariÃ©s dans des actions de bÃ©nÃ©volat',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company implements a system to measure its local anchoring and impact (internal and external survey)',
          text_fr: 'L\'entreprise met en place un dispositif pour mesurer son ancrage local et son impact (enquÃªte interne et externe)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: communityEngagementSectionId,
          text: 'The company invests in projects that promote local development by involving local actors, example R&D project',
          text_fr: 'L\'entreprise investit dans des projets qui favorise le dÃ©veloppement local en impliquant les acteurs locaux , exemple projet R&D',
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
          text_fr: 'L\'entreprise respecte la rÃ¨glementation en vigueur en matiÃ¨re de dialogue social Ã  savoir l\'existence d\'un CCE pour les entreprises de plus de 40 salariÃ© pour celle qui en ont moins disponibilitÃ© des PV de rÃ©union avec les salariÃ©s de l\'entreprise',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Social partners are strongly involved in decisions and tend to impose their opinion',
          text_fr: 'Les partenaires sociaux sont fortement impliquÃ©s dans les dÃ©cisions et ont tendance Ã  imposer leur avis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Decisions affecting the social aspect are the result of collective bargaining with social partners with a final tendency towards compromise',
          text_fr: 'Les dÃ©cisions touchant le volet social sont la rÃ©sultante de nÃ©gociation collective avec les partenaires sociaux avec vers la fin une tendance au compromis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Staff delegates are considered as true partners and contribute to the development of relevant solutions even on operational aspects which has a positive impact on performance',
          text_fr: 'Les dÃ©lÃ©guÃ©s du personnel sont considÃ©rÃ©s comme de vrais partenaires et contribuent Ã  l\'Ã©laboration de solutions pertinentes mÃªme sur des volets opÃ©rationnels ce qui a un impact positif sur la performance',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Social partners are stakeholders in all social or territorial initiatives and involved in the deployment of any strategic project of the company and position themselves as ambassadors',
          text_fr: 'Les partenaires sociaux sont parties prenantes Ã  toutes initiative sociale ou territoriale et impliquÃ©s dans le dÃ©ploiement de tout projet stratÃ©gique de l\'entreprise et se positionnent en ambassadeurs',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: socialDialogueSectionId,
          text: 'Stakeholders in social dialogue succeed in establishing a healthy social climate and a co-responsible action framework: absence of social crisis',
          text_fr: 'Les parties prenantes au dialogue social et aboutit Ã  instaurer un climat social sain et un cadre d\'action Co responsabilisant : absence de crise sociale',
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
          text_fr: 'L\'Ã©tape de planification du projet est validÃ©e Ã  la suite d\'un Ã©tat des lieux avec la dÃ©finition d\'un plan d\'action priorisÃ©, l\'identification des ressources Ã  mettre Ã  disposition et la dÃ©signation d\'un chef de projetâ€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The organization phase is validated with: resources made available, action plan being implemented: data collection done completely and reliably',
          text_fr: 'La phase d\'organisation est validÃ©e avec :  la mise Ã  disposition des ressources faite, plan d\'action en cours de rÃ©alisation : collecte des donnÃ©es faite de faÃ§on complÃ¨te et fiable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Employees are made aware of climate issues and CO2 emissions',
          text_fr: 'Les salariÃ©s sont sensibilisÃ©s aux questions climatiques et Ã©missions de C02',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Effective implementation of the action plan is in place: Carbon footprint or carbon footprint calculation carried out, validated quantification',
          text_fr: 'La mise en Å“uvre effective du plan d\'action est en place : Calcul du bilan ou empreinte carbone effectuÃ©, quantification validÃ©e',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Emission reduction objectives defined and communicated',
          text_fr: 'Des objectifs de rÃ©duction des Ã©missions dÃ©finis et communiquÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The evaluation and control phase is in place with: exploitation of results and advantages for organizational and operational consolidation and improvement',
          text_fr: 'La phase d\'Ã©valuation et de contrÃ´le est en place avec : l\'exploitation des rÃ©sultats et des avantages pour la consolidation et l\'amÃ©lioration organisationnelle et opÃ©rationnelle',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'The company deploys its climate transition plan in coherence with its deployment at all levels of the organization',
          text_fr: 'L\'entreprise dÃ©ploie son plan de transition climat en cohÃ©rence avec sa dÃ©ployÃ©e Ã  tous les niveaux de l\'organisation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: carbonFootprintSectionId,
          text: 'Decarbonization objectives validated by third party (Ex, SBTI)',
          text_fr: 'Les objectifs de dÃ©carbonations validÃ©s par tierce partie (Ex, SBTI)',
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
          text_fr: 'La phase de planification du projet est validÃ©e Ã  la suite d\'un Ã©tat des lieux avec :  la dÃ©finition d\'un plan d\'action, ressources mises Ã  disposition, rapport d\'audit disponibleâ€¦',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The organization phase is completed: resources made available, action plan being implemented with an energy monitoring system in place: data collection done completely and reliably',
          text_fr: 'La phase d\'organisation est clÃ´turÃ©e : la mise Ã  disposition des ressources faite, plan d\'action en cours de rÃ©alisation avec un systÃ¨me de monitoring de l\'Ã©nergie mis en place : collecte des donnÃ©es faite de faÃ§on complÃ¨te et fiable',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'Operational mastery demonstrated by supervising staff',
          text_fr: 'MaÃ®trise opÃ©rationnelle dÃ©montrÃ©e par le personnel encadrant',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company undertakes employee awareness actions regarding energy consumption',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation des salariÃ©s au sujet de la consommation Ã©nergÃ©tique',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The effective implementation phase of the action plan is being realized (progress between 50 and 80%) and energy efficiency indicators are mastered and well managed',
          text_fr: 'La phase de mise en Å“uvre effective du plan d\'action est en cours de rÃ©alisation (avancement entre 50 et Ã  80%) et les Indicateurs d\'efficacitÃ© Ã©nergÃ©tique sont maÃ®trisÃ©s et bien pilotÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company has defined a code of conduct on energy efficiency and communicates about it with its internal stakeholders',
          text_fr: 'L\'entreprise a dÃ©fini un code de conduite en matiÃ¨re d\'efficacitÃ© Ã©nergÃ©tique et communique dessus avec ses parties prenantes internes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: energyManagementSectionId,
          text: 'The company has implemented a continuous improvement strategy for its energy efficiency actions to achieve previously set objectives: energy audits are frequently carried out with definition of adjustment plans',
          text_fr: 'L\'entreprise a mis en place une stratÃ©gie d\'amÃ©lioration continue de ses actions d\'efficacitÃ© Ã©nergÃ©tique afin d\'atteindre les objectifs prÃ©alablement fixÃ©s : des audits Ã©nergÃ©tiques sont frÃ©quemment rÃ©alisÃ©s avec dÃ©finition de plan d\'ajustement',
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
          text_fr: 'L\'entreprise entreprend des actions de communication Ã  l\'externe afin de sensibiliser ses parties prenantes externes Ã  l\'importance de l\'Ã©conomie d\'Ã©nergie et les inciter Ã  aller dans une dÃ©marche d\'efficacitÃ© Ã©nergÃ©tique et ou adopter des comportements responsables',
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
          text_fr: 'La planification du projet est validÃ©e avec :                                                                                             L\'identification des aspects environnementaux effectuÃ©e et leur significativitÃ© est Ã©valuÃ©e  \nL\'Ã©tablissement d\'un plan d\'action pour la maÃ®trise des aspects environnementaux. \nLa mise Ã  disposition des ressources (humaines et matÃ©rielles) nÃ©cessaires au projet validÃ© et initiÃ©e',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Actions related to identified environmental aspects are carried out including investment in environmentally friendly technologies',
          text_fr: 'Les actions liÃ©es aux aspects environnementaux identifiÃ©es sont rÃ©alisÃ©es y compris l\'investissement dans des technologies respectueuse de l\'environnement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Internal actors in charge of implementing actions are trained in the fundamentals of environmental operational control',
          text_fr: 'Les acteurs internes en charge de la mise en Å“uvre des actions sont formÃ©s aux fondamentaux de la maÃ®trise opÃ©rationnelle environnementale',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'Performance monitoring launched with development and implementation of actions: The company has defined environmental sustainability indicators and involves its employees in achieving them',
          text_fr: 'Suivi des performances lancÃ©es avec Ã©laboration et mise en Å“uvre des actions : L\'entreprise a dÃ©fini des indicateurs de durabilitÃ© environnementale et implique ses collaborateurs dans leur atteinte',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company undertakes employee awareness actions regarding respect for the environment and risks related to pollution',
          text_fr: 'L\'entreprise entreprend des actions de sensibilisation des salariÃ©s au sujet du respect de l\'environnement et des risques liÃ©s Ã  la pollution',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The implementation and deployment phase is confirmed and effective: 14001 Certification recently obtained',
          text_fr: 'La phase de mise en Å“uvre et dÃ©ploiement est confirmÃ©e et est effective : Certification 14001 rÃ©cemment obtenue',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company has implemented a continuous improvement strategy for its environmental sustainability actions: a monitoring system is in place for this purpose',
          text_fr: 'L\'entreprise a mis en place une stratÃ©gie d\'amÃ©lioration continue de ses actions de durabilitÃ© environnementale : un systÃ¨me de surveillance est mis en place Ã  cet effet',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The monitoring, control and evaluation phase is effectively in place to ensure system stability and performance',
          text_fr: 'La phase suivi , contrÃ´le et Ã©valuation est effectivement en place afin de s\'assurer de la stabilitÃ© du systÃ¨me et sa performance',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company structures an environmental management strategy and policy that allows it to position itself as a leader',
          text_fr: 'L\'entreprise structure une stratÃ©gie et une politique de gestion de l\'environnement qui lui permet de se positionner comme leader',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company has defined a policy and/or code of conduct regarding respect for the environment and communicates about it with its internal and external stakeholders',
          text_fr: 'L\'entreprise a dÃ©fini une politique et ou code de conduite en matiÃ¨re de respect de l\'environnement et communique dessus avec ses parties prenantes internes et externes',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: pollutionSectionId,
          text: 'The company invests in awareness actions for its external stakeholders (local community, suppliers and customers) to engage them to be respectful of the environment and adopt responsible behaviors',
          text_fr: 'L\'entreprise investit dans des actions de sensibilisation de ses parties prenantes externes (communautÃ© locale, fournisseurs et client) pour les engager Ã  Ãªtre respectueux de l\'environnement et adopter des comportements responsables',
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
          text_fr: 'La phase de planification est validÃ©e avec :                                                                                                   Des processus de conception et de dÃ©veloppement orientÃ©s vers l\'Ã©conomie circulaire Ã©tablis, mise Ã  disposition des ressources (humaines et matÃ©rielles) , disponibilitÃ© de la cartographie des parties prenantes aux processus de l\'Ã©conomie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'Partners to be involved in the process are informed and have validated the process',
          text_fr: 'Les partenaires Ã  impliquer dans le processus sont informÃ©s et ont validÃ© le processus',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The organization phase is validated and confirmed: The company formalizes its commitment to the environment through a circular economy policy whether at the level of its purchasing, production or valorization policy',
          text_fr: 'La phase d\'organisation est validÃ©e et confirmÃ©e :  L\'entreprise formalise son engagement vis-Ã -vis de l\'environnement et ce Ã  travers une politique d\'Ã©conomie circulaire que ce soit au niveau de sa politique d\'achat, de production ou de valorisation',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company raises awareness among its internal stakeholders about the importance of the circular economy and encourages them to use recycled products',
          text_fr: 'L\'entreprise sensibilise ses parties prenantes internes sur l\'importance de l\'Ã©conomie circulaire et les encourage Ã  utiliser les produits recyclÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company favors the consumption and purchase of recycled products by favoring agreements and transactions with suppliers who are adepts of the circular economy or who provide recycled products',
          text_fr: 'L\'entreprise privilÃ©gie la consommation et achat de produits recyclÃ© en favorisant les conventions et transactions avec des fournisseurs adeptes de l\'Ã©conomie circulaire ou qui fournissent des produits recyclÃ©s',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The effective implementation phase is in place with a positive trend for the use of internal resources for circular economy purposes',
          text_fr: 'La phase de mise en Å“uvre effective est en place avec une Tendance positive pour l\'utilisation des ressources internes Ã  des fins d\'Ã©conomie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company encourages its external stakeholders to use products from the circular economy by promoting processes or products based on this principle (offers recycled products, uses recycled products in its transactions...)',
          text_fr: 'L\'entreprise encourage ses parties prenantes externes Ã  utiliser des produits issus de l\'Ã©conomie circulaire en faisant la promotion des processus ou produits issue de ce principe (offre des produits recyclÃ©s, utilise dans ses transactions des produits recyclÃ©s ...)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'Innovations and projects are implemented integrating the circular economy',
          text_fr: 'Des innovations et des projets sont mis en Å“uvre intÃ©grant l\'Ã©conomie circulaire',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company systematically integrates eco-design principles into its design, development and production processes, based for example on the life cycle analysis (LCA) methodology',
          text_fr: 'L\'entreprise intÃ¨gre systÃ©matiquement dans ses process de conception, dÃ©veloppement et production les principes de l\'Ã©co conception, basÃ© par exemple sur la mÃ©thodologie de l\'analyse du cycle de vie (ACV)',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The company adopts production practices, on its sites and with its implementation territories, that are inspired by the principles of the circular economy in order to minimize impacts on the environment',
          text_fr: 'L\'entreprise adopte des pratiques de production, sur ses sites et avec ses territoires d\'implantation, qui s\'inspirent des principes de l\'Ã©conomie circulaire en vue de minimiser les impacts sur l\'environnement',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: circularEconomySectionId,
          text: 'The monitoring, control and evaluation phase is in place with organizational surveillance properly carried out (Inspections, audits, activity reviews)',
          text_fr: 'La phase de suivi, contrÃ´le et Ã©valuation est en place avec une surveillance de l\'organisation bel et bien effectuÃ©e (Inspections, audits, revues d\'activitÃ©s,)',
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
          text_fr: 'La phase de planification est bien validÃ©e : les enjeux de la biodiversitÃ© au niveau du territoire identifiÃ©s ainsi que l\'impact de l\'activitÃ©, produits et service sur la biodiversitÃ©, cartographie des parties prenantes Ã©tablie ainsi que le plan d\'action pour la prÃ©servation de la biodiversitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The implementation phase is started: employee awareness of the importance of biodiversity and the impact of their non-compliant practices on nature, stakeholder training on the action plan',
          text_fr: 'La phase de mise en Å“uvre est entamÃ©e : sensibilisation des collaborateurs Ã  l\'importance de la biodiversitÃ© et l\'impact de leur pratiques non conformes sur la nature, formation des parties prenantes au plan d\'action',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company implements an action plan in line with established national plans',
          text_fr: 'L\'entreprise met en Å“uvre un plan d\'action en adÃ©quation avec les plans nationaux Ã©tablis',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company involves its external and internal stakeholders in its commitments towards nature and respect for biodiversity by communicating about its actions and inviting them to take part in field actions',
          text_fr: 'L\'entreprise implique ses parties prenantes externes et internes dans ses engagements vis-Ã -vis de la nature et respect de la biodiversitÃ© en communiquant sur ses actions et en les invitant Ã  prendre part aux actions terrains',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company engages in partnerships with territorial actors involved in biodiversity-related subjects',
          text_fr: 'L\'entreprise s\'engage dans des partenariats avec les acteurs du territoire impliquÃ©s dans des sujets en lien avec la biodiversitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company participates in national and international initiatives aimed at protecting biodiversity',
          text_fr: 'L\'entreprise participe Ã  des initiatives nationales et internationales ayant pour objectif la protection de la biodiversitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company implements a system to evaluate the effectiveness of its actions on biodiversity',
          text_fr: 'L\'entreprise met en place un dispositif d\'Ã©valuation de l\'efficacitÃ© de ses actions sur la biodiversitÃ©',
          score_value: 5,
          created_at: new Date(),
          updated_at: new Date()
        },
        {
          id: uuidv4(),
          section_id: biodiversitySectionId,
          text: 'The company invests in research actions with specialized structures to encourage respect for biodiversity and limit the impact of risks: it wants to be a leader in ecosystem restoration and biodiversity preservation actions',
          text_fr: 'L\'entreprise investit dans actions de recherche avec des structures spÃ©cialisÃ©es afin d\'encourager le respect de la biodiversitÃ© et limiter l\'impact des risques : elle se veut leader en matiÃ¨re d\'action de restauration de l\'Ã©cosystÃ¨me et prÃ©servation de la biodiversitÃ©',
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
