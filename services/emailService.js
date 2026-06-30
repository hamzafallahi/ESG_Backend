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
const generateEmailHtml = (organizationName, resultData, resultId) => {
  const envScore = resultData.categoryScores["Environment"] || resultData.categoryScores["Environnement"] || 0;
  const socScore = resultData.categoryScores["Social"] || 0;
  const govScore = resultData.categoryScores["Governance"] || resultData.categoryScores["Gouvernance"] || 0;
  const envLevel = resultData.categoryLevels["Environment"] || resultData.categoryLevels["Environnement"] || "N0";
  const socLevel = resultData.categoryLevels["Social"] || "N0";
  const govLevel = resultData.categoryLevels["Governance"] || resultData.categoryLevels["Gouvernance"] || "N0";

  const envPct = Math.min(Math.round((envScore / 235) * 100), 100);
  const socPct = Math.min(Math.round((socScore / 405) * 100), 100);
  const govPct = Math.min(Math.round((govScore / 315) * 100), 100);
  const maxTotal = resultData.totalScore || 955;
  const globalPct = Math.min(Math.round((resultData.globalScore / maxTotal) * 100), 100);

  const quartileLabel = resultData.globalScore <= 250
    ? "Q1 – Prise de conscience et initiation"
    : resultData.globalScore <= 500
    ? "Q2 – Progression"
    : resultData.globalScore <= 750
    ? "Q3 – Confirmé"
    : "Q4 – Leadership et exemplarité";

  const getLevelStyle = (levelStr) => {
    const n = parseInt((levelStr || "N0").replace("N", "")) || 0;
    const styles = {
      0: { bg: "#f3f4f6", color: "#6b7280" },
      1: { bg: "#fee2e2", color: "#991b1b" },
      2: { bg: "#fef3c7", color: "#92400e" },
      3: { bg: "#dbeafe", color: "#1e40af" },
      4: { bg: "#d1fae5", color: "#065f46" },
    };
    return styles[n] || styles[0];
  };

  const envLevelStyle = getLevelStyle(envLevel);
  const socLevelStyle = getLevelStyle(socLevel);
  const govLevelStyle = getLevelStyle(govLevel);

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résultats ESG – TAA</title>
</head>
<body style="margin:0;padding:0;background:linear-gradient(to right,#f3f4f6,#fee2e2);font-family:system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;color:#374151;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:linear-gradient(to right,#f3f4f6,#fee2e2);padding:32px 0;">
    <tr>
      <td align="center">
        <table width="620" cellpadding="0" cellspacing="0" style="max-width:620px;width:100%;">

          <tr>
  <td style="background:#ffffff;border-radius:12px 12px 0 0;padding:24px 32px;text-align:center;border-bottom:4px solid #ef4444;">
    
    <!-- Logo -->
    <img 
      src="https://www.esg-taa.tn/images/LOGO.png" 
      alt="TAA ESG" 
      style="max-width:320px;width:100%;height:auto;margin-bottom:14px;"
    />

    <!-- Title -->
    <h1 style="margin:0;font-size:22px;font-weight:700;color:#111827;">
      Résultats de l'évaluation ESG
    </h1>

    <p style="margin:6px 0 0;font-size:14px;color:#374151;">
      Tunisian Automotive Association
    </p>

  </td>
</tr>

          <!-- INTRO -->
          <tr>
            <td style="background:#ffffff;padding:24px 32px;">
              <p style="margin:0 0 14px;font-size:14px;line-height:1.7;color:#4b5563;font-style:italic;background:#f9fafb;border-left:4px solid #ef4444;padding:14px 16px;border-radius:0 8px 8px 0;">
                Dans ce contexte de transformations continues du marché et de notre environnement législatif, les évolutions économiques et les nouvelles régulations exigent une adaptation constante de nos stratégies. Fidèle à sa vocation de fédérer, représenter et accompagner les acteurs de l'industrie automobile en Tunisie, la TAA œuvre à fournir des outils concrets pour anticiper ces mutations et renforcer la compétitivité du secteur.
              </p>
              <p style="margin:0;font-size:15px;line-height:1.7;color:#374151;">Cher/Chère <strong>${organizationName}</strong>,</p>
              <p style="margin:10px 0 0;font-size:14px;line-height:1.7;color:#4b5563;">
                Merci d'avoir complété l'évaluation ESG. Cette auto-évaluation vise à fournir un aperçu clair et objectif de votre positionnement en matière environnementale, sociale et de gouvernance. Voici un résumé de vos résultats :
              </p>
            </td>
          </tr>

          <!-- GLOBAL SCORE CARD -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 24px;">
              <div style="background:#f9fafb;border-radius:12px;padding:24px;text-align:center;border:1px solid #e5e7eb;">
                <p style="margin:0 0 8px;font-size:13px;font-weight:600;text-transform:uppercase;letter-spacing:0.05em;color:#6b7280;">Score Global</p>
                <p style="margin:0;font-size:52px;font-weight:700;color:#111827;line-height:1;">${resultData.globalScore}</p>
                <p style="margin:4px 0 16px;font-size:14px;color:#9ca3af;">/ ${resultData.totalScore || 955}</p>
                <!-- Progress bar -->
                <table width="100%" cellpadding="0" cellspacing="0">
                  <tr>
                    <td style="background:#e5e7eb;border-radius:9999px;height:10px;overflow:hidden;">
                      <div style="width:${globalPct}%;background:#ef4444;height:10px;border-radius:9999px;"></div>
                    </td>
                  </tr>
                </table>
                <p style="margin:14px 0 0;font-size:14px;font-weight:600;color:#374151;">${quartileLabel}</p>
              </div>
            </td>
          </tr>

          <!-- CATEGORY SCORES -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 24px;">
              <h2 style="margin:0 0 16px;font-size:16px;font-weight:600;color:#111827;border-bottom:1px solid #e5e7eb;padding-bottom:10px;">Résultats par catégorie</h2>

              <!-- Environnement -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;width:10px;height:10px;background:#10b981;border-radius:50%;vertical-align:middle;margin-right:8px;"></span>
                          <strong style="font-size:14px;color:#065f46;">Environnement</strong>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${envLevelStyle.bg};color:${envLevelStyle.color};">${envLevel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:10px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden;">
                                <div style="width:${envPct}%;background:#10b981;height:8px;border-radius:9999px;"></div>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:6px 0 0;font-size:13px;color:#4b5563;">${envScore} / 235 points</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Social -->
              <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:14px;">
                <tr>
                  <td style="background:#eff6ff;border:1px solid #bfdbfe;border-radius:10px;padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;width:10px;height:10px;background:#3b82f6;border-radius:50%;vertical-align:middle;margin-right:8px;"></span>
                          <strong style="font-size:14px;color:#1e40af;">Social</strong>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${socLevelStyle.bg};color:${socLevelStyle.color};">${socLevel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:10px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden;">
                                <div style="width:${socPct}%;background:#3b82f6;height:8px;border-radius:9999px;"></div>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:6px 0 0;font-size:13px;color:#4b5563;">${socScore} / 405 points</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>

              <!-- Gouvernance -->
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td style="background:#fef2f2;border:1px solid #fecaca;border-radius:10px;padding:16px;">
                    <table width="100%" cellpadding="0" cellspacing="0">
                      <tr>
                        <td>
                          <span style="display:inline-block;width:10px;height:10px;background:#ef4444;border-radius:50%;vertical-align:middle;margin-right:8px;"></span>
                          <strong style="font-size:14px;color:#991b1b;">Gouvernance</strong>
                        </td>
                        <td align="right">
                          <span style="display:inline-block;padding:3px 10px;border-radius:9999px;font-size:12px;font-weight:600;background:${govLevelStyle.bg};color:${govLevelStyle.color};">${govLevel}</span>
                        </td>
                      </tr>
                      <tr>
                        <td colspan="2" style="padding-top:10px;">
                          <table width="100%" cellpadding="0" cellspacing="0">
                            <tr>
                              <td style="background:#e5e7eb;border-radius:9999px;height:8px;overflow:hidden;">
                                <div style="width:${govPct}%;background:#ef4444;height:8px;border-radius:9999px;"></div>
                              </td>
                            </tr>
                          </table>
                          <p style="margin:6px 0 0;font-size:13px;color:#4b5563;">${govScore} / 315 points</p>
                        </td>
                      </tr>
                    </table>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="background:#ffffff;padding:0 32px 28px;text-align:center;">
              <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:10px;padding:20px;">
                <p style="margin:0 0 6px;font-size:15px;font-weight:600;color:#111827;">Accéder à votre rapport détaillé</p>
                <p style="margin:0 0 16px;font-size:13px;color:#6b7280;">Consultez l'analyse complète avec graphiques interactifs, niveaux de maturité et recommandations par pilier ESG.</p>
                <a href="${process.env.FRONTEND_URL}/Formulaire_ESG/results/${resultId}"
                   style="display:inline-block;background:#ef4444;color:#ffffff;padding:12px 28px;border-radius:8px;font-size:14px;font-weight:600;text-decoration:none;">
                  Voir mon rapport en ligne →
                </a>
                <p style="margin:14px 0 0;font-size:12px;color:#9ca3af;">Le fichier HTML complet est également joint à cet email.</p>
              </div>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#111827;border-radius:0 0 12px 12px;padding:20px 32px;text-align:center;">
              <p style="margin:0 0 4px;font-size:13px;color:#9ca3af;">Tunisian Automotive Association</p>
              <p style="margin:0 0 4px;font-size:12px;color:#6b7280;">Rue Hedi Nouira, Les Berges du Lac, 1053 Tunis</p>
              <p style="margin:0;font-size:12px;color:#6b7280;">contact@taa.tn</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
};

/**
 * Generate full results page HTML for attachment – styled to match TAA React app
 */
const generateResultsPageHtml = (organizationName, resultData) => {
  // Define subcategory max scores
  const subcategoryMaxScores = {
    "Environnement": resultData.subcategoryMaxScores?.Environnement || {},
    "Social": resultData.subcategoryMaxScores?.Social || {},
    "Gouvernance": resultData.subcategoryMaxScores?.Gouvernance || {}
  };

  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Résultats ESG – ${organizationName}</title>
  <script src="https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js"></script>
  <style>
    *, *::before, *::after { box-sizing: border-box; }

    body {
      margin: 0;
      padding: 24px 16px;
      background: linear-gradient(to right, #f3f4f6, #fee2e2);
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      color: #374151;
      min-height: 100vh;
    }

    .container { max-width: 1200px; margin: 0 auto; }

    h1 { font-size: 1.875rem; font-weight: 700; color: #111827; text-align: center; margin: 0 0 24px; }
    h2 { font-size: 1.5rem; font-weight: 600; color: #111827; margin: 0 0 16px; text-align: center; }
    h3 { font-size: 1.125rem; font-weight: 600; color: #374151; margin: 0 0 12px; }
    h4 { font-size: 0.875rem; font-weight: 500; color: #4b5563; margin: 0 0 8px; text-align: center; }
    p  { line-height: 1.7; color: #4b5563; margin: 0 0 12px; }

    .card {
      background: #ffffff;
      border-radius: 12px;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.07), 0 2px 4px -1px rgba(0,0,0,0.04);
      padding: 24px;
      margin-bottom: 32px;
    }

    /* Intro */
    .intro-text { text-align: justify; }
    .intro-border {
      border-left: 4px solid #ef4444;
      padding-left: 16px;
      margin-bottom: 16px;
      font-style: italic;
      color: #4b5563;
    }

    /* Global score */
    .score-wrapper {
      display: flex;
      justify-content: center;
      margin: 8px 0 16px;
    }
    .score-donut-container {
      position: relative;
      width: 180px;
      height: 180px;
    }
    .score-donut-container canvas { position: absolute; top: 0; left: 0; }
    .score-donut-overlay {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      pointer-events: none;
    }
    .score-number { font-size: 3rem; font-weight: 700; color: #111827; line-height: 1; }
    .score-max   { font-size: 0.875rem; color: #9ca3af; }
    .quartile-label { text-align: center; font-size: 1rem; font-weight: 600; color: #374151; margin-top: 12px; }

    /* Maturity bar chart */
    .maturity-bg {
      background: #f9fafb;
      border-radius: 12px;
      padding: 12px 16px;
      border: 1px solid #e5e7eb;
    }
    .maturity-chart-wrapper { height: 280px; margin-bottom: 24px; }

    /* Level description cards */
    .levels-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 12px;
      margin-top: 16px;
    }
    @media (max-width: 900px) { .levels-grid { grid-template-columns: repeat(2, 1fr); } }
    @media (max-width: 560px) { .levels-grid { grid-template-columns: 1fr; } }

    .level-card {
      background: #ffffff;
      border-radius: 10px;
      padding: 14px;
      box-shadow: 0 1px 3px rgba(0,0,0,0.08);
      border: 1px solid #e5e7eb;
    }
    .level-card-header {
      display: flex;
      align-items: center;
      gap: 8px;
      padding-bottom: 10px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 12px;
    }
    .level-dot { width: 12px; height: 12px; border-radius: 50%; flex-shrink: 0; }
    .level-card-title { font-size: 1rem; font-weight: 600; color: #111827; margin: 0; }
    .level-card-subtitle { font-weight: 400; color: #6b7280; }
    .level-desc-list { list-style: disc; padding-left: 16px; margin: 0; }
    .level-desc-list li { font-size: 0.8125rem; color: #4b5563; line-height: 1.55; margin-bottom: 8px; }

    /* Category section */
    .category-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px; }
    .category-score-text { font-weight: 600; font-size: 0.9375rem; }
    .category-level-text { font-size: 0.875rem; color: #6b7280; }
    .progress-track { width: 100%; background: #e5e7eb; border-radius: 9999px; height: 14px; overflow: hidden; margin-bottom: 24px; }
    .progress-fill   { height: 14px; border-radius: 9999px; }
    .fill-green { background: #10b981; }
    .fill-blue  { background: #3b82f6; }
    .fill-red   { background: #ef4444; }

    /* Subcategory grid */
    .subcat-grid { display: grid; grid-template-columns: repeat(2, 1fr); gap: 16px; margin-bottom: 24px; }
    @media (max-width: 600px) { .subcat-grid { grid-template-columns: 1fr; } }

    .subcat-card {
      border-radius: 10px;
      padding: 14px;
      border: 1px solid;
    }
    .subcat-card.green { background: #f0fdf4; border-color: #bbf7d0; }
    .subcat-card.blue  { background: #eff6ff; border-color: #bfdbfe; }
    .subcat-card.red   { background: #fef2f2; border-color: #fecaca; }

    .subcat-top { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 10px; }
    .subcat-name { font-size: 0.875rem; font-weight: 500; color: #374151; flex: 1; padding-right: 8px; }
    .badge { display: inline-flex; align-items: center; padding: 3px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .badge.green { background: #d1fae5; color: #065f46; }
    .badge.blue  { background: #dbeafe; color: #1e40af; }
    .badge.red   { background: #fee2e2; color: #991b1b; }
    .subcat-score { font-weight: 700; font-size: 1rem; }

    /* Analysis charts */
    .charts-analysis-title { font-size: 1rem; font-weight: 500; text-align: center; margin-bottom: 16px; }
    .charts-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 24px; }
    @media (max-width: 700px) { .charts-grid { grid-template-columns: 1fr; } }
    .chart-box { background: #fff; border-radius: 10px; border: 1px solid #e5e7eb; box-shadow: inset 0 2px 4px rgba(0,0,0,0.04); padding: 14px; }
    .chart-box-bar    { height: 400px; }
    .chart-box-radar  { height: 280px; }

    /* Legend */
    .legend-box { margin-top: 16px; background: #f9fafb; border-radius: 10px; border: 1px solid #e5e7eb; padding: 14px; }
    .legend-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 6px 16px; }
    .legend-item { display: flex; align-items: flex-start; gap: 6px; font-size: 0.8125rem; color: #374151; }
    .legend-index { font-weight: 700; color: #6b7280; flex-shrink: 0; }

    /* Level badge colours (inline quartile chips) */
    .level-chip { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 0.75rem; font-weight: 600; }
    .level-chip-1 { background: #fee2e2; color: #991b1b; }
    .level-chip-2 { background: #fef3c7; color: #92400e; }
    .level-chip-3 { background: #dbeafe; color: #1e40af; }
    .level-chip-4 { background: #d1fae5; color: #065f46; }

    @media print {
      body { background: white; padding: 0; }
      .card { box-shadow: none; border: 1px solid #e5e7eb; break-inside: avoid; }
    }
  </style>
</head>
<body>
<div class="container" id="results-content">

  <h1>Résultats de l'évaluation ESG</h1>

  <!-- INTRO -->
  <div class="card">
    <div class="intro-border intro-text">
      Dans ce contexte de transformations continues du marché et de notre environnement législatif,
      les évolutions économiques et les nouvelles régulations exigent une adaptation constante de nos stratégies.
      Fidèle à sa vocation de fédérer, représenter et accompagner les acteurs de l'industrie automobile en Tunisie,
      la TAA œuvre à fournir des outils concrets pour anticiper ces mutations et renforcer la compétitivité du secteur.
    </div>
    <p class="intro-text">
      C'est dans cette optique qu'un outil d'auto-évaluation ESG a été mis à disposition des entreprises.
      Cette auto-évaluation, remplie directement par l'entreprise, vise à fournir un aperçu clair et objectif
      de son positionnement en matière environnementale, sociale et de gouvernance. L'entreprise demeure responsable
      de l'exactitude des informations fournies, et les résultats, strictement confidentiels, permettent de mettre
      en lumière à la fois les points forts et les axes d'amélioration. Ce positionnement constitue une première
      étape essentielle pour tracer une stratégie ESG cohérente, alignée avec les standards internationaux et les
      exigences du marché.
      La TAA reste mobilisée pour vous accompagner dans cette démarche stratégique, en proposant un accompagnement
      sur mesure à travers des formations ciblées, du conseil personnalisé et l'appui de son pôle d'expertise dédié
      à l'ESG et au développement durable.
    </p>
  </div>

  <!-- GLOBAL SCORE -->
  <div class="card">
    <h2>Score Global</h2>
    <div class="score-wrapper">
      <div class="score-donut-container">
        <canvas id="globalDoughnutChart" width="180" height="180"></canvas>
        <div class="score-donut-overlay">
          <span class="score-number">${resultData.globalScore}</span>
          <span class="score-max">/ ${resultData.totalScore || 955}</span>
        </div>
      </div>
    </div>
    <p class="quartile-label">
      Quartile&nbsp;:&nbsp;${resultData.globalScore <= 250
        ? "Q1 – Prise de conscience et initiation"
        : resultData.globalScore <= 500
        ? "Q2 – Progression"
        : resultData.globalScore <= 750
        ? "Q3 – Confirmé"
        : "Q4 – Leadership et exemplarité"}
    </p>
  </div>

  <!-- MATURITY LEVELS COMPARISON -->
  <div class="card">
    <h2>Comparaison des Niveaux de Maturité ESG</h2>
    <p style="text-align:center;color:#9ca3af;margin-bottom:20px;">Niveaux atteints pour chaque pilier d'évaluation</p>

    <div class="maturity-bg">
      <div class="maturity-chart-wrapper">
        <canvas id="barChart"></canvas>
      </div>

      <div class="levels-grid">
        ${[1,2,3,4].map(level => {
          const colors = { 1:'#ef4444', 2:'#f59e0b', 3:'#3b82f6', 4:'#10b981' };
          const labels = { 1:'Initial', 2:'Progression', 3:'Confirmé', 4:'Leadership' };
          const descs = {
            1: [
              "Critères basés/respecte OU AU MOINS s'engage (plan d'action adéquat) à la conformité à la réglementation en vigueur dans le pays de résidence si il y en a.",
              "Le critère est en cours de préparation (phase de planification validée) avec une existence sommaire qui se limite à des procédures formelles ou informelles non structurées."
            ],
            2: [
              "Les attentes des parties prenantes par rapport à ces critères sont identifiées et respectées.",
              "La phase d'organisation est bien validée.",
              "L'approche de l'entreprise à ce niveau est à un niveau réactif sans anticipation ni proactivité."
            ],
            3: [
              "Les pratiques sont mises en œuvre avec suivi de l'efficacité et amélioration continue (phase de mise en œuvre entamée).",
              "Existence de certification, organisation opérationnelle initiée, amélioration lancée."
            ],
            4: [
              "Pratiques innovantes / Rayonnement exemplarité et partage / Performances organisationnelles et opérationnelles démontrées en cohérence avec la vision stratégique moyen et long terme. Management participatif démontré.",
              "La phase contrôle, évaluation et suivi est bel et bien en place."
            ]
          };
          return `
          <div class="level-card">
            <div class="level-card-header">
              <span class="level-dot" style="background:${colors[level]};"></span>
              <p class="level-card-title">N${level}: <span class="level-card-subtitle">${labels[level]}</span></p>
            </div>
            <ul class="level-desc-list">
              ${descs[level].map(d => `<li>${d}</li>`).join('')}
            </ul>
          </div>`;
        }).join('')}
      </div>
    </div>
  </div>

  <!-- CATEGORY SECTIONS -->
  ${["Environnement", "Social", "Gouvernance"].map(category => {
    const colClass = category === "Environnement" ? "green" : category === "Social" ? "blue" : "red";
    const maxScore = category === "Environnement" ? 235 : category === "Social" ? 405 : 315;
    const catScore = resultData.categoryScores[category] || 0;
    const catLevel = resultData.categoryLevels[category] || "N0";
    const catPct   = Math.min(Math.round((catScore / maxScore) * 100), 100);
    const subcats  = Object.keys(resultData.subcategoryScores[category] || {});

    return `
    <div class="card">
      <h2>${category}</h2>

      <div class="category-header">
        <span class="category-score-text">Score : ${catScore} / ${maxScore}</span>
        <span class="category-level-text">Niveau : ${catLevel}</span>
      </div>
      <div class="progress-track">
        <div class="progress-fill fill-${colClass}" style="width:${catPct}%;"></div>
      </div>

      <!-- Subcategory cards -->
      <div class="subcat-grid">
        ${subcats.map(subcat => {
          const score    = resultData.subcategoryScores[category][subcat];
          const maxSub   = subcategoryMaxScores[category][subcat] || maxScore;
          const levelNum = Math.min(Math.ceil((score / maxSub) * 4) || 1, 4);
          return `
          <div class="subcat-card ${colClass}">
            <div class="subcat-top">
              <span class="subcat-name">${subcat}</span>
              <span class="badge ${colClass}">N${levelNum}</span>
            </div>
            <span class="subcat-score">${score} / ${maxSub}</span>
          </div>`;
        }).join('')}
      </div>

      <!-- Charts analysis -->
      <div>
        <h3 class="charts-analysis-title">Analyse des sous-catégories</h3>
        <div class="charts-grid">
          <div>
            <h4>Progression par sous-catégorie (%)</h4>
            <div class="chart-box chart-box-bar">
              <canvas id="${category}BarChart"></canvas>
            </div>
          </div>
          <div>
            <h4>Niveaux de maturité</h4>
            <div class="chart-box chart-box-radar">
              <canvas id="${category}RadarChart"></canvas>
            </div>
            <div style="margin-top:10px;text-align:center;display:flex;flex-wrap:wrap;justify-content:center;gap:6px;">
              <span style="padding:3px 8px;background:#f3f4f6;border-radius:4px;font-size:0.75rem;">N1 : Initial</span>
              <span style="padding:3px 8px;background:#f3f4f6;border-radius:4px;font-size:0.75rem;">N2 : Progression</span>
              <span style="padding:3px 8px;background:#f3f4f6;border-radius:4px;font-size:0.75rem;">N3 : Confirmé</span>
              <span style="padding:3px 8px;background:#f3f4f6;border-radius:4px;font-size:0.75rem;">N4 : Leadership</span>
            </div>
          </div>
        </div>

        <div class="legend-box">
          <h4 style="text-align:left;margin-bottom:10px;">Légende des sous-catégories</h4>
          <div class="legend-grid">
            ${subcats.map((subcat, i) => `
              <div class="legend-item">
                <span class="legend-index">${i+1}.</span>
                <span>${subcat}</span>
              </div>`).join('')}
          </div>
        </div>
      </div>
    </div>`;
  }).join('')}

</div><!-- end .container -->

<script>
document.addEventListener('DOMContentLoaded', function() {

  // ── GLOBAL SCORE DOUGHNUT ────────────────────────────────────────────────────
  new Chart(document.getElementById('globalDoughnutChart'), {
    type: 'doughnut',
    data: {
      labels: ['Score', 'Restant'],
      datasets: [{
        data: [${resultData.globalScore}, ${(resultData.totalScore || 955) - resultData.globalScore}],
        backgroundColor: ['rgba(249,21,21,0.8)', 'rgba(220,220,220,0.3)'],
        borderWidth: 0
      }]
    },
    options: {
      cutout: '80%',
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend:  { display: false },
        tooltip: { enabled: false }
      }
    }
  });

  // ── MATURITY COMPARISON BAR ──────────────────────────────────────────────────
  new Chart(document.getElementById('barChart'), {
    type: 'bar',
    data: {
      labels: ['Environnement', 'Social', 'Gouvernance'],
      datasets: [{
        data: [
          ${parseInt((resultData.categoryLevels['Environnement'] || 'N0').replace('N',''))},
          ${parseInt((resultData.categoryLevels['Social']        || 'N0').replace('N',''))},
          ${parseInt((resultData.categoryLevels['Gouvernance']   || 'N0').replace('N',''))}
        ],
        backgroundColor: ['rgba(16,185,129,0.7)','rgba(59,130,246,0.7)','rgba(239,68,68,0.7)'],
        borderColor:      ['rgba(16,185,129,1)',  'rgba(59,130,246,1)',  'rgba(239,68,68,1)' ],
        borderWidth: 2,
        borderRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true, max: 4,
          ticks: { stepSize: 1, callback: v => v > 0 ? 'N'+v : '' }
        }
      },
      plugins: { legend: { display: false } }
    }
  });

  // ── CATEGORY CHARTS ──────────────────────────────────────────────────────────
  ${["Environnement","Social","Gouvernance"].map(category => {
    const barColor   = category === "Environnement" ? "rgba(16,185,129,0.7)"  : category === "Social" ? "rgba(59,130,246,0.7)"  : "rgba(239,68,68,0.7)";
    const lineColor  = category === "Environnement" ? "rgba(16,185,129,1)"    : category === "Social" ? "rgba(59,130,246,1)"    : "rgba(239,68,68,1)";
    const fillColor  = category === "Environnement" ? "rgba(16,185,129,0.15)" : category === "Social" ? "rgba(59,130,246,0.15)" : "rgba(239,68,68,0.15)";
    const maxScore   = category === "Environnement" ? 235 : category === "Social" ? 405 : 315;
    return `
  // ${category}
  (function() {
    const subcatScores = ${JSON.stringify(resultData.subcategoryScores[category] || {})};
    const maxScores    = ${JSON.stringify(subcategoryMaxScores[category] || {})};
    const labels  = Object.keys(subcatScores);
    const pctData = labels.map(k => {
      const max = maxScores[k] || ${maxScore};
      return Math.round((subcatScores[k] / max) * 100);
    });
    const lvlData = labels.map(k => {
      const max = maxScores[k] || ${maxScore};
      return Math.min(Math.ceil((subcatScores[k] / max) * 4) || 1, 4);
    });

    new Chart(document.getElementById('${category}BarChart'), {
      type: 'bar',
      data: {
        labels: labels,
        datasets: [{ data: pctData, backgroundColor: '${barColor}', borderRadius: 4 }]
      },
      options: {
        indexAxis: 'y',
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: {
            beginAtZero: true, max: 100,
            ticks: { callback: v => v+'%' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });

    new Chart(document.getElementById('${category}RadarChart'), {
      type: 'radar',
      data: {
        labels: labels,
        datasets: [{
          data: lvlData,
          backgroundColor: '${fillColor}',
          borderColor: '${lineColor}',
          borderWidth: 2,
          pointRadius: 4
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          r: {
            beginAtZero: true, max: 4,
            ticks: { stepSize: 1, callback: v => v > 0 ? 'N'+v : '' }
          }
        },
        plugins: { legend: { display: false } }
      }
    });
  })();`;
  }).join('\n')}

});
</script>
</body>
</html>`;
};

/**
 * Send ESG results email via Microsoft SMTP with OAuth2
 * @param {string} email - Recipient email address
 * @param {string} organizationName - Organization name
 * @param {string} phoneNumber - Phone number
 * @param {object} resultData - Result data object containing scores and levels
 * @param {string|number} resultId - DB result ID used to build the report URL
 */
const sendResultEmail = async (email, organizationName, phoneNumber, resultData, resultId) => {
  try {
    const emailHtml = generateEmailHtml(organizationName, resultData, resultId);
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
