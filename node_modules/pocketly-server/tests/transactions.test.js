import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';

describe('Transaction API Routes (/api/v1/transactions)', () => {
  let authToken;
  let testWalletId;
  let testCategoryId;
  let createdTransactionId;

  beforeAll(async () => {
    // Login as demo user
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'user1@pocketly.com',
        password: 'User@123'
      });
    authToken = loginRes.body.data.accessToken;

    // Get an existing wallet & category
    const wallet = await prisma.wallet.findFirst({
      where: { user: { email: 'user1@pocketly.com' } }
    });
    testWalletId = wallet.id;

    const category = await prisma.category.findFirst({
      where: { type: 'EXPENSE' }
    });
    testCategoryId = category.id;
  });

  afterAll(async () => {
    // Cleanup created test transaction if any
    if (createdTransactionId) {
      await prisma.transaction.deleteMany({
        where: { id: createdTransactionId }
      });
    }
    await prisma.$disconnect();
  });

  describe('GET /api/v1/transactions', () => {
    it('should return 401 if unauthenticated', async () => {
      const res = await request(app).get('/api/v1/transactions');
      expect(res.status).toBe(401);
    });

    it('should list transactions for the authenticated user', async () => {
      const res = await request(app)
        .get('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transactions');
      expect(Array.isArray(res.body.data.transactions)).toBe(true);
      expect(res.body.data).toHaveProperty('meta');
    });

    it('should filter transactions by type', async () => {
      const res = await request(app)
        .get('/api/v1/transactions?type=EXPENSE')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      res.body.data.transactions.forEach((tx) => {
        expect(tx.type).toBe('EXPENSE');
      });
    });
  });

  describe('POST /api/v1/transactions', () => {
    it('should create an expense transaction and update wallet balance', async () => {
      const payload = {
        walletId: testWalletId,
        categoryId: testCategoryId,
        amount: 35000,
        type: 'EXPENSE',
        note: 'Bữa trưa cơm tấm kiểm thử Jest',
        date: new Date().toISOString()
      };

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('transaction');
      expect(res.body.data.transaction.note).toBe('Bữa trưa cơm tấm kiểm thử Jest');
      expect(Number(res.body.data.transaction.amount)).toBe(35000);

      createdTransactionId = res.body.data.transaction.id;
    });

    it('should reject invalid transaction amount', async () => {
      const payload = {
        walletId: testWalletId,
        categoryId: testCategoryId,
        amount: -5000,
        type: 'EXPENSE'
      };

      const res = await request(app)
        .post('/api/v1/transactions')
        .set('Authorization', `Bearer ${authToken}`)
        .send(payload);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });

  describe('GET /api/v1/transactions/export/csv', () => {
    it('should export transactions to CSV', async () => {
      const res = await request(app)
        .get('/api/v1/transactions/export/csv')
        .set('Authorization', `Bearer ${authToken}`);

      expect(res.status).toBe(200);
      expect(res.headers['content-type']).toContain('text/csv');
    });
  });
});
