const express = require('express');
const { authenticate } = require('../middleware/authMiddleware');

// Import route modules
const resultRoutes = require('./result');
const resultCategoryRoutes = require('./resultCategory');
const resultSectionRoutes = require('./resultSection');
const categoryRoutes = require('./categories');
const sectionRoutes = require('./sections');
const questionRoutes = require('./questions');
const rsciRoutes = require('./rscis');
const subSectorRoutes = require('./subsectors');
const authRoutes = require('./auth');
const adminRoutes = require('./admins');
const superAdminRoutes = require('./superadmins');
const userRoutes = require('./users');
const profileRoutes = require('./profile');
const eventRoutes = require('./Event'); 
const assessmentProgressRoutes = require('./assessmentProgress');
const settingsRoutes = require('./settings');
const inboxMessageRoutes = require('./inboxMessages');
const messageReadRoutes = require('./messageReads');
const inboxActionsRoutes = require('./inboxActions');
const uploadRoutes = require('./upload');
const rankingRoutes = require('./rankings');
const resultsIntroductionRoutes = require('./resultsIntroduction');
const router = express.Router();

// Public routes (no authentication required)
router.use('/auth', authRoutes);

// Inbox actions has mixed auth (some public, some authenticated, some admin)
router.use('/inbox-actions', inboxActionsRoutes);

// SSE events use their own authentication middleware (supports query params)
router.use('/events', eventRoutes);

// All routes below require authentication
router.use(authenticate);

router.use('/results', resultRoutes);
router.use('/result-categories', resultCategoryRoutes);
router.use('/result-sections', resultSectionRoutes);
router.use('/categories', categoryRoutes);
router.use('/sections', sectionRoutes);
router.use('/questions', questionRoutes);
router.use('/rscis', rsciRoutes);
router.use('/sub-sectors', subSectorRoutes);
router.use('/admins', adminRoutes);
router.use('/super-admins', superAdminRoutes);
router.use('/users', userRoutes);
router.use('/profile', profileRoutes);
router.use('/assessment-progress', assessmentProgressRoutes);
router.use('/settings', settingsRoutes);
router.use('/inbox-messages', inboxMessageRoutes);
router.use('/message-reads', messageReadRoutes);
router.use('/upload', uploadRoutes);
router.use('/rankings', rankingRoutes);
router.use('/results-introduction', resultsIntroductionRoutes);

module.exports = router;    