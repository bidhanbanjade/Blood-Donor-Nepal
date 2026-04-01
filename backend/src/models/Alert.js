const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Alert = sequelize.define(
    'Alert',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      bloodBankId: {
        type: DataTypes.UUID,
        field: 'blood_bank_id',
      },
      hospitalId: {
        type: DataTypes.UUID,
        field: 'hospital_id',
      },
      createdBy: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'created_by',
      },
      bloodType: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: 'blood_type',
      },
      urgency: {
        type: DataTypes.ENUM('low', 'medium', 'high', 'critical'),
        allowNull: false,
      },
      message: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      radiusKm: {
        type: DataTypes.DECIMAL(8, 2),
        allowNull: false,
        defaultValue: 10,
        field: 'radius_km',
      },
      latitude: {
        type: DataTypes.DOUBLE,
      },
      longitude: {
        type: DataTypes.DOUBLE,
      },
      status: {
        type: DataTypes.ENUM('active', 'sent', 'closed'),
        allowNull: false,
        defaultValue: 'active',
      },
    },
    {
      tableName: 'alerts',
      underscored: true,
      timestamps: true,
    }
  );

  return Alert;
};
