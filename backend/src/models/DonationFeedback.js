const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const DonationFeedback = sequelize.define(
    'DonationFeedback',
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
      donationId: {
        type: DataTypes.UUID,
        field: 'donation_id',
      },
      rating: {
        type: DataTypes.SMALLINT,
        allowNull: false,
        validate: {
          min: 1,
          max: 5,
        },
      },
      comment: {
        type: DataTypes.TEXT,
      },
    },
    {
      tableName: 'donation_feedback',
      underscored: true,
      timestamps: true,
    }
  );

  return DonationFeedback;
};
