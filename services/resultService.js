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
 * @param {string|number} resultId - The DB result ID used to build the report URL
 */
const processResultData = async (userId, resultData, resultId) => {
  try {
    // Fetch user information
    const user = await User.findByPk(userId);
    console.log('User fetched for result processing: 4444444444444444444444', user);
    
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
      emailService.sendResultEmail(email, organization_name, phone_number, resultData, resultId),
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
    totalScore: result.scoring_snapshot?.total || null,
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
      const sectionName = rs.section?.title || 'Unknown';
      const categoryName = rs.section?.category?.name || 'Unknown';
      
      if (!resultData.subcategoryScores[categoryName]) {
        resultData.subcategoryScores[categoryName] = {};
      }
      
      resultData.subcategoryScores[categoryName][sectionName] = rs.score || 0;
    });
  }
  console.log('Calculated result data: 2222222222222222222222', resultData);
  return resultData;
};

/**
 * Send result notification after result creation
 * @param {object} result - Result instance with user_id and score data
 */
const sendResultNotification = async (result) => {
  try {
    // Retry mechanism to wait for result_categories and result_sections to be created
    const maxRetries = 30; // 30 attempts
    const retryDelay = 1000; // 1 second between retries
    let completeResult = null;
    let attempts = 0;

    // Keep trying until we get the data or reach max retries
    while (attempts < maxRetries) {
      completeResult = await db.results.findOne({
        where: { id: result.id },
        include: [
          { 
            association: 'result_categories',
            include: [{ association: 'category' }]
          },
          { 
            association: 'result_sections',
            include: [
              { 
                association: 'section',
                include: [{ association: 'category' }]
              }
            ]
          }
        ]
      });

      // Check if we have data in both arrays
      const hasCategories = completeResult?.result_categories?.length > 0;
      const hasSections = completeResult?.result_sections?.length > 0;

      if (hasCategories && hasSections) {
        console.log(`✓ Result data loaded successfully after ${attempts + 1} attempt(s)`);
        break;
      }

      attempts++;
      
      if (attempts < maxRetries) {
        console.log(`⏳ Waiting for result data... Attempt ${attempts}/${maxRetries}`);
        // Wait before retrying
        await new Promise(resolve => setTimeout(resolve, retryDelay));
      }
    }

    // If we still don't have data after all retries, throw an error
    if (!completeResult?.result_categories?.length && !completeResult?.result_sections?.length) {
      throw new Error(`Timeout: Result categories and sections not found after ${maxRetries} seconds`);
    }
    
    console.log('Complete result fetched: 33333333333333333333', JSON.stringify(completeResult, null, 2));
    
    if (!completeResult) {
      throw new Error('Result not found');
    }

    // Calculate result data
    const resultData = calculateResultData(completeResult);

    // Process and send result
    const processResult = await processResultData(result.user_id, resultData, result.id);

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
