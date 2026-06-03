import { Router, Request, Response } from 'express';
import { PenjemputanService } from '../services/penjemputanService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/penjemputan
 * Get semua penjemputan
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status } = req.query;
    const penjemputans = await PenjemputanService.getAll(status as string);

    return ApiSuccess.send(res, penjemputans, 'Data penjemputan', 200);
  })
);

/**
 * GET /api/penjemputan/:id
 * Get penjemputan by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const penjemputan = await PenjemputanService.getById(id);

    if (!penjemputan) {
      return ApiError.send(res, 'Penjemputan tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, penjemputan, 'Penjemputan ditemukan', 200);
  })
);

/**
 * GET /api/penjemputan/nasabah/:nasabahId
 * Get penjemputan by nasabah
 */
router.get(
  '/nasabah/:nasabahId',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId } = req.params;
    const penjemputans = await PenjemputanService.getByNasabah(nasabahId);

    return ApiSuccess.send(res, penjemputans, 'Data penjemputan nasabah', 200);
  })
);

/**
 * GET /api/penjemputan/date/:tanggal
 * Get penjemputan by date
 */
router.get(
  '/date/:tanggal',
  asyncHandler(async (req: Request, res: Response) => {
    const { tanggal } = req.params;
    const penjemputans = await PenjemputanService.getByDate(new Date(tanggal));

    return ApiSuccess.send(res, penjemputans, 'Data penjemputan sesuai tanggal', 200);
  })
);

/**
 * POST /api/penjemputan
 * Create penjemputan baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId, tanggal, waktu, alamat } = req.body;

    if (!nasabahId || !tanggal || !waktu || !alamat) {
      return ApiError.send(
        res,
        'Nasabah, tanggal, waktu, dan alamat harus diisi',
        400
      );
    }

    try {
      const penjemputan = await PenjemputanService.create({
        nasabahId,
        tanggal: new Date(tanggal),
        waktu,
        alamat,
      });

      return ApiSuccess.send(res, penjemputan, 'Penjemputan berhasil dibuat', 201);
    } catch (error: any) {
      logger.error('Create penjemputan error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/penjemputan/:id
 * Update penjemputan
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { tanggal, waktu, alamat, status } = req.body;

    try {
      const penjemputan = await PenjemputanService.update(id, {
        tanggal: tanggal ? new Date(tanggal) : undefined,
        waktu,
        alamat,
        status,
      });

      return ApiSuccess.send(res, penjemputan, 'Penjemputan berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update penjemputan error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Penjemputan tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * DELETE /api/penjemputan/:id
 * Delete penjemputan
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await PenjemputanService.delete(id);
      return ApiSuccess.send(res, null, 'Penjemputan berhasil dihapus', 200);
    } catch (error: any) {
      logger.error('Delete penjemputan error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Penjemputan tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
