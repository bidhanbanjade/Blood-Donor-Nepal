const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const OTP = sequelize.define(
    'OTP',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        index: true,
        field: 'email',
      },
      code: {
        type: DataTypes.STRING(6),
        allowNull: false,
        field: 'code',
      },
      purpose: {
        type: DataTypes.ENUM('login', 'signup', 'reset'),
        allowNull: false,
        defaultValue: 'login',
        field: 'purpose',
      },
      isUsed: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'is_used',
      },
      expiresAt: {
        type: DataTypes.DATE,
        allowNull: false,
        field: 'expires_at',
      },
      attemptCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'attempt_count',
      },
    },
    {
      tableName: 'otps',
      underscored: true,
      timestamps: true,
    }
  );

  return OTP;
};
