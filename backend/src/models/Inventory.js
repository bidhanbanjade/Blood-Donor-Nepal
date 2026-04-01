const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const Inventory = sequelize.define(
    'Inventory',
    {
      id: {
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
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
      unitsAvailable: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        field: 'units_available',
      },
      availabilityFlag: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false,
        field: 'availability_flag',
      },
      lastUpdated: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW,
        field: 'last_updated',
      },
    },
    {
      tableName: 'inventory',
      underscored: true,
      timestamps: true,
      indexes: [{ unique: true, fields: ['blood_bank_id', 'blood_type'] }],
    }
  );

  Inventory.addHook('beforeSave', (inventory) => {
    inventory.availabilityFlag = inventory.unitsAvailable > 0;
    inventory.lastUpdated = new Date();
  });

  return Inventory;
};
