const express = require('express');
const router = express.Router();
const rankingController = require('../controllers/Ranking.controller');
const { requireAdmin, requireUser } = require('../middleware/authMiddleware');

router.get('/period', rankingController.getPeriod);
router.get('/leaderboard', rankingController.getLeaderboard);
router.get('/me', requireUser, rankingController.getMyRanking);
router.get('/me/history', requireUser, rankingController.getMyHistory);

router.post('/reset', requireAdmin, rankingController.resetRankings);
router.post('/recompute', requireAdmin, rankingController.recomputeRankings);

module.exports = router;
