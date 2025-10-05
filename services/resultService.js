const emailService = require('./emailService');
const googleSheetsService = require('./googleSheetsService');
const db = require('../models');
const User = db.user;

/**
 * Process and send result data
 * - Sends email with results
 * - Saves data to Google Sheets
 * @param {string} userId - User ID
 * @param {object} resultData - Result data object
 */
const processResultData = async (userId, resultData) => {
  try {
    // Fetch user information
    const user = await User.findByPk(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    const { organization_name, phone_number, email } = user;

    // Validate required data
    if (!email || !organization_name || !resultData) {
      throw new Error('Missing required data: email, organization_name, or resultData');
    }

    // Send email and append to Google Sheets in parallel
    const [emailResult, sheetsResult] = await Promise.allSettled([
      emailService.sendResultEmail(email, organization_name, phone_number, resultData),
      googleSheetsService.appendResultToSheet(organization_name, phone_number, email, resultData)
    ]);

    // Check results
    const results = {
      email: {
        success: emailResult.status === 'fulfilled',
        data: emailResult.status === 'fulfilled' ? emailResult.value : null,
        error: emailResult.status === 'rejected' ? emailResult.reason.message : null
      },
      sheets: {
        success: sheetsResult.status === 'fulfilled',
        data: sheetsResult.status === 'fulfilled' ? sheetsResult.value : null,
        error: sheetsResult.status === 'rejected' ? sheetsResult.reason.message : null
      }
    };

    // Log results
    if (results.email.success) {
      console.log('✓ Email sent successfully');
    } else {
      console.error('✗ Email failed:', results.email.error);
    }

    if (results.sheets.success) {
      console.log('✓ Data saved to Google Sheets successfully');
    } else {
      console.error('✗ Google Sheets update failed:', results.sheets.error);
    }

    // Return combined results
    return {
      success: results.email.success && results.sheets.success,
      partialSuccess: results.email.success || results.sheets.success,
      results
    };
  } catch (error) {
    console.error('Error processing result data:', error);
    throw error;
  }
};

/**
 * Calculate result data from result categories and sections
 * @param {object} result - Result instance with categories and sections
 */
const calculateResultData = (result) => {
  const resultData = {
    globalScore: result.total_score || 0,
    categoryScores: {},
    subcategoryScores: {},
    categoryLevels: {}
  };

  // Process result categories
  if (result.result_categories && result.result_categories.length > 0) {
    result.result_categories.forEach(rc => {
      const categoryName = rc.category?.name || 'Unknown';
      resultData.categoryScores[categoryName] = rc.score || 0;
      resultData.categoryLevels[categoryName] = rc.level ? `N${rc.level}` : 'N1';
    });
  }

  // Process result sections (subcategories)
  if (result.result_sections && result.result_sections.length > 0) {
    result.result_sections.forEach(rs => {
      const sectionName = rs.section?.name || 'Unknown';
      const categoryName = rs.section?.category?.name || 'Unknown';
      
      if (!resultData.subcategoryScores[categoryName]) {
        resultData.subcategoryScores[categoryName] = {};
      }
      
      resultData.subcategoryScores[categoryName][sectionName] = rs.score || 0;
    });
  }

  return resultData;
};

/**
 * Send result notification after result creation
 * @param {object} result - Result instance with user_id and score data
 */
const sendResultNotification = async (result) => {
  try {
    // Fetch complete result with associations
    const completeResult = await db.results.findByPk(result.id, {
      include: [
        {
          model: db.result_categories,
          as: 'result_categories',
          include: [{
            model: db.category,
            as: 'category'
          }]
        },
        {
          model: db.result_sections,
          as: 'result_sections',
          include: [{
            model: db.section,
            as: 'section',
            include: [{
              model: db.category,
              as: 'category'
            }]
          }]
        }
      ]
    });

    if (!completeResult) {
      throw new Error('Result not found');
    }

    // Calculate result data
    const resultData = calculateResultData(completeResult);

    // Process and send result
    const processResult = await processResultData(result.user_id, resultData);

    return processResult;
  } catch (error) {
    console.error('Error sending result notification:', error);
    throw error;
  }
};

module.exports = {
  processResultData,
  calculateResultData,
  sendResultNotification
};
