module.exports = (sequelize, type) => {
  const RankingSnapshot = sequelize.define('ranking_snapshots', {
    id: {
      type: type.UUID,
      defaultValue: type.UUIDV4,
      primaryKey: true,
    },
    user_id: {
      type: type.UUID,
      allowNull: false,
    },
    year: {
      type: type.INTEGER,
      allowNull: false,
    },
    rank: {
      type: type.INTEGER,
      allowNull: false,
    },
    total_score: {
      type: type.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    total_participants: {
      type: type.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    trigger_result_id: {
      type: type.UUID,
      allowNull: true,
    },
    snapshot_at: {
      type: type.DATE,
      defaultValue: type.NOW,
    },
  }, {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { fields: ['user_id', 'year', 'snapshot_at'] },
      { fields: ['year'] },
    ],
    operators: false,
  });

  return RankingSnapshot;
};
