module.exports = (sequelize, type) => {
  const ResultSection = sequelize.define('result_sections', {
    id: {
        type:type.UUID,
        defaultValue: type.UUIDV4,
        primaryKey: true
    },
    result_id: {
      type: type.UUID,
      allowNull: false
    },
    section_id: {
      type: type.UUID,
      allowNull: false
    },
    score: {
      type: type.INTEGER
    },
    level: {
      type: type.INTEGER
    }
  }, {
    timestamps: true,
    paranoid: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    operators: false
  });

  ResultSection.associate = function(models) {
    ResultSection.belongsTo(models.results, { foreignKey: 'result_id'  , as: 'results'});
    ResultSection.belongsTo(models.section, { foreignKey: 'section_id' });
  };

  return ResultSection;
};
