const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Donation = sequelize.define(
    'Donation',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      donorId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'donor_id',
      },
      bloodBankId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'blood_bank_id',
      },
      bloodType: {
        type: DataTypes.STRING(5),
        allowNull: false,
        field: 'blood_type',
      },
      donationDate: {
        type: DataTypes.DATEONLY,
        allowNull: false,
        field: 'donation_date',
      },
      unitsDonated: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        field: 'units_donated',
      },
      notes: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'donations',
      underscored: true,
      timestamps: true,
    }
  );

  return Donation;
};
