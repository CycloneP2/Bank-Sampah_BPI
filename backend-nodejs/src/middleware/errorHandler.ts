import { Express, Request, Response, NextFunction } from 'express';
import { logger } from '../lib/logger.js';
import { ApiError } from '../lib/response.js';

export interface CustomError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: CustomError,
  req: Request,
  res: Response,
  _next: NextFunction
): void => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  logger.error(message, {
    method: req.method,
    url: req.url,
    statusCode,
    error: err.stack,
  });

  ApiError.send(res, message, statusCode);
};

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction): void => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };

export const notFoundHandler = (req: Request, res: Response): void => {
  ApiError.send(res, `Route ${req.originalUrl} not found`, 404);
};

export const setupErrorHandling = (app: Express): void => {
  // 404 handler - harus sebelum error handler
  app.use(notFoundHandler);

  // Error handler - harus paling akhir
  app.use(errorHandler);
};
