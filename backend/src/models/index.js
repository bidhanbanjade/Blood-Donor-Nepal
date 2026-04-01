const { sequelize } = require('../config/database');

const User = require('./User')(sequelize);
const BloodBank = require('./BloodBank')(sequelize);
const Donor = require('./Donor')(sequelize);
const Hospital = require('./Hospital')(sequelize);
const Inventory = require('./Inventory')(sequelize);
const Donation = require('./Donation')(sequelize);
const DonationFeedback = require('./DonationFeedback')(sequelize);
const Alert = require('./Alert')(sequelize);
const PushSubscription = require('./PushSubscription')(sequelize);

User.hasOne(BloodBank, { foreignKey: 'userId', as: 'bloodBank' });
BloodBank.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Donor, { foreignKey: 'userId', as: 'donorProfile' });
Donor.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasOne(Hospital, { foreignKey: 'userId', as: 'hospitalProfile' });
Hospital.belongsTo(User, { foreignKey: 'userId', as: 'user' });

BloodBank.hasMany(Inventory, { foreignKey: 'bloodBankId', as: 'inventory' });
Inventory.belongsTo(BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });

Donor.hasMany(Donation, { foreignKey: 'donorId', as: 'donations' });
Donation.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

BloodBank.hasMany(Donation, { foreignKey: 'bloodBankId', as: 'donations' });
Donation.belongsTo(BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });

Donor.hasMany(DonationFeedback, { foreignKey: 'donorId', as: 'feedback' });
DonationFeedback.belongsTo(Donor, { foreignKey: 'donorId', as: 'donor' });

Donation.hasMany(DonationFeedback, { foreignKey: 'donationId', as: 'feedback' });
DonationFeedback.belongsTo(Donation, { foreignKey: 'donationId', as: 'donation' });

BloodBank.hasMany(Alert, { foreignKey: 'bloodBankId', as: 'alerts' });
Alert.belongsTo(BloodBank, { foreignKey: 'bloodBankId', as: 'bloodBank' });

Hospital.hasMany(Alert, { foreignKey: 'hospitalId', as: 'alerts' });
Alert.belongsTo(Hospital, { foreignKey: 'hospitalId', as: 'hospital' });

User.hasMany(PushSubscription, { foreignKey: 'userId', as: 'subscriptions' });
PushSubscription.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  BloodBank,
  Donor,
  Hospital,
  Inventory,
  Donation,
  DonationFeedback,
  Alert,
  PushSubscription,
};
