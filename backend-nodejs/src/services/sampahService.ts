import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreateSampahRequest {
  nama: string;
  hargaBeli: number;
  hargaJual: number;
  kategori: 'ORGANIK' | 'ANORGANIK' | 'B3' | 'LAINNYA';
  deskripsi?: string;
}

export interface UpdateSampahRequest {
  nama?: string;
  hargaBeli?: number;
  hargaJual?: number;
  kategori?: string;
  deskripsi?: string;
}

export class SampahService {
  static async getAll(kategori?: string) {
    try {
      const sampah = await prisma.jenisSampah.findMany({
        where: kategori ? { kategori: kategori as any } : undefined,
        orderBy: { nama: 'asc' },
      });

      return sampah.map((s) => ({
        ...s,
        hargaBeli: parseFloat(s.hargaBeli.toString()),
        hargaJual: parseFloat(s.hargaJual.toString()),
      }));
    } catch (error) {
      logger.error('Get all sampah error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const sampah = await prisma.jenisSampah.findUnique({
        where: { id },
      });

      if (!sampah) return null;

      return {
        ...sampah,
        hargaBeli: parseFloat(sampah.hargaBeli.toString()),
        hargaJual: parseFloat(sampah.hargaJual.toString()),
      };
    } catch (error) {
      logger.error('Get sampah by ID error', error);
      throw error;
    }
  }

  static async create(data: CreateSampahRequest) {
    try {
      const sampah = await prisma.jenisSampah.create({
        data: {
          id: generateId('SP'),
          nama: data.nama,
          hargaBeli: parseFloat(data.hargaBeli.toString()),
          hargaJual: parseFloat(data.hargaJual.toString()),
          kategori: data.kategori,
          deskripsi: data.deskripsi || null,
        },
      });

      logger.info('Sampah created successfully', { id: sampah.id });
      return {
        ...sampah,
        hargaBeli: parseFloat(sampah.hargaBeli.toString()),
        hargaJual: parseFloat(sampah.hargaJual.toString()),
      };
    } catch (error) {
      logger.error('Create sampah error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateSampahRequest) {
    try {
      const sampah = await prisma.jenisSampah.update({
        where: { id },
        data: {
          ...(data.nama && { nama: data.nama }),
          ...(data.hargaBeli && {
            hargaBeli: parseFloat(data.hargaBeli.toString()),
          }),
          ...(data.hargaJual && {
            hargaJual: parseFloat(data.hargaJual.toString()),
          }),
          ...(data.kategori && { kategori: data.kategori as any }),
          ...(data.deskripsi !== undefined && { deskripsi: data.deskripsi }),
        },
      });

      logger.info('Sampah updated successfully', { id });
      return {
        ...sampah,
        hargaBeli: parseFloat(sampah.hargaBeli.toString()),
        hargaJual: parseFloat(sampah.hargaJual.toString()),
      };
    } catch (error) {
      logger.error('Update sampah error', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.jenisSampah.delete({
        where: { id },
      });

      logger.info('Sampah deleted successfully', { id });
      return { message: 'Jenis sampah berhasil dihapus' };
    } catch (error) {
      logger.error('Delete sampah error', error);
      throw error;
    }
  }
}
