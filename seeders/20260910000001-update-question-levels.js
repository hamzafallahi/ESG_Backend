'use strict';

// Sets the `level` (N1-N4, i.e. 1-4) on each existing question created by
// 20250909000003-create-questions.js, based on the evaluation grid.
// Matching is done by section title + exact text_fr, in the same order the
// questions were originally created (verified 1:1 against the evaluation grid).

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const sections = await queryInterface.sequelize.query(
      `SELECT s.id, s.title, s.title_fr
       FROM sections s`,
      { type: Sequelize.QueryTypes.SELECT }
    );

    const sectionMap = {};
    sections.forEach(section => {
      sectionMap[section.title] = section.id;
      if (section.title_fr) {
        sectionMap[section.title_fr] = section.id;
      }
    });

    const sectionQuestionLevels = {
      'The vision, strategy and governance of the CSR approach': [
        ["La politique RSE a été établie sur la base d'une analyse pertinente et sur la base d'un référentiel RSE exemples :\nExistence d'une feuille de route qui traduit les engagements RSE \nExistence d'une politique d'entreprise qui intègre les valeurs de développement durable", 1],
        ["L'engagement du leadership est démontré à travers des codes de conduite, une politique d'entreprise, vision stratégique qui intègre les valeurs RSE et ou préserve la durabilité de l'entreprise", 1],
        ["L'existence d'un code éthique et/ou d'une charte traduisant l'engagement de l'entreprise en matière de RSE", 2],
        ["Des outils et supports de communication sont mis en place et déployés à des fins de sensibilisation du personnel quant à l'importance de la RSE et l'engagement de l'entreprise dans ce sens. Exemples : affiches, vidéos, organisation de séances de formation, focus groupe…", 2],
        ["Les enjeux de l'entreprise en matière de RSE sont bien identifiés et analysés, exemples : matrice de matérialité disponible", 3],
        ["L'entreprise implique ses parties prenantes internes et externes dans sa stratégie à moyen et long terme exemple : charte et ou codes éthiques communiqués et signés par les parties prenantes, des indicateurs de durabilité sont fixés pour les managers et ou départements", 3],
        ["Un dispositif d'évaluation de la politique RSE est en place, exemple : audit interne par les responsables, chargé RSE", 3],
        ["Le modèle d'affaire est établi dans le respect des exigences du développement durable", 4],
        ["Processus de prise de décision pertinent et implique toutes les parties prenantes exemples : existence d'outil de concertation avec les parties prenantes", 4],
        ["Déploiement des normes de développement durable dans tous les processus de l'entreprise", 4]
      ],
      'Ethical approach: Anti-corruption policy and business ethics / Due diligence': [
        ["Les pratiques de l'entreprise sont conformes à la réglementation et législation en vigueur", 1],
        ["L'entreprise met en place un dispositif pour s'assurer des pratiques éthiques par ses salariés, exemples engagements signés par les parties concernées, contrôle continu …", 1],
        ["L'entreprise formalise son engagement éthique et le communique à toutes ses parties prenantes, exemple : les principes d'éthique des affaires et de lutte contre la corruption sont intégrés dans la politique interne, existence d'un code ou charte éthique qui aborde les principes de lutte contre la corruption et l'éthique des affaires, existence de politique de lutte contre la corruption et de l'éthique des affaires", 2],
        ["L'entreprise met en place un dispositif de communication et de sensibilisation sur l'éthique des affaires et la lutte contre la corruption", 2],
        ["Des programmes de lutte contre la corruption, destinés à toutes les parties prenantes sont en place exemples : formation des salariés, séances d'information et de sensibilisation par des experts, mise en place d'un système d'alerte, enquêtes internes et externes…", 3],
        ["Des audits internes sont fréquemment effectués afin de s'assurer de la conformité des pratiques en matière d'éthique des affaires.", 3],
        ["L'intégralité du processus de diligence est en place et est maîtrisé avec :\nLa cartographie des risques élaborée\nDes évaluations régulières des situations des filiales, sous-traitant et fournisseurs sont en place et contrôlées\nUn système d'évaluation indépendant est en place (audit externe)\nUn reporting est en place et est communiqué", 4]
      ],
      'Relationship with clients and consumers': [
        ["L'entreprise respecte son engagement contractuel vis-à-vis de ses clients /consommateurs et ce dans le respect de la réglementation en faveur de leurs droits exemples : conformité des consignes de santé de sécurité des clients : consommateurs, conformité des produits commercialisés, vendus", 1],
        ["L'entreprise intègre les principes de protection des clients ou consommateurs dans son code et ou charte éthique tout en insistant sur sa responsabilité vis-à-vis de ces derniers et ce dans le cadre de leur relation contractuelle", 1],
        ["L'entreprise se veut être une entreprise responsable en bannissant toute le publicité mensongère et greenwashing", 1],
        ["L'entreprise se montre à l'écoute de ses clients et consommateurs avec la mise en place d'un dispositif d'écoute client exemple : enquête de satisfaction", 2],
        ["L'entreprise élabore un plan d'action en réponse aux réclamations, propositions des clients", 2],
        ["L'entreprise respecte les délais annoncés dans le traitement des réclamations et ou litiges avec les clients consommateurs", 2],
        ["L'entreprise met en place un système de veille lui permettant de proposer les solutions les mieux à même de satisfaire aux besoins de ses clients au niveau social et environnemental pour renforcer ainsi leur responsabilité en matière de durabilité exemple : partage de bonne pratiques RSE , proposition de fournisseur « RSE » particulièrement s'il font partie de leur territoires accompagnement dans l'adaptation de processus durable…", 3],
        ["L'entreprise encourage des clients et consommateurs à adopter une consommation responsable exemple : campagne de communication et de sensibilisation ayant pour objectif la lutte contre l'obsolescence programmée, sur les bénéficies de la réutilisation et le réemploi …", 3],
        ["L'entreprise investit dans des processus innovants afin de renforcer le dispositif de protection des consommateurs contre les risques pour leur santé et leur sécurité lors de l'utilisation du produit commercialisé.", 4],
        ["L'entreprise encourage ses client consommateurs à la consommation responsable en investissant dans :\nDes actions de sensibilisation sur les bénéfices de la réutilisation ou réemploi\nDes actions de lutte contre l'obsolescence programmée\nAcquisition de dispositif de collecte des produits usagés", 4]
      ],
      'Transparency: Executive Compensation': [
        ["Les données financières relatives à la rémunération sont disponibles et ce pour tous les salariés de l'entreprise y compris les dirigeants", 1],
        ["L'entreprise publie dans ses rapports annuels la rémunération et les avantages en toute nature des dirigeants / mandataires sociaux", 2],
        ["Les parties prenantes internes (représentants du personnel) contribue à l'élaboration ou ajustement de la politique salariale", 2],
        ["Les rapports annuels font état de la rémunération de tous les dirigeants et mandataires", 3],
        ["L'entreprise privilégie ou encourage l'investissement d'une partie de la rémunération des dirigeants (essentiellement les variables) dans des projets durables et ou d'ancrage territorial.", 3],
        ["Le reporting qui intègre la rémunération des dirigeants est vérifié par des tiers", 4]
      ],
      'Governance: Independence of the Board of Directors': [
        ["Les missions et activités des dirigeants tels que définis au sein du conseil ou comité de direction traduisent leur indépendance et ce dans le respect des exigences RSE", 1],
        ["Les membres du conseil d'administration ou comité de direction sont formés sur les principes de la RSE et s'engage à les adopter.", 2],
        ["Existence de protocole et ou charte traduisant le principe d'indépendance des membres du conseil d'administration ou de direction", 2],
        ["Les membres du conseil d'administration démontrent leurs indépendances vis-à-vis des décisions stratégiques, les membres du comité de direction démontrent leur impartialité vis-à-vis des décisions stratégiques, des membres tiers indépendants ont un rôle et un pouvoir décisionnaire dans le conseil d'administration.", 3],
        ["Les décisions prises sont communiquées et partagées avec les parties prenantes internes et externes", 3],
        ["Des audits en internes sont fréquemment réalisés afin d'évaluer l'indépendance des membres du conseil d'administration et impartialité du comité de direction", 3],
        ["Un système d'évaluation par des tiers est en place pour évaluer l'indépendance des membres du conseil d'administration et les décisions prises dans l'exercice de leur mission", 4],
        ["Un système d'alerte est mis en place pour signaler toute situation à risque", 4]
      ],
      'Feminization of management': [
        ["La féminisation du conseil ou comité de direction fait partie des objectifs stratégiques de l'entreprise et est intégrée à la feuille de route RH", 1],
        ["La charte et Protocoles de sélection des cadres de directions et des droits des actionnaires favorisent les nominations et promotions basés sur les compétences et traduisent le principe de l'égalité des chances", 1],
        ["L'entreprise est à l'écoute des parties prenantes internes afin d'identifier les besoins et leviers qui permettent de favoriser la féminisation des postes de direction", 2],
        ["L'entreprise alloue les moyens nécessaires afin de développer les compétences des femmes dans une optique d'évolution de carrière et d'intégration dans les postes à responsabilité", 2],
        ["L'entreprise mesure la satisfaction des parties prenantes internes quant aux actions favorisant la féminisation des postes de management", 3],
        ["La démarche de féminisation des postes de management est fréquemment revue et ajustée", 3],
        ["L'entreprise investit dans des actions qui favorise la promotion de la femme dans les postes de responsabilité", 3],
        ["L'entreprise s'accorde le droit d'ajuster les moyens et conditions de travail afin de favoriser l'intégration des femmes dans les postes à responsabilité", 4],
        ["Des plans de carrière pour les potentiels femmes sont mis en place afin de favoriser la féminisation de la direction", 4]
      ],
      'Data confidentiality and privacy protection': [
        ["L'entreprise dispose de procédures ayant pour objectif la protection des données à caractère personnel", 1],
        ["L'entreprise dispose de procédures ayant pour objectif la protection des données client", 1],
        ["L'entreprise dispose de politique ayant pour objectif la protection des données et ce au niveau de tout le processus de gestion (collecte , rétention et destruction)", 2],
        ["L'entreprise sensibilise en continue ses collaborateurs aux enjeux de la protection des données", 2],
        ["L'entreprise communique sur sa stratégie de protection et de gestion des données avec ses clients et fournisseurs", 2],
        ["L'entreprise évalue les risques en matière de gestion des données client et à caractère personnel", 3],
        ["L'entreprise dispose d'un plan de prévention et d'atténuation des risques", 3],
        ["L'entreprise surveille activement la mise en application de ses politiques en matière de protection des données : réalisation d'audit interne", 3],
        ["Disponibilité des données relatives à la gestion des données dans les rapports annuels", 4],
        ["L'entreprise fait appel à des tiers afin de réaliser des audits pour s'assurer de la conformité des pratiques", 4],
        ["L'entreprise étend sa politique de protection des données à ses fournisseurs et sous-traitants", 4],
        ["L'entreprise a obtenu sa certification 27701 ou tout autre norme qui atteste de sa conformité en la matière", 4]
      ],
      'Working conditions: Compliance with regulatory standards in labor matters': [
        ["L'entreprise formalise toutes relations contractuelles avec ses salariés par un contrat de travail dûment établi : type de contrat, volume horaire, droit des parties, travail des enfants …", 1],
        ["L'entreprise dispose d'un bilan social lorsque son effectif est égal ou dépasse les 300 salariés, pour celle dont l'effectif est de moins de 300 salariés, elle dispose des données nécessaires relatives à chaque salarié et le tout est bien archivés", 1],
        ["Les déclarations sociales sont faites par l'entreprise à temps", 1],
        ["Existence de procédures de gestion administrative du personnel avec documentation et traçabilité de toutes les actions relatives à ces procédures", 2],
        ["Le bilan social est en place, communiqué et suivi de plan d'action", 2],
        ["En cas de dysfonctionnement signalé en interne ou par un tiers et relatif au respect d'une norme en lien avec les droits de l\"homme et le respect de la règlementation , l'entreprise doit justifier des mesures entreprises à l'égard de ces dépassements involontaires", 2],
        ["Une enquête de satisfaction salariés est déployée afin de mesurer la satisfaction des salariés quantaux procédures de gestion administrative du personnel, les résultats de l'enquête donnent lieu à un plan d'action", 2],
        ["Des audits internes sont fréquemment effectués afin de s'assurer de la conformité des pratiques liées à la gestion administrative du personnel et du respect des droits de l'homme, les résultats de ces audits donnent lieu à des plans d'action", 3],
        ["L'entreprise engage des actions de sensibilisations pour ses parties prenantes internes et qui portent sur les risques liés au respect des droits de l'homme", 3],
        ["Un processus de diligence qui consacre le principe de respect des droits de l'homme est en place avec l'existence de :\nLa cartographie des risques liés aux droits de l'homme\nDes procédures d'évaluation régulière de la situation des filiales, et des sous-traitants ou fournisseurs pour contrôler leur respect des droits de l'homme et des conditions de travail \nActions de sensibilisation pour ses parties prenantes externes et qui portent sur les risques liés au respect des droits de l'homme.\nUn plan d'atténuation des risques lié aux droits de l'homme ou de prévention                                                  Un système d'évaluation et de suivi mis en place", 4]
      ],
      'Working conditions: health and safety at work': [
        ["Existence d'un comité de santé et de sécurité au travail pour les entreprises de 40 salariés et plus, existence de procédure de sécurité de travail pour les entreprises de moins de 40 salariés", 1],
        ["Les procédures de prévention des risques liés à la santé et la sécurité au travail sont bien maîtrisées", 1],
        ["La certification 45001 en cours de mise en place", 2],
        ["Système de management de l'entreprise est en phase avec les exigences de l'ISO 9001", 2],
        ["Les salariés sont impliqués dans la gestion de la santé et sécurité au travail exemple :\nLes mécanismes de la consultation / participation des travailleurs est en place et initiés\nUn système d'alerte par tous les salariés quant aux risques liés à la santé et sécurité au travail est mis en place", 2],
        ["L'entreprise dispose d'un guide de bonnes pratiques qui intègre toutes les règles liées à la santé et la sécurité au travail. Ce même guide est communiqué à tous les salariés", 2],
        ["Certification 45001 Obtenue", 3],
        ["Les pratiques en lien avec la santé et la sécurité sont constamment évaluées", 3],
        ["Les Risques psychosociaux figurent dans la cartographie des risques de l'entreprise", 3],
        ["Toutes les parties prenantes internes sont impliquées dans les plans de prévention des risques sur la santé et sécurité au travail exemple les managers sont formés sur le rôle en matière de santé et de sécurité au travail et ont des objectifs dessus, la matrice des compétences intègre celles en lien avec la santé et la sécurité au travail", 3],
        ["Existence de Label portant sur les normes de santé et sécurité au travail", 4],
        ["Prise en compte de tous les indicateurs de la santé et sécurité au travail y comrpis les RPS dans le rapport annuel", 4],
        ["Toutes les parties prenantes internes et externes sont impliquées dans les plans de prévention des risques sur la santé et sécurité au travail exemples : convention avec des organismes de santé ou de sécurité au travail", 4],
        ["Des plans d'action Qualité de Vie et Condition de Travail sont définis déployés et pilotés", 4]
      ],
      'Working conditions: Equal pay': [
        ["L'entreprise respecte la grille conventionnelle telle que définie", 1],
        ["Une grille de salaire interne est en place tient compte de la différence entre les différentes catégories socio-professionnelle et de l'ancienneté", 2],
        ["Existence d'un système de rétribution", 2],
        ["Des enquêtes de satisfaction internes abordent la question de la rémunération, l'entreprise tient compte de ses retours afin d'ajuster sa politique de rémunération", 2],
        ["La grille de salaire de l'entreprise est respectueuse de l'équité interne et externe", 3],
        ["Une politique de rémunération fixe et variable est en place et est conforme", 3],
        ["Le système de rémunération interne est construit selon une approche participative avec des représentant de toutes les parties prenantes internes", 3],
        ["Des enquêtes de satisfaction interne sur la politique de rémunération sont en place afin de mesurer leur satisfaction", 4],
        ["En cas de non-conformité des résultats de l'enquête un plan d'action est bien établi", 4],
        ["Une grille d'avantage sociaux est en place et respecte le principe de l'équité", 4],
        ["L'entreprise veille à ce que ses prestataires ( société d'intérim) respectent les normes conventionnelles en matière de rémunération et s'assure que les écarts de salaires ne sont pas préjudiciables aux intérimaires et ne dépasse pas 10%", 4]
      ],
      'Working conditions: Employee training': [
        ["Tous les salariés ont reçu au moins une action de montée en compétence par an", 1],
        ["Des formations initiales sont prévues afin de garantir un minimum de maîtrise du métier par chaque collaborateur dans son poste de travail", 1],
        ["Le niveau de maîtrise des compétences est mesuré en post formation", 1],
        ["Des plans de développement de compétence sont définis et déployés pour les collaborateurs en besoin de montée en compétence", 2],
        ["Un dispositif d'identification des besoins en formation est en place", 2],
        ["Les salariés sont questionnés sur leur besoin en formation", 2],
        ["Des plans de développement de compétence sont définis et déployés pour tous les salariés et sont intégré dans un plan de développement de carrière", 3],
        ["Les plans de développement de compétence sont annuellement évalués et revisités", 3],
        ["L'entreprise dispose d'une politique de gestion des potentiels et des talents", 4],
        ["Les plans de développement des compétences font l'objet d'enquête de satisfaction interne dont les résultats sont systématiquement suivis de plan d'ajustement", 4],
        ["L'entreprise propose des formations innovantes, à la carte et en cohérence avec la stratégie RSE de l'entreprise", 4]
      ],
      "Diversity and inclusion: Integration of women, people with reduced mobility, disabled people and young people": [
        ["L'entreprise respecte la règlementation en vigueur au sujet de la diversité et de l'inclusion exemple : égalité de la rémunération, inclusion des personnes en situations d'handicape", 1],
        ["L'entreprise justifie de demandes de dérogation lorsqu'elle n'est pas en mesure d'intégrer le % de personnes en situation d'handicape tel que stipulé par la loi ( 2% pour les entreprises de plus de 100 salarié et 1% pour les entreprises de moins de 100 salariés )", 1],
        ["Les indicateurs de la diversité et de l'inclusion sont intégrés dans le bilan social", 2],
        ["Les objectifs d'inclusion sont fixés, suivis et atteints", 2],
        ["Les acteurs agissant sur la politique de la diversité et de l'inclusion sont formés aux outils et démarche de mise en œuvre", 2],
        ["L'entreprise investit dans des installations et espaces adaptés aux personnes à mobilités réduites et besoins spécifiques", 2],
        ["Les principes de l'égalité des chances, de la diversité et de l'inclusion sont intégrés dans le code éthique et ou charte éthique", 2],
        ["La politique de la diversité et de l'inclusion est bien formalisée", 3],
        ["La communication interne, la formation et sensibilisation des salariés sont établis", 3],
        ["Les aspects de la diversité et de l'inclusion sont pris en compte dans les processus de gestion RH", 3],
        ["Existence d'un système d'évaluation de la diversité et de l'inclusion avec des plans d'amélioration des actions", 3],
        ["Un bilan annuel des actions de la diversité et de l'inclusion est établi et communiqué", 3],
        ["Les parties prenantes internes sont impliqués dans le bon déploiement de la politique", 3],
        ["Existence d'une démarche Diversité et inclusion structurée et reconnue (Label ou certification)", 4],
        ["Intégration de la politique diversité et inclusion dans la stratégie de l'entreprise", 4],
        ["Prise en compte des indicateurs de la diversité dans tous les processus de gestion RH", 4],
        ["Communication externe et implication des parties prenantes externes à savoir client fournisseurs et communauté locale et institutions spécialisées dans des actions qui favorise le genre en la diversité", 4],
        ["Existence d'un système d'évaluation des risques à la diversité en interne et au niveau des parties prenantes externes concernées", 4],
        ["Existence d'un système d'évaluation des pratiques de la diversité avec un dispositif d'amélioration et d'innovation", 4]
      ],
      'Community engagement and commitment to local communities': [
        ["L'entreprise veille au respect des normes et règlementations en vigueur et se limite au droit d'exercice dans sa région", 1],
        ["L'entreprise adopte des pratiques conforment à la culture et tradition de la région", 1],
        ["L'entreprise entreprend des actions de sensibilisation quant à son rôle dans le développement local et régional et communique sur les actions entreprises dans ce sens", 2],
        ["L'entreprise adopte les outils de production aux besoins locaux et ce dans la mesure du possible", 2],
        ["L'entreprise favorise par ses actions la création de richesse chez les communautés locales exemple : choix de fournisseurs locaux", 2],
        ["L'entreprise engage des actions avec les communautés locales en favorisant les relations gagnant-gagnant exemples : convention avec les institutions locales, stages, journées portes ouvertes", 3],
        ["L'entreprise implique ses salariés dans des actions de bénévolat", 3],
        ["L'entreprise met en place un dispositif pour mesurer son ancrage local et son impact (enquête interne et externe)", 3],
        ["L'entreprise investit dans des projets qui favorise le développement local en impliquant les acteurs locaux , exemple projet R&D", 4]
      ],
      'Social dialogue: Relationship with unions and staff representatives': [
        ["L'entreprise respecte la règlementation en vigueur en matière de dialogue social à savoir l'existence d'un CCE pour les entreprises de plus de 40 salarié pour celle qui en ont moins disponibilité des PV de réunion avec les salariés de l'entreprise", 1],
        ["Les partenaires sociaux sont fortement impliqués dans les décisions et ont tendance à imposer leur avis", 1],
        ["Les décisions touchant le volet social sont la résultante de négociation collective avec les partenaires sociaux avec vers la fin une tendance au compromis", 2],
        ["Les délégués du personnel sont considérés comme de vrais partenaires et contribuent à l'élaboration de solutions pertinentes même sur des volets opérationnels ce qui a un impact positif sur la performance", 3],
        ["Les partenaires sociaux sont parties prenantes à toutes initiative sociale ou territoriale et impliqués dans le déploiement de tout projet stratégique de l'entreprise et se positionnent en ambassadeurs", 4],
        ["Les parties prenantes au dialogue social et aboutit à instaurer un climat social sain et un cadre d'action Co responsabilisant : absence de crise sociale", 4]
      ],
      'Climate assessment: CO2 emissions: Carbon footprint/Carbon footprint': [
        ["L'étape de planification du projet est validée à la suite d'un état des lieux avec la définition d'un plan d'action priorisé, l'identification des ressources à mettre à disposition et la désignation d'un chef de projet…", 1],
        ["La phase d'organisation est validée avec :  la mise à disposition des ressources faite, plan d'action en cours de réalisation : collecte des données faite de façon complète et fiable", 2],
        ["Les salariés sont sensibilisés aux questions climatiques et émissions de C02", 2],
        ["La mise en œuvre effective du plan d'action est en place : Calcul du bilan ou empreinte carbone effectué, quantification validée", 3],
        ["Des objectifs de réduction des émissions définis et communiqués", 3],
        ["La phase d'évaluation et de contrôle est en place avec : l'exploitation des résultats et des avantages pour la consolidation et l'amélioration organisationnelle et opérationnelle", 4],
        ["L'entreprise déploie son plan de transition climat en cohérence avec sa déployée à tous les niveaux de l'organisation", 4],
        ["Les objectifs de décarbonations validés par tierce partie (Ex, SBTI)", 4]
      ],
      'Energy Management': [
        ["La phase de planification du projet est validée à la suite d'un état des lieux avec :  la définition d'un plan d'action, ressources mises à disposition, rapport d'audit disponible…", 1],
        ["La phase d'organisation est clôturée : la mise à disposition des ressources faite, plan d'action en cours de réalisation avec un système de monitoring de l'énergie mis en place : collecte des données faite de façon complète et fiable", 2],
        ["Maîtrise opérationnelle démontrée par le personnel encadrant", 2],
        ["L'entreprise entreprend des actions de sensibilisation des salariés au sujet de la consommation énergétique", 2],
        ["La phase de mise en œuvre effective du plan d'action est en cours de réalisation (avancement entre 50 et à 80%) et les Indicateurs d'efficacité énergétique sont maîtrisés et bien pilotés", 3],
        ["L'entreprise a défini un code de conduite en matière d'efficacité énergétique et communique dessus avec ses parties prenantes internes", 3],
        ["L'entreprise a mis en place une stratégie d'amélioration continue de ses actions d'efficacité énergétique afin d'atteindre les objectifs préalablement fixés : des audits énergétiques sont fréquemment réalisés avec définition de plan d'ajustement", 3],
        ["Certification 50001 obtenue", 4],
        ["L'entreprise entreprend des actions de communication à l'externe afin de sensibiliser ses parties prenantes externes à l'importance de l'économie d'énergie et les inciter à aller dans une démarche d'efficacité énergétique et ou adopter des comportements responsables", 4]
      ],
      'Pollution: water use/pollution, waste management': [
        ["La planification du projet est validée avec :                                                                                             L'identification des aspects environnementaux effectuée et leur significativité est évaluée  \nL'établissement d'un plan d'action pour la maîtrise des aspects environnementaux. \nLa mise à disposition des ressources (humaines et matérielles) nécessaires au projet validé et initiée", 1],
        ["Les actions liées aux aspects environnementaux identifiées sont réalisées y compris l'investissement dans des technologies respectueuse de l'environnement", 2],
        ["Les acteurs internes en charge de la mise en œuvre des actions sont formés aux fondamentaux de la maîtrise opérationnelle environnementale", 2],
        ["Suivi des performances lancées avec élaboration et mise en œuvre des actions : L'entreprise a défini des indicateurs de durabilité environnementale et implique ses collaborateurs dans leur atteinte", 2],
        ["L'entreprise entreprend des actions de sensibilisation des salariés au sujet du respect de l'environnement et des risques liés à la pollution", 2],
        ["La phase de mise en œuvre et déploiement est confirmée et est effective : Certification 14001 récemment obtenue", 3],
        ["L'entreprise a mis en place une stratégie d'amélioration continue de ses actions de durabilité environnementale : un système de surveillance est mis en place à cet effet", 3],
        ["La phase suivi , contrôle et évaluation est effectivement en place afin de s'assurer de la stabilité du système et sa performance", 4],
        ["L'entreprise structure une stratégie et une politique de gestion de l'environnement qui lui permet de se positionner comme leader", 4],
        ["L'entreprise a défini une politique et ou code de conduite en matière de respect de l'environnement et communique dessus avec ses parties prenantes internes et externes", 4],
        ["L'entreprise investit dans des actions de sensibilisation de ses parties prenantes externes (communauté locale, fournisseurs et client) pour les engager à être respectueux de l'environnement et adopter des comportements responsables", 4]
      ],
      'Circular economy': [
        ["La phase de planification est validée avec :                                                                                                   Des processus de conception et de développement orientés vers l'économie circulaire établis, mise à disposition des ressources (humaines et matérielles) , disponibilité de la cartographie des parties prenantes aux processus de l'économie circulaire", 1],
        ["Les partenaires à impliquer dans le processus sont informés et ont validé le processus", 1],
        ["La phase d'organisation est validée et confirmée :  L'entreprise formalise son engagement vis-à-vis de l'environnement et ce à travers une politique d'économie circulaire que ce soit au niveau de sa politique d'achat, de production ou de valorisation", 2],
        ["L'entreprise sensibilise ses parties prenantes internes sur l'importance de l'économie circulaire et les encourage à utiliser les produits recyclés", 2],
        ["L'entreprise privilégie la consommation et achat de produits recyclé en favorisant les conventions et transactions avec des fournisseurs adeptes de l'économie circulaire ou qui fournissent des produits recyclés", 2],
        ["La phase de mise en œuvre effective est en place avec une Tendance positive pour l'utilisation des ressources internes à des fins d'économie circulaire", 3],
        ["L'entreprise encourage ses parties prenantes externes à utiliser des produits issus de l'économie circulaire en faisant la promotion des processus ou produits issue de ce principe (offre des produits recyclés, utilise dans ses transactions des produits recyclés ...)", 3],
        ["Des innovations et des projets sont mis en œuvre intégrant l'économie circulaire", 3],
        ["L'entreprise intègre systématiquement dans ses process de conception, développement et production les principes de l'éco conception, basé par exemple sur la méthodologie de l'analyse du cycle de vie (ACV)", 4],
        ["L'entreprise adopte des pratiques de production, sur ses sites et avec ses territoires d'implantation, qui s'inspirent des principes de l'économie circulaire en vue de minimiser les impacts sur l'environnement", 4],
        ["La phase de suivi, contrôle et évaluation est en place avec une surveillance de l'organisation bel et bien effectuée (Inspections, audits, revues d'activités,)", 4]
      ],
      'Impact on biodiversity': [
        ["La phase de planification est bien validée : les enjeux de la biodiversité au niveau du territoire identifiés ainsi que l'impact de l'activité, produits et service sur la biodiversité, cartographie des parties prenantes établie ainsi que le plan d'action pour la préservation de la biodiversité", 1],
        ["La phase de mise en œuvre est entamée : sensibilisation des collaborateurs à l'importance de la biodiversité et l'impact de leur pratiques non conformes sur la nature, formation des parties prenantes au plan d'action", 2],
        ["L'entreprise met en œuvre un plan d'action en adéquation avec les plans nationaux établis", 3],
        ["L'entreprise implique ses parties prenantes externes et internes dans ses engagements vis-à-vis de la nature et respect de la biodiversité en communiquant sur ses actions et en les invitant à prendre part aux actions terrains", 3],
        ["L'entreprise s'engage dans des partenariats avec les acteurs du territoire impliqués dans des sujets en lien avec la biodiversité", 3],
        ["L'entreprise participe à des initiatives nationales et internationales ayant pour objectif la protection de la biodiversité", 3],
        ["L'entreprise met en place un dispositif d'évaluation de l'efficacité de ses actions sur la biodiversité", 4],
        ["L'entreprise investit dans actions de recherche avec des structures spécialisées afin d'encourager le respect de la biodiversité et limiter l'impact des risques : elle se veut leader en matière d'action de restauration de l'écosystème et préservation de la biodiversité", 4]
      ]
    };

    let updatedCount = 0;
    let notFoundCount = 0;

    for (const [sectionTitle, entries] of Object.entries(sectionQuestionLevels)) {
      const sectionId = sectionMap[sectionTitle];
      if (!sectionId) {
        console.warn(`Section not found, skipping: ${sectionTitle}`);
        continue;
      }

      for (const [textFr, level] of entries) {
        const [, affectedRows] = await queryInterface.sequelize.query(
          `UPDATE questions SET level = :level, updated_at = NOW()
           WHERE section_id = :sectionId AND text_fr = :textFr`,
          {
            replacements: { level, sectionId, textFr },
            type: Sequelize.QueryTypes.UPDATE
          }
        );

        if (affectedRows) {
          updatedCount += affectedRows;
        } else {
          notFoundCount += 1;
          console.warn(`No matching question found for section "${sectionTitle}": ${textFr.slice(0, 60)}...`);
        }
      }
    }

    console.log(`Question levels updated: ${updatedCount}, not found: ${notFoundCount}`);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.sequelize.query(`UPDATE questions SET level = 1, updated_at = NOW()`);
  }
};
