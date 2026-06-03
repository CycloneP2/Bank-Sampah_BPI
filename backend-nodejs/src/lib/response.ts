import { Response } from 'express';

export interface ApiResponse<T = unknown> {
  status: 'success' | 'error';
  message: string;
  data?: T;
}

export class ApiSuccess {
  static send<T>(
    res: Response,
    data: T | null = null,
    message: string = 'OK',
    statusCode: number = 200
  ): Response {
    const response: ApiResponse<T> = {
      status: 'success',
      message,
    };

    if (data !== null) {
      response.data = data;
    }

    return res.status(statusCode).json(response);
  }
}

export class ApiError {
  static send(
    res: Response,
    message: string,
    statusCode: number = 400,
    error?: unknown
  ): Response {
    const response: ApiResponse = {
      status: 'error',
      message,
    };

    if (process.env.NODE_ENV === 'development' && error) {
      console.error('Error details:', error);
    }

    return res.status(statusCode).json(response);
  }
}

export const generateId = (prefix: string, length: number = 8): string => {
  const timestamp = Date.now().toString().slice(-length);
  const random = Math.random().toString(36).substring(2, 5).toUpperCase();
  return `${prefix}${random}${timestamp}`;
};
