const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PublicBloodRequest = sequelize.define(
    'PublicBloodRequest',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      fullName: {
        type: DataTypes.STRING(120),
        allowNull: false,
        field: 'full_name',
      },
      phone: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      bloodType: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: 'blood_type',
      },
      urgency: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
        defaultValue: 'high',
      },
      unitsNeeded: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'units_needed',
      },
      city: {
        type: DataTypes.STRING(100),
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      status: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'open',
      },
    },
    {
      tableName: 'public_blood_requests',
      underscored: true,
      timestamps: true,
    }
  );

  return PublicBloodRequest;
};
