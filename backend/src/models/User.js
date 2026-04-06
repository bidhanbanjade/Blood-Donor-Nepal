const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const User = sequelize.define(
    'User',
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
      email: {
        type: DataTypes.STRING(255),
        allowNull: false,
        unique: true,
        validate: {
          isEmail: true,
        },
      },
      passwordHash: {
        type: DataTypes.TEXT,
        allowNull: false,
        field: 'password_hash',
      },
      phone: {
        type: DataTypes.STRING(30),
      },
      role: {
        type: DataTypes.ENUM('donor', 'receiver', 'admin'),
        allowNull: false,
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true,
        field: 'is_active',
      },
    },
    {
      tableName: 'users',
      underscored: true,
      timestamps: true,
      defaultScope: {
        attributes: { exclude: ['passwordHash'] },
      },
      scopes: {
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  return User;
};
