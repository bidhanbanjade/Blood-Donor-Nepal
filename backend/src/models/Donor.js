const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donor = sequelize.define(
    'Donor',
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
      bloodType: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: 'blood_type',
      },
      dateOfBirth: {
        type: DataTypes.DATEONLY,
        field: 'date_of_birth',
      },
      lastDonationDate: {
        type: DataTypes.DATEONLY,
        field: 'last_donation_date',
      },
      latitude: {
        type: DataTypes.DOUBLE,
      },
      longitude: {
        type: DataTypes.DOUBLE,
      },
      city: {
        type: DataTypes.STRING(100),
      },
      isEligible: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_eligible',
      },
    },
    {
      tableName: 'donors',
      underscored: true,
      timestamps: true,
    }
  );

  return Donor;
};
