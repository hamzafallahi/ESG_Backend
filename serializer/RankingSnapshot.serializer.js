const { Serializer } = require('jsonapi-serializer');

const RankingSnapshotSerializer = new Serializer('ranking_snapshots', {
  attributes: [
    'user_id',
    'year',
    'rank',
    'total_score',
    'total_participants',
    'trigger_result_id',
    'snapshot_at',
    'created_at',
  ],
  keyForAttribute: 'snake_case',
});

module.exports = RankingSnapshotSerializer;
