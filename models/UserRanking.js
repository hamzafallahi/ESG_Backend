module.exports = (sequelize, type) => {
  const UserRanking = sequelize.define('user_rankings', {
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
    result_id: {
      type: type.UUID,
      allowNull: true,
    },
    computed_at: {
      type: type.DATE,
      defaultValue: type.NOW,
    },
  }, {
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      { unique: true, fields: ['user_id', 'year'] },
      { fields: ['year'] },
    ],
    operators: false,
  });

  return UserRanking;
};
