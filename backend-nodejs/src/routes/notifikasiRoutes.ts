import { Router, Request, Response } from 'express';
import { NotifikasiService } from '../services/notifikasiService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/notifikasi
 * Get semua notifikasi
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId } = req.query;
    const notifikasis = await NotifikasiService.getAll(nasabahId as string);

    return ApiSuccess.send(res, notifikasis, 'Data notifikasi', 200);
  })
);

/**
 * GET /api/notifikasi/:id
 * Get notifikasi by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const notifikasi = await NotifikasiService.getById(id);

    if (!notifikasi) {
      return ApiError.send(res, 'Notifikasi tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, notifikasi, 'Notifikasi ditemukan', 200);
  })
);

/**
 * GET /api/notifikasi/nasabah/:nasabahId
 * Get notifikasi by nasabah
 */
router.get(
  '/nasabah/:nasabahId',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId } = req.params;
    const notifikasis = await NotifikasiService.getByNasabah(nasabahId);

    return ApiSuccess.send(res, notifikasis, 'Data notifikasi nasabah', 200);
  })
);

/**
 * POST /api/notifikasi
 * Create notifikasi baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId, title, msg, status } = req.body;

    if (!title || !msg) {
      return ApiError.send(res, 'Title dan message harus diisi', 400);
    }

    try {
      const notifikasi = await NotifikasiService.create({
        nasabahId,
        title,
        msg,
        status,
      });

      return ApiSuccess.send(res, notifikasi, 'Notifikasi berhasil dibuat', 201);
    } catch (error: any) {
      logger.error('Create notifikasi error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/notifikasi/:id
 * Update notifikasi
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, msg, status, isRead } = req.body;

    try {
      const notifikasi = await NotifikasiService.update(id, {
        title,
        msg,
        status,
        isRead,
      });

      return ApiSuccess.send(res, notifikasi, 'Notifikasi berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update notifikasi error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Notifikasi tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/notifikasi/:id/read
 * Mark notifikasi as read
 */
router.put(
  '/:id/read',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      const notifikasi = await NotifikasiService.markAsRead(id);
      return ApiSuccess.send(res, notifikasi, 'Notifikasi telah dibaca', 200);
    } catch (error: any) {
      logger.error('Mark as read error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Notifikasi tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * DELETE /api/notifikasi/:id
 * Delete notifikasi
 */
router.delete(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    try {
      await NotifikasiService.delete(id);
      return ApiSuccess.send(res, null, 'Notifikasi berhasil dihapus', 200);
    } catch (error: any) {
      logger.error('Delete notifikasi error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Notifikasi tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
