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
  PushSubscription: {
    findAll: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    scope: jest.fn(),
  },
}));

const { Alert, Donor, PushSubscription } = require('../src/models');
const app = require('../src/server');

describe('Alerts API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/alerts/trigger sends alert for admin', async () => {
    const token = jwt.sign({ id: 'admin1', role: 'admin' }, process.env.JWT_SECRET);

    const mockAlert = {
      id: 'a1',
      bloodType: 'A+',
      urgency: 'high',
      message: 'Urgent requirement',
      radiusKm: 10,
      update: jest.fn().mockResolvedValue(),
    };

    Alert.create.mockResolvedValue(mockAlert);
    Donor.findAll.mockResolvedValue([]);
    PushSubscription.findAll.mockResolvedValue([]);

    const response = await request(app)
      .post('/api/alerts/trigger')
      .set('Authorization', `Bearer ${token}`)
      .send({
        bloodType: 'A+',
        urgency: 'high',
        message: 'Urgent requirement',
        radiusKm: 10,
        latitude: 27.7,
        longitude: 85.3,
      });

    expect(response.status).toBe(200);
    expect(response.body.matchedDonors).toBe(0);
  });
});
