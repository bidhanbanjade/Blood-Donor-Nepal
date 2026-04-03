process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/services/notificationService', () => ({
  sendEmailNotification: jest.fn().mockResolvedValue({ sent: true }),
  sendPushNotification: jest.fn().mockResolvedValue({ sent: true }),
  sendSmsNotification: jest.fn().mockResolvedValue({ sent: true }),
}));

jest.mock('../src/models', () => ({
  Alert: {
    create: jest.fn(),
    findAll: jest.fn(),
  },
  BloodBank: {
    findOne: jest.fn(),
  },
  Donor: {
    findAll: jest.fn(),
  },
  Hospital: {
    findOne: jest.fn(),
  },
  Inventory: {
    findAll: jest.fn(),
  },
  PushSubscription: {
    findAll: jest.fn(),
    findOrCreate: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    scope: jest.fn(),
  },
}));

const { Alert, BloodBank, Donor, Hospital, Inventory, PushSubscription } = require('../src/models');
const app = require('../src/server');

describe('Dashboard API integration flows', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('GET /api/hospitals/me returns profile for hospital role', async () => {
    const token = jwt.sign({ id: 'hospital-user-1', role: 'hospital' }, process.env.JWT_SECRET);

    Hospital.findOne.mockResolvedValue({
      id: 'hospital-1',
      userId: 'hospital-user-1',
      name: 'City Hospital',
      city: 'Kathmandu',
    });

    const response = await request(app)
      .get('/api/hospitals/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.name).toBe('City Hospital');
  });

  test('GET /api/blood-banks/me returns profile with inventory', async () => {
    const token = jwt.sign({ id: 'bank-user-1', role: 'blood_bank' }, process.env.JWT_SECRET);

    BloodBank.findOne.mockResolvedValue({
      id: 'bank-1',
      userId: 'bank-user-1',
      name: 'Central Blood Bank',
      inventory: [{ bloodType: 'O+', unitsAvailable: 8 }],
    });

    const response = await request(app)
      .get('/api/blood-banks/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.id).toBe('bank-1');
  });

  test('GET /api/alerts/history returns hospital scoped history', async () => {
    const token = jwt.sign({ id: 'hospital-user-1', role: 'hospital' }, process.env.JWT_SECRET);

    Hospital.findOne.mockResolvedValue({ id: 'hospital-1', userId: 'hospital-user-1' });
    Alert.findAll.mockResolvedValue([{ id: 'alert-1', bloodType: 'A+', status: 'sent' }]);

    const response = await request(app)
      .get('/api/alerts/history')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body).toHaveLength(1);
    expect(Alert.findAll).toHaveBeenCalled();
  });

  test('POST /api/blood-banks/urgent-request triggers urgent flow', async () => {
    const token = jwt.sign({ id: 'bank-user-1', role: 'blood_bank' }, process.env.JWT_SECRET);

    const update = jest.fn().mockResolvedValue();

    BloodBank.findOne.mockResolvedValue({
      id: 'bank-1',
      userId: 'bank-user-1',
      latitude: 27.7172,
      longitude: 85.324,
    });

    Alert.create.mockResolvedValue({
      id: 'alert-urgent-1',
      radiusKm: 10,
      bloodType: 'O+',
      urgency: 'critical',
      message: 'Urgent O+ needed',
      update,
    });

    Donor.findAll.mockResolvedValue([
      {
        id: 'donor-1',
        userId: 'donor-user-1',
        bloodType: 'O+',
        isEligible: true,
        latitude: 27.7172,
        longitude: 85.324,
        user: { email: 'donor@test.com', phone: '9800000000' },
      },
    ]);

    PushSubscription.findAll.mockResolvedValue([]);
    Inventory.findAll.mockResolvedValue([]);

    const response = await request(app)
      .post('/api/blood-banks/urgent-request')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bloodType: 'O+',
        urgency: 'critical',
        message: 'Urgent O+ needed',
        radiusKm: 10,
      });

    expect(response.status).toBe(200);
    expect(response.body.matchedDonors).toBe(1);
    expect(update).toHaveBeenCalledWith({ status: 'sent' });
  });
});
