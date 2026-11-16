import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/index.js';

export const generateAccessToken = (payload) => {
  return jwt.sign(payload, config.jwt.accessSecret, {
    expiresIn: config.jwt.accessExpiresIn
  });
};

export const generateRefreshToken = (payload) => {
  return jwt.sign(payload, config.jwt.refreshSecret, {
    expiresIn: config.jwt.refreshExpiresIn
  });
};

export const verifyAccessToken = (token) => {
  return jwt.verify(token, config.jwt.accessSecret);
};

export const verifyRefreshToken = (token) => {
  return jwt.verify(token, config.jwt.refreshSecret);
};

// Băm token (sha256) trước khi lưu vào DB để bảo mật cao hơn
export const hashToken = (token) => {
  return crypto.createHash('sha256').update(token).digest('hex');
};

// Sinh token ngẫu nhiên bảo mật
export const generateRandomToken = () => {
  return crypto.randomBytes(32).toString('hex');
};
