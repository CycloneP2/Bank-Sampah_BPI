import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreateNotifikasiRequest {
  nasabahId?: string;
  title: string;
  msg: string;
  status?: 'DRAFT' | 'PUBLISHED';
}

export interface UpdateNotifikasiRequest {
  title?: string;
  msg?: string;
  status?: 'DRAFT' | 'PUBLISHED';
  isRead?: boolean;
}

export class NotifikasiService {
  static async getAll(nasabahId?: string) {
    try {
      const notifikasi = await prisma.notifikasi.findMany({
        where: nasabahId
          ? {
              OR: [
                { nasabahId },
                { nasabahId: null, status: 'PUBLISHED' },
              ],
            }
          : undefined,
        orderBy: { createdAt: 'desc' },
      });

      return notifikasi;
    } catch (error) {
      logger.error('Get all notifikasi error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const notifikasi = await prisma.notifikasi.findUnique({
        where: { id },
      });

      return notifikasi;
    } catch (error) {
      logger.error('Get notifikasi by ID error', error);
      throw error;
    }
  }

  static async getByNasabah(nasabahId: string) {
    try {
      const notifikasi = await prisma.notifikasi.findMany({
        where: {
          OR: [
            { nasabahId },
            { nasabahId: null, status: 'PUBLISHED' },
          ],
        },
        orderBy: { createdAt: 'desc' },
      });

      return notifikasi;
    } catch (error) {
      logger.error('Get notifikasi by nasabah error', error);
      throw error;
    }
  }

  static async create(data: CreateNotifikasiRequest) {
    try {
      const notifikasi = await prisma.notifikasi.create({
        data: {
          id: generateId('NOTIF'),
          nasabahId: data.nasabahId || null,
          title: data.title,
          msg: data.msg,
          status: data.status || 'DRAFT',
        },
      });

      logger.info('Notifikasi created successfully', { id: notifikasi.id });
      return notifikasi;
    } catch (error) {
      logger.error('Create notifikasi error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateNotifikasiRequest) {
    try {
      const notifikasi = await prisma.notifikasi.update({
        where: { id },
        data: {
          ...(data.title && { title: data.title }),
          ...(data.msg && { msg: data.msg }),
          ...(data.status && { status: data.status }),
          ...(data.isRead !== undefined && {
            isRead: data.isRead,
            readAt: data.isRead ? new Date() : null,
          }),
        },
      });

      logger.info('Notifikasi updated successfully', { id });
      return notifikasi;
    } catch (error) {
      logger.error('Update notifikasi error', error);
      throw error;
    }
  }

  static async markAsRead(id: string) {
    try {
      const notifikasi = await prisma.notifikasi.update({
        where: { id },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      });

      logger.info('Notifikasi marked as read', { id });
      return notifikasi;
    } catch (error) {
      logger.error('Mark as read error', error);
      throw error;
    }
  }

  static async delete(id: string) {
    try {
      await prisma.notifikasi.delete({
        where: { id },
      });

      logger.info('Notifikasi deleted successfully', { id });
      return { message: 'Notifikasi berhasil dihapus' };
    } catch (error) {
      logger.error('Delete notifikasi error', error);
      throw error;
    }
  }
}
