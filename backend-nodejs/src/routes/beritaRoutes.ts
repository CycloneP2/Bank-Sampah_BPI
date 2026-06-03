import { Router, Request, Response } from 'express';
import { BeritaService } from '../services/beritaService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/berita
 * Get semua berita
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { kategori, limit, offset } = req.query;

    const result = await BeritaService.getAll(
      kategori as string,
      limit ? parseInt(limit as string) : 10,
      offset ? parseInt(offset as string) : 0
    );

    return ApiSuccess.send(res, result.data, 'Data berita', 200);
  })
);

/**
 * GET /api/berita/:id
 * Get berita by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const berita = await BeritaService.getById(id);

    if (!berita) {
      return ApiError.send(res, 'Berita tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, berita, 'Berita ditemukan', 200);
  })
);

/**
 * POST /api/berita
 * Create berita baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { judul, deskripsi, kategori, gambar, tanggal } = req.body;

    if (!judul || !deskripsi || !kategori) {
      return ApiError.send(res, 'Judul, deskripsi, dan kategori harus diisi', 400);
    }

    try {
      const berita = await BeritaService.create({
        judul,
        deskripsi,
        kategori,
        gambar,
        tanggal: tanggal ? new Date(tanggal) : undefined,
      });

      return ApiSuccess.send(res, berita, 'Berita berhasil ditambahkan', 201);
    } catch (error: any) {
      logger.error('Create berita error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/berita/:id
 * Update berita
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { judul, deskripsi, kategori, gambar, tanggal } = req.body;

    try {
      const berita = await BeritaService.update(id, {
        judul,
        deskripsi,
        kategori,
        gambar,
        tanggal: tanggal ? new Date(tanggal) : undefined,
      });

      return ApiSuccess.send(res, berita, 'Berita berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update berita error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Berita tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * DELETE /api/berita/:id
 * Delete berita
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await BeritaService.delete(id);
      return ApiSuccess.send(res, null, 'Berita berhasil dihapus', 200);
    } catch (error: any) {
      logger.error('Delete berita error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Berita tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
