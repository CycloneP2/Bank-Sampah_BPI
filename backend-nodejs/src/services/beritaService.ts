import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreateBeritaRequest {
  judul: string;
  deskripsi: string;
  kategori: 'EDUKASI' | 'KEGIATAN' | 'PENGUMUMAN';
  gambar?: string;
  tanggal?: Date;
}

export interface UpdateBeritaRequest {
  judul?: string;
  deskripsi?: string;
  kategori?: string;
  gambar?: string;
  tanggal?: Date;
}

export class BeritaService {
  static async getAll(kategori?: string, limit?: number, offset?: number) {
    try {
      const berita = await prisma.berita.findMany({
        where: kategori ? { kategori: kategori as any } : undefined,
        orderBy: { tanggal: 'desc' },
        ...(limit && { take: limit }),
        ...(offset && { skip: offset }),
      });

      const total = await prisma.berita.count({
        where: kategori ? { kategori: kategori as any } : undefined,
      });

      return {
        data: berita,
        total,
        limit: limit || 10,
        offset: offset || 0,
      };
    } catch (error) {
      logger.error('Get all berita error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const berita = await prisma.berita.findUnique({
        where: { id },
      });

      return berita;
    } catch (error) {
      logger.error('Get berita by ID error', error);
      throw error;
    }
  }

  static async create(data: CreateBeritaRequest) {
    try {
      const berita = await prisma.berita.create({
        data: {
          id: generateId('NEWS'),
          judul: data.judul,
          deskripsi: data.deskripsi,
          kategori: data.kategori,
          gambar: data.gambar || null,
          tanggal: data.tanggal || new Date(),
        },
      });

      logger.info('Berita created successfully', { id: berita.id });
      return berita;
    } catch (error) {
      logger.error('Create berita error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateBeritaRequest) {
    try {
      const berita = await prisma.berita.update({
        where: { id },
        data: {
          ...(data.judul && { judul: data.judul }),
          ...(data.deskripsi && { deskripsi: data.deskripsi }),
          ...(data.kategori && { kategori: data.kategori as any }),
          ...(data.gambar !== undefined && { gambar: data.gambar }),
          ...(data.tanggal && { tanggal: data.tanggal }),
        },
      });

      logger.info('Berita updated successfully', { id });
      return berita;
    } catch (error) {
      logger.error('Update berita error', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.berita.delete({
        where: { id },
      });

      logger.info('Berita deleted successfully', { id });
      return { message: 'Berita berhasil dihapus' };
    } catch (error) {
      logger.error('Delete berita error', error);
      throw error;
    }
  }
}
