const db = require('../models');
const { DateTime } = require('luxon');
const { Op } = require('sequelize');

const DEFAULT_PERIOD = {
  start_month: 1,
  start_day: 1,
  auto_reset_enabled: true,
};

/**
 * Load the current ranking period configuration from settings.
 * Falls back to a calendar year starting Jan 1 if the setting is missing.
 */
async function getRankingPeriodConfig() {
  const Settings = db.settings;
  const setting = await Settings.findOne({ where: { key: 'ranking_period' } });
  if (!setting || !setting.value || typeof setting.value !== 'object') {
    return { ...DEFAULT_PERIOD };
  }
  const value = setting.value;
  return {
    start_month: Number(value.start_month) || DEFAULT_PERIOD.start_month,
    start_day: Number(value.start_day) || DEFAULT_PERIOD.start_day,
    auto_reset_enabled: value.auto_reset_enabled !== false,
  };
}

/**
 * Derive the ranking year that a given JS Date belongs to based on the
 * configured period start (month, day).
 */
function rankingYearFor(date, config) {
  const dt = DateTime.fromJSDate(date);
  const boundary = DateTime.fromObject({
    year: dt.year,
    month: config.start_month,
    day: config.start_day,
  });
  return dt < boundary ? dt.year - 1 : dt.year;
}

/**
 * Compute the current active ranking year.
 */
async function getCurrentRankingYear() {
  const config = await getRankingPeriodConfig();
  return rankingYearFor(new Date(), config);
}

/**
 * Bounds (Date, Date) of the ranking year, half-open [start, end).
 */
function rankingYearBounds(year, config) {
  const start = DateTime.fromObject({
    year,
    month: config.start_month,
    day: config.start_day,
  }).toJSDate();
  const end = DateTime.fromObject({
    year: year + 1,
    month: config.start_month,
    day: config.start_day,
  }).toJSDate();
  return { start, end };
}

/**
 * For each user, find their best result inside the ranking window (highest
 * total_score, tie-broken by most recent).
 * Returns array of { user_id, total_score, result_id } sorted desc by score,
 * then by earliest submission time (earlier submission ranks higher on ties).
 */
async function getBestResultsForYear(year, config) {
  const Result = db.results;
  const { start, end } = rankingYearBounds(year, config);

  const results = await Result.findAll({
    where: {
      created_at: { [Op.gte]: start, [Op.lt]: end },
      total_score: { [Op.ne]: null },
    },
    attributes: ['id', 'user_id', 'total_score', 'created_at'],
    order: [['created_at', 'ASC']],
    raw: true,
  });

  // Keep only the best result per user
  const bestByUser = new Map();
  for (const r of results) {
    const current = bestByUser.get(r.user_id);
    if (!current || r.total_score > current.total_score) {
      bestByUser.set(r.user_id, r);
    }
  }

  const ranked = Array.from(bestByUser.values())
    .sort((a, b) => {
      if (b.total_score !== a.total_score) return b.total_score - a.total_score;
      return new Date(a.created_at) - new Date(b.created_at);
    })
    .map((r, index) => ({
      user_id: r.user_id,
      total_score: r.total_score,
      result_id: r.id,
      rank: index + 1,
    }));

  return ranked;
}

/**
 * Recompute rankings for the current year, persist to user_rankings, and emit
 * SSE notifications to any user whose rank or participant count changed.
 * Also writes a ranking_snapshots row for any user whose rank changed (or is
 * new) so the history chart can render the evolution.
 *
 * When `triggerUserId` is supplied (i.e. the user who just submitted an
 * assessment), a snapshot is ALWAYS appended for that user — even if their
 * rank/score did not change — so every submission produces a traceable point
 * on the evolution graph and previous ranks are preserved as history.
 *
 * Returns { year, totalParticipants, changed: [...], triggerRanking }.
 */
async function recomputeCurrentYearRankings(triggerResultId = null, triggerUserId = null) {
  const config = await getRankingPeriodConfig();
  const year = rankingYearFor(new Date(), config);

  const UserRanking = db.user_rankings;
  const RankingSnapshot = db.ranking_snapshots;

  const ranked = await getBestResultsForYear(year, config);
  const totalParticipants = ranked.length;

  const previous = await UserRanking.findAll({
    where: { year },
    attributes: ['user_id', 'rank', 'total_score'],
    raw: true,
  });
  const prevByUser = new Map(previous.map((r) => [r.user_id, r]));
  const newByUser = new Map(ranked.map((r) => [r.user_id, r]));

  const now = new Date();
  const changed = [];
  const snapshotRows = [];
  const snapshotUserIds = new Set();

  // Upsert new rankings
  for (const r of ranked) {
    const prev = prevByUser.get(r.user_id);
    const rankChanged = !prev || prev.rank !== r.rank || prev.total_score !== r.total_score;

    await UserRanking.upsert({
      user_id: r.user_id,
      year,
      rank: r.rank,
      total_score: r.total_score,
      result_id: r.result_id,
      computed_at: now,
    });

    if (rankChanged) {
      snapshotRows.push({
        user_id: r.user_id,
        year,
        rank: r.rank,
        total_score: r.total_score,
        total_participants: totalParticipants,
        trigger_result_id: triggerResultId,
        snapshot_at: now,
      });
      snapshotUserIds.add(r.user_id);
      changed.push({
        userId: r.user_id,
        previousRank: prev ? prev.rank : null,
        newRank: r.rank,
        totalScore: r.total_score,
        totalParticipants,
      });
    }
  }

  // Always append a snapshot for the submitting user so every assessment
  // attempt is traceable on the evolution graph, even when their rank was
  // unchanged (e.g. a new lower-scoring attempt that did not beat their best).
  const triggerRanking = triggerUserId ? newByUser.get(triggerUserId) || null : null;
  if (triggerUserId && triggerRanking && !snapshotUserIds.has(triggerUserId)) {
    snapshotRows.push({
      user_id: triggerUserId,
      year,
      rank: triggerRanking.rank,
      total_score: triggerRanking.total_score,
      total_participants: totalParticipants,
      trigger_result_id: triggerResultId,
      snapshot_at: now,
    });
    snapshotUserIds.add(triggerUserId);
  }

  // Remove stale rankings (users who no longer have a result in this window)
  const staleUserIds = previous
    .map((p) => p.user_id)
    .filter((uid) => !newByUser.has(uid));
  if (staleUserIds.length > 0) {
    await UserRanking.destroy({
      where: { user_id: { [Op.in]: staleUserIds }, year },
    });
  }

  if (snapshotRows.length > 0) {
    await RankingSnapshot.bulkCreate(snapshotRows);
  }

  return { year, totalParticipants, changed, triggerRanking };
}

/**
 * Get a single user's current rank for the active year.
 * Returns null if the user has no ranking yet.
 */
async function getUserCurrentRanking(userId) {
  const UserRanking = db.user_rankings;
  const year = await getCurrentRankingYear();
  const row = await UserRanking.findOne({ where: { user_id: userId, year } });
  if (!row) return { year, rank: null, total_score: null, total_participants: 0 };

  const totalParticipants = await UserRanking.count({ where: { year } });
  return {
    year,
    rank: row.rank,
    total_score: row.total_score,
    total_participants: totalParticipants,
    computed_at: row.computed_at,
  };
}

/**
 * Get the ranking history (snapshots) for a user across one or more years.
 * If `year` is provided, filters to that year; otherwise returns all years.
 */
async function getUserRankingHistory(userId, { year, limit = 500 } = {}) {
  const RankingSnapshot = db.ranking_snapshots;
  const where = { user_id: userId };
  if (year) where.year = year;

  const rows = await RankingSnapshot.findAll({
    where,
    order: [['snapshot_at', 'ASC']],
    limit,
    raw: true,
  });
  return rows;
}

/**
 * Get the list of distinct years for which the user has ranking data.
 */
async function getUserRankingYears(userId) {
  const UserRanking = db.user_rankings;
  const RankingSnapshot = db.ranking_snapshots;

  const [current, historical] = await Promise.all([
    UserRanking.findAll({
      where: { user_id: userId },
      attributes: ['year'],
      raw: true,
    }),
    RankingSnapshot.findAll({
      where: { user_id: userId },
      attributes: ['year'],
      group: ['year'],
      raw: true,
    }),
  ]);

  const set = new Set();
  current.forEach((r) => set.add(r.year));
  historical.forEach((r) => set.add(r.year));
  return Array.from(set).sort((a, b) => a - b);
}

/**
 * Manual admin reset: preserves history (snapshots remain) but clears the
 * live user_rankings rows for the given year (defaults to current year), then
 * recomputes for the target year. Use this after changing period boundaries.
 */
async function resetRankingsForYear(year = null) {
  const config = await getRankingPeriodConfig();
  const targetYear = year != null ? year : rankingYearFor(new Date(), config);
  const UserRanking = db.user_rankings;
  await UserRanking.destroy({ where: { year: targetYear } });
  // Recompute for the current year only (previous years' snapshots stay intact).
  return recomputeCurrentYearRankings();
}

module.exports = {
  getRankingPeriodConfig,
  rankingYearFor,
  getCurrentRankingYear,
  recomputeCurrentYearRankings,
  getUserCurrentRanking,
  getUserRankingHistory,
  getUserRankingYears,
  resetRankingsForYear,
};
