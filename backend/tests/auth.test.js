process.env.JWT_SECRET = 'test_secret';

const request = require('supertest');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

jest.mock('../src/models', () => ({
  User: {
    findOne: jest.fn(),
    create: jest.fn(),
    findByPk: jest.fn(),
    scope: jest.fn(),
  },
}));

const { User } = require('../src/models');
const app = require('../src/server');

describe('Auth API', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('POST /api/auth/register registers user and sets cookie', async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({
      id: 'u1',
      fullName: 'Jane Donor',
      email: 'jane@test.com',
      role: 'donor',
      phone: '9800000000',
    });

    const response = await request(app).post('/api/auth/register').send({
      fullName: 'Jane Donor',
      email: 'jane@test.com',
      password: 'password123',
      role: 'donor',
      phone: '9800000000',
    });

    expect(response.status).toBe(201);
    expect(response.body.user.email).toBe('jane@test.com');
    expect(response.headers['set-cookie']).toBeDefined();
  });

  test('POST /api/auth/login logs in and returns token', async () => {
    const passwordHash = await bcrypt.hash('password123', 10);
    const mockUser = {
      id: 'u1',
      fullName: 'Jane Donor',
      email: 'jane@test.com',
      role: 'donor',
      phone: '9800000000',
      passwordHash,
    };

    User.scope.mockReturnValue({
      findOne: jest.fn().mockResolvedValue(mockUser),
    });

    const response = await request(app).post('/api/auth/login').send({
      email: 'jane@test.com',
      password: 'password123',
    });

    expect(response.status).toBe(200);
    expect(response.body.token).toBeDefined();
  });

  test('GET /api/auth/me returns authenticated user', async () => {
    const token = jwt.sign({ id: 'u1', role: 'donor', email: 'jane@test.com' }, process.env.JWT_SECRET);

    User.findByPk.mockResolvedValue({
      id: 'u1',
      fullName: 'Jane Donor',
      email: 'jane@test.com',
      role: 'donor',
      phone: '9800000000',
    });

    const response = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(response.status).toBe(200);
    expect(response.body.email).toBe('jane@test.com');
  });
});
