import cors from 'cors';
import { env } from '../config/env.js';

export const corsOptions = cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    
    const allowedOrigins = env.CORS_ORIGIN;
    const isAllowed = allowedOrigins.includes(origin) || 
      allowedOrigins.includes(origin + '/') ||
      origin.includes('banksampah-bpi.netlify.app') ||
      origin.includes('localhost') ||
      origin.includes('127.0.0.1');

    if (isAllowed) {
      callback(null, true);
    } else {
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  maxAge: 86400, // 24 hours
});
