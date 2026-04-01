const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const PushSubscription = sequelize.define(
    'PushSubscription',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
      },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        field: 'user_id',
      },
      endpoint: {
        type: DataTypes.TEXT,
        allowNull: false,
        unique: true,
      },
      p256dh: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      auth: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
    },
    {
      tableName: 'push_subscriptions',
      underscored: true,
      timestamps: true,
    }
  );

  return PushSubscription;
};
