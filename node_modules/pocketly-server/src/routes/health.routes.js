import { Router } from 'express';
import { successResponse } from '../utils/response.js';
import { prisma } from '../config/prisma.js';

const router = Router();

router.get('/health', async (req, res, next) => {
  try {
    // Quick DB connectivity check
    await prisma.$queryRaw`SELECT 1`;

    return successResponse(res, {
      message: 'Pocketly API is healthy and operational 🌿',
      data: {
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV || 'development',
        database: 'connected'
      }
    });
  } catch (error) {
    next(error);
  }
});

export default router;
