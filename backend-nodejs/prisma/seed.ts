import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Memulai proses seeding database...');

  // 1. Bersihkan database lama (urutan penting untuk menghindari constraint error)
  console.log('🧹 Membersihkan data lama...');
  await prisma.penjemputan.deleteMany();
  await prisma.notifikasi.deleteMany();
  await prisma.transaksi.deleteMany();
  await prisma.jenisSampah.deleteMany();
  await prisma.berita.deleteMany();
  await prisma.user.deleteMany();

  // 2. Seed Users
  console.log('👤 Membuat data Users...');
  const users = [
    {
      id: 'ADMIN001',
      nama: 'Admin Pengurus',
      email: 'pengurus@banksampah.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', // bcrypt hash 'password'
      telepon: '081122334455',
      alamat: 'Kantor Bank Sampah BPI Lestari',
      role: 'PENGURUS' as const,
      saldo: 0.00,
      totalSetoran: 0.00,
      tanggalBergabung: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01T08:00:00Z'),
    },
    {
      id: 'STAFF001',
      nama: 'Staff Petugas',
      email: 'petugas@banksampah.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '081122334466',
      alamat: 'Gudang Bank Sampah BPI Lestari',
      role: 'PETUGAS' as const,
      saldo: 0.00,
      totalSetoran: 0.00,
      tanggalBergabung: new Date('2024-01-01'),
      createdAt: new Date('2024-01-01T08:00:00Z'),
    },
    {
      id: 'STAFF002',
      nama: 'Rina Kusuma',
      email: 'rina@banksampah.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '081555666777',
      alamat: 'Kantor Cabang Pamulang',
      role: 'PETUGAS' as const,
      saldo: 0.00,
      totalSetoran: 0.00,
      tanggalBergabung: new Date('2024-02-01'),
      createdAt: new Date('2024-02-01T09:00:00Z'),
    },
    {
      id: 'NS001',
      nama: 'Ahmad Wijaya',
      email: 'nasabah@banksampah.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '081234567890',
      alamat: 'Jl. Mawar No. 12',
      role: 'NASABAH' as const,
      saldo: 250500.00,
      totalSetoran: 450000.00,
      rekeningBank: 'BCA',
      nomorRekening: '1234567890',
      namaRekening: 'Ahmad Wijaya',
      tanggalBergabung: new Date('2024-02-15'),
      penimbanganPertama: new Date('2024-02-20'),
      createdAt: new Date('2024-02-15T10:00:00Z'),
    },
    {
      id: 'NS002',
      nama: 'Siti Aminah',
      email: 'siti@gmail.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '081299998888',
      alamat: 'Perumahan Elok Blok A1',
      role: 'NASABAH' as const,
      saldo: 125000.00,
      totalSetoran: 300000.00,
      rekeningBank: 'Mandiri',
      nomorRekening: '9876543210',
      namaRekening: 'Siti Aminah',
      tanggalBergabung: new Date('2024-03-01'),
      penimbanganPertama: new Date('2024-03-05'),
      createdAt: new Date('2024-03-01T11:00:00Z'),
    },
    {
      id: 'NS003',
      nama: 'Budi Santoso',
      email: 'budi@yahoo.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '087811112222',
      alamat: 'Jl. Melati No. 5',
      role: 'NASABAH' as const,
      saldo: 75000.00,
      totalSetoran: 150000.00,
      rekeningBank: 'BNI',
      nomorRekening: '5555666677',
      namaRekening: 'Budi Santoso',
      tanggalBergabung: new Date('2024-03-10'),
      penimbanganPertama: new Date('2024-03-15'),
      createdAt: new Date('2024-03-10T09:00:00Z'),
    },
    {
      id: 'NS004',
      nama: 'Dewi Lestari',
      email: 'dewi@gmail.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '081777888999',
      alamat: 'Jl. Anggrek No. 8',
      role: 'NASABAH' as const,
      saldo: 350000.00,
      totalSetoran: 600000.00,
      rekeningBank: 'BCA',
      nomorRekening: '1111222233',
      namaRekening: 'Dewi Lestari',
      tanggalBergabung: new Date('2024-01-20'),
      penimbanganPertama: new Date('2024-01-25'),
      createdAt: new Date('2024-01-20T14:00:00Z'),
    },
    {
      id: 'NS005',
      nama: 'Rudi Hermawan',
      email: 'rudi@yahoo.com',
      password: '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi',
      telepon: '082111222333',
      alamat: 'Jl. Bunga No. 15',
      role: 'NASABAH' as const,
      saldo: 180000.00,
      totalSetoran: 400000.00,
      rekeningBank: 'Mandiri',
      nomorRekening: '4444555566',
      namaRekening: 'Rudi Hermawan',
      tanggalBergabung: new Date('2024-02-28'),
      penimbanganPertama: new Date('2024-03-03'),
      createdAt: new Date('2024-02-28T11:30:00Z'),
    }
  ];

  for (const u of users) {
    await prisma.user.create({ data: u });
  }

  // 3. Seed Jenis Sampah
  console.log('♻️ Membuat data Jenis Sampah...');
  const sampah = [
    { id: 'PL01', nama: 'Botol PET Bersih', hargaBeli: 2500.00, hargaJual: 3500.00, kategori: 'ANORGANIK' as const, deskripsi: 'Botol plastik PET transparan bersih' },
    { id: 'PL02', nama: 'Botol PET Kotor',  hargaBeli: 1500.00, hargaJual: 2500.00, kategori: 'ANORGANIK' as const, deskripsi: 'Botol plastik PET dengan label/sisa minuman' },
    { id: 'PL04', nama: 'Galon PC',         hargaBeli: 3000.00, hargaJual: 5000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Galon air mineral bahan Polycarbonate' },
    { id: 'PL05', nama: 'Gelas PP Bersih',  hargaBeli: 2000.00, hargaJual: 3000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Gelas plastik PP bening bersih' },
    { id: 'KK02', nama: 'HVS/Putihan',      hargaBeli: 2500.00, hargaJual: 3500.00, kategori: 'ANORGANIK' as const, deskripsi: 'Kertas HVS putih bersih' },
    { id: 'KK04', nama: 'Kardus',           hargaBeli: 1800.00, hargaJual: 2800.00, kategori: 'ANORGANIK' as const, deskripsi: 'Kardus coklat bersih' },
    { id: 'LO01', nama: 'Aluminium',       hargaBeli: 12000.00, hargaJual: 15000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Barang berbahan aluminium' },
    { id: 'LO02', nama: 'Besi',             hargaBeli: 3500.00, hargaJual: 5000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Besi tua/rongsok' },
    { id: 'KC02', nama: 'Btl Kaca Bening',   hargaBeli: 500.00, hargaJual: 1000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Botol kaca bening/transparan' },
    { id: 'LL03', nama: 'Jelantah',         hargaBeli: 3000.00, hargaJual: 5000.00, kategori: 'ANORGANIK' as const, deskripsi: 'Minyak goreng bekas pakai (per liter)' }
  ];

  for (const s of sampah) {
    await prisma.jenisSampah.create({ data: s });
  }

  // 4. Seed Berita
  console.log('📰 Membuat data Berita...');
  const berita = [
    {
      id: 'NEWS001',
      judul: 'Workshop Pengolahan Kompos',
      tanggal: new Date('2024-04-05'),
      deskripsi: 'Mari belajar mengolah sampah organik menjadi pupuk kompos yang berguna untuk tanaman.',
      gambar: 'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?q=80&w=1000',
      kategori: 'EDUKASI' as const,
    },
    {
      id: 'NEWS002',
      judul: 'Lomba Kebersihan Lingkungan',
      tanggal: new Date('2024-04-10'),
      deskripsi: 'Persiapkan RT anda untuk mengikuti lomba kebersihan lingkungan tahunan bersama warga.',
      gambar: 'https://images.unsplash.com/photo-1532996122724-e3c354a0b15b?q=80&w=1000',
      kategori: 'KEGIATAN' as const,
    },
    {
      id: 'NEWS003',
      judul: 'Jadwal Penjemputan Lebaran',
      tanggal: new Date('2024-04-15'),
      deskripsi: 'Informasi perubahan jadwal penjemputan sampah selama libur lebaran. Harap diperhatikan.',
      gambar: 'https://images.unsplash.com/photo-1621451537084-482c73073a0f?q=80&w=1000',
      kategori: 'PENGUMUMAN' as const,
    },
    {
      id: 'NEWS004',
      judul: 'Tips Memilah Sampah Plastik',
      tanggal: new Date('2024-04-08'),
      deskripsi: 'Pelajari cara memilah sampah plastik dengan benar untuk meningkatkan nilai jual.',
      gambar: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?q=80&w=1000',
      kategori: 'EDUKASI' as const,
    },
    {
      id: 'NEWS005',
      judul: 'Kegiatan Bersih-Bersih Rutin',
      tanggal: new Date('2024-04-12'),
      deskripsi: 'Setiap hari Sabtu kami mengadakan kegiatan bersih-bersih lingkungan. Ayo bergabung!',
      gambar: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?q=80&w=1000',
      kategori: 'KEGIATAN' as const,
    },
    {
      id: 'NEWS006',
      judul: 'Peningkatan Harga Sampah',
      tanggal: new Date('2024-04-18'),
      deskripsi: 'Mulai bulan depan, harga beli sampah plastik akan naik 10%. Manfaatkan kesempatan ini!',
      gambar: 'https://images.unsplash.com/photo-1559027615-cd2628902d4a?q=80&w=1000',
      kategori: 'PENGUMUMAN' as const,
    }
  ];

  for (const b of berita) {
    await prisma.berita.create({ data: b });
  }

  // 5. Seed Transaksi
  console.log('💵 Membuat data Transaksi...');
  const transaksi = [
    { id: 'TRX001', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'PL01', jenisSampahNama: 'Botol PET Bersih', berat: 5.00, hargaPerKg: 2500.00, hargaJualPerKg: 3500.00, jumlah: 12500.00, tanggal: new Date('2024-03-20'), status: 'SUCCESS' as const, keterangan: 'Setoran rutin', petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX002', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'KK04', jenisSampahNama: 'Kardus',          berat: 10.00, hargaPerKg: 1800.00, hargaJualPerKg: 2800.00, jumlah: 18000.00, tanggal: new Date('2024-03-21'), status: 'SUCCESS' as const, keterangan: 'Kardus bekas pindahan',  petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX003', nasabahId: 'NS002', nasabahNama: 'Siti Aminah',  jenisTransaksi: 'SETOR' as const, jenisSampahId: 'LO01', jenisSampahNama: 'Aluminium',       berat: 2.00, hargaPerKg: 12000.00, hargaJualPerKg: 15000.00, jumlah: 24000.00, tanggal: new Date('2024-03-22'), status: 'SUCCESS' as const, keterangan: 'Kaleng soda',            petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX004', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', jenisTransaksi: 'TARIK' as const, jenisSampahId: null,   jenisSampahNama: null,               berat: null,     hargaPerKg: null,    hargaJualPerKg: null,  jumlah: 5000.00, tanggal: new Date('2024-03-25'), status: 'SUCCESS' as const, keterangan: 'Penarikan uang jajan',   petugasId: 'ADMIN001', petugasNama: 'Admin Pengurus' },
    { id: 'TRX005', nasabahId: 'NS003', nasabahNama: 'Budi Santoso', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'PL04', jenisSampahNama: 'Galon PC',         berat: 3.00,  hargaPerKg: 3000.00, hargaJualPerKg: 5000.00, jumlah: 9000.00, tanggal: new Date('2024-03-26'), status: 'PENDING' as const, keterangan: 'Belum ditimbang total',  petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX006', nasabahId: null,    nasabahNama: null,           jenisTransaksi: 'JUAL' as const,  jenisSampahId: 'PL01', jenisSampahNama: 'Botol PET Bersih', berat: 50.00, hargaPerKg: 2500.00, hargaJualPerKg: 3500.00, jumlah: 175000.00, tanggal: new Date('2024-03-28'), status: 'SUCCESS' as const, keterangan: 'Jual ke Lapak Berkah',   petugasId: 'ADMIN001', petugasNama: 'Admin Pengurus', lapakNama: 'Lapak Berkah' },
    { id: 'TRX007', nasabahId: 'NS004', nasabahNama: 'Dewi Lestari', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'PL02', jenisSampahNama: 'Botol PET Kotor',  berat: 8.00,  hargaPerKg: 1500.00, hargaJualPerKg: 2500.00, jumlah: 12000.00, tanggal: new Date('2024-03-29'), status: 'SUCCESS' as const, keterangan: 'Setoran mingguan',      petugasId: 'STAFF002', petugasNama: 'Rina Kusuma' },
    { id: 'TRX008', nasabahId: 'NS005', nasabahNama: 'Rudi Hermawan', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'KK02', jenisSampahNama: 'HVS/Putihan',     berat: 15.00, hargaPerKg: 2500.00, hargaJualPerKg: 3500.00, jumlah: 37500.00, tanggal: new Date('2024-03-30'), status: 'SUCCESS' as const, keterangan: 'Kertas bekas kantor',    petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX009', nasabahId: 'NS002', nasabahNama: 'Siti Aminah',  jenisTransaksi: 'TARIK' as const, jenisSampahId: null,   jenisSampahNama: null,               berat: null,     hargaPerKg: null,    hargaJualPerKg: null,  jumlah: 50000.00, tanggal: new Date('2024-04-01'), status: 'PENDING' as const, keterangan: 'Penarikan saldo' },
    { id: 'TRX010', nasabahId: 'NS004', nasabahNama: 'Dewi Lestari', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'LO02', jenisSampahNama: 'Besi',             berat: 5.00,  hargaPerKg: 3500.00, hargaJualPerKg: 5000.00, jumlah: 17500.00, tanggal: new Date('2024-04-02'), status: 'PENDING' as const, keterangan: 'Besi tua dari renovasi', petugasId: 'STAFF002', petugasNama: 'Rina Kusuma' },
    { id: 'TRX011', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', jenisTransaksi: 'SETOR' as const, jenisSampahId: 'PL01', jenisSampahNama: 'Botol PET Bersih', berat: 12.00, hargaPerKg: 2500.00, hargaJualPerKg: 3500.00, jumlah: 30000.00, tanggal: new Date('2024-04-03'), status: 'SUCCESS' as const, keterangan: 'Setoran besar',         petugasId: 'STAFF001', petugasNama: 'Staff Petugas' },
    { id: 'TRX012', nasabahId: null,    nasabahNama: null,           jenisTransaksi: 'JUAL' as const,  jenisSampahId: 'KK04', jenisSampahNama: 'Kardus',           berat: 100.00, hargaPerKg: 1800.00, hargaJualPerKg: 2800.00, jumlah: 28000.00, tanggal: new Date('2024-04-04'), status: 'SUCCESS' as const, keterangan: 'Jual ke Lapak Jaya',    petugasId: 'ADMIN001', petugasNama: 'Admin Pengurus', lapakNama: 'Lapak Jaya' }
  ];

  for (const t of transaksi) {
    await prisma.transaksi.create({ data: t });
  }

  // 6. Seed Notifikasi
  console.log('🔔 Membuat data Notifikasi...');
  const notifikasi = [
    { id: 'NOTIF001', nasabahId: 'NS001', title: 'Saldo Masuk',       msg: 'Setoran TRX001 Berhasil. Saldo bertambah Rp 12.500.',                          status: 'PUBLISHED' as const, createdAt: new Date('2024-03-20T10:30:00Z') },
    { id: 'NOTIF002', nasabahId: 'NS001', title: 'Penarikan Sukses',  msg: 'Penarikan dana Rp 5.000 sukses diproses.',                                     status: 'PUBLISHED' as const, createdAt: new Date('2024-03-25T14:00:00Z') },
    { id: 'NOTIF003', nasabahId: null,    title: 'Promo Tukar Sampah', msg: 'Tukarkan botol PET minimal 10kg dapatkan bonus saldo Rp 5.000. Berlaku s/d akhir bulan.', status: 'PUBLISHED' as const, createdAt: new Date('2024-03-30T08:00:00Z') },
    { id: 'NOTIF004', nasabahId: 'NS004', title: 'Setoran Diterima',  msg: 'Setoran TRX007 Anda berhasil diterima. Saldo bertambah Rp 12.000.',            status: 'PUBLISHED' as const, createdAt: new Date('2024-03-29T15:45:00Z') },
    { id: 'NOTIF005', nasabahId: 'NS005', title: 'Setoran Besar',     msg: 'Terima kasih! Setoran TRX008 Anda sebesar Rp 37.500 telah diproses.',          status: 'PUBLISHED' as const, createdAt: new Date('2024-03-30T16:20:00Z') },
    { id: 'NOTIF006', nasabahId: null,    title: 'Pengumuman Penting', msg: 'Kantor Bank Sampah akan tutup pada hari Jumat untuk maintenance sistem.',       status: 'PUBLISHED' as const, createdAt: new Date('2024-04-01T09:00:00Z') },
    { id: 'NOTIF007', nasabahId: 'NS002', title: 'Penarikan Pending', msg: 'Permintaan penarikan Anda sedang diproses. Tunggu konfirmasi dari pengurus.',    status: 'DRAFT' as const, createdAt: new Date('2024-04-01T10:15:00Z') }
  ];

  for (const n of notifikasi) {
    await prisma.notifikasi.create({ data: n });
  }

  // 7. Seed Penjemputan
  console.log('🚗 Membuat data Penjemputan...');
  const penjemputan = [
    { id: 'PICK001', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', tanggal: new Date('2024-04-02'), waktu: 'PAGI' as const,  alamat: 'Jl. Mawar No. 12',       status: 'PROCESSED' as const, createdAt: new Date('2024-04-01T15:00:00Z') },
    { id: 'PICK002', nasabahId: 'NS002', nasabahNama: 'Siti Aminah',  tanggal: new Date('2024-04-03'), waktu: 'SIANG' as const, alamat: 'Perumahan Elok Blok A1', status: 'PENDING' as const,   createdAt: new Date('2024-04-01T16:30:00Z') },
    { id: 'PICK003', nasabahId: 'NS003', nasabahNama: 'Budi Santoso', tanggal: new Date('2024-04-04'), waktu: 'SORE' as const,  alamat: 'Jl. Melati No. 5',       status: 'PENDING' as const,   createdAt: new Date('2024-04-02T09:00:00Z') },
    { id: 'PICK004', nasabahId: 'NS004', nasabahNama: 'Dewi Lestari', tanggal: new Date('2024-04-05'), waktu: 'PAGI' as const,  alamat: 'Jl. Anggrek No. 8',      status: 'PENDING' as const,   createdAt: new Date('2024-04-02T14:30:00Z') },
    { id: 'PICK005', nasabahId: 'NS005', nasabahNama: 'Rudi Hermawan', tanggal: new Date('2024-04-06'), waktu: 'SIANG' as const, alamat: 'Jl. Bunga No. 15',       status: 'PENDING' as const,   createdAt: new Date('2024-04-03T10:00:00Z') },
    { id: 'PICK006', nasabahId: 'NS001', nasabahNama: 'Ahmad Wijaya', tanggal: new Date('2024-04-09'), waktu: 'SORE' as const,  alamat: 'Jl. Mawar No. 12',       status: 'PENDING' as const,   createdAt: new Date('2024-04-04T11:45:00Z') }
  ];

  for (const p of penjemputan) {
    await prisma.penjemputan.create({ data: p });
  }

  console.log('🎉 Seeding database selesai sukses!');
}

main()
  .catch((e) => {
    console.error('❌ Error saat seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
