const { google } = require('googleapis');

/**
 * Initialize Google Sheets API client
 */
const getGoogleSheetsClient = async () => {
  try {
    const auth = new google.auth.GoogleAuth({
      credentials: {
        client_email: process.env.GOOGLE_CLIENT_EMAIL,
        private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      },
      scopes: [
        "https://www.googleapis.com/auth/drive",
        "https://www.googleapis.com/auth/drive.file",
        "https://www.googleapis.com/auth/spreadsheets",
      ],
    });

    const sheets = google.sheets({ auth, version: "v4" });
    return sheets;
  } catch (error) {
    console.error('Error initializing Google Sheets client:', error);
    throw error;
  }
};

/**
 * Append result data to Google Sheets
 * @param {string} organizationName - Organization name
 * @param {string} phoneNumber - Phone number
 * @param {string} email - Email address
 * @param {object} resultData - Result data object
 */
const appendResultToSheet = async (organizationName, phoneNumber, email, resultData) => {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET1_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET1_ID is not defined in environment variables');
    }

    const range = "Sheet1!A1:I1";
    const assessmentDate = new Date().toLocaleDateString('fr-FR');
    const globalScore = `${resultData.globalScore} / ${resultData.totalScore || 955}`;
    
    // Encode the resultData to create the link
    const encodedData = encodeURIComponent(JSON.stringify(resultData));
    const resultsLink = `${process.env.FRONTEND_URL}/Formulaire_ESG/results?resultData=${encodedData}`;

    // Prepare the data for Google Sheets - main row and category rows
    const values = [
      [organizationName, phoneNumber, email, assessmentDate, globalScore, "", "", "", resultsLink], // Main row
      ["", "", "", "", "", "Gouvernance", resultData.categoryScores["Gouvernance"], resultData.categoryLevels["Gouvernance"]],
      ["", "", "", "", "", "Social", resultData.categoryScores["Social"], resultData.categoryLevels["Social"]],
      ["", "", "", "", "", "Environnement", resultData.categoryScores["Environnement"], resultData.categoryLevels["Environnement"]],
    ];

    // Append data to Google Sheets
    const response = await sheets.spreadsheets.values.append({
      spreadsheetId,
      range,
      valueInputOption: "USER_ENTERED",
      requestBody: {
        values,
      },
    });

    return { success: true, message: 'Data appended to Google Sheets successfully', response: response.data };
  } catch (error) {
    console.error('Error appending to Google Sheets:', error);
    throw error;
  }
};

/**
 * Read data from Google Sheets
 * @param {string} range - The range to read from (e.g., "Sheet1!A1:I10")
 */
const readFromSheet = async (range = "Sheet1!A1:I100") => {
  try {
    const sheets = await getGoogleSheetsClient();
    const spreadsheetId = process.env.GOOGLE_SHEET1_ID;

    if (!spreadsheetId) {
      throw new Error('GOOGLE_SHEET1_ID is not defined in environment variables');
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error reading from Google Sheets:', error);
    throw error;
  }
};

module.exports = {
  appendResultToSheet,
  readFromSheet,
  getGoogleSheetsClient
};
