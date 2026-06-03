import { Router, Request, Response } from 'express';
import { SampahService } from '../services/sampahService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/sampah
 * Get semua jenis sampah
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { kategori } = req.query;
    const sampahs = await SampahService.getAll(kategori as string);
    return ApiSuccess.send(res, sampahs, 'Data jenis sampah', 200);
  })
);

/**
 * GET /api/sampah/:id
 * Get sampah by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const sampah = await SampahService.getById(id);

    if (!sampah) {
      return ApiError.send(res, 'Jenis sampah tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, sampah, 'Jenis sampah ditemukan', 200);
  })
);

/**
 * POST /api/sampah
 * Create jenis sampah baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { nama, hargaBeli, hargaJual, kategori, deskripsi } = req.body;

    if (!nama || hargaBeli === undefined || hargaJual === undefined || !kategori) {
      return ApiError.send(
        res,
        'Nama, harga beli, harga jual, dan kategori harus diisi',
        400
      );
    }

    try {
      const sampah = await SampahService.create({
        nama,
        hargaBeli,
        hargaJual,
        kategori,
        deskripsi,
      });

      return ApiSuccess.send(res, sampah, 'Jenis sampah berhasil ditambahkan', 201);
    } catch (error: any) {
      logger.error('Create sampah error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/sampah/:id
 * Update sampah
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { nama, hargaBeli, hargaJual, kategori, deskripsi } = req.body;

    try {
      const sampah = await SampahService.update(id, {
        nama,
        hargaBeli,
        hargaJual,
        kategori,
        deskripsi,
      });

      return ApiSuccess.send(res, sampah, 'Jenis sampah berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update sampah error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Jenis sampah tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * DELETE /api/sampah/:id
 * Delete sampah
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await SampahService.delete(id);
      return ApiSuccess.send(res, null, 'Jenis sampah berhasil dihapus', 200);
    } catch (error: any) {
      logger.error('Delete sampah error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Jenis sampah tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
