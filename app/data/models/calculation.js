module.exports = (sequelize, DataTypes) => {
  const claim = sequelize.define('calculation', {
    calculationId: { type: DataTypes.INTEGER, primaryKey: true },
    sbi: DataTypes.INTEGER,
    frn: DataTypes.BIGINT,
    calculationDate: DataTypes.DATE,
    invoiceNumber: DataTypes.STRING,
    scheme: DataTypes.STRING,
    updated: DataTypes.DATE
  },
  {
    tableName: 'calculations',
    freezeTableName: true,
    timestamps: false
  })
  claim.associate = function (models) {
    claim.hasMany(models.funding, {
      foreignKey: 'calculationId',
      as: 'funding'
    })
    claim.belongsTo(models.organisation, {
      foreignKey: 'sbi',
      as: 'organisations'
    })
    return claim
  }
}
