import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Auth API Routes (/api/v1/auth)', () => {
  let userToken;

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user1@pocketly.com',
        password: 'User@123'
      });
    userToken = loginRes.body?.data?.accessToken;
  });

  afterAll(async () => {
    await prisma.$disconnect();
  });

  describe('POST /api/v1/auth/login', () => {
    it('should login successfully with valid credentials', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user1@pocketly.com',
          password: 'User@123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('accessToken');
      expect(res.body.data).toHaveProperty('user');
      expect(res.body.data.user.email).toBe('user1@pocketly.com');
      expect(res.headers['set-cookie']).toBeDefined();
    });

    it('should fail with 401 when password is wrong', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'user1@pocketly.com',
          password: 'WrongPassword@999'
        });

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 when email format is invalid', async () => {
      const res = await request(app)
        .post('/api/v1/auth/login')
        .send({
          email: 'not-an-email',
          password: 'Password123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/auth/me', () => {
    it('should fail with 401 when no token is provided', async () => {
      const res = await request(app).get('/api/v1/auth/me');
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it('should return user profile when valid token is provided', async () => {
      expect(userToken).toBeDefined();

      const res = await request(app)
        .get('/api/v1/auth/me')
        .set('Authorization', `Bearer ${userToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user.email).toBe('user1@pocketly.com');
    });
  });

  describe('POST /api/v1/auth/register', () => {
    it('should fail with 409 when email already exists', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Existing',
          email: 'user1@pocketly.com',
          password: 'SecurePass@123'
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
    });

    it('should fail with 400 when password is too short', async () => {
      const res = await request(app)
        .post('/api/v1/auth/register')
        .send({
          fullName: 'Test Short Pass',
          email: 'newuser@pocketly.com',
          password: '123'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
