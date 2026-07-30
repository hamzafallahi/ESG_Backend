'use strict';

/**
 * Dynamic seeder that links questions to RSCI elements based on the Excel mapping.
 *
 * Strategy: for each Excel row (French question text + RSCI codes), we find the
 * best-matching question in the DB using normalised Jaccard word-overlap similarity,
 * then insert one row in question_rscis per (question, rsci) pair.
 *
 * The texts in the Excel were reformulated relative to the DB, so exact matching
 * is not possible – the similarity function tolerates paraphrasing while still
 * finding the right question.
 */

// ---------------------------------------------------------------------------
// Excel data: every entry has the French question text and the RSCI codes that
// must be linked to it.  Source: excel.txt (Questions | RSCI REF columns only).
// ---------------------------------------------------------------------------
const EXCEL_MAPPINGS = [
  // ── GOVERNANCE / Ethics & anti-corruption ──────────────────────────────
  {
    text: "La politique RSE est établie et documentée sur la base d'une analyse pertinente et d'un référentiel de développement durable reconnu. Elle est déclinée en feuille de route avec engagements concrets, et intègre une vision portée par des valeurs respectueuses du développement durable.",
    rscis: ['A.1']
  },
  {
    text: "L'engagement du leadership en faveur de la RSE est démontré à travers un code de conduite formalisé, une politique d'entreprise écrite, une vision stratégique communiquée et des actions visibles de la direction (communications internes/externes, prises de parole, allocation de ressources).",
    rscis: ['A.1']
  },
  {
    text: "Un code éthique et/ou une charte traduisent l'engagement de l'entreprise en matière de RSE et de respect des principes fondamentaux (redevabilité, transparence, comportement éthique, légalité, respect des droits humains et des parties prenantes). Le document est validé par la direction, diffusé à l'ensemble des collaborateurs et signé par chacun lors de l'intégration.",
    rscis: ['A.1']
  },
  {
    text: "Des outils et supports de communication (intranet, livret d'accueil, affichage, e-learning, vidéos) sont mis en place et déployés à des fins de sensibilisation du personnel à la démarche RSE, avec suivi du taux de participation et évaluation des connaissances acquises.",
    rscis: ['A.1']
  },
  {
    text: "Un dispositif d'évaluation de la politique RSE est en place : audits internes réalisés par les responsables ou un chargé RSE, revue de direction périodique, mesure des indicateurs clés, plan d'amélioration continue formalisé.",
    rscis: ['A.1']
  },
  {
    text: "Les pratiques de l'entreprise sont conformes à la réglementation et à la législation en vigueur dans tous les domaines de son activité (fiscalité, droit du travail, transactions commerciales, concurrence loyale, lutte contre la corruption, protection des données).",
    rscis: ['A.1']
  },
  {
    text: "L'entreprise met en place un dispositif pour s'assurer des pratiques éthiques par ses salariés : engagements signés à l'embauche, charte éthique remise à chaque collaborateur, formation initiale obligatoire à la déontologie, dispositif d'alerte interne pour signaler tout manquement.",
    rscis: ['A.1']
  },
  {
    text: "L'entreprise formalise son engagement éthique dans un code de conduite / charte éthique et le communique à toutes ses parties prenantes (salariés, clients, fournisseurs, partenaires). Le document précise les principes de loyauté, de non-corruption, de respect des personnes et des règles, et les sanctions encourues en cas de manquement.",
    rscis: ['A.1']
  },
  {
    text: "L'entreprise met en place un dispositif de communication et de sensibilisation continu sur l'éthique des affaires et la lutte contre la corruption (affichage, newsletter, e-learning, modules de formation obligatoires renouvelés périodiquement).",
    rscis: ['A.1']
  },
  {
    text: "Des programmes structurés de lutte contre la corruption sont déployés à destination de toutes les parties prenantes (formations métiers exposés, cartographie des situations à risque, procédures cadeaux et invitations, due diligence des tiers, plan de communication, planning d'audits internes).",
    rscis: ['A.1']
  },
  {
    text: "Des audits internes sont fréquemment réalisés afin de s'assurer de la conformité des pratiques en matière d'éthique des affaires et anti-corruption, avec rapports formalisés, plans d'action correctifs et suivi par la direction.",
    rscis: ['A.1']
  },
  {
    text: "L'intégralité du processus de diligence raisonnable est en place et maîtrisé : cartographie des risques éthiques et droits humains, matrice des risques, plan d'atténuation, structure éthique indépendante (comité ou référent), mécanisme d'alerte sécurisé, mesures correctives et reporting régulier au comité de direction.",
    rscis: ['A.1', 'K.1']
  },

  // ── SOCIAL / Working conditions – labour standards ────────────────────
  {
    text: "L'entreprise formalise toutes ses relations contractuelles avec ses salariés par un contrat de travail dûment établi et signé par les deux parties (CDI, CDD selon les besoins et selon les exigences réglementaires) conforme à la convention sectorielle. Les contrats stipulent explicitement la liberté de démissionner avec un préavis raisonnable, l'interdiction de toute rétention de documents originaux (passeports, titres de séjour, diplômes) et l'absence de tout dépôt de garantie financière. Une procédure de vérification d'âge documentée garantit l'absence de travailleurs de moins de 15 ans, et les jeunes travailleurs (15-18 ans) bénéficient de conditions adaptées.",
    rscis: ['D.2', 'B.1', 'C.1']
  },
  {
    text: "L'entreprise dispose d'un bilan social complet lorsque son effectif est ≥ 300 salariés (conformément aux obligations légales) ; pour les entreprises de moindre effectif, un bilan synthétique reprend a minima les indicateurs RH essentiels : effectifs par catégorie, mouvements (entrées/sorties/turnover), masse salariale, formation, conditions de travail, accidents, absentéisme, dialogue social.",
    rscis: ['A.1']
  },
  {
    text: "Les déclarations sociales (CNSS, CNAM, IRPP) sont faites par l'entreprise dans les délais légaux, avec traçabilité des paiements et des justificatifs, et zéro pénalité de retard.",
    rscis: ['A.1', 'F.3']
  },
  {
    text: "L'entreprise dispose de procédures formalisées de gestion administrative du personnel avec documentation et traçabilité de toutes les actions RH (dossier individuel par salarié, tableau de bord RH, registre du personnel). Le temps de travail est enregistré via un système fiable et infalsifiable, conservé au minimum 24 mois.",
    rscis: ['D.2', 'F.1']
  },
  {
    text: "Le bilan social est en place, communiqué aux représentants du personnel et à la direction, et suivi d'un plan d'action avec objectifs chiffrés et indicateurs de réalisation.",
    rscis: ['A.1']
  },
  {
    text: "L'entreprise applique scrupuleusement le droit du travail et la convention collective sectorielle : politique de non-discrimination, respect des plafonds légaux d'heures supplémentaires (effectuées sur base volontaire et payées avec majoration légale), respect des temps de repos quotidien et hebdomadaire.",
    rscis: ['D.2', 'F.2']
  },
  {
    text: "L'entreprise s'assure que les conditions de travail proposées aux salariés intérimaires et sous-traitants présents sur site sont équivalentes à celles des salariés permanents (SST, EPI, formation, accès aux installations). Les agences de placement sont sélectionnées sur la base de critères éthiques (charte signée, audit social), avec application stricte du principe selon lequel aucun frais de recrutement n'est facturé au travailleur.",
    rscis: ['D.2', 'D.3']
  },
  {
    text: "L'entreprise réalise des audits internes fréquents afin d'évaluer la conformité réglementaire de ses pratiques RH et le respect des droits humains, avec rapports formalisés et plans d'action correctifs.",
    rscis: ['A.1']
  },
  {
    text: "L'entreprise va au-delà des bonnes pratiques contractuelles minimales : politique de mobilité interne, accès à la formation pour les CDD et intérimaires, transformation des CDD en CDI selon des règles formalisées, équité de traitement.",
    rscis: ['D.2']
  },
  {
    text: "L'entreprise déploie un processus de diligence raisonnable sur les droits humains : cartographie des risques (travail forcé, travail des enfants, discrimination, harcèlement), procédures d'évaluation régulière, mécanismes d'alerte sécurisés, mesures correctives et reporting régulier au comité de direction.",
    rscis: ['D.2', 'B.1', 'C.1', 'K.1']
  },

  // ── SOCIAL / Health & Safety ──────────────────────────────────────────
  {
    text: "La phase de planification SST est validée à la suite d'un état des lieux complet : pour les entreprises ≥ 40 salariés, existence d'un Comité de Santé et Sécurité au Travail conformément aux articles 157, 161 et 169 du Code du travail ; pour les entreprises < 40 salariés, désignation d'un référent SST formé. Plan d'action SST formalisé sur la base d'une cartographie des risques couvrant l'ensemble des dangers : risques mécaniques, électriques, chimiques, incendie, ergonomiques et psychosociaux.",
    rscis: ['H.1', 'H.5']
  },
  {
    text: "La phase d'organisation SST est validée : ressources humaines et matérielles mises à disposition, procédures de travail établies, gestion documentaire en place. Les zones de travail font l'objet d'évaluations spécifiques (éclairage, ventilation, bruit, températures, ergonomie, plan d'évacuation) avec actions correctives traçables.",
    rscis: ['H.1', 'H.5']
  },
  {
    text: "Le personnel encadrant et de production est équipé d'EPI adaptés aux risques de chaque poste (analyse de poste documentée), fournis gratuitement par l'employeur, avec formation à l'utilisation correcte, traçabilité des dotations et contrôle du port effectif. La sécurité électrique est conforme (armoires verrouillées, mise à la terre, vérification périodique réglementaire), les machines disposent de carters/protecteurs et de dispositifs d'arrêt d'urgence accessibles, et la procédure de consignation/déconsignation (LOTO) est appliquée pour toute intervention.",
    rscis: ['H.1', 'H.4', 'H.2', 'H.3']
  },
  {
    text: "L'entreprise entreprend des actions de sensibilisation continues des salariés à la santé et sécurité au travail et à la prévention des risques d'incendie : campagnes d'affichage, briefings sécurité (causeries), modules e-learning, exercices d'évacuation au minimum annuels avec compte-rendu et plan d'amélioration.",
    rscis: ['H.1', 'G.1', 'G.5']
  },
  {
    text: "La phase de mise en œuvre est confirmée et effective : démarche ISO 45001 en cours. Les premiers secours sont organisés (trousses accessibles et complètes, sauveteurs SST formés en nombre suffisant – au minimum 1 pour 20 salariés, infirmerie si requis) ; les exercices d'évacuation incendie sont réalisés au moins annuellement (semestriellement pour sites à risque élevé) avec compte-rendu et axes d'amélioration.",
    rscis: ['H.1', 'H.6', 'G.5']
  },
  {
    text: "Un système d'alerte par tous les salariés quant aux risques liés à la santé et sécurité au travail est mis en place : système d'alarme incendie audible et visible dans toutes les zones, testé mensuellement ; détecteurs automatiques (fumée/chaleur) couvrent les zones à risque ; issues de secours en nombre suffisant, dégagées et correctement signalées ; extincteurs adaptés en nombre suffisant et contrôlés annuellement par organisme agréé.",
    rscis: ['H.1', 'G.2', 'G.3', 'G.6', 'G.7', 'G.8']
  },
  {
    text: "L'entreprise gère ses produits chimiques et substances dangereuses selon les règles applicables : étiquetage CLP/SGH conforme, fiches de données de sécurité (FDS) disponibles et accessibles en langue locale, stockage sécurisé (rétention, séparation des incompatibles, ventilation, accès restreint), plan d'intervention en cas de déversement ou d'exposition (kits anti-pollution, douches d'urgence, rince-œil, procédure médicale d'urgence).",
    rscis: ['H.1', 'I.1', 'I.2', 'I.3']
  },
  {
    text: "Certification ISO 45001 obtenue. Les pratiques SST sont structurées, pilotées et constamment évaluées : tableau de bord SST (taux de fréquence, taux de gravité, presque-accidents), revues périodiques avec la direction, analyses ergonomiques des postes, matrice de compétences intégrant les exigences SST.",
    rscis: ['H.1']
  },
  {
    text: "Les Risques Psycho-Sociaux (RPS) figurent explicitement dans la cartographie des risques de l'entreprise et font l'objet d'un plan de prévention spécifique (enquêtes climat, formation des managers, dispositif d'écoute, cellule d'écoute psychologique externe).",
    rscis: ['H.1']
  },
  {
    text: "La conformité réglementaire SST est élevée et démontrée par les contrôles internes et externes (inspections, vérifications périodiques obligatoires sur installations électriques, équipements de levage, équipements sous pression, etc.), avec zéro non-conformité majeure non corrigée.",
    rscis: ['H.1']
  },
  {
    text: "La certification ISO 45001 obtenue (système de management de la santé et sécurité au travail) : l'entreprise déploie sa démarche dans une logique d'amélioration continue.",
    rscis: ['H.1']
  },
  {
    text: "L'entreprise détient un label reconnu portant sur les normes SST (ex. label sécurité sectoriel) et intègre la prise en compte des RPS dans son rapport annuel, témoignant d'un niveau d'excellence reconnu par des tiers.",
    rscis: ['H.1']
  },
  {
    text: "Toutes les parties prenantes internes et externes sont impliquées dans les plans de prévention des risques SST : conventions avec des organismes de santé et sécurité au travail, partenariats avec les services de médecine du travail, implication des sous-traitants présents sur site, dialogue avec la médecine du travail et l'inspection du travail.",
    rscis: ['H.1']
  },
  {
    text: "Des plans d'action Qualité de Vie et Conditions de Travail (QVCT) sont définis, déployés et pilotés (organisation du travail, autonomie, reconnaissance, équilibre vie professionnelle / vie personnelle, prévention des RPS, dialogue social de qualité), avec mesure régulière de la satisfaction des salariés.",
    rscis: ['H.1']
  },

  // ── SOCIAL / Equal pay ────────────────────────────────────────────────
  {
    text: "L'entreprise respecte intégralement la grille conventionnelle telle que définie par la convention collective sectorielle ou nationale et le SMIG en vigueur. Les bulletins de paie sont remis individuellement à chaque salarié, lisibles, en langue locale, détaillant heures normales et supplémentaires, primes, déductions et net à payer.",
    rscis: ['F.4', 'F.3']
  },
  {
    text: "Une grille de salaires interne est en place, tient compte des différences entre catégories socio-professionnelles et de l'ancienneté, avec un système de rétribution structuré. Les registres de paie sont conservés selon les durées réglementaires (au minimum 5 ans) et sont accessibles en cas de contrôle.",
    rscis: ['F.3', 'F.4']
  },
  {
    text: "Le volet rémunération figure parmi les thèmes abordés dans les enquêtes de satisfaction interne, avec analyse des résultats et plan d'action.",
    rscis: ['F.4']
  },
  {
    text: "La grille de salaires respecte le principe d'équité interne (à poste et compétence équivalents, rémunération égale entre les salariés) et d'équité externe (benchmark sectoriel régulièrement réalisé pour positionner les rémunérations).",
    rscis: ['F.4']
  },
  {
    text: "Une politique de rémunération formelle est en place, couvrant la rémunération fixe, la rémunération variable et les avantages sociaux, et faisant l'objet d'une communication claire à l'ensemble des salariés.",
    rscis: ['F.4']
  },
  {
    text: "Une politique de rémunération variable et de rétribution au mérite est en place, avec des critères objectifs et mesurables, et fait l'objet d'enquêtes de satisfaction interne attestant de sa perception comme équitable.",
    rscis: ['F.4']
  },
  {
    text: "Le système de rémunération interne est construit selon une approche participative impliquant les représentants du personnel et les managers, garantissant transparence et adhésion des salariés.",
    rscis: ['F.4', 'E.1']
  },
  {
    text: "Des enquêtes de satisfaction interne sur la politique de rémunération sont en place et menées périodiquement, avec un taux de satisfaction cible supérieur à 70 %.",
    rscis: ['F.4']
  },
  {
    text: "En cas de non-conformité des résultats de l'enquête de satisfaction, un plan d'action est établi, validé par la direction, déployé et suivi avec des indicateurs précis.",
    rscis: ['F.4']
  },
  {
    text: "Une grille d'avantages sociaux (mutuelle, prévoyance, retraite supplémentaire, tickets restaurant, transport, etc.) est en place et respecte le principe d'équité interne, avec conformité à l'indice d'égalité salariale femmes/hommes.",
    rscis: ['F.4']
  },
  {
    text: "L'entreprise veille à ce que ses prestataires (sociétés d'intérim, sous-traitants présents sur site) respectent les mêmes principes d'équité salariale et de paiement régulier. L'entreprise effectue des audits à cet effet en appliquant le principe de la due diligence des tiers.",
    rscis: ['D.3', 'F.4']
  },

  // ── SOCIAL / Employee training ────────────────────────────────────────
  {
    text: "Tous les salariés ont reçu au moins une action de montée en compétence par an, dispensée en interne ou en externe, traçable dans le système RH (nombre d'heures, thèmes, attestation).",
    rscis: ['A.1']
  },
  {
    text: "Des formations initiales sont prévues lors de l'intégration afin de garantir un minimum de maîtrise du poste : formation au poste, formation sécurité obligatoire (incendie, EPI, gestes et postures, risques chimiques), parcours d'accueil structuré.",
    rscis: ['A.1', 'H.1']
  },

  // ── SOCIAL / Diversity & inclusion ───────────────────────────────────
  {
    text: "L'entreprise respecte intégralement la réglementation en vigueur en matière de diversité et d'inclusion (égalité de rémunération hommes-femmes, quotas légaux pour personnes handicapées, non-discrimination à l'embauche et durant la carrière) ; elle interdit formellement toute forme de harcèlement (moral, sexuel) ainsi que toute pratique abusive ou discriminatoire et dispose d'une procédure de signalement et de traitement dédiée.",
    rscis: ['D.1']
  },
  {
    text: "L'entreprise justifie de demandes de dérogation lorsqu'elle n'est pas en mesure d'atteindre les quotas réglementaires (notamment travailleurs handicapés), avec démarche active de recrutement et de partenariat avec des structures d'insertion.",
    rscis: ['D.1']
  },
  {
    text: "Les indicateurs de la diversité et de l'inclusion (mixité, pyramide des âges, taux de handicap, taux de femmes en management, écart de rémunération F/H) sont intégrés dans le bilan social et suivis dans le temps.",
    rscis: ['D.1']
  },
  {
    text: "Les objectifs d'inclusion sont fixés et suivis avec un plan d'action si pas atteints et un reporting régulier au comité de direction et aux représentants du personnel.",
    rscis: ['D.1']
  },
  {
    text: "Les acteurs agissant sur la politique de diversité et d'inclusion (RH, managers, recruteurs, représentants du personnel) sont formés aux biais inconscients, à la prévention des discriminations et au traitement des situations de harcèlement.",
    rscis: ['D.1']
  },
  {
    text: "L'entreprise investit dans des installations et espaces de travail adaptés aux personnes à mobilité réduite et en situation de handicap (accessibilité, postes adaptés, équipements ergonomiques spécifiques).",
    rscis: ['D.1']
  },
  {
    text: "Les principes d'égalité des chances, de diversité et d'inclusion sont intégrés au code éthique et/ou à la charte éthique, et appliqués à tous les processus RH (recrutement, intégration, évolution, formation, rémunération, départ).",
    rscis: ['D.1']
  },
  {
    text: "La politique de diversité et d'inclusion est formalisée dans un document de référence (politique RH dédiée, charte de la diversité signée, accord d'entreprise) et communiquée à l'ensemble des parties prenantes.",
    rscis: ['D.1']
  },
  {
    text: "La communication interne, la formation et la sensibilisation des salariés en matière de diversité et d'inclusion sont structurées et régulières (campagnes annuelles, formation à l'embauche, modules e-learning, événements internes).",
    rscis: ['D.1']
  },
  {
    text: "Les aspects de diversité et d'inclusion sont pris en compte dans tous les processus de gestion (recrutement à candidatures diversifiées, parcours d'évolution sans biais, accessibilité des outils, indicateurs RH suivis).",
    rscis: ['D.1']
  },
  {
    text: "Existence d'un système d'évaluation de la diversité et de l'inclusion avec parties prenantes internes impliquées (CCE, référents diversité, salariés via enquêtes), permettant d'identifier les axes de progrès.",
    rscis: ['D.1']
  },
  {
    text: "Un bilan annuel des actions de diversité et d'inclusion est établi et communiqué en interne et en externe (rapport extra-financier, rapport annuel intégré, site web), traduisant l'engagement de l'entreprise.",
    rscis: ['D.1']
  },
  {
    text: "Les parties prenantes internes sont impliquées dans le bon déploiement de la politique de diversité et d'inclusion (groupes de travail, réseaux internes, réseau femmes, réseau handicap, etc.).",
    rscis: ['D.1']
  },
  {
    text: "Existence d'une démarche Diversité et Inclusion structurée et reconnue par un label ou une certification externe (Label Diversité AFNOR, GEEIS, Top Employer, etc.).",
    rscis: ['D.1']
  },
  {
    text: "La politique de diversité et d'inclusion est pleinement intégrée à la stratégie de l'entreprise et portée par la direction générale (engagements publics du CEO, objectifs RSE liés à la part variable des dirigeants).",
    rscis: ['D.1']
  },
  {
    text: "Les indicateurs de diversité sont pris en compte dans tous les processus de gestion (RH, achats responsables avec entreprises adaptées, commercial avec accessibilité produits, etc.).",
    rscis: ['D.1']
  },
  {
    text: "L'entreprise communique en externe sur sa démarche et implique ses parties prenantes externes (clients, fournisseurs, communautés) dans la promotion de la diversité (achats inclusifs, mécénat, partenariats associatifs).",
    rscis: ['D.1']
  },
  {
    text: "Existence d'un système d'évaluation des risques liés à la diversité en interne et auprès des parties prenantes externes (audits, enquêtes, baromètres climat), permettant d'anticiper et de prévenir les situations à risque.",
    rscis: ['D.1']
  },
  {
    text: "Existence d'un système d'évaluation des pratiques de diversité avec un dispositif d'amélioration continue (revue annuelle, plan d'action ajusté, partage des bonnes pratiques avec d'autres entreprises du secteur).",
    rscis: ['D.1']
  },

  // ── SOCIAL / Community engagement (one entry) ─────────────────────────
  {
    text: "L'entreprise veille au respect des normes et réglementations en vigueur sur son territoire (urbanisme, fiscalité locale, droit du travail local) et se limite à un impact négatif minimal sur les communautés locales.",
    rscis: ['A.1']
  },

  // ── SOCIAL / Social dialogue ──────────────────────────────────────────
  {
    text: "L'entreprise respecte la réglementation en vigueur en matière de dialogue social (élections de représentants du personnel dans les délais, liberté d'association et de négociation collective garanties sans entrave ni discrimination contre les représentants du personnel).",
    rscis: ['E.1']
  },
  {
    text: "Les partenaires sociaux sont fortement impliqués dans les décisions de l'entreprise et leur opinion est tendanciellement prise en compte (consultations préalables, droit d'expression, négociations annuelles obligatoires menées de bonne foi).",
    rscis: ['E.1']
  },
  {
    text: "Les décisions touchant le volet social sont la résultante de négociations collectives formalisées (accords d'entreprise, accords salariaux), avec des réunions régulières du CCE/délégués du personnel, ordre du jour communiqué à l'avance et procès-verbaux diffusés.",
    rscis: ['E.1']
  },
  {
    text: "Les délégués du personnel sont considérés comme de vrais partenaires et contribuent activement aux décisions ; un mécanisme structuré de remontée des doléances et d'alerte (whistleblowing) est en place, accessible à tous les salariés (boîte physique, ligne anonyme, plateforme dédiée), garantissant l'anonymat et la non-représaille.",
    rscis: ['E.1', 'E.2']
  },
  {
    text: "Les partenaires sociaux sont parties prenantes à toute initiative sociale ou technique (accords innovants, projets de transformation, plans QVCT), au-delà de leur rôle de régulateur social.",
    rscis: ['E.1']
  },
  {
    text: "Les parties prenantes au dialogue social contribuent à instaurer un climat social apaisé et constructif ; le mécanisme de doléances est étendu aux travailleurs intérimaires, sous-traitants présents sur site et communautés locales, avec délais de traitement définis, suivis et reporting annuel.",
    rscis: ['E.1', 'E.2']
  }
];

// ---------------------------------------------------------------------------
// Similarity helper – normalised Jaccard on words longer than 3 chars,
// accent-stripped and lower-cased.  Good enough to match paraphrased French.
// ---------------------------------------------------------------------------
function jaccard(a, b) {
  const normalise = (s) =>
    s
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')   // strip diacritics
      .replace(/[^\w\s]/g, ' ')
      .split(/\s+/)
      .filter((w) => w.length > 3);

  const setA = new Set(normalise(a));
  const setB = new Set(normalise(b));
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const w of setA) if (setB.has(w)) intersection++;

  return intersection / (setA.size + setB.size - intersection);
}

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const now = new Date();

    // ── 1. Fetch existing questions and RSCIs ──────────────────────────
    const questions = await queryInterface.sequelize.query(
      'SELECT id, text_fr FROM questions WHERE text_fr IS NOT NULL',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const rscis = await queryInterface.sequelize.query(
      'SELECT id, code FROM rscis',
      { type: Sequelize.QueryTypes.SELECT }
    );

    const rsciByCode = {};
    rscis.forEach((r) => { rsciByCode[r.code] = r.id; });

    // ── 2. Match each Excel row to its best DB question ────────────────
    const MIN_SCORE = 0.12;
    const entries = [];
    const skipped = [];

    for (const mapping of EXCEL_MAPPINGS) {
      let bestQuestion = null;
      let bestScore = 0;

      for (const q of questions) {
        const score = jaccard(mapping.text, q.text_fr);
        if (score > bestScore) {
          bestScore = score;
          bestQuestion = q;
        }
      }

      if (!bestQuestion || bestScore < MIN_SCORE) {
        skipped.push({ excerpt: mapping.text.substring(0, 80), score: bestScore.toFixed(3) });
        continue;
      }

      for (const code of mapping.rscis) {
        const rsciId = rsciByCode[code];
        if (!rsciId) {
          console.warn(`[question-rscis seeder] RSCI code not found in DB: ${code}`);
          continue;
        }
        entries.push({
          question_id: bestQuestion.id,
          rsci_id: rsciId,
          created_at: now,
          updated_at: now
        });
      }
    }

    if (skipped.length > 0) {
      console.warn('[question-rscis seeder] Skipped rows (score below threshold):');
      skipped.forEach((s) => console.warn(`  score=${s.score}  "${s.excerpt}..."`));
    }

    // ── 3. De-duplicate (question_id, rsci_id) pairs ───────────────────
    const seen = new Set();
    const uniqueEntries = entries.filter((e) => {
      const key = `${e.question_id}|${e.rsci_id}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });


    if (uniqueEntries.length > 0) {
      // ignoreDuplicates so re-running the seeder is safe
      await queryInterface.bulkInsert('question_rscis', uniqueEntries, {
        ignoreDuplicates: true
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.bulkDelete('question_rscis', {}, {});
  }
};
