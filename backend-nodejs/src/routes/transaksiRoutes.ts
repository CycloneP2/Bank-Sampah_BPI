import { Router, Request, Response } from 'express';
import { TransaksiService } from '../services/transaksiService.js';
import { ApiSuccess, ApiError } from '../lib/response.js';
import { asyncHandler } from '../middleware/errorHandler.js';
import { logger } from '../lib/logger.js';

const router = Router();

/**
 * GET /api/transaksi
 * Get semua transaksi
 */
router.get(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const { status, nasabahId } = req.query;

    const transaksis = await TransaksiService.getAll({
      status: status as string,
      nasabahId: nasabahId as string,
    });

    return ApiSuccess.send(res, transaksis, 'Data transaksi', 200);
  })
);

/**
 * GET /api/transaksi/stats
 * Get statistik transaksi
 */
router.get(
  '/stats',
  asyncHandler(async (_req: Request, res: Response) => {
    const stats = await TransaksiService.getStats();
    return ApiSuccess.send(res, stats, 'Statistik transaksi', 200);
  })
);

/**
 * GET /api/transaksi/:id
 * Get transaksi by ID
 */
router.get(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const transaksi = await TransaksiService.getById(id);

    if (!transaksi) {
      return ApiError.send(res, 'Transaksi tidak ditemukan', 404);
    }

    return ApiSuccess.send(res, transaksi, 'Transaksi ditemukan', 200);
  })
);

/**
 * GET /api/transaksi/nasabah/:nasabahId
 * Get transaksi by nasabah
 */
router.get(
  '/nasabah/:nasabahId',
  asyncHandler(async (req: Request, res: Response) => {
    const { nasabahId } = req.params;
    const transaksis = await TransaksiService.getByNasabah(nasabahId);

    return ApiSuccess.send(res, transaksis, 'Data transaksi nasabah', 200);
  })
);

/**
 * POST /api/transaksi
 * Create transaksi baru
 */
router.post(
  '/',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      nasabahId,
      jenisTransaksi,
      jenisSampahId,
      berat,
      hargaPerKg,
      hargaJualPerKg,
      jumlah,
      keterangan,
      petugasId,
      lapakNama,
      rekeningTujuan,
      nomorTujuan,
      namaTujuan,
    } = req.body;

    if (!jenisTransaksi || !jumlah) {
      return ApiError.send(res, 'Jenis transaksi dan jumlah harus diisi', 400);
    }

    try {
      const transaksi = await TransaksiService.create({
        nasabahId,
        jenisTransaksi,
        jenisSampahId,
        berat,
        hargaPerKg,
        hargaJualPerKg,
        jumlah,
        keterangan,
        petugasId,
        lapakNama,
        rekeningTujuan,
        nomorTujuan,
        namaTujuan,
      });

      return ApiSuccess.send(res, transaksi, 'Transaksi berhasil dibuat', 201);
    } catch (error: any) {
      logger.error('Create transaksi error', error);
      return ApiError.send(res, error.message, 400);
    }
  })
);

/**
 * PUT /api/transaksi/:id
 * Update transaksi
 */
router.put(
  '/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { status, processedBy, keterangan } = req.body;

    try {
      const transaksi = await TransaksiService.update(id, {
        status,
        processedBy,
        processedAt: status === 'SUCCESS' ? new Date() : undefined,
        keterangan,
      });

      return ApiSuccess.send(res, transaksi, 'Transaksi berhasil diperbarui', 200);
    } catch (error: any) {
      logger.error('Update transaksi error', error);

      if (error.message.includes('not found')) {
        return ApiError.send(res, 'Transaksi tidak ditemukan', 404);
      }

      return ApiError.send(res, error.message, 400);
    }
  })
);

export default router;
