import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Budget API Routes (/api/v1/budgets)', () => {
  let authToken;
  let createdBudgetId;

  beforeAll(async () => {
    // Login as demo user
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user1@pocketly.com',
        password: 'User@123'
      });
    authToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    if (createdBudgetId) {
      await prisma.budget.deleteMany({
        where: { id: createdBudgetId }
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/v1/budgets', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/v1/budgets');
      expect(res.status).toBe(401);
    });

    it('should return budget status list with spent amount and percentage', async () => {
      const res = await request(app)
        .get('/api/v1/budgets?month=11&year=2026')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('budgets');
      expect(Array.isArray(res.body.data.budgets)).toBe(true);

      if (res.body.data.budgets.length > 0) {
        const firstBudget = res.body.data.budgets[0];
        expect(firstBudget).toHaveProperty('spent');
        expect(firstBudget).toHaveProperty('percentage');
        expect(firstBudget).toHaveProperty('remaining');
      }
    });
  });

  describe('POST /api/v1/budgets', () => {
    it('should reject budget with invalid month', async () => {
      const payload = {
        amount: 2500000,
        month: 15, // Invalid month
        year: 2026,
        alertThreshold: 80
      };

      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it('should create an overall monthly budget', async () => {
      // Use next month to prevent collision
      const targetMonth = 12;
      const targetYear = 2026;

      // Ensure clean state for month 12
      const user = await prisma.user.findUnique({ where: { email: 'user1@pocketly.com' } });
      await prisma.budget.deleteMany({
        where: {
          userId: user.id,
          categoryId: null,
          month: targetMonth,
          year: targetYear
        }
      });

      const payload = {
        amount: 3500000,
        month: targetMonth,
        year: targetYear,
        alertThreshold: 85
      };

      const res = await request(app)
        .post('/api/v1/budgets')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('budget');
      expect(Number(res.body.data.budget.amount)).toBe(3500000);
      expect(res.body.data.budget.month).toBe(12);

      createdBudgetId = res.body.data.budget.id;
    });
  });
});
