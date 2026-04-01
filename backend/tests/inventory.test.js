process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');

jest.mock('../src/models', () => ({
  BloodBank: {
    findOne: jest.fn(),
  },
  Inventory: {
    findOrCreate: jest.fn(),
    findAll: jest.fn(),
  },
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    scope: jest.fn(),
  },
}));

const { BloodBank, Inventory } = require('../src/models');
const app = require('../src/server');

describe('Inventory API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/inventory upserts stock for blood bank role', async () => {
    const token = jwt.sign({ id: 'user-bank-1', role: 'blood_bank' }, process.env.JWT_SECRET);

    BloodBank.findOne.mockResolvedValue({ id: 'bb1' });
    Inventory.findOrCreate.mockResolvedValue([
      {
        id: 'inv1',
        bloodBankId: 'bb1',
        bloodType: 'O+',
        unitsAvailable: 12,
        update: jest.fn().mockResolvedValue(),
      },
      true,
    ]);

    const response = await request(app)
      .post('/api/inventory')
      .set('Authorization', `Bearer ${token}`)
      .send({ bloodType: 'O+', unitsAvailable: 12 });

    expect(response.status).toBe(200);
    expect(response.body.bloodType).toBe('O+');
  });
});
