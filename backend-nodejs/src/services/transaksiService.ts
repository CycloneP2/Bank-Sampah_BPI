import { prisma } from '../lib/prisma.js';
import { logger } from '../lib/logger.js';
import { generateId } from '../lib/response.js';

export interface CreateTransaksiRequest {
  nasabahId?: string;
  jenisTransaksi: 'SETOR' | 'TARIK' | 'JUAL';
  jenisSampahId?: string;
  berat?: number;
  hargaPerKg?: number;
  hargaJualPerKg?: number;
  jumlah: number;
  tanggal?: Date;
  keterangan?: string;
  petugasId?: string;
  lapakNama?: string;
  rekeningTujuan?: string;
  nomorTujuan?: string;
  namaTujuan?: string;
}

export interface UpdateTransaksiRequest {
  status?: 'PENDING' | 'SUCCESS' | 'CANCELLED';
  processedBy?: string;
  processedAt?: Date;
  keterangan?: string;
}

export class TransaksiService {
  static async getAll(filters?: { status?: string; nasabahId?: string }) {
    try {
      const transaksis = await prisma.transaksi.findMany({
        where: {
          ...(filters?.status && { status: filters.status as any }),
          ...(filters?.nasabahId && { nasabahId: filters.nasabahId }),
        },
        orderBy: { tanggal: 'desc' },
      });

      return transaksis.map((t) => this.formatTransaksi(t));
    } catch (error) {
      logger.error('Get all transaksi error', error);
      throw error;
    }
  }

  static async getById(id: string) {
    try {
      const transaksi = await prisma.transaksi.findUnique({
        where: { id },
      });

      return transaksi ? this.formatTransaksi(transaksi) : null;
    } catch (error) {
      logger.error('Get transaksi by ID error', error);
      throw error;
    }
  }

  static async create(data: CreateTransaksiRequest) {
    try {
      // Get jenis sampah if provided
      let jenisSampahData = null;
      if (data.jenisSampahId) {
        jenisSampahData = await prisma.jenisSampah.findUnique({
          where: { id: data.jenisSampahId },
        });
      }

      const transaksi = await prisma.transaksi.create({
        data: {
          id: generateId('TRX'),
          nasabahId: data.nasabahId || null,
          nasabahNama: data.nasabahId
            ? (await this.getNasabahName(data.nasabahId))
            : null,
          jenisTransaksi: data.jenisTransaksi,
          jenisSampahId: data.jenisSampahId || null,
          jenisSampahNama: jenisSampahData?.nama || data.keterangan || null,
          berat: data.berat ? parseFloat(data.berat.toString()) : null,
          hargaPerKg: data.hargaPerKg
            ? parseFloat(data.hargaPerKg.toString())
            : null,
          hargaJualPerKg: data.hargaJualPerKg
            ? parseFloat(data.hargaJualPerKg.toString())
            : null,
          jumlah: parseFloat(data.jumlah.toString()),
          tanggal: data.tanggal || new Date(),
          status: 'PENDING',
          keterangan: data.keterangan || null,
          petugasId: data.petugasId || null,
          lapakNama: data.lapakNama || null,
          rekeningTujuan: data.rekeningTujuan || null,
          nomorTujuan: data.nomorTujuan || null,
          namaTujuan: data.namaTujuan || null,
        },
      });

      logger.info('Transaksi created successfully', { id: transaksi.id });
      return this.formatTransaksi(transaksi);
    } catch (error) {
      logger.error('Create transaksi error', error);
      throw error;
    }
  }

  static async update(id: string, data: UpdateTransaksiRequest) {
    try {
      const transaksi = await prisma.transaksi.update({
        where: { id },
        data: {
          ...(data.status && { status: data.status }),
          ...(data.processedBy && { processedBy: data.processedBy }),
          ...(data.processedAt && { processedAt: data.processedAt }),
          ...(data.keterangan !== undefined && { keterangan: data.keterangan }),
        },
      });

      // If success, update user saldo
      if (data.status === 'SUCCESS' && transaksi.nasabahId) {
        await this.updateUserSaldo(
          transaksi.nasabahId,
          transaksi.jumlah,
          transaksi.jenisTransaksi
        );
      }

      logger.info('Transaksi updated successfully', { id });
      return this.formatTransaksi(transaksi);
    } catch (error) {
      logger.error('Update transaksi error', error);
      throw error;
    }
  }

  static async getByNasabah(nasabahId: string) {
    try {
      const transaksis = await prisma.transaksi.findMany({
        where: { nasabahId },
        orderBy: { tanggal: 'desc' },
      });

      return transaksis.map((t) => this.formatTransaksi(t));
    } catch (error) {
      logger.error('Get transaksi by nasabah error', error);
      throw error;
    }
  }

  static async getStats() {
    try {
      // 1. Total Nasabah aktif
      const totalNasabah = await prisma.user.count({
        where: { role: 'NASABAH' }
      });

      // 2. Total berat sampah terkumpul (setor success)
      const totalSampahRes = await prisma.transaksi.aggregate({
        where: {
          jenisTransaksi: 'SETOR',
          status: 'SUCCESS'
        },
        _sum: { berat: true }
      });
      const totalSampah = totalSampahRes._sum.berat ? parseFloat(totalSampahRes._sum.berat.toString()) : 0;

      // 3. Total saldo seluruh nasabah
      const totalSaldoRes = await prisma.user.aggregate({
        where: { role: 'NASABAH' },
        _sum: { saldo: true }
      });
      const totalSaldo = totalSaldoRes._sum.saldo ? parseFloat(totalSaldoRes._sum.saldo.toString()) : 0;

      // 4. Jumlah transaksi bulan ini
      const startOfMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      const endOfMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0, 23, 59, 59);

      const transaksiBulanIni = await prisma.transaksi.count({
        where: {
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        }
      });

      // 5. Berat sampah bulan ini
      const sampahBulanIniRes = await prisma.transaksi.aggregate({
        where: {
          jenisTransaksi: 'SETOR',
          status: 'SUCCESS',
          tanggal: {
            gte: startOfMonth,
            lte: endOfMonth
          }
        },
        _sum: { berat: true }
      });
      const sampahBulanIni = sampahBulanIniRes._sum.berat ? parseFloat(sampahBulanIniRes._sum.berat.toString()) : 0;

      // 6. Estimasi keuntungan bank (selisih harga jual - harga beli)
      const txsForProfit = await prisma.transaksi.findMany({
        where: {
          jenisTransaksi: 'SETOR',
          status: 'SUCCESS',
          NOT: {
            hargaJualPerKg: null,
            hargaPerKg: null,
            berat: null
          }
        },
        select: {
          hargaJualPerKg: true,
          hargaPerKg: true,
          berat: true
        }
      });

      const keuanganBank = txsForProfit.reduce((sum, tx) => {
        const berat = parseFloat(tx.berat?.toString() || '0');
        const hargaJual = parseFloat(tx.hargaJualPerKg?.toString() || '0');
        const hargaBeli = parseFloat(tx.hargaPerKg?.toString() || '0');
        return sum + ((hargaJual - hargaBeli) * berat);
      }, 0);

      // 7. Data chart 6 bulan terakhir
      const chartData = [];
      const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      
      for (let i = 5; i >= 0; i--) {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        const month = date.getMonth();
        const year = date.getFullYear();
        const monthName = monthNames[month];
        
        const startOfLoopMonth = new Date(year, month, 1);
        const endOfLoopMonth = new Date(year, month + 1, 0, 23, 59, 59);
        
        const [setoranRes, penarikanRes] = await Promise.all([
          prisma.transaksi.aggregate({
            where: {
              jenisTransaksi: 'SETOR',
              status: 'SUCCESS',
              tanggal: {
                gte: startOfLoopMonth,
                lte: endOfLoopMonth
              }
            },
            _sum: { berat: true }
          }),
          prisma.transaksi.aggregate({
            where: {
              jenisTransaksi: 'TARIK',
              status: 'SUCCESS',
              tanggal: {
                gte: startOfLoopMonth,
                lte: endOfLoopMonth
              }
            },
            _sum: { jumlah: true }
          })
        ]);
        
        chartData.push({
          bulan: monthName,
          setoran: setoranRes._sum.berat ? parseFloat(setoranRes._sum.berat.toString()) : 0,
          penarikan: penarikanRes._sum.jumlah ? parseFloat(penarikanRes._sum.jumlah.toString()) : 0
        });
      }

      return {
        totalNasabah,
        totalSampahTerkumpul: totalSampah,
        totalSaldoNasabah: totalSaldo,
        transaksiBulanIni,
        sampahBulanIni,
        keuanganBankSampah: keuanganBank,
        chartData
      };
    } catch (error) {
      logger.error('Get stats error', error);
      throw error;
    }
  }

  private static async updateUserSaldo(
    nasabahId: string,
    jumlah: any,
    jenisTransaksi: string
  ) {
    const amount = parseFloat(jumlah.toString());

    if (jenisTransaksi === 'SETOR') {
      await prisma.user.update({
        where: { id: nasabahId },
        data: {
          saldo: {
            increment: amount,
          },
          totalSetoran: {
            increment: amount,
          },
        },
      });
    } else if (jenisTransaksi === 'TARIK') {
      await prisma.user.update({
        where: { id: nasabahId },
        data: {
          saldo: {
            decrement: amount,
          },
        },
      });
    }
  }

  private static async getNasabahName(nasabahId: string): Promise<string | null> {
    const nasabah = await prisma.user.findUnique({
      where: { id: nasabahId },
      select: { nama: true },
    });
    return nasabah?.nama || null;
  }

  private static formatTransaksi(t: any) {
    return {
      ...t,
      berat: t.berat ? parseFloat(t.berat.toString()) : null,
      hargaPerKg: t.hargaPerKg ? parseFloat(t.hargaPerKg.toString()) : null,
      hargaJualPerKg: t.hargaJualPerKg
        ? parseFloat(t.hargaJualPerKg.toString())
        : null,
      jumlah: parseFloat(t.jumlah.toString()),
    };
  }
}
