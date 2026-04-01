const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Hospital = sequelize.define(
    'Hospital',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        unique: true,
        field: 'user_id',
      },
      name: {
        type: DataTypes.STRING(180),
        allowNull: false,
      },
      address: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      city: {
        type: DataTypes.STRING(100),
      },
      latitude: {
        type: DataTypes.DOUBLE,
      },
      longitude: {
        type: DataTypes.DOUBLE,
      },
      contactPhone: {
        type: DataTypes.STRING(30),
        field: 'contact_phone',
      },
    },
    {
      tableName: 'hospitals',
      underscored: true,
      timestamps: true,
    }
  );

  return Hospital;
};
