// User Roles
export type UserRole = 'nasabah' | 'petugas' | 'pengurus';

// User Interface
export interface User {
  id: string;
  nama: string;
  email: string;
  telepon: string;
  alamat: string;
  role: UserRole;
  saldo: number;
  totalSetoran: number;
  createdAt: string;
  tanggalBergabung?: string;
  penimbanganPertama?: string;
  rekening_bank?: string;
  nomor_rekening?: string;
  nama_rekening?: string;
  isDemo?: boolean;
}

// Waste Type
export interface JenisSampah {
  id: string;
  nama: string;
  hargaBeli: number;
  hargaJual: number;
  kategori: 'organik' | 'anorganik' | 'B3' | 'lainnya';
  deskripsi?: string;
}

// Transaction Types
export type TransactionType = 'setor' | 'tarik' | 'jual';

export interface Transaksi {
  id: string;
  nasabahId: string;
  nasabahNama: string;
  jenisTransaksi: TransactionType;
  jenisSampahId?: string;
  jenisSampahNama?: string;
  berat?: number;
  hargaPerKg?: number; // For nasabah (buy price)
  hargaJualPerKg?: number; // For kamibox/lapak
  jumlah: number;
  tanggal: string;
  status: 'pending' | 'success' | 'cancelled';
  keterangan?: string;
  petugasId?: string;
  petugasNama?: string;
  lapakNama?: string; // Dropdown for nama lapak (kamibox)
  processed_by?: string;
  processed_at?: string;
  // Payment info (from users table via join)
  rekening_bank?: string;
  nomor_rekening?: string;
  nama_rekening?: string;
  // Transaction-specific destination
  rekening_tujuan?: string;
  nomor_tujuan?: string;
  nama_tujuan?: string;
}

// News/Activities
export interface Berita {
  id: string;
  judul: string;
  tanggal: string;
  deskripsi: string;
  gambar?: string;
  kategori: 'edukasi' | 'kegiatan' | 'pengumuman';
}

// Dashboard Stats
export interface DashboardStats {
  totalNasabah: number;
  totalSampahTerkumpul: number;
  totalSaldoNasabah: number;
  transaksiBulanIni: number;
  sampahBulanIni: number;
  keuanganBankSampah: number;
}

// Monthly Chart Data
export interface ChartData {
  bulan: string;
  setoran: number;
  penarikan: number;
}

// Login Credentials (for demo purposes)
export interface LoginCredentials {
  email: string;
  password: string;
}

// Role Permissions
export interface RolePermissions {
  canManageTransactions: boolean;
  canManageUsers: boolean;
  canManageWasteTypes: boolean;
  canViewReports: boolean;
  canManageNews: boolean;
  canWithdraw: boolean;
  canViewAllBalances: boolean;
  canApproveWithdrawal: boolean;
  canViewDashboard: boolean;
}

export const ROLE_PERMISSIONS: Record<UserRole, RolePermissions> = {
  nasabah: {
    canManageTransactions: false,
    canManageUsers: false,
    canManageWasteTypes: false,
    canViewReports: false,
    canManageNews: false,
    canWithdraw: false,
    canViewAllBalances: false,
    canApproveWithdrawal: false,
    canViewDashboard: true,
  },
  petugas: {
    canManageTransactions: true,
    canManageUsers: false,
    canManageWasteTypes: false,
    canViewReports: false,
    canManageNews: false,
    canWithdraw: false,
    canViewAllBalances: false,
    canApproveWithdrawal: false,
    canViewDashboard: false, // staff no longer needs dashboard per request
  },
  pengurus: {
    canManageTransactions: true,
    canManageUsers: true,
    canManageWasteTypes: true,
    canViewReports: true,
    canManageNews: true,
    canWithdraw: true,
    canViewAllBalances: true,
    canApproveWithdrawal: true,
    canViewDashboard: true,
  },
};

// Notifications
export interface Notifikasi {
  id: string;
  title: string;
  msg: string;
  status: 'Published' | 'Draft';
  createdAt: string;
  nasabahId?: string;
}

// Pickups
export interface Penjemputan {
  id: string;
  nasabahId: string;
  tanggal: string;
  waktu: 'pagi' | 'siang' | 'sore';
  alamat: string;
  status: 'pending' | 'processed';
  createdAt: string;
}

// Demo Login Data
export const DEMO_USERS: { email: string; password: string; role: UserRole; nama: string }[] = [
  { email: 'nasabah@banksampah.com', password: 'nasabah123', role: 'nasabah', nama: 'Ahmad Wijaya' },
  { email: 'petugas@banksampah.com', password: 'petugas123', role: 'petugas', nama: 'Budi Santoso' },
  { email: 'pengurus@banksampah.com', password: 'pengurus123', role: 'pengurus', nama: 'Admin Pengurus' },
];
