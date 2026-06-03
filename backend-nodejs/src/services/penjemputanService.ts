import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreatePenjemputanRequest {
  nasabahId: string;
  tanggal: Date;
  waktu: 'PAGI' | 'SIANG' | 'SORE';
  alamat: string;
}

export interface UpdatePenjemputanRequest {
  tanggal?: Date;
  waktu?: 'PAGI' | 'SIANG' | 'SORE';
  alamat?: string;
  status?: 'PENDING' | 'PROCESSED' | 'CANCELLED';
}

export class PenjemputanService {
  static async getAll(status?: string) {
    try {
      const penjemputan = await prisma.penjemputan.findMany({
        where: status ? { status: status as any } : undefined,
        orderBy: { tanggal: 'desc' },
        include: {
          nasabah: {
            select: {
              nama: true,
              email: true,
              telepon: true,
            },
          },
        },
      });

      return penjemputan;
    } catch (error) {
      logger.error('Get all penjemputan error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const penjemputan = await prisma.penjemputan.findUnique({
        where: { id },
        include: {
          nasabah: {
            select: {
              nama: true,
              email: true,
              telepon: true,
              alamat: true,
            },
          },
        },
      });

      return penjemputan;
    } catch (error) {
      logger.error('Get penjemputan by ID error', error);
      throw error;
    }
  }

  static async getByNasabah(nasabahId: string) {
    try {
      const penjemputan = await prisma.penjemputan.findMany({
        where: { nasabahId },
        orderBy: { tanggal: 'desc' },
      });

      return penjemputan;
    } catch (error) {
      logger.error('Get penjemputan by nasabah error', error);
      throw error;
    }
  }

  static async create(data: CreatePenjemputanRequest) {
    try {
      // Get nasabah data
      const nasabah = await prisma.user.findUnique({
        where: { id: data.nasabahId },
        select: { nama: true },
      });

      if (!nasabah) {
        throw new Error('Nasabah tidak ditemukan');
      }

      const penjemputan = await prisma.penjemputan.create({
        data: {
          id: generateId('PICK'),
          nasabahId: data.nasabahId,
          nasabahNama: nasabah.nama,
          tanggal: data.tanggal,
          waktu: data.waktu,
          alamat: data.alamat,
          status: 'PENDING',
        },
      });

      logger.info('Penjemputan created successfully', { id: penjemputan.id });
      return penjemputan;
    } catch (error) {
      logger.error('Create penjemputan error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdatePenjemputanRequest) {
    try {
      const penjemputan = await prisma.penjemputan.update({
        where: { id },
        data: {
          ...(data.tanggal && { tanggal: data.tanggal }),
          ...(data.waktu && { waktu: data.waktu }),
          ...(data.alamat && { alamat: data.alamat }),
          ...(data.status && { status: data.status }),
        },
      });

      logger.info('Penjemputan updated successfully', { id });
      return penjemputan;
    } catch (error) {
      logger.error('Update penjemputan error', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.penjemputan.delete({
        where: { id },
      });

      logger.info('Penjemputan deleted successfully', { id });
      return { message: 'Penjemputan berhasil dihapus' };
    } catch (error) {
      logger.error('Delete penjemputan error', error);
      throw error;
    }
  }

  static async getByDate(tanggal: Date) {
    try {
      const startDate = new Date(tanggal);
      startDate.setHours(0, 0, 0, 0);

      const endDate = new Date(tanggal);
      endDate.setHours(23, 59, 59, 999);

      const penjemputan = await prisma.penjemputan.findMany({
        where: {
          tanggal: {
            gte: startDate,
            lte: endDate,
          },
        },
        orderBy: { waktu: 'asc' },
      });

      return penjemputan;
    } catch (error) {
      logger.error('Get penjemputan by date error', error);
      throw error;
    }
  }
}
