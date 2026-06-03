import { Router, Request, Response } from 'express';
import { AuthService } from '../services/authService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * POST /api/auth/login
 * Login user dan return user data
 */
router.post(
  '/login',
  asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

    if (!email || !password) {
      return ApiError.send(res, 'Email dan password harus diisi', 400);
    }

    const user = await AuthService.login({
      email,
      password,
    });

    if (!user) {
      return ApiError.send(res, 'Email atau password salah', 401);
    }

    return ApiSuccess.send(res, user, 'Login berhasil', 200);
  })
);

/**
 * POST /api/auth/register
 * Register user baru (nasabah)
 */
router.post(
  '/register',
  asyncHandler(async (req: Request, res: Response) => {
    const { nama, email, password, telepon, alamat } = req.body;

    if (!nama || !email || !password) {
      return ApiError.send(res, 'Nama, email, dan password harus diisi', 400);
    }

    try {
      const user = await AuthService.register({
        nama,
        email,
        password,
        telepon,
        alamat,
      });

      return ApiSuccess.send(res, user, 'Registrasi berhasil', 201);
    } catch (error: any) {
      logger.error('Register error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * GET /api/auth/user/:id
 * Get user by ID
 */
router.get(
  '/user/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await AuthService.getUserById(id);

    if (!user) {
      return ApiError.send(res, 'User tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, user, 'User ditemukan', 200);
  })
);

export default router;
