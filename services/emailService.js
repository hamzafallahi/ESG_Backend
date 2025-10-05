const sgMail = require('@sendgrid/mail');

// Initialize SendGrid with API key
if (!process.env.SENDGRID_API_KEY) {
  throw new Error('SENDGRID_API_KEY is not defined in environment variables');
}
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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
                    <strong>Environnement:</strong> ${resultData.categoryScores["Environnement"]} / 235
                    <span class="level level-${parseInt(resultData.categoryLevels["Environnement"].replace("N", ""))}">
                        ${resultData.categoryLevels["Environnement"]}
                    </span>
                </div>
                
                <div class="category social">
                    <strong>Social:</strong> ${resultData.categoryScores["Social"]} / 405
                    <span class="level level-${parseInt(resultData.categoryLevels["Social"].replace("N", ""))}">
                        ${resultData.categoryLevels["Social"]}
                    </span>
                </div>
                
                <div class="category gov">
                    <strong>Gouvernance:</strong> ${resultData.categoryScores["Gouvernance"]} / 315
                    <span class="level level-${parseInt(resultData.categoryLevels["Gouvernance"].replace("N", ""))}">
                        ${resultData.categoryLevels["Gouvernance"]}
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
  // This would be your complete results page with charts
  // For now, using a simplified version
  return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <title>Résultats ESG - ${organizationName}</title>
        <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
        <style>
            body { font-family: Arial, sans-serif; padding: 20px; }
            .container { max-width: 1200px; margin: 0 auto; }
            .header { text-align: center; margin-bottom: 30px; }
            .score-card { background: #f5f5f5; padding: 20px; border-radius: 8px; margin: 20px 0; }
            .chart-container { margin: 30px 0; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <img src="https://www.taa.tn/wp-content/uploads/2022/03/Logo-TAA.png" alt="TAA Logo" style="max-width: 300px;">
                <h1>Rapport d'évaluation ESG</h1>
                <h2>${organizationName}</h2>
            </div>
            
            <div class="score-card">
                <h2>Score Global: ${resultData.globalScore} / 955</h2>
                <h3>Résultats par catégorie:</h3>
                <ul>
                    <li>Environnement: ${resultData.categoryScores["Environnement"]} / 235 - ${resultData.categoryLevels["Environnement"]}</li>
                    <li>Social: ${resultData.categoryScores["Social"]} / 405 - ${resultData.categoryLevels["Social"]}</li>
                    <li>Gouvernance: ${resultData.categoryScores["Gouvernance"]} / 315 - ${resultData.categoryLevels["Gouvernance"]}</li>
                </ul>
            </div>
            
            <div class="chart-container">
                <canvas id="categoryChart"></canvas>
            </div>
            
            <script>
                const ctx = document.getElementById('categoryChart').getContext('2d');
                new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: ['Environnement', 'Social', 'Gouvernance'],
                        datasets: [{
                            label: 'Score',
                            data: [${resultData.categoryScores["Environnement"]}, ${resultData.categoryScores["Social"]}, ${resultData.categoryScores["Gouvernance"]}],
                            backgroundColor: ['#4CAF50', '#2196F3', '#f44336']
                        }]
                    },
                    options: {
                        responsive: true,
                        scales: {
                            y: {
                                beginAtZero: true
                            }
                        }
                    }
                });
            </script>
        </div>
    </body>
    </html>
  `;
};

/**
 * Send ESG results email via SendGrid
 * @param {string} email - Recipient email address
 * @param {string} organizationName - Organization name
 * @param {string} phoneNumber - Phone number
 * @param {object} resultData - Result data object containing scores and levels
 */
const sendResultEmail = async (email, organizationName, phoneNumber, resultData) => {
  try {
    const emailHtml = generateEmailHtml(organizationName, resultData);
    const resultsPageHtml = generateResultsPageHtml(organizationName, resultData);

    const msg = {
      to: email,
      from: process.env.FROM_EMAIL_GMAIL || 'esg@taa.tn',
      subject: "Résultats de votre évaluation ESG - TAA",
      html: emailHtml,
      attachments: [
        {
          content: Buffer.from(resultsPageHtml).toString('base64'),
          filename: 'ESG_Results.html',
          type: 'text/html',
          disposition: 'attachment'
        }
      ]
    };

    await sgMail.send(msg);
    console.log(`Email sent successfully to ${email}`);
    return { success: true, message: 'Email sent successfully' };
  } catch (error) {
    console.error('Error sending email:', error);
    if (error.response) {
      console.error('SendGrid error details:', error.response.body);
    }
    throw error;
  }
};

module.exports = {
  sendResultEmail,
  generateEmailHtml,
  generateResultsPageHtml
};
