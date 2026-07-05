const rankingService = require('../services/rankingService');
const UserRankingSerializer = require('../serializer/UserRanking.serializer');
const RankingSnapshotSerializer = require('../serializer/RankingSnapshot.serializer');
const NotFoundError = require('../error/exception/NotFound');
const db = require('../models');

const UserRanking = db.user_rankings;

/**
 * GET /rankings/me - current user's ranking + summary.
 */
const getMyRanking = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new NotFoundError('User not found', 'User');
    const ranking = await rankingService.getUserCurrentRanking(userId);
    res.json(
      UserRankingSerializer.serialize({
        id: `${userId}-${ranking.year}`,
        user_id: userId,
        year: ranking.year,
        rank: ranking.rank,
        total_score: ranking.total_score,
        total_participants: ranking.total_participants,
        result_id: null,
        computed_at: ranking.computed_at || null,
        created_at: null,
        updated_at: null,
      })
    );
  } catch (error) {
    next(error);
  }
};

/**
 * GET /rankings/me/history - historical snapshots for the current user.
 * Optional query: ?year=2026
 */
const getMyHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    if (!userId) throw new NotFoundError('User not found', 'User');
    const year = req.query.year ? Number(req.query.year) : undefined;
    const snapshots = await rankingService.getUserRankingHistory(userId, { year });
    const years = await rankingService.getUserRankingYears(userId);
    const currentYear = await rankingService.getCurrentRankingYear();

    const payload = snapshots.map((s) => ({
      id: s.id,
      user_id: s.user_id,
      year: s.year,
      rank: s.rank,
      total_score: s.total_score,
      total_participants: s.total_participants,
      trigger_result_id: s.trigger_result_id,
      snapshot_at: s.snapshot_at,
      created_at: s.created_at,
    }));

    const serialized = RankingSnapshotSerializer.serialize(payload);
    serialized.meta = { years, current_year: currentYear };
    res.json(serialized);
  } catch (error) {
    next(error);
  }
};

/**
 * GET /rankings/leaderboard?year=YYYY&limit=N - top ranked users for a year.
 */
const getLeaderboard = async (req, res, next) => {
  try {
    const year = req.query.year
      ? Number(req.query.year)
      : await rankingService.getCurrentRankingYear();
    const limit = Math.min(Number(req.query.limit) || 50, 200);

    const rows = await UserRanking.findAll({
      where: { year },
      order: [['rank', 'ASC']],
      limit,
      raw: true,
    });

    const totalParticipants = await UserRanking.count({ where: { year } });
    const serialized = UserRankingSerializer.serialize(rows);
    serialized.meta = { year, total_participants: totalParticipants };
    res.json(serialized);
  } catch (error) {
    next(error);
  }
};

/**
 * POST /rankings/reset - admin only. Optional body { year }.
 */
const resetRankings = async (req, res, next) => {
  try {
    const year = req.body?.year ? Number(req.body.year) : null;
    const { year: resolvedYear, totalParticipants, changed } =
      await rankingService.resetRankingsForYear(year);
    res.json({
      data: {
        type: 'ranking_reset',
        id: String(resolvedYear),
        attributes: {
          year: resolvedYear,
          total_participants: totalParticipants,
          affected_users: changed.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /rankings/recompute - admin only, force a full recomputation.
 */
const recomputeRankings = async (req, res, next) => {
  try {
    const { year, totalParticipants, changed } =
      await rankingService.recomputeCurrentYearRankings();
    res.json({
      data: {
        type: 'ranking_recompute',
        id: String(year),
        attributes: {
          year,
          total_participants: totalParticipants,
          affected_users: changed.length,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /rankings/period - returns the current ranking period configuration and
 * the derived active year. Accessible to any authenticated user.
 */
const getPeriod = async (req, res, next) => {
  try {
    const config = await rankingService.getRankingPeriodConfig();
    const year = await rankingService.getCurrentRankingYear();
    res.json({
      data: {
        type: 'ranking_period',
        id: String(year),
        attributes: {
          current_year: year,
          start_month: config.start_month,
          start_day: config.start_day,
          auto_reset_enabled: config.auto_reset_enabled,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyRanking,
  getMyHistory,
  getLeaderboard,
  resetRankings,
  recomputeRankings,
  getPeriod,
};
