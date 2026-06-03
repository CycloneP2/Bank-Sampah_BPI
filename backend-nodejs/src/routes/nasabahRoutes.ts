import { Router, Request, Response } from 'express';
import { NasabahService } from '../services/nasabahService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/nasabah
 * Get semua nasabah
 */
router.get(
  '/',
  asyncHandler(async (_req: Request, res: Response) => {
    const nasabahs = await NasabahService.getAll();
    return ApiSuccess.send(res, nasabahs, 'Data nasabah', 200);
  })
);

/**
 * GET /api/nasabah/:id
 * Get nasabah by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const nasabah = await NasabahService.getById(id);

    if (!nasabah) {
      return ApiError.send(res, 'Nasabah tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, nasabah, 'Nasabah ditemukan', 200);
  })
);

/**
 * POST /api/nasabah
 * Create nasabah baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { nama, email, password, telepon, alamat, tanggalBergabung } =
      req.body;

    if (!nama || !email || !password) {
      return ApiError.send(res, 'Nama, email, dan password harus diisi', 400);
    }

    try {
      const nasabah = await NasabahService.create({
        nama,
        email,
        password,
        telepon,
        alamat,
        tanggalBergabung: tanggalBergabung ? new Date(tanggalBergabung) : undefined,
      });

      return ApiSuccess.send(res, nasabah, 'Nasabah berhasil ditambahkan', 201);
    } catch (error: any) {
      logger.error('Create nasabah error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/nasabah/:id
 * Update nasabah
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, email, telepon, alamat, rekeningBank, nomorRekening, namaRekening, password } =
      req.body;

    try {
      const nasabah = await NasabahService.update(id, {
        nama,
        email,
        telepon,
        alamat,
        rekeningBank,
        nomorRekening,
        namaRekening,
        password,
      });

      return ApiSuccess.send(res, nasabah, 'Profil berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update nasabah error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Nasabah tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * DELETE /api/nasabah/:id
 * Delete nasabah
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await NasabahService.delete(id);
      return ApiSuccess.send(res, null, 'Nasabah berhasil dihapus', 200);
    } catch (error: any) {
      logger.error('Delete nasabah error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Nasabah tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
