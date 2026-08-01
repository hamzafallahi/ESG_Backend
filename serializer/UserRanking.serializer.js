const { Serializer } = require('jsonapi-serializer');

const UserRankingSerializer = new Serializer('user_rankings', {
  attributes: [
    'user_id',
    'year',
    'rank',
    'total_score',
    'total_participants',
    'result_id',
    'computed_at',
    'created_at',
    'updated_at',
  ],
  keyForAttribute: 'snake_case',
});

module.exports = UserRankingSerializer;
