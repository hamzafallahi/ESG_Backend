const nodemailer = require('nodemailer');
const { ConfidentialClientApplication } = require('@azure/msal-node');

// Microsoft Azure AD OAuth2 Configuration
const msalConfig = {
  auth: {
    clientId: process.env.AZURE_CLIENT_ID,
    clientSecret: process.env.AZURE_CLIENT_SECRET,
    authority: process.env.AZURE_AUTHORITY,
  },
};

// MSAL client for acquiring tokens
let msalClient = null;

/**
 * Initialize MSAL client
 */
const getMsalClient = () => {
  if (!msalClient) {
    if (!process.env.AZURE_CLIENT_ID || !process.env.AZURE_CLIENT_SECRET || !process.env.AZURE_TENANT_ID) {
      throw new Error('Azure AD OAuth2 credentials are not defined in environment variables (AZURE_CLIENT_ID, AZURE_CLIENT_SECRET, AZURE_TENANT_ID)');
    }
    msalClient = new ConfidentialClientApplication(msalConfig);
  }
  return msalClient;
};

/**
 * Get OAuth2 access token for SMTP
 */
const getAccessToken = async () => {
  const client = getMsalClient();
  
  const tokenRequest = {
    scopes: ['https://outlook.office365.com/.default'],
  };

  try {
    const response = await client.acquireTokenByClientCredential(tokenRequest);
    return response.accessToken;
  } catch (error) {
    console.error('Error acquiring OAuth2 token:', error);
    throw error;
  }
};

/**
 * Create nodemailer transporter with OAuth2
 */
const createTransporter = async () => {
  const accessToken = await getAccessToken();
  
  return nodemailer.createTransport({
    host: process.env.SMTP_SERVER,
    port: parseInt(process.env.SMTP_PORT),
    secure: false, // STARTTLS
    auth: {
      type: 'OAuth2',
      user: process.env.FROM_EMAIL,
      accessToken: accessToken,
    },
  });
};

/**
 * Generate the HTML email content with result data
 */
const generateEmailHtml = (organizationName, resultData) => {
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #0056a8; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
            .content { padding: 20px; background-color: #f9f9f9; }
            .footer { text-align: center; padding: 20px; background-color: #0056a8; color: white; border-radius: 0 0 8px 8px; }
            .score { font-size: 24px; font-weight: bold; color: #0056a8; text-align: center; margin: 20px 0; padding: 15px; background-color: #e6f3ff; border-radius: 8px; }
            .button { display: inline-block; background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold; margin-top: 15px; }
            .button:hover { background-color: #45a049; }
            .category { padding: 12px; margin-bottom: 10px; border-radius: 8px; }
            .env { background-color: #e8f5e9; border-left: 4px solid #4CAF50; }
            .social { background-color: #e3f2fd; border-left: 4px solid #2196F3; }
            .gov { background-color: #ffebee; border-left: 4px solid #f44336; }
            .level { display: inline-block; padding: 3px 8px; border-radius: 12px; font-size: 12px; font-weight: bold; margin-left: 8px; }
            .level-1 { background-color: #ffcdd2; color: #c62828; }
            .level-2 { background-color: #ffe0b2; color: #ef6c00; }
            .level-3 { background-color: #bbdefb; color: #1565c0; }
            .level-4 { background-color: #c8e6c9; color: #2e7d32; }
            .intro { background-color: #f5f5f5; padding: 15px; border-radius: 8px; margin-bottom: 15px; font-style: italic; }
            .section-title { font-size: 18px; font-weight: bold; margin: 15px 0; color: #0056a8; }
            .pdf-info { background-color: #e8f5e9; padding: 10px; border-radius: 8px; margin-top: 15px; }
            .pdf-info ul { margin-left: 20px; padding-left: 10px; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.taa.tn/wp-content/uploads/2022/03/Logo-TAA.png" alt="TAA Logo" style="max-width: 200px;">
                <h1>Résultats de l'évaluation ESG</h1>
            </div>
            <div class="content">
                <div class="intro">
                    <p>Dans ce contexte de transformations continues du marché et de notre environnement législatif, les évolutions économiques et les nouvelles régulations exigent une adaptation constante de nos stratégies. Fidèle à sa vocation de fédérer, représenter et accompagner les acteurs de l'industrie automobile en Tunisie, la TAA œuvre à fournir des outils concrets pour anticiper ces mutations et renforcer la compétitivité du secteur.</p>
                </div>
            
                <p>Cher/Chère ${organizationName},</p>
                <p>Merci d'avoir complété l'évaluation ESG. Cette auto-évaluation vise à fournir un aperçu clair et objectif de votre positionnement en matière environnementale, sociale et de gouvernance. Voici un résumé de vos résultats :</p>
                
                <div class="score">
                    Score Global: ${resultData.globalScore} / 955
                    <div style="font-size: 16px; margin-top: 8px; color: #666;">
                        Quartile: ${resultData.globalScore <= 250 
                          ? "Q1: Prise de conscience et initiation" 
                          : resultData.globalScore <= 500 
                          ? "Q2: Progression" 
                          : resultData.globalScore <= 750 
                          ? "Q3: Confirmé" 
                          : "Q4: Leadership et exemplarité"}
                    </div>
                </div>
                
                <div class="section-title">Résultats par catégorie</div>
                
                <div class="category env">
                    <strong>Environnement:</strong> ${resultData.categoryScores["Environment"] || resultData.categoryScores["Environnement"] || 0} / 235
                    <span class="level level-${parseInt((resultData.categoryLevels["Environment"] || resultData.categoryLevels["Environnement"] || "N0").replace("N", ""))}">
                        ${resultData.categoryLevels["Environment"] || resultData.categoryLevels["Environnement"] || "N0"}
                    </span>
                </div>
                
                <div class="category social">
                    <strong>Social:</strong> ${resultData.categoryScores["Social"] || 0} / 405
                    <span class="level level-${parseInt((resultData.categoryLevels["Social"] || "N0").replace("N", ""))}">
                        ${resultData.categoryLevels["Social"] || "N0"}
                    </span>
                </div>
                
                <div class="category gov">
                    <strong>Gouvernance:</strong> ${resultData.categoryScores["Governance"] || resultData.categoryScores["Gouvernance"] || 0} / 315
                    <span class="level level-${parseInt((resultData.categoryLevels["Governance"] || resultData.categoryLevels["Gouvernance"] || "N0").replace("N", ""))}">
                        ${resultData.categoryLevels["Governance"] || resultData.categoryLevels["Gouvernance"] || "N0"}
                    </span>
                </div>
                
                <div class="section-title">Accéder à votre rapport détaillé</div>
                <p>Vous pouvez consulter votre rapport détaillé de deux façons :</p>
                <ol>
                    <li>Ouvrir le fichier HTML attaché à cet email pour voir les résultats complets avec graphiques interactifs.</li>
                    <li>Cliquer sur le lien ci-dessous pour accéder à la version en ligne de votre rapport :</li>
                </ol>
                
                <div style="text-align: center; margin: 25px 0;">
                    <a href="${process.env.FRONTEND_URL || 'https://taa-esg-ref.vercel.app'}/Formulaire_ESG/results?resultData=${encodeURIComponent(JSON.stringify(resultData))}" class="button">
                        Voir mon rapport en ligne
                    </a>
                </div>
                
                <div class="pdf-info">
                    <p><strong>Format PDF amélioré :</strong> Dans la version en ligne, vous pouvez également télécharger votre rapport détaillé au format PDF, qui inclut :</p>
                    <ul>
                        <li>Une analyse complète de votre score global</li>
                        <li>Des rapports détaillés pour chaque pilier ESG (Environnement, Social, Gouvernance)</li>
                        <li>Un comparatif des niveaux de maturité entre catégories</li>
                        <li>Des graphiques et visuels pour mieux comprendre vos résultats</li>
                    </ul>
                </div>
                
                <p>N'hésitez pas à nous contacter si vous avez des questions concernant ces résultats.</p>
            </div>
            <div class="footer">
                <p>Tunisian Automotive Association</p>
                <p>Rue Hedi Nouira, Les Berges du Lac, 1053 Tunis</p>
                <p>Email: contact@taa.tn | Tel: +216 71 xxx xxx</p>
            </div>
        </div>
    </body>
    </html>
  `;
};

/**
 * Generate full results page HTML for attachment
 */
const generateResultsPageHtml = (organizationName, resultData) => {
  // Define subcategory max scores
  const subcategoryMaxScores = {
    "Environnement": resultData.subcategoryMaxScores?.Environnement || {},
    "Social": resultData.subcategoryMaxScores?.Social || {},
    "Gouvernance": resultData.subcategoryMaxScores?.Gouvernance || {}
  };

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>ESG Assessment Results</title>
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <script src="https://unpkg.com/framer-motion@10.16.5/dist/framer-motion.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
    <style>
        :root {
            --background-gradient: linear-gradient(to right, #f3f4f6, #fee2e2);
        }
        
        body { 
            font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
            background: var(--background-gradient);
            margin: 0;
            padding: 20px;
            min-height: 100vh;
            color: #374151;
        }
        
        .container {
            max-width: 1200px;
            margin: 0 auto;
            padding: 20px;
        }
        
        .bg-white {
            background: white;
            border-radius: 0.75rem;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
            margin-bottom: 2rem;
            padding: 1.5rem;
        }
        
        .text-center {
            text-align: center;
        }
        
        h1 {
            font-size: 1.875rem;
            font-weight: 700;
            color: #111827;
            margin-bottom: 2rem;
        }
        
        h2 {
            font-size: 1.5rem;
            font-weight: 600;
            color: #1f2937;
            margin-bottom: 1rem;
        }
        
        h3 {
            font-size: 1.25rem;
            font-weight: 600;
            color: #374151;
            margin-bottom: 1rem;
        }
        
        h4 {
            font-size: 1rem;
            font-weight: 500;
            color: #4b5563;
            margin-bottom: 0.5rem;
        }
        
        p {
            line-height: 1.5;
            color: #4b5563;
        }
        
        .chart-container {
            height: 350px;
            position: relative;
            margin: 20px 0;
            background: white;
            border-radius: 0.5rem;
            padding: 1rem;
            box-shadow: inset 0 2px 4px rgba(0, 0, 0, 0.06);
        }
        
        .grid {
            display: grid;
            gap: 1.5rem;
        }
        
        .grid-cols-1 {
            grid-template-columns: repeat(1, 1fr);
        }
        
        @media (min-width: 768px) {
            .grid-cols-2 {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .grid-cols-4 {
                grid-template-columns: repeat(4, 1fr);
            }
        }
        
        .flex {
            display: flex;
        }
        
        .items-center {
            align-items: center;
        }
        
        .justify-between {
            justify-content: space-between;
        }
        
        .justify-center {
            justify-content: center;
        }
        
        .progress-bar {
            width: 100%;
            height: 1rem;
            background-color: #e5e7eb;
            border-radius: 9999px;
            overflow: hidden;
        }
        
        .progress-bar-fill {
            height: 100%;
            border-radius: 9999px;
            transition: width 0.8s ease;
        }
        
        .progress-bar-fill.green {
            background-color: #10b981;
        }
        
        .progress-bar-fill.blue {
            background-color: #3b82f6;
        }
        
        .progress-bar-fill.red {
            background-color: #ef4444;
        }
        
        .badge {
            display: inline-flex;
            align-items: center;
            padding: 0.25rem 0.75rem;
            border-radius: 9999px;
            font-size: 0.75rem;
            font-weight: 500;
        }
        
        .badge.green {
            background-color: #d1fae5;
            color: #065f46;
        }
        
        .badge.blue {
            background-color: #dbeafe;
            color: #1e40af;
        }
        
        .badge.red {
            background-color: #fee2e2;
            color: #991b1b;
        }
        
        .subcategory-card {
            padding: 1rem;
            border-radius: 0.5rem;
            border: 1px solid;
        }
        
        .subcategory-card.green {
            background-color: #f0fdf4;
            border-color: #bbf7d0;
        }
        
        .subcategory-card.blue {
            background-color: #eff6ff;
            border-color: #bfdbfe;
        }
        
        .subcategory-card.red {
            background-color: #fef2f2;
            border-color: #fecaca;
        }
        
        .score-display {
            font-size: 4rem;
            font-weight: bold;
            color: #374151;
            line-height: 1;
        }
        
        .level-icon {
            color: #fbbf24;
            font-size: 1.25rem;
        }
        
        .legend {
            background-color: #f9fafb;
            border-radius: 0.5rem;
            padding: 1rem;
            font-size: 0.875rem;
        }
        
        .legend-item {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            margin-bottom: 0.25rem;
        }
        
        .legend-color {
            width: 1rem;
            height: 1rem;
            border-radius: 9999px;
        }

        .niveau-box {
            background: white;
            border-radius: 0.5rem;
            padding: 1rem;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
            border: 1px solid #e5e7eb;
        }

        .niveau-header {
            display: flex;
            align-items: center;
            gap: 0.5rem;
            padding-bottom: 0.5rem;
            border-bottom: 1px solid #e5e7eb;
            margin-bottom: 0.75rem;
        }

        .niveau-dot {
            width: 0.75rem;
            height: 0.75rem;
            border-radius: 9999px;
        }

        .niveau-content {
            font-size: 0.875rem;
            color: #4b5563;
            line-height: 1.5;
        }

        .text-justify {
            text-align: justify;
        }

        @media print {
            body {
                background: white;
            }
            
            .bg-white {
                box-shadow: none;
                border: 1px solid #e5e7eb;
            }
            
            .chart-container {
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="container" id="results-content">
        <h1 class="text-center">Résultats de l'évaluation ESG</h1>

        <!-- Introduction section -->
        <div class="bg-white">
            <p class="text-justify mb-3">
                Dans ce contexte de transformations continues du marché et de notre environnement législatif, 
                les évolutions économiques et les nouvelles régulations exigent une adaptation constante de nos stratégies. 
                Fidèle à sa vocation de fédérer, représenter et accompagner les acteurs de l'industrie automobile en Tunisie, 
                la TAA œuvre à fournir des outils concrets pour anticiper ces mutations et renforcer la compétitivité du secteur.
            </p>
            <p class="text-justify">
                C'est dans cette optique qu'un outil d'auto-évaluation ESG a été mis à disposition des entreprises. 
                Cette auto-évaluation, remplie directement par l'entreprise, vise à fournir un aperçu clair et objectif 
                de son positionnement en matière environnementale, sociale et de gouvernance. L'entreprise demeure responsable 
                de l'exactitude des informations fournies, et les résultats, strictement confidentiels, permettent de mettre 
                en lumière à la fois les points forts et les axes d'amélioration. Ce positionnement constitue une première 
                étape essentielle pour tracer une stratégie ESG cohérente, alignée avec les standards internationaux et les 
                exigences du marché.
                La TAA reste mobilisée pour vous accompagner dans cette démarche stratégique, en proposant un accompagnement sur mesure à travers des formations ciblées, du conseil personnalisé et l'appui de son pôle d'expertise dédié à l'ESG et au développement durable.
            </p>
        </div>

        <!-- Score global -->
        <div class="bg-white">
            <h2 class="text-center">Score Global</h2>
            <div class="flex justify-center">
                <div class="relative w-48 h-48" style="position: relative;">
                    <canvas id="globalDoughnutChart"></canvas>
                    <div style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; display: flex; align-items: center; justify-content: center; flex-direction: column;">
                        <span class="score-display">${resultData.globalScore}</span>
                        <span class="text-sm text-gray-500">/ 955</span>
                    </div>
                </div>
            </div>
            <div class="mt-4 text-center">
                <p class="text-lg font-medium">
                    Quartile: ${resultData.globalScore <= 250 
                        ? "Q1: Prise de conscience et initiation" 
                        : resultData.globalScore <= 500 
                        ? "Q2: Progression" 
                        : resultData.globalScore <= 750 
                        ? "Q3: Confirmé" 
                        : "Q4: Leadership et exemplarité"}
                </p>
            </div>
        </div>

        <!-- Comparison section -->
        <div class="bg-white">
            <h2 class="text-2xl font-semibold mb-2 text-center">Comparaison des Niveaux de Maturité ESG</h2>
            <p class="text-gray-500 text-center mb-6">Niveaux atteints pour chaque pilier d'évaluation</p>

            <div style="background-color: #f9fafb; border-radius: 0.75rem; padding: 1rem; border: 1px solid #e5e7eb;">
                <div class="chart-container">
                    <canvas id="barChart"></canvas>
                </div>

                <!-- Niveau descriptions -->
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
                    ${[1, 2, 3, 4].map(level => `
                        <div class="niveau-box">
                            <div class="niveau-header">
                                <div class="niveau-dot" style="background-color: ${
                                    level === 1 ? '#ef4444' : 
                                    level === 2 ? '#f59e0b' : 
                                    level === 3 ? '#3b82f6' : 
                                    '#10b981'
                                }"></div>
                                <h3 class="text-lg font-semibold">
                                    N${level}: <span class="font-normal text-gray-600">${
                                        level === 1 ? 'Initial' : 
                                        level === 2 ? 'Progression' : 
                                        level === 3 ? 'Confirmé' : 
                                        'Leadership'
                                    }</span>
                                </h3>
                            </div>
                            <div class="niveau-content">
                                <ul class="list-disc pl-4 space-y-2">
                                    ${[
                                        level === 1 ? [
                                            "Critères basés/respecte OU AU MOINS s'engage (plan d'action adequat) à la conformité à la réglementation en vigueur dans le pays de résidence si il y en a.",
                                            "Le critère est en cours de préparation (phase de planification validée) avec une existence sommaire qui se limite à des procédures formelles ou informelles non structurées."
                                        ] :
                                        level === 2 ? [
                                            "Les attentes des parties prenantes par rapport à ces critères sont identifiées et respectées.",
                                            "La phase d'organisation est bien validée.",
                                            "L'approche de l'entreprise à ce niveau est à un niveau réactif sans anticipation ni proactivité."
                                        ] :
                                        level === 3 ? [
                                            "Les pratiques sont mises en œuvre avec suivi de l'efficacité et amélioration continue (phase de mise en œuvre entamée).",
                                            "Existence de certification, organisation opérationnelle initiée, amelioration lancée."
                                        ] :
                                        [
                                            "Pratiques innovantes / Rayonnement exemplarité et partage / Performances organisationnelles et opérationnelles demontrées en cohérence avec la vision strategique moyen et long terme. Management participatif demontré",
                                            "La phase contrôle, évaluation et suivi est bel et bien en place."
                                        ]
                                    ].map(desc => `
                                        <li>${desc}</li>
                                    `).join('')}
                                </ul>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        </div>

        <!-- Category results -->
        ${["Environnement", "Social", "Gouvernance"].map(category => `
            <div class="bg-white">
                <h2>${category}</h2>

                <!-- Score and progress bar -->
                <div class="mb-6">
                    <div class="flex justify-between mb-1">
                        <span class="font-medium">
                            Score: ${resultData.categoryScores[category] || 0}/${
                              category === "Environnement" ? 235 : 
                              category === "Social" ? 405 : 
                              category === "Gouvernance" ? 315 : 0
                            }
                        </span>
                        <span class="text-sm text-gray-500">
                            Niveau: ${resultData.categoryLevels[category] || 'N0'}
                        </span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-bar-fill ${
                            category === "Environnement" ? "green" : 
                            category === "Social" ? "blue" : 
                            "red"
                        }" style="width: ${
                            Math.min(
                                Math.round(
                                    ((resultData.categoryScores[category] || 0) / 
                                    (category === "Environnement" ? 235 : 
                                    category === "Social" ? 405 : 
                                    315)) * 100
                                ), 100
                            )}%">
                        </div>
                    </div>
                </div>

                <!-- Subcategories grid -->
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    ${Object.keys(resultData.subcategoryScores[category] || {}).map(subcat => {
                        const score = resultData.subcategoryScores[category][subcat];
                        const maxScore = subcategoryMaxScores[category][subcat] || 
                                    (category === "Environnement" ? 235 : 
                                    category === "Social" ? 405 : 315);
                        const level = Math.min(Math.ceil((score / maxScore) * 4), 4);
                        
                        return `
                            <div class="subcategory-card ${
                                category === "Environnement" ? "green" : 
                                category === "Social" ? "blue" : 
                                "red"
                            }">
                                <div class="flex justify-between items-start mb-3">
                                    <h3 class="font-medium text-sm md:text-base flex-1 pr-2">${subcat}</h3>
                                    <span class="badge ${
                                        category === "Environnement" ? "green" : 
                                        category === "Social" ? "blue" : 
                                        "red"
                                    }">N${level}</span>
                                </div>
                                <div class="flex justify-between items-center">
                                    <span class="font-bold text-lg">${score} / ${maxScore}</span>
                                </div>
                            </div>
                        `;
                    }).join('')}
                </div>

                <!-- Charts section -->
                <div class="mt-6">
                    <h3 class="text-lg font-medium mb-4 text-center">Analyse des sous-catégories</h3>
                    <div class="grid grid-cols-1 md:grid-cols-2 gap-6" style="display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem;">
                        <!-- Bar chart -->
                        <div>
                            <h4 class="text-center">Progression par sous-catégorie (%)</h4>
                            <div class="chart-container">
                                <canvas id="${category}BarChart"></canvas>
                            </div>
                        </div>

                        <!-- Radar chart -->
                        <div>
                            <h4 class="text-center">Niveaux de maturité</h4>
                            <div class="chart-container">
                                <canvas id="${category}RadarChart"></canvas>
                            </div>
                        </div>
                    </div>

                    <!-- Legend -->
                    <div class="legend mt-4">
                        <h4 class="font-medium mb-2">Légende des sous-catégories:</h4>
                        <div class="grid grid-cols-2 gap-2">
                            ${Object.keys(resultData.subcategoryScores[category] || {}).map((subcat, index) => `
                                <div class="legend-item">
                                    <span class="font-bold text-gray-600">${index + 1}.</span>
                                    <span class="text-xs text-gray-700">${subcat}</span>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `).join('')}
    </div>

    <script>
        // Initialize charts
        document.addEventListener('DOMContentLoaded', function() {
            // GLOBAL SCORE DOUGHNUT CHART
            new Chart(document.getElementById('globalDoughnutChart'), {
                type: 'doughnut',
                data: {
                    labels: ['Score', 'Restant'],
                    datasets: [{
                        data: [${resultData.globalScore}, ${955 - resultData.globalScore}],
                        backgroundColor: [
                            'rgba(75, 192, 192, 0.8)',
                            'rgba(220, 220, 220, 0.3)'
                        ],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '80%',
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        legend: {
                            display: false
                        },
                        tooltip: {
                            enabled: false
                        }
                    }
                }
            });

            // BAR CHART
            new Chart(document.getElementById('barChart'), {
                type: 'bar',
                data: {
                    labels: ['Environnement', 'Social', 'Gouvernance'],
                    datasets: [{
                        label: 'Niveaux ESG',
                        data: [
                            ${parseInt((resultData.categoryLevels['Environnement'] || 'N0').replace('N', ''))},
                            ${parseInt((resultData.categoryLevels['Social'] || 'N0').replace('N', ''))},
                            ${parseInt((resultData.categoryLevels['Gouvernance'] || 'N0').replace('N', ''))}
                        ],
                        backgroundColor: [
                            'rgba(75, 192, 92, 0.7)',
                            'rgba(54, 162, 235, 0.7)',
                            'rgba(255, 99, 132, 0.7)'
                        ],
                        borderColor: [
                            'rgba(75, 192, 92, 1)',
                            'rgba(54, 162, 235, 1)',
                            'rgba(255, 99, 132, 1)'
                        ],
                        borderWidth: 2,
                        borderRadius: 6
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: false,
                    scales: {
                        y: {
                            beginAtZero: true,
                            max: 4,
                            ticks: {
                                stepSize: 1,
                                callback: function(value) {
                                    return value > 0 ? 'N' + value : '';
                                }
                            }
                        }
                    },
                    plugins: {
                        legend: {
                            display: false
                        }
                    }
                }
            });

            // Category-specific charts
            ${["Environnement", "Social", "Gouvernance"].map(category => `
                // ${category} Bar Chart
                new Chart(document.getElementById('${category}BarChart'), {
                    type: 'bar',
                    data: {
                        labels: Object.keys(${JSON.stringify(resultData.subcategoryScores[category] || {})}),
                        datasets: [{
                            data: Object.entries(${JSON.stringify(resultData.subcategoryScores[category] || {})}).map(([subcat, score]) => {
                                const maxScore = ${JSON.stringify(subcategoryMaxScores[category] || {})}[subcat] || 
                                    ${category === "Environnement" ? 235 : 
                                      category === "Social" ? 405 : 315};
                                return (score / maxScore) * 100;
                            }),
                            backgroundColor: '${
                                category === "Environnement" ? "rgba(75, 192, 92, 0.7)" : 
                                category === "Social" ? "rgba(54, 162, 235, 0.7)" : 
                                "rgba(255, 99, 132, 0.7)"
                            }',
                            borderRadius: 4
                        }]
                    },
                    options: {
                        indexAxis: 'y',
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            x: {
                                beginAtZero: true,
                                max: 100,
                                ticks: {
                                    callback: function(value) {
                                        return value + '%';
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });

                // ${category} Radar Chart
                new Chart(document.getElementById('${category}RadarChart'), {
                    type: 'radar',
                    data: {
                        labels: Object.keys(${JSON.stringify(resultData.subcategoryScores[category] || {})}),
                        datasets: [{
                            data: Object.entries(${JSON.stringify(resultData.subcategoryScores[category] || {})}).map(([subcat, score]) => {
                                const maxScore = ${JSON.stringify(subcategoryMaxScores[category] || {})}[subcat] || 
                                    ${category === "Environnement" ? 235 : 
                                      category === "Social" ? 405 : 315};
                                return Math.min(Math.ceil((score / maxScore) * 4), 4);
                            }),
                            backgroundColor: '${
                                category === "Environnement" ? "rgba(75, 192, 92, 0.2)" : 
                                category === "Social" ? "rgba(54, 162, 235, 0.2)" : 
                                "rgba(255, 99, 132, 0.2)"
                            }',
                            borderColor: '${
                                category === "Environnement" ? "rgba(75, 192, 92, 1)" : 
                                category === "Social" ? "rgba(54, 162, 235, 1)" : 
                                "rgba(255, 99, 132, 1)"
                            }',
                            borderWidth: 2,
                            pointRadius: 4
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        scales: {
                            r: {
                                beginAtZero: true,
                                max: 4,
                                ticks: {
                                    stepSize: 1,
                                    callback: function(value) {
                                        return value > 0 ? 'N' + value : '';
                                    }
                                }
                            }
                        },
                        plugins: {
                            legend: {
                                display: false
                            }
                        }
                    }
                });
            `).join('')}
        });
    </script>
</body>
</html>
  `;
};

/**
 * Send ESG results email via Microsoft SMTP with OAuth2
 * @param {string} email - Recipient email address
 * @param {string} organizationName - Organization name
 * @param {string} phoneNumber - Phone number
 * @param {object} resultData - Result data object containing scores and levels
 */
const sendResultEmail = async (email, organizationName, phoneNumber, resultData) => {
  try {
    const emailHtml = generateEmailHtml(organizationName, resultData);
    const resultsPageHtml = generateResultsPageHtml(organizationName, resultData);

    // Create OAuth2 transporter
    const transporter = await createTransporter();

    const mailOptions = {
      from: process.env.FROM_EMAIL,
      to: email,
      subject: "Résultats de votre évaluation ESG - TAA",
      html: emailHtml,
      attachments: [
        {
          content: resultsPageHtml,
          filename: 'ESG_Results.html',
          contentType: 'text/html',
        }
      ]
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${email}. MessageId: ${info.messageId}`);
    return { success: true, message: 'Email sent successfully', messageId: info.messageId };
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = {
  sendResultEmail,
  generateEmailHtml,
  generateResultsPageHtml
};
