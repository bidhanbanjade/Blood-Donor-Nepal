const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const BloodBank = sequelize.define(
    'BloodBank',
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
        allowNull: false,
      },
      longitude: {
        type: DataTypes.DOUBLE,
        allowNull: false,
      },
      contactPhone: {
        type: DataTypes.STRING(30),
        field: 'contact_phone',
      },
      isVerified: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_verified',
      },
    },
    {
      tableName: 'blood_banks',
      underscored: true,
      timestamps: true,
    }
  );

  return BloodBank;
};
