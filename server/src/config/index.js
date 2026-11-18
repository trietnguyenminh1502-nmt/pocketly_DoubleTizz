import dotenv from 'dotenv';
dotenv.config();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:5173',
  databaseUrl: process.env.DATABASE_URL,
  jwt: {
    accessSecret: process.env.JWT_ACCESS_SECRET || 'default_pocketly_access_secret_min_32_chars',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_pocketly_refresh_secret_min_32_chars',
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || '15m',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d'
  },
  aiProvider: process.env.AI_PROVIDER || 'gemini',
  gemini: {
    apiKey: process.env.GEMINI_API_KEY || '',
    model: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
    timeoutMs: parseInt(process.env.GEMINI_TIMEOUT_MS, 10) || 60000
  },
  groq: {
    apiKey: process.env.GROQ_API_KEY || '',
    model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
    timeoutMs: parseInt(process.env.GROQ_TIMEOUT_MS, 10) || 60000
  }
};
