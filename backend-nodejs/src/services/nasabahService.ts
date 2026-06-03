import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreateNasabahRequest {
  nama: string;
  email: string;
  password: string;
  telepon?: string;
  alamat?: string;
  tanggalBergabung?: Date;
}

export interface UpdateNasabahRequest {
  nama?: string;
  email?: string;
  telepon?: string;
  alamat?: string;
  rekeningBank?: string;
  nomorRekening?: string;
  namaRekening?: string;
}

export class NasabahService {
  static async getAll() {
    try {
      const nasabahs = await prisma.user.findMany({
        where: { role: 'NASABAH' },
        select: {
          id: true,
          nama: true,
          email: true,
          telepon: true,
          alamat: true,
          saldo: true,
          totalSetoran: true,
          rekeningBank: true,
          nomorRekening: true,
          namaRekening: true,
          createdAt: true,
          tanggalBergabung: true,
          penimbanganPertama: true,
        },
        orderBy: { createdAt: 'desc' },
      });

      return nasabahs.map((n) => ({
        ...n,
        saldo: parseFloat(n.saldo.toString()),
        totalSetoran: parseFloat(n.totalSetoran.toString()),
      }));
    } catch (error) {
      logger.error('Get all nasabah error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const nasabah = await prisma.user.findFirst({
        where: { id, role: 'NASABAH' },
        select: {
          id: true,
          nama: true,
          email: true,
          telepon: true,
          alamat: true,
          saldo: true,
          totalSetoran: true,
          rekeningBank: true,
          nomorRekening: true,
          namaRekening: true,
          createdAt: true,
          tanggalBergabung: true,
          penimbanganPertama: true,
        },
      });

      if (!nasabah) return null;

      return {
        ...nasabah,
        saldo: parseFloat(nasabah.saldo.toString()),
        totalSetoran: parseFloat(nasabah.totalSetoran.toString()),
      };
    } catch (error) {
      logger.error('Get nasabah by ID error', error);
      throw error;
    }
  }

  static async create(data: CreateNasabahRequest) {
    try {
      // Check email already exists
      const existing = await prisma.user.findUnique({
        where: { email: data.email.toLowerCase() },
      });

      if (existing) {
        throw new Error('Email sudah terdaftar');
      }

      // Hash password
      const bcryptjs = await import('bcryptjs');
      const hashedPassword = await bcryptjs.hash(data.password, 10);

      const nasabah = await prisma.user.create({
        data: {
          id: generateId('NS'),
          nama: data.nama,
          email: data.email.toLowerCase(),
          password: hashedPassword,
          telepon: data.telepon || null,
          alamat: data.alamat || null,
          role: 'NASABAH',
          tanggalBergabung: data.tanggalBergabung || new Date(),
        },
        select: {
          id: true,
          nama: true,
          email: true,
          telepon: true,
          alamat: true,
          createdAt: true,
        },
      });

      logger.info('Nasabah created successfully', { id: nasabah.id });
      return nasabah;
    } catch (error) {
      logger.error('Create nasabah error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateNasabahRequest) {
    try {
      // Check email uniqueness if updating email
      if (data.email) {
        const existing = await prisma.user.findFirst({
          where: {
            email: data.email.toLowerCase(),
            NOT: { id },
          },
        });

        if (existing) {
          throw new Error('Email sudah terdaftar');
        }
      }

      const nasabah = await prisma.user.update({
        where: { id },
        data: {
          ...(data.nama && { nama: data.nama }),
          ...(data.email && { email: data.email.toLowerCase() }),
          ...(data.telepon && { telepon: data.telepon }),
          ...(data.alamat && { alamat: data.alamat }),
          ...(data.rekeningBank && { rekeningBank: data.rekeningBank }),
          ...(data.nomorRekening && { nomorRekening: data.nomorRekening }),
          ...(data.namaRekening && { namaRekening: data.namaRekening }),
        },
        select: {
          id: true,
          nama: true,
          email: true,
          telepon: true,
          alamat: true,
          saldo: true,
          totalSetoran: true,
          rekeningBank: true,
          nomorRekening: true,
          namaRekening: true,
        },
      });

      logger.info('Nasabah updated successfully', { id });
      return {
        ...nasabah,
        saldo: parseFloat(nasabah.saldo.toString()),
        totalSetoran: parseFloat(nasabah.totalSetoran.toString()),
      };
    } catch (error) {
      logger.error('Update nasabah error', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.user.delete({
        where: { id, role: 'NASABAH' },
      });

      logger.info('Nasabah deleted successfully', { id });
      return { message: 'Nasabah berhasil dihapus' };
    } catch (error) {
      logger.error('Delete nasabah error', error);
      throw error;
    }
  }
}
