import React, { useState, useEffect, useRef } from 'react';

import {
  LayoutDashboard, Users, Recycle, Wallet, Banknote,
  Newspaper, FileText, LogOut, Plus, Search, Edit2,
  Trash2, ChevronDown, Download, Bell,
  TrendingUp, TrendingDown, Package,
  Menu, X, CheckCircle, XCircle, Clock, MapPin, Coins, ShieldCheck, Info, AlertCircle, Send, UserCircle, Scale, Lock, Eye, EyeOff
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/context/AuthContext';
import { useTabDetection } from '@/hooks/use-tab-detection';
import { ROLE_PERMISSIONS } from '@/types';
import type { User, JenisSampah, Transaksi, DashboardStats } from '@/types';
import { API_URL } from '@/lib/api';


import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { SlipSetoranManual } from '@/components/SlipSetoranManual';


interface DashboardProps {
  onNavigate: (page: string) => void;
}

type DashboardPage = 'dashboard' | 'nasabah' | 'sampah' | 'transaksi' | 'slip' | 'saldo' | 'penarikan' | 'berita' | 'laporan' | 'profil' | 'jemput' | 'setor' | 'keuangan_nasabah' | 'keuangan_bank' | 'notif' | 'kelola_notif';

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {

  const { user, role, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState<DashboardPage>(() => {
    // Initialize dengan saved tab atau default
    const savedTab = localStorage.getItem('bank_sampah_current_tab');
    if (savedTab) {
      return savedTab as DashboardPage;
    }
    // Default based on role
    return role === 'petugas' ? 'transaksi' : 'dashboard';
  });
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const tabInfo = useTabDetection();

  // Save current tab to localStorage whenever it changes
  useEffect(() => {
    localStorage.setItem('bank_sampah_current_tab', currentPage);
  }, [currentPage]);

  const permissions = role ? ROLE_PERMISSIONS[role] : null;

  const handleLogout = () => {
    logout();
    onNavigate('landing');
  };

  // Filter menu items based on role
  const getMenuItems = () => {
    const items = [
      { id: 'dashboard' as DashboardPage, label: 'Dashboard', icon: LayoutDashboard, show: role !== 'petugas' },
      { id: 'nasabah' as DashboardPage, label: 'Data Nasabah', icon: Users, show: permissions?.canManageUsers || (permissions?.canViewAllBalances && role !== 'petugas') },
      { id: 'sampah' as DashboardPage, label: 'Data Sampah', icon: Recycle, show: permissions?.canManageWasteTypes && role !== 'petugas' },
      { id: 'transaksi' as DashboardPage, label: 'Transaksi Setor', icon: Package, show: permissions?.canManageTransactions },
      { id: 'slip' as DashboardPage, label: 'Slip Setoran', icon: FileText, show: permissions?.canManageTransactions && role !== 'petugas' },
      { id: 'keuangan_nasabah' as DashboardPage, label: 'Riwayat Transaksi', icon: Wallet, show: (role === 'nasabah' || permissions?.canViewAllBalances) && role !== 'petugas' },
      { id: 'keuangan_bank' as DashboardPage, label: 'Keuangan Bank Sampah', icon: Banknote, show: role === 'pengurus' },
      { id: 'penarikan' as DashboardPage, label: 'Persetujuan Penarikan', icon: CheckCircle, show: permissions?.canApproveWithdrawal && role !== 'petugas' },
      { id: 'berita' as DashboardPage, label: 'Berita & Kegiatan', icon: Newspaper, show: permissions?.canManageNews && role !== 'petugas' },
      { id: 'laporan' as DashboardPage, label: 'Report Penimbangan & Penjualan', icon: FileText, show: permissions?.canViewReports && role !== 'petugas' },
      { id: 'notif' as DashboardPage, label: 'Notifikasi', icon: Bell, show: true },
      { id: 'kelola_notif' as DashboardPage, label: 'Kelola Notifikasi', icon: Package, show: role === 'pengurus' },
      { id: 'profil' as DashboardPage, label: 'Profil Saya', icon: Users, show: role !== 'petugas' },
    ];
    return items.filter(item => item.show);
  };

  const menuItems = getMenuItems();

  // Render content based on current page
  const renderContent = () => {
    switch (currentPage) {
      case 'dashboard':
        return role === 'nasabah' ? <NasabahDashboardOverview onNavigateTo={setCurrentPage} /> : <DashboardOverview />;
      case 'nasabah':
        return <DataNasabahPage />;
      case 'sampah':
        return <DataSampahPage />;
      case 'transaksi':
        return <TransaksiSetorPage />;
      case 'slip':
        return <div className="max-w-4xl mx-auto"><SlipSetoranManual /></div>;
      case 'keuangan_nasabah':
        return <SaldoNasabahPage />;
      case 'keuangan_bank':
        return <KeuanganBankSampahPage />;
      case 'penarikan':
        return <PenarikanPage />;
      case 'berita':
        return <BeritaPage />;
      case 'laporan':
        return <LaporanPage />;
      case 'profil':
        return <ProfilPage />;
      case 'jemput':
        return <JemputSampahPage />;
      case 'setor':
        return <SetorMandiriPage />;
      case 'notif':
        return <NotifikasiPage />;
      case 'kelola_notif':
        return <KelolaNotifikasiPage />;
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="min-h-screen flex bg-[#E9F3EC]">
      {/* Mobile Sidebar Overlay */}
      {mobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white shadow-xl transition-all duration-300 ${sidebarOpen ? 'w-72' : 'w-20'
          } ${mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        <div className="h-full flex flex-col">
          {/* Logo */}
          <div className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center flex-shrink-0">
                <img src="/logopat.png" className="w-full h-full object-contain" alt="Logo" />
              </div>
              {sidebarOpen && (
                <span className="font-bold text-[#0F3D2E] text-sm leading-tight">
                  Bank Sampah<br />BPI Lestari
                </span>
              )}
            </div>
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="lg:hidden p-2"
            >
              <X className="w-5 h-5 text-[#0F3D2E]" />
            </button>
          </div>

          {/* Toggle Sidebar (Desktop) */}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden lg:flex absolute -right-3 top-24 w-6 h-6 bg-[#22C55E] rounded-full items-center justify-center shadow-lg"
          >
            <ChevronDown className={`w-4 h-4 text-white transition-transform ${sidebarOpen ? 'rotate-90' : '-rotate-90'}`} />
          </button>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  setCurrentPage(item.id);
                  setMobileSidebarOpen(false);
                }}
                className={`sidebar-item w-full ${currentPage === item.id ? 'active' : 'text-[#2A6B52] hover:bg-[#22C55E]/10'}`}
              >
                <item.icon className="w-5 h-5 flex-shrink-0" />
                {sidebarOpen && <span className="font-medium">{item.label}</span>}
              </button>
            ))}
          </nav>

          {/* User Info & Logout */}
          <div className="p-4 border-t border-[#0F3D2E]/10">
            <div className={`flex items-center gap-3 mb-4 ${!sidebarOpen && 'justify-center'}`}>
              <div className="w-10 h-10 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#22C55E] font-bold">{user?.nama?.[0]}</span>
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <p className="font-medium text-[#0F3D2E] text-sm truncate">{user?.nama}</p>
                  <p className="text-xs text-[#2A6B52] capitalize">{role}</p>
                </div>
              )}
            </div>
            <button
              onClick={handleLogout}
              className={`sidebar-item w-full text-red-500 hover:bg-red-50 ${!sidebarOpen && 'justify-center'}`}
            >
              <LogOut className="w-5 h-5 flex-shrink-0" />
              {sidebarOpen && <span className="font-medium">Keluar</span>}
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Tab Detection Notification */}
        {!tabInfo.isActive && (
          <div className="bg-amber-50 border-b-2 border-amber-200 px-6 py-3 flex items-center justify-between animate-pulse">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600 animate-bounce" />
              <span className="text-sm font-semibold text-amber-800">
                ⚠️ Tab ini sedang tidak aktif. Klik di sini untuk mengaktifkan.
              </span>
            </div>
            <button
              onClick={() => window.focus()}
              className="text-xs font-bold text-amber-600 hover:text-amber-800 px-3 py-1 bg-amber-100 rounded-lg transition-colors"
            >
              Aktifkan
            </button>
          </div>
        )}

        {/* Header */}
        <header className="bg-white shadow-sm px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              className="lg:hidden p-2 hover:bg-[#E9F3EC] rounded-lg"
            >
              <Menu className="w-5 h-5 text-[#0F3D2E]" />
            </button>
            <h1 className="text-xl font-bold text-[#0F3D2E] capitalize">
              {menuItems.find(m => m.id === currentPage)?.label || 'Dashboard'}
            </h1>
            {/* Tab Status Indicator */}
            <div className="hidden sm:flex items-center gap-2 ml-auto">
              <div className={`w-2 h-2 rounded-full ${tabInfo.isActive ? 'bg-green-500 animate-pulse' : 'bg-gray-300'}`}></div>
              <span className="text-xs font-medium text-gray-500">
                {tabInfo.isActive ? 'Tab Aktif' : 'Tab Tidak Aktif'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-4">
            {role === 'nasabah' && (
              <div className="hidden sm:flex items-center gap-2 bg-[#22C55E]/10 px-4 py-2 rounded-full">
                <Wallet className="w-4 h-4 text-[#22C55E]" />
                <span className="text-sm font-semibold text-[#0F3D2E]">
                  Rp {user?.saldo?.toLocaleString('id-ID')}
                </span>
              </div>
            )}
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 p-6 overflow-auto">
          {renderContent()}
        </div>
      </main>
    </div>
  );
};

// Dashboard Overview Component
const DashboardOverview: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>({
    totalNasabah: 0,
    totalSampahTerkumpul: 0,
    totalSaldoNasabah: 0,
    transaksiBulanIni: 0,
    sampahBulanIni: 0,
    keuanganBankSampah: 0
  });
  const [recentTransactions, setRecentTransactions] = useState<Transaksi[]>([]);
  const [chartData, setChartData] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/stats.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setStats(res.data);
          if (res.data.chartData) setChartData(res.data.chartData);
        }
      })
      .catch(err => console.error('Stats fetch error:', err));

    fetch(`${API_URL}/transaksi.php?limit=5`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setRecentTransactions(res.data);
      })
      .catch(err => console.error('Transactions fetch error:', err));
  }, [user]);


  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Nasabah"
          value={stats.totalNasabah}
          icon={Users}
          trend="+5%"
          trendUp={true}
        />
        <StatCard
          title="Sampah Terkumpul"
          value={`${stats.totalSampahTerkumpul} kg`}
          icon={Recycle}
          trend="+12%"
          trendUp={true}
        />
        <StatCard
          title="Total Saldo Nasabah"
          value={`Rp ${stats.totalSaldoNasabah.toLocaleString('id-ID')}`}
          icon={Wallet}
          trend="+8%"
          trendUp={true}
        />
        <StatCard
          title="Transaksi Bulan Ini"
          value={stats.transaksiBulanIni}
          icon={Package}
          trend="+15%"
          trendUp={true}
        />
      </div>

      {/* Chart & Recent Transactions */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <div className="eco-card p-6">
          <h3 className="text-lg font-bold text-[#0F3D2E] mb-4">Grafik Transaksi Bulanan</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E9F3EC" />
                <XAxis dataKey="bulan" stroke="#2A6B52" fontSize={12} />
                <YAxis stroke="#2A6B52" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 20px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="setoran" fill="#22C55E" radius={[4, 4, 0, 0]} />
                <Bar dataKey="penarikan" fill="#EF4444" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recent Transactions */}
        <div className="eco-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-[#0F3D2E]">Transaksi Terbaru</h3>
            <button className="text-sm text-[#22C55E] hover:underline">Lihat Semua</button>
          </div>
          <div className="space-y-3">
            {recentTransactions.map((trx) => (
              <div key={trx.id} className="flex items-center justify-between p-3 bg-[#E9F3EC] rounded-xl">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${trx.jenisTransaksi === 'setor' ? 'bg-green-100' : 'bg-amber-100'
                    }`}>
                    {trx.jenisTransaksi === 'setor' ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : (
                      <TrendingDown className="w-5 h-5 text-amber-600" />
                    )}
                  </div>
                  <div>
                    <p className="font-medium text-[#0F3D2E] text-sm">{trx.nasabahNama}</p>
                    <p className="text-xs text-[#2A6B52]">{trx.jenisSampahNama || 'Penarikan'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`font-semibold text-sm ${trx.jenisTransaksi === 'setor' ? 'text-green-600' : 'text-amber-600'
                    }`}>
                    {trx.jenisTransaksi === 'setor' ? '+' : '-'} Rp {trx.jumlah.toLocaleString('id-ID')}
                  </p>
                  <p className="text-xs text-[#2A6B52]">{trx.tanggal}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export interface Notifikasi {
  id: string;
  title: string;
  msg: string;
  status: 'Published' | 'Draft';
  createdAt: string;
  nasabahId?: string; // Add this
}

const StatCard: React.FC<{
  title: string;
  value: string | number;
  icon: React.ElementType;
  trend: string;
  trendUp: boolean;
}> = ({ title, value, icon: Icon, trend, trendUp }) => (
  <div className="eco-card p-5">
    <div className="flex items-start justify-between">
      <div>
        <p className="text-sm text-[#2A6B52] mb-1">{title}</p>
        <p className="text-2xl font-bold text-[#0F3D2E]">{value}</p>
      </div>
      <div className="w-10 h-10 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
        <Icon className="w-5 h-5 text-[#22C55E]" />
      </div>
    </div>
    <div className="flex items-center gap-1 mt-3">
      <span className={`text-xs font-medium ${trendUp ? 'text-green-600' : 'text-red-600'}`}>
        {trend}
      </span>
      <span className="text-xs text-[#2A6B52]">dari bulan lalu</span>
    </div>
  </div>
);
// Berita & Kegiatan untuk Nasabah
const BeritaKegiataanNasabahSection: React.FC = () => {
  const [beritaList, setBeritaList] = useState<any[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/berita.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setBeritaList(res.data.slice(0, 3));
        }
      })
      .catch(err => console.error('Error fetching berita:', err));
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
          <Newspaper className="w-6 h-6 text-[#22C55E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F3D2E]">Berita & Kegiatan</h2>
          <p className="text-sm text-[#2A6B52]">Update terbaru dari Bank Sampah BPI Lestari</p>
        </div>
      </div>

      {beritaList.length > 0 ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {beritaList.map((berita: any) => (
            <div key={berita.id} className="eco-card overflow-hidden group hover:shadow-lg transition-all">
              <div className="h-40 overflow-hidden">
                <img
                  src={berita.gambar || '/ill_news_1.jpg'}
                  alt={berita.judul}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="p-5">
                <div className="flex items-center gap-2 mb-2">
                  <Badge variant="outline" className="capitalize text-xs">{berita.kategori}</Badge>
                  <span className="text-xs text-[#2A6B52]">{berita.tanggal}</span>
                </div>
                <h3 className="font-bold text-[#0F3D2E] mb-2 line-clamp-2">{berita.judul}</h3>
                <p className="text-sm text-[#2A6B52] line-clamp-2">
                  {berita.deskripsi}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="eco-card p-12 text-center">
          <Newspaper className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada berita</p>
          <p className="text-sm text-gray-400 mt-2">Berita dan kegiatan akan ditampilkan di sini</p>
        </div>
      )}
    </div>
  );
};

const NasabahDashboardOverview: React.FC<{ onNavigateTo: (page: DashboardPage) => void }> = ({ onNavigateTo }) => {
  const { user, isNewLogin, clearNewLoginFlag } = useAuth();
  const [showSetorDialog, setShowSetorDialog] = useState(false);
  const [wasteTypes, setWasteTypes] = useState<JenisSampah[]>([]);
  const [recentTransactions, setRecentTransactions] = useState<Transaksi[]>([]);
  const [isSuccess, setIsSuccess] = useState(false);
  const [items, setItems] = useState<any[]>([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
  const [displayNotifications, setDisplayNotifications] = useState<any[]>([]);

  useEffect(() => {
    // Fetch waste types
    fetch(`${API_URL}/sampah.php`)
      .then(res => res.json())
      .then(res => res.status === 'success' && setWasteTypes(res.data));

    // Fetch transactions
    if (user?.id) {
      fetch(`${API_URL}/transaksi.php?nasabahId=${user.id}`)
        .then(res => res.json())
        .then(res => res.status === 'success' && setRecentTransactions(res.data));
    }
  }, [user]);

  // Polling untuk notifikasi - refresh setiap 5 detik
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = user?.id 
          ? `${API_URL}/notifikasi.php?nasabahId=${user.id}&includeRead=false`
          : `${API_URL}/notifikasi.php`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          // Hanya tampilkan notif saat login baru
          if (isNewLogin) {
            setDisplayNotifications(data.data);
            clearNewLoginFlag();
          }
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      }
    };

    fetchNotifications();
    const interval = setInterval(fetchNotifications, 5000); // Refresh setiap 5 detik
    return () => clearInterval(interval);
  }, [user, isNewLogin, clearNewLoginFlag]);

  // State untuk tracking notifikasi yang di-close
  const [closedNotifications, setClosedNotifications] = useState<Set<string>>(new Set());

  // Auto-close notifikasi setelah 10 detik
  useEffect(() => {
    if (displayNotifications.length === 0) return;

    const timers = displayNotifications.map((notif) => {
      if (closedNotifications.has(notif.id)) return null;
      
      return setTimeout(() => {
        setClosedNotifications(prev => new Set([...prev, notif.id]));
      }, 10000); // 10 detik
    });

    return () => {
      timers.forEach(timer => {
        if (timer) clearTimeout(timer);
      });
    };
  }, [displayNotifications, closedNotifications]);

  const handleCloseNotification = (notifId: string) => {
    setClosedNotifications(prev => new Set([...prev, notifId]));
  };

  const visibleNotifications = displayNotifications.filter(n => !closedNotifications.has(n.id));

  const addItem = () => {
    setItems([...items, { id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        if (field === 'jenisSampahId') {
          const waste = wasteTypes.find(w => w.id === value);
          if (waste) {
            updated.harga = waste.hargaBeli;
            updated.nama = waste.nama;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const totalEstimasi = items.reduce((sum, item) => {
    const b = parseFloat(item.berat) || 0;
    return sum + (b * item.harga);
  }, 0);

  const totalSampahDisetor = recentTransactions
    .filter(t => t.jenisTransaksi === 'setor')
    .reduce((sum, t) => sum + (Number(t.berat) || 0), 0);

  const pohonDiselamatkan = totalSampahDisetor >= 10 ? Math.floor(totalSampahDisetor / 10) : 1;

  // Ambil data penimbangan pertama dari transaksi setor paling awal
  const penimbanganPertama = recentTransactions
    .filter(t => t.jenisTransaksi === 'setor')
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())[0];

  const handleQuickSetor = async () => {
    const validItems = items.filter(i => i.jenisSampahId && parseFloat(i.berat) > 0);
    if (validItems.length === 0) return alert('Lengkapi data setoran minimal satu baris!');
    try {
      for (const item of validItems) {
        const response = await fetch(`${API_URL}/transaksi.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nasabahId: user?.id,
            nasabahNama: user?.nama,
            jenisTransaksi: 'setor',
            jenisSampahId: item.jenisSampahId,
            jenisSampahNama: item.nama,
            berat: parseFloat(item.berat),
            hargaPerKg: item.harga,
            jumlah: parseFloat(item.berat) * item.harga,
            tanggal: new Date().toISOString().split('T')[0],
            status: 'pending',
            keterangan: 'Setor langsung via dashboard'
          })
        });
        const respText = await response.text();
        const result = JSON.parse(respText);
        if (result.status !== 'success') {
          throw new Error(result.message);
        }
      }
      setIsSuccess(true);
      setItems([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
    } catch (err) {
      alert('Gagal sistem: ' + (err instanceof Error ? err.message : 'Koneksi terputus'));
    }
  };

  return (
    <div className="space-y-6">
      {/* Notifications Popup - Display all published notifications */}
      {visibleNotifications.length > 0 && (
        <div className="fixed top-24 right-6 z-[60] space-y-4 max-h-[70vh] overflow-y-auto pr-2">
          {visibleNotifications.map((notif, idx) => (
            <div 
              key={notif.id || idx} 
              className="animate-in fade-in slide-in-from-right-4 duration-500"
            >
              <div className="bg-white rounded-2xl shadow-2xl border-l-4 border-blue-500 p-5 max-w-sm flex items-start gap-3 hover:shadow-3xl transition-shadow">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bell className="w-6 h-6 text-blue-600" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-2 mb-1">
                    <h4 className="font-bold text-[#0F3D2E] text-sm leading-tight">{notif.title}</h4>
                    <button 
                      onClick={() => handleCloseNotification(notif.id)}
                      className="text-gray-400 hover:text-gray-600 flex-shrink-0 p-1 hover:bg-gray-100 rounded-lg transition-colors"
                      title="Tutup notifikasi"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <p className="text-xs text-[#2A6B52] line-clamp-2">{notif.msg}</p>
                  <p className="text-[10px] text-gray-400 mt-2">{notif.createdAt || 'Baru saja'}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="relative overflow-hidden rounded-[28px] border border-[#0F3D2E]/10 p-8 shadow-[0_18px_45px_rgba(15,61,46,0.12)] bg-gradient-to-br from-[#22C55E] to-[#16A34A] text-white">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <h2 className="text-3xl font-bold mb-2">Halo, {user?.nama}! 👋</h2>
            <div className="flex flex-wrap gap-x-4 gap-y-2 mt-4">
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <CheckCircle className="w-4 h-4" />
                <span className="text-xs font-semibold">Gabung: {user?.tanggalBergabung || user?.createdAt}</span>
              </div>
              <div className="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-1.5 border border-white/20">
                <Recycle className="w-4 h-4" />
                <span className="text-xs font-semibold">Total Setor: {totalSampahDisetor.toFixed(2)} kg</span>
              </div>
            </div>
          </div>
          <div className="bg-white/20 backdrop-blur-md rounded-3xl p-5 min-w-[220px] border border-white/30 shadow-lg">
            <p className="text-green-50 text-sm font-medium mb-1 drop-shadow-sm">Saldo Saat Ini</p>
            <p className="text-3xl font-bold drop-shadow-md">Rp {user?.saldo?.toLocaleString('id-ID')}</p>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black opacity-10 rounded-full translate-y-1/3 -translate-x-1/4 blur-2xl" />
      </div>

      {/* Penimbangan Pertama Card */}
      {penimbanganPertama && (
        <div className="eco-card p-6 bg-gradient-to-br from-blue-50 to-blue-25 border-2 border-blue-200 rounded-3xl shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-[#0F3D2E] text-lg">📦 Penimbangan Pertama</h3>
            <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center text-blue-600">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="space-y-3">
            <div className="bg-white rounded-xl p-3 border border-blue-100">
              <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Jenis Sampah</p>
              <p className="font-bold text-[#0F3D2E]">{penimbanganPertama.jenisSampahNama}</p>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Berat</p>
                <p className="font-bold text-[#0F3D2E] text-lg">{typeof penimbanganPertama.berat === 'number' ? penimbanganPertama.berat.toFixed(2) : penimbanganPertama.berat} kg</p>
              </div>
              <div className="bg-white rounded-xl p-3 border border-blue-100">
                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Tanggal</p>
                <p className="font-bold text-[#0F3D2E] text-sm">{penimbanganPertama.tanggal}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Stats & Actions */}
        <div className="space-y-6">
          <div className="eco-card p-6 bg-white overflow-hidden relative group">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-bold text-[#0F3D2E] text-lg">Pencapaian Lingkungan</h3>
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                <Recycle className="w-5 h-5" />
              </div>
            </div>
            <div className="relative">
              <div className="flex flex-col gap-1 mb-4">
                <p className="text-3xl font-black text-[#0F3D2E]">{pohonDiselamatkan}</p>
                <p className="text-sm font-bold text-[#2A6B52]">Pohon Telah Diselamatkan 🌳</p>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-[#22C55E] h-full rounded-full transition-all duration-1000" style={{ width: `${Math.min((totalSampahDisetor % 10) * 10, 100)}%` }} />
              </div>
              <p className="text-[10px] text-gray-400 mt-2 font-bold uppercase tracking-wider">{(10 - (totalSampahDisetor % 10)).toFixed(1)} kg lagi menuju pohon berikutnya</p>
            </div>
          </div>

          <div className="eco-card p-6">
            <h3 className="font-bold text-[#0F3D2E] text-lg mb-4">Aksi Cepat</h3>
            <div className="grid gap-4">
              <button
                onClick={() => setShowSetorDialog(true)}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-[#22C55E]/20 bg-[#22C55E]/5 hover:bg-[#22C55E]/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Recycle className="w-6 h-6 text-[#22C55E]" />
                  </div>
                  <span className="font-bold text-[#0F3D2E]">Setor Langsung</span>
                </div>
                <TrendingUp className="w-5 h-5 text-[#2A6B52] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() => onNavigateTo('penarikan')}
                className="w-full flex items-center justify-between p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 hover:bg-amber-500/10 transition-colors group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                    <Banknote className="w-6 h-6 text-amber-500" />
                  </div>
                  <span className="font-bold text-[#0F3D2E]">Tarik Saldo</span>
                </div>
                <TrendingUp className="w-5 h-5 text-[#2A6B52] opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

          </div>
        </div>

        {/* Recent Transactions */}
        <div className="lg:col-span-2 eco-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-lg font-bold text-[#0F3D2E]">Riwayat Transaksi</h3>
            <button 
              onClick={() => onNavigateTo('keuangan_nasabah')}
              className="text-sm text-[#22C55E] hover:underline font-semibold bg-[#22C55E]/10 px-3 py-1.5 rounded-lg"
            >
              Lihat Semua
            </button>
          </div>


          {recentTransactions.length > 0 ? (
            <div className="space-y-4">
              {recentTransactions.map((trx) => (
                <div key={trx.id} className="flex items-center justify-between p-4 bg-[#E9F3EC]/40 hover:bg-[#E9F3EC] transition-all rounded-2xl border border-transparent hover:border-[#22C55E]/20">
                  <div className="flex items-center gap-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm ${trx.jenisTransaksi === 'setor' ? 'bg-gradient-to-br from-green-100 to-green-50' : 'bg-gradient-to-br from-amber-100 to-amber-50'
                      }`}>
                      {trx.jenisTransaksi === 'setor' ? (
                        <TrendingUp className="w-7 h-7 text-green-600" />
                      ) : (
                        <TrendingDown className="w-7 h-7 text-amber-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-bold text-[#0F3D2E] text-base capitalize">{trx.jenisTransaksi} {trx.jenisTransaksi === 'setor' ? 'Sampah' : 'Saldo'}</p>
                      <p className="text-sm font-medium text-[#2A6B52] mt-0.5">{trx.jenisSampahNama || trx.keterangan || 'Penarikan Tunai'}</p>
                      <div className="flex items-center gap-1.5 mt-1.5 opacity-80">
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span className="text-xs text-gray-500 font-medium">{trx.tanggal}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-right flex flex-col items-end">
                    <span className={`font-bold text-base px-3.5 py-1.5 rounded-xl shadow-sm ${trx.jenisTransaksi === 'setor' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                      {trx.jenisTransaksi === 'setor' ? '+' : '-'} Rp {trx.jumlah ? trx.jumlah.toLocaleString('id-ID') : '0'}
                    </span>
                    {trx.jenisTransaksi === 'setor' && trx.berat && (
                      <span className="text-sm font-bold text-[#2A6B52]/70 mt-2 bg-[#2A6B52]/10 px-2 py-0.5 rounded-lg">{typeof trx.berat === 'number' ? trx.berat.toFixed(2) : trx.berat} kg</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-[#0F3D2E] font-bold text-lg mb-1">Belum ada transaksi</p>
              <p className="text-sm text-gray-500 max-w-sm mx-auto">Mulai kumpulkan dan setor sampahmu untuk membantu lingkungan dan mendapatkan saldo tambahan!</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Setor Dialog */}
      <Dialog 
        open={showSetorDialog} 
        onOpenChange={(open) => {
          if (!open && isSuccess) {
            setIsSuccess(false);
            setItems([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
            // Refresh transactions
            if (user?.id) {
              fetch(`${API_URL}/transaksi.php?nasabahId=${user.id}`)
                .then(res => res.json())
                .then(res => res.status === 'success' && setRecentTransactions(res.data));
            }
          }
          setShowSetorDialog(open);
          if (open) setIsSuccess(false);
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-md max-h-[90vh] rounded-[1.5rem] sm:rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl flex flex-col">
          {isSuccess ? (
            <div className="p-6 sm:p-8 text-center bg-white overflow-y-auto">
              <div className="w-16 h-16 sm:w-24 sm:h-24 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 sm:mb-6 animate-bounce">
                <CheckCircle className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
              </div>
              <h3 className="text-xl sm:text-2xl font-black text-[#0F3D2E] mb-2 sm:mb-3">Setoran Berhasil!</h3>
              <p className="text-xs sm:text-sm text-gray-500 font-medium mb-6 sm:mb-8">
                Data setoran Anda telah tercatat. Silakan bawa sampah Anda ke bank sampah untuk ditimbang petugas.
              </p>
              <div className="bg-[#E9F3EC] p-4 sm:p-5 rounded-2xl border border-green-500/10 mb-6 sm:mb-8 text-left">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold text-gray-400 uppercase">Estimasi Hasil</span>
                  <span className="text-base sm:text-lg font-black text-[#0F3D2E]">Rp {totalEstimasi.toLocaleString('id-ID')}</span>
                </div>
                <div className="flex justify-between items-center text-[8px] sm:text-[10px] text-gray-400 font-bold uppercase tracking-widest leading-none">
                  <span>ID TRx: KILAT</span>
                  <span>TIPE: SETOR LANGSUNG</span>
                </div>
              </div>
              <Button 
                onClick={() => {
                  setShowSetorDialog(false);
                  setIsSuccess(false);
                  setItems([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
                }} 
                className="w-full bg-[#0F3D2E] hover:bg-black text-white h-12 sm:h-14 rounded-2xl font-bold shadow-lg"
              >
                TUTUP & LIHAT RIWAYAT
              </Button>
            </div>
          ) : (
            <>
              <div className="bg-[#0F3D2E] p-5 sm:p-8 text-white relative overflow-hidden flex-shrink-0">
                <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl opacity-50" />
                <DialogHeader className="relative z-10 text-left">
                  <DialogTitle className="text-xl sm:text-3xl font-black text-white leading-tight">
                    Mulai Setoran <br className="sm:hidden" /> Kilat ⚡
                  </DialogTitle>
                </DialogHeader>
                <div className="mt-2 sm:mt-4 flex items-center gap-2 sm:gap-3 bg-white/10 w-fit px-3 py-1.5 sm:px-4 sm:py-2 rounded-full border border-white/20 backdrop-blur-md">
                  <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 bg-green-400 rounded-full animate-pulse" />
                  <span className="text-[10px] sm:text-xs font-bold text-white/90 whitespace-nowrap">Sistem Online & Siap Menimbang</span>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto custom-scrollbar p-0 bg-white">
                <div className="p-4 sm:p-6 space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="p-4 sm:p-5 bg-gray-50 rounded-2xl sm:rounded-3xl border border-gray-100 relative group/item">
                      {items.length > 1 && (
                        <button 
                          onClick={() => removeItem(item.id)}
                          className="absolute -right-1 -top-1 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover/item:opacity-100 transition-opacity shadow-lg z-20"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      )}
                      
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 mb-3 sm:mb-4">
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kategori</label>
                          <Select value={item.kategori} onValueChange={(val) => updateItem(item.id, 'kategori', val)}>
                            <SelectTrigger className="border-none bg-white h-10 sm:h-12 font-bold rounded-xl shadow-sm text-xs sm:text-sm">
                              <SelectValue placeholder="Pilih" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              <SelectItem value="anorganik">Anorganik</SelectItem>
                              <SelectItem value="organik">Organik</SelectItem>
                              <SelectItem value="B3">B3</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1.5 sm:space-y-2">
                          <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jenis Sampah</label>
                          <Select value={item.jenisSampahId} onValueChange={(val) => updateItem(item.id, 'jenisSampahId', val)}>
                            <SelectTrigger className="border-none bg-white h-10 sm:h-12 font-bold rounded-xl shadow-sm text-xs sm:text-sm">
                              <SelectValue placeholder="Pilih Jenis" />
                            </SelectTrigger>
                            <SelectContent className="rounded-2xl border-none shadow-2xl">
                              {wasteTypes.filter(w => w.kategori === item.kategori).map(w => (
                                <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
                        <div className="flex-1 space-y-1.5 sm:space-y-2">
                          <label className="block text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Berat (kg)</label>
                          <div className="relative">
                            <Input
                              type="number"
                              step="0.1"
                              placeholder="0.0"
                              value={item.berat}
                              onChange={(e) => updateItem(item.id, 'berat', e.target.value)}
                              className="bg-white border-none h-10 sm:h-12 font-black text-base sm:text-lg text-[#0F3D2E] rounded-xl shadow-sm pl-4 pr-10"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-[8px] sm:text-[10px] font-black text-gray-300">KG</div>
                          </div>
                        </div>
                        <div className="flex-1">
                          <div className="text-left sm:text-right">
                            <p className="text-[8px] sm:text-[10px] font-bold text-gray-400 uppercase mb-0.5">Subtotal</p>
                            <p className="font-black text-[#0F3D2E] text-base sm:text-lg">Rp {( (parseFloat(item.berat) || 0) * item.harga).toLocaleString('id-ID')}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button 
                    onClick={addItem}
                    variant="outline"
                    className="w-full border-dashed border-2 border-gray-100 h-12 sm:h-14 rounded-2xl font-bold text-gray-400 hover:text-[#22C55E] hover:border-[#22C55E] transition-all bg-white text-xs sm:text-sm"
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Tambah Jenis Sampah Lagi
                  </Button>
                </div>
              </div>

              <div className="p-4 sm:p-6 bg-white border-t border-gray-100 flex-shrink-0">
                <div className="bg-gradient-to-br from-[#0F3D2E] to-[#1a5d46] p-4 sm:p-6 rounded-2xl sm:rounded-[2rem] shadow-xl relative overflow-hidden mb-4 sm:mb-6">
                  <div className="absolute right-0 bottom-0 opacity-10">
                    <Coins className="w-20 h-20 sm:w-32 sm:h-32 -mr-4 -mb-4 sm:-mr-8 sm:-mb-8 text-white" />
                  </div>
                  <div className="relative z-10">
                    <p className="text-[8px] sm:text-[10px] font-black text-white/60 uppercase tracking-[0.2em] mb-0.5">Total Estimasi Saldo</p>
                    <p className="text-xl sm:text-3xl font-black text-white">Rp {totalEstimasi.toLocaleString('id-ID')}</p>
                  </div>
                </div>

                <Button 
                  onClick={handleQuickSetor}
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white h-12 sm:h-16 rounded-2xl sm:rounded-3xl font-bold text-base sm:text-lg shadow-[0_8px_30px_rgb(34,197,94,0.3)] transition-all active:scale-95"
                >
                  KONFIRMASI SEMUA
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Berita & Kegiatan Section */}
      <BeritaKegiataanNasabahSection />
    </div>
  );
};


// Data Nasabah Page
const DataNasabahPage: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const { user } = useAuth();
  
  const fetchNasabahList = async () => {
    try {
      const res = await fetch(`${API_URL}/nasabah.php`);
      const data = await res.json();
      if (data.status === 'success') {
        const mappedData = data.data.map((u: any) => ({
          ...u,
          saldo: Number(u.saldo),
          totalSetoran: Number(u.totalSetoran)
        }));
        setNasabahList(mappedData);
      }
    } catch (err) {
      console.error('Error fetching nasabah:', err);
    }
  };

  useEffect(() => {
    fetchNasabahList();
  }, [user, refreshTrigger]);


  const filteredNasabah = nasabahList.filter((n: User) =>
    n.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    n.id.toLowerCase().includes(searchTerm.toLowerCase())
  );



  const handleDelete = (id: string) => {
    if (confirm('Apakah Anda yakin ingin menghapus nasabah ini?')) {
      setNasabahList(prev => prev.filter(n => n.id !== id));
    }
  };

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A6B52]" />
          <Input
            placeholder="Cari nasabah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="eco-input pl-10"
          />
        </div>
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
          <DialogTrigger asChild>
            <Button className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl">
              <Plus className="w-4 h-4 mr-2" />
              Tambah Nasabah
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-[#0F3D2E]">Tambah Nasabah Baru</DialogTitle>
            </DialogHeader>
            <AddNasabahForm 
              onClose={() => setShowAddDialog(false)}
              onSuccess={() => {
                setRefreshTrigger(prev => prev + 1);
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      {/* Table */}
      <div className="eco-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Nasabah</th>
                <th>Nama Nasabah</th>
                <th>Nomor Telepon</th>
                <th>Alamat</th>
                <th>Saldo</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNasabah.map((nasabah) => (
                <tr key={nasabah.id}>
                  <td className="font-medium text-[#0F3D2E]">{nasabah.id}</td>
                  <td>{nasabah.nama}</td>
                  <td>{nasabah.telepon}</td>
                  <td className="max-w-xs truncate">{nasabah.alamat}</td>
                  <td className="font-semibold text-[#22C55E]">
                    Rp {nasabah.saldo.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button className="p-2 hover:bg-[#22C55E]/10 rounded-lg text-[#22C55E]">
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(nasabah.id)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {filteredNasabah.length === 0 && (
          <div className="text-center py-12">
            <p className="text-[#2A6B52]">Tidak ada data nasabah</p>
          </div>
        )}
      </div>
    </div>
  );
};

const AddNasabahForm: React.FC<{ onClose: () => void; onSuccess?: () => void }> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    nama: '',
    telepon: '',
    alamat: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const generatePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData({ ...formData, password, confirmPassword: password });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    // Validasi
    if (!formData.password.trim()) {
      setError('Password tidak boleh kosong!');
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError('Password dan konfirmasi password tidak cocok!');
      return;
    }
    if (formData.password.length < 6) {
      setError('Password minimal 6 karakter!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/nasabah.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          id: `NS-${Date.now().toString().slice(-6)}`,
          role: 'nasabah'
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess(true);
        setFormData({ nama: '', email: '', telepon: '', alamat: '', password: '', confirmPassword: '' });
        // Call parent callback to refresh list
        if (onSuccess) {
          onSuccess();
        }
        // Close dialog after 1.5 seconds to show success message
        setTimeout(() => {
          onClose();
        }, 1500);
      } else {
        setError(result.message || 'Gagal menambah nasabah');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 mt-4">
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
          {error}
        </div>
      )}
      {success && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
          ✓ Nasabah berhasil ditambahkan!
        </div>
      )}
      <div>
        <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Nama Lengkap</label>
        <Input
          value={formData.nama}
          onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
          className="eco-input"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Email</label>
        <Input
          type="email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          className="eco-input"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Nomor Telepon</label>
        <Input
          value={formData.telepon}
          onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
          className="eco-input"
          required
          disabled={isLoading}
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Alamat</label>
        <textarea
          value={formData.alamat}
          onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
          className="eco-input w-full h-24 resize-none"
          required
          disabled={isLoading}
        />
      </div>
      <div className="border-t border-gray-200 pt-4">
        <div className="flex justify-between items-center mb-3">
          <label className="block text-sm font-medium text-[#0F3D2E]">Password</label>
          <button
            type="button"
            onClick={generatePassword}
            className="text-xs text-[#22C55E] hover:text-[#16A34A] font-medium"
            disabled={isLoading}
          >
            Generate Password
          </button>
        </div>
        <div className="relative">
          <Input
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            className="eco-input pr-10"
            required
            disabled={isLoading}
            placeholder="Masukkan atau generate password"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
            disabled={isLoading}
          >
            {showPassword ? '👁️' : '👁️‍🗨️'}
          </button>
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Konfirmasi Password</label>
        <Input
          type={showPassword ? 'text' : 'password'}
          value={formData.confirmPassword}
          onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
          className="eco-input"
          required
          disabled={isLoading}
          placeholder="Konfirmasi password"
        />
      </div>
      <div className="flex gap-3 pt-4">
        <Button type="button" variant="outline" onClick={onClose} className="flex-1" disabled={isLoading}>
          Batal
        </Button>
        <Button type="submit" className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white" disabled={isLoading}>
          {isLoading ? 'Menyimpan...' : 'Simpan'}
        </Button>
      </div>
    </form>
  );
};

// Data Sampah Page
const DataSampahPage: React.FC = () => {
  const { user, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [sampahList, setSampahList] = useState<JenisSampah[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Form state
  const [formData, setFormData] = useState({
    nama: '',
    hargaBeli: '',
    hargaJual: '',
    kategori: 'anorganik',
    deskripsi: ''
  });

  useEffect(() => {
    fetch(`${API_URL}/sampah.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setSampahList(res.data);
        }
      })
      .catch(err => console.error('Error fetching sampah:', err));
  }, [user, refreshTrigger]);

  const filteredSampah = sampahList.filter(s =>
    s.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const resetForm = () => {
    setFormData({
      nama: '',
      hargaBeli: '',
      hargaJual: '',
      kategori: 'anorganik',
      deskripsi: ''
    });
    setError(null);
    setSuccess(false);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (sampah: JenisSampah) => {
    setFormData({
      nama: sampah.nama,
      hargaBeli: sampah.hargaBeli.toString(),
      hargaJual: sampah.hargaJual.toString(),
      kategori: sampah.kategori,
      deskripsi: sampah.deskripsi || ''
    });
    setEditingId(sampah.id);
    setError(null);
    setSuccess(false);
    setShowEditDialog(true);
  };

  const validateForm = () => {
    if (!formData.nama.trim()) {
      setError('Nama jenis sampah tidak boleh kosong!');
      return false;
    }
    if (!formData.hargaBeli || parseFloat(formData.hargaBeli) <= 0) {
      setError('Harga beli harus lebih dari 0!');
      return false;
    }
    if (!formData.hargaJual || parseFloat(formData.hargaJual) <= 0) {
      setError('Harga jual harus lebih dari 0!');
      return false;
    }
    if (!formData.deskripsi.trim()) {
      setError('Deskripsi tidak boleh kosong!');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/sampah.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: formData.nama.trim(),
          hargaBeli: parseFloat(formData.hargaBeli),
          hargaJual: parseFloat(formData.hargaJual),
          kategori: formData.kategori,
          deskripsi: formData.deskripsi.trim()
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowAddDialog(false);
          resetForm();
          setRefreshTrigger(prev => prev + 1);
        }, 1500);
      } else {
        setError(result.message || 'Gagal menambah jenis sampah');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/sampah.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          nama: formData.nama.trim(),
          hargaBeli: parseFloat(formData.hargaBeli),
          hargaJual: parseFloat(formData.hargaJual),
          kategori: formData.kategori,
          deskripsi: formData.deskripsi.trim()
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowEditDialog(false);
          resetForm();
          setRefreshTrigger(prev => prev + 1);
        }, 1500);
      } else {
        setError(result.message || 'Gagal mengubah jenis sampah');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string, nama: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus "${nama}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/sampah.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('✓ Jenis sampah berhasil dihapus!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Gagal menghapus: ' + result.message);
      }
    } catch (err) {
      console.error('Delete error:', err);
      alert('Gagal menghubungi server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A6B52]" />
          <Input
            placeholder="Cari jenis sampah..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="eco-input pl-10"
          />
        </div>
        <Button
          onClick={handleOpenAdd}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl"
        >
          <Plus className="w-4 h-4 mr-2" />
          Tambah Jenis
        </Button>
      </div>

      <div className="eco-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Jenis Sampah</th>
                <th>Harga Beli {role === 'pengurus' ? '(Nasabah)' : ''}</th>
                {role === 'pengurus' && <th>Harga Jual (Lapak)</th>}
                <th>Kategori</th>
                <th>Deskripsi</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredSampah.map((sampah) => (
                <tr key={sampah.id}>
                  <td className="font-medium text-[#0F3D2E]">{sampah.nama}</td>
                  <td className="font-semibold text-blue-600">
                    Rp {sampah.hargaBeli.toLocaleString('id-ID')}
                  </td>
                  {role === 'pengurus' && (
                    <td className="font-semibold text-green-600">
                      Rp {sampah.hargaJual.toLocaleString('id-ID')}
                    </td>
                  )}
                  <td>
                    <Badge variant="outline" className="capitalize">
                      {sampah.kategori}
                    </Badge>
                  </td>
                  <td className="max-w-xs truncate">{sampah.deskripsi}</td>
                  <td>
                    <div className="flex items-center gap-2">
                      <button 
                        onClick={() => handleOpenEdit(sampah)}
                        className="p-2 hover:bg-[#22C55E]/10 rounded-lg text-[#22C55E]"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => handleDelete(sampah.id, sampah.nama)}
                        className="p-2 hover:bg-red-50 rounded-lg text-red-500"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dialog Tambah */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Tambah Jenis Sampah</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                ✓ Jenis sampah berhasil ditambahkan!
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Nama Jenis Sampah</label>
              <Input 
                className="eco-input" 
                placeholder="Contoh: Kertas HVS"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Harga Beli (Rp)</label>
              <Input 
                className="eco-input" 
                type="number" 
                placeholder="Berapa kita bayar ke nasabah?"
                value={formData.hargaBeli}
                onChange={(e) => setFormData({...formData, hargaBeli: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Harga Jual / Lapak (Rp)</label>
              <Input 
                className="eco-input" 
                type="number" 
                placeholder="Berapa lapak bayar ke kita?"
                value={formData.hargaJual}
                onChange={(e) => setFormData({...formData, hargaJual: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Kategori</label>
              <Select value={formData.kategori} onValueChange={(value) => setFormData({...formData, kategori: value})}>
                <SelectTrigger className="eco-input">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organik">Organik</SelectItem>
                  <SelectItem value="anorganik">Anorganik</SelectItem>
                  <SelectItem value="B3">B3</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Deskripsi</label>
              <textarea 
                className="eco-input w-full h-20 resize-none" 
                placeholder="Deskripsi jenis sampah..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowAddDialog(false)} 
                className="flex-1 h-11"
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button 
                onClick={handleAdd} 
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white h-11 font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Jenis Sampah</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                ✓ Jenis sampah berhasil diubah!
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Nama Jenis Sampah</label>
              <Input 
                className="eco-input" 
                placeholder="Contoh: Kertas HVS"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Harga Beli (Rp)</label>
              <Input 
                className="eco-input" 
                type="number" 
                placeholder="Berapa kita bayar ke nasabah?"
                value={formData.hargaBeli}
                onChange={(e) => setFormData({...formData, hargaBeli: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Harga Jual / Lapak (Rp)</label>
              <Input 
                className="eco-input" 
                type="number" 
                placeholder="Berapa lapak bayar ke kita?"
                value={formData.hargaJual}
                onChange={(e) => setFormData({...formData, hargaJual: e.target.value})}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Kategori</label>
              <Select value={formData.kategori} onValueChange={(value) => setFormData({...formData, kategori: value})}>
                <SelectTrigger className="eco-input">
                  <SelectValue placeholder="Pilih kategori" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="organik">Organik</SelectItem>
                  <SelectItem value="anorganik">Anorganik</SelectItem>
                  <SelectItem value="B3">B3</SelectItem>
                  <SelectItem value="lainnya">Lainnya</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Deskripsi</label>
              <textarea 
                className="eco-input w-full h-20 resize-none" 
                placeholder="Deskripsi jenis sampah..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              />
            </div>
            <div className="flex gap-3 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowEditDialog(false)} 
                className="flex-1 h-11"
                disabled={isLoading}
              >
                Batal
              </Button>
              <Button 
                onClick={handleEdit} 
                className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white h-11 font-semibold rounded-xl"
                disabled={isLoading}
              >
                {isLoading ? 'Menyimpan...' : 'Simpan Perubahan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};


// Transaksi Setor Page
const TransaksiSetorPage: React.FC = () => {
  const { user, role, refreshUser } = useAuth();
  const [selectedNasabah, setSelectedNasabah] = useState('');
  const [selectedLapak, setSelectedLapak] = useState('kamibox1');
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [wasteTypes, setWasteTypes] = useState<JenisSampah[]>([]);
  const [pendingSetoran, setPendingSetoran] = useState<Transaksi[]>([]);
  const [items, setItems] = useState<{ id: string, sampahId: string, berat: string }[]>([
    { id: Math.random().toString(), sampahId: '', berat: '' }
  ]);

  const fetchPending = async () => {
    const res = await fetch(`${API_URL}/transaksi.php`);
    const data = await res.json();
    if (data.status === 'success') {
      setPendingSetoran(data.data.filter((t: any) => t.jenisTransaksi === 'setor' && t.status === 'pending'));
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/nasabah.php`)
      .then(res => res.json())
      .then(res => res.status === 'success' && setNasabahList(res.data));
    
    fetch(`${API_URL}/sampah.php`)
      .then(res => res.json())
      .then(res => res.status === 'success' && setWasteTypes(res.data));
    
    fetchPending();
  }, [user]);

  const handleProses = (trx: Transaksi) => {
    setSelectedNasabah(trx.nasabahId);
    setItems([{ 
      id: Math.random().toString(), 
      sampahId: trx.jenisSampahId || '', 
      berat: trx.berat?.toString() || '' 
    }]);
    // Scroll to form
    slipRef.current?.scrollIntoView({ behavior: 'smooth' });
    alert(`Memproses setoran ${trx.nasabahNama}. Silakan sesuaikan berat hasil timbangan sebelum cetak struk.`);
  };

  const handleApproveDirect = async (trxId: string) => {
    try {
      const resp = await fetch(`${API_URL}/transaksi.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trxId, status: 'success' })
      });
      const result = await resp.json();
      if (result.status === 'success') {
        alert('✅ Setoran berhasil diverifikasi!');
        fetchPending();
        // Refresh user data to sync saldo
        if (role === 'nasabah') {
          await refreshUser();
        }
      } else {
        alert('❌ Gagal verifikasi: ' + result.message);
      }
    } catch (err) {
      console.error('Approve error:', err);
      alert('❌ Gagal menghubungi server');
    }
  };

  const handleRejectDirect = async (trxId: string) => {
    if (!confirm('Apakah Anda yakin ingin menolak setoran ini?')) return;
    
    try {
      const resp = await fetch(`${API_URL}/transaksi.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: trxId, status: 'cancelled' })
      });
      const result = await resp.json();
      if (result.status === 'success') {
        alert('✅ Setoran berhasil ditolak!');
        fetchPending();
        // Refresh user data to sync saldo
        if (role === 'nasabah') {
          await refreshUser();
        }
      } else {
        alert('❌ Gagal menolak: ' + result.message);
      }
    } catch (err) {
      console.error('Reject error:', err);
      alert('❌ Gagal menghubungi server');
    }
  };

  const [showAddSampah, setShowAddSampah] = useState(false);
  const slipRef = useRef<HTMLDivElement>(null);

  const addItem = () => {
    setItems([...items, { id: Math.random().toString(), sampahId: '', berat: '' }]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter((item: any) => item.id !== id));

    }
  };

  const updateItem = (id: string, field: 'sampahId' | 'berat', value: string) => {
    setItems(items.map((item: any) => item.id === id ? { ...item, [field]: value } : item));

  };

  const calculateItemTotal = (item: { sampahId: string, berat: string }) => {
    const data = wasteTypes.find((s: JenisSampah) => s.id === item.sampahId);

    return data && item.berat ? parseFloat(item.berat) * data.hargaBeli : 0;
  };


  const total = items.reduce((sum: number, item: { sampahId: string, berat: string }) => sum + calculateItemTotal(item), 0);


  const handlePrint = () => {
    if (selectedNasabah && selectedLapak) {
      window.print();
    } else {
      alert('Mohon pilih nasabah dan lapak terlebih dahulu!');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!selectedNasabah) {
      alert('Mohon pilih nasabah terlebih dahulu!');
      return;
    }
    if (!selectedLapak) {
      alert('Mohon pilih lapak terlebih dahulu!');
      return;
    }
    if (items.some(item => !item.sampahId || !item.berat)) {
      alert('Mohon lengkapi semua barang (jenis dan berat)!');
      return;
    }

    // Submit each item as a transaction
    try {
      for (const item of items) {
        const wasteData = wasteTypes.find(w => w.id === item.sampahId);
        if (!wasteData) continue;

        const transactionData = {
          nasabahId: selectedNasabah,
          nasabahNama: nasabahList.find(n => n.id === selectedNasabah)?.nama || '',
          jenisTransaksi: 'setor',
          jenisSampahId: item.sampahId,
          jenisSampahNama: wasteData.nama,
          berat: parseFloat(item.berat),
          hargaPerKg: wasteData.hargaBeli,
          jumlah: parseFloat(item.berat) * wasteData.hargaBeli,
          tanggal: new Date().toISOString().split('T')[0],
          status: 'pending',
          lapakNama: selectedLapak,
          petugasId: user?.id || '',
          petugasNama: user?.nama || ''
        };

        const response = await fetch(`${API_URL}/transaksi.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(transactionData)
        });

        const result = await response.json();
        if (result.status !== 'success') {
          alert(`Gagal menyimpan transaksi untuk ${wasteData.nama}: ${result.message}`);
          return;
        }
      }

      alert('✓ Semua transaksi berhasil disimpan! Silakan cetak struk.');
      handlePrint();
      
      // Reset form
      setSelectedNasabah('');
      setItems([{ id: Math.random().toString(), sampahId: '', berat: '' }]);
      fetchPending();
    } catch (err) {
      console.error('Submit error:', err);
      alert('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-6 space-y-10 px-4">
      {/* Pending Setoran Section for Staff */}
      {(role === 'pengurus' || role === 'petugas') && pendingSetoran.length > 0 && (
        <div className="eco-card p-6 border-l-4 border-blue-500 bg-blue-50/30 backdrop-blur-xl">
           <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-black text-[#0F3D2E] flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg transform -rotate-3">
                  <Package className="w-6 h-6 text-blue-600" />
                </div>
                Antrean Setoran (Langsung)
              </h3>
              <Badge className="bg-blue-600">{pendingSetoran.length} Antrean</Badge>
           </div>
          
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingSetoran.map((s) => (
                <div key={s.id} className="p-5 bg-white rounded-3xl border border-blue-100 shadow-sm space-y-4 hover:shadow-md transition-all group">
                   <div className="flex justify-between items-start">
                      <div>
                         <p className="font-black text-[#0F3D2E] text-lg">{s.nasabahNama}</p>
                         <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 uppercase tracking-widest mt-1">
                            <Clock className="w-3 h-3" /> {s.tanggal}
                         </div>
                      </div>
                      <div className="text-right">
                         <p className="text-xs font-black text-gray-400 uppercase">Estimasi</p>
                         <p className="text-lg font-black text-blue-600">{s.berat} KG</p>
                      </div>
                   </div>
                   
                   <div className="bg-blue-50/50 p-3 rounded-2xl border border-blue-50">
                      <p className="text-[10px] font-bold text-blue-400 uppercase">Jenis Sampah</p>
                      <p className="text-sm font-black text-blue-800">{s.jenisSampahNama}</p>
                   </div>

                   <div className="flex gap-2 pt-2">
                      <Button 
                        onClick={() => handleProses(s)} 
                        className="flex-1 bg-[#0F3D2E] hover:bg-black h-11 rounded-xl font-bold flex items-center justify-center gap-2"
                      >
                         <Recycle className="w-4 h-4" /> Proses Penimbangan
                      </Button>
                      <Button 
                        onClick={() => handleApproveDirect(s.id)}
                        variant="outline" 
                        className="w-11 h-11 p-0 flex items-center justify-center rounded-xl border-green-200 text-green-600 hover:bg-green-50 shadow-sm"
                        title="Approve Langsung"
                      >
                         <CheckCircle className="w-5 h-5" />
                      </Button>
                      <Button 
                        onClick={() => handleRejectDirect(s.id)}
                        variant="outline" 
                        className="w-11 h-11 p-0 flex items-center justify-center rounded-xl border-red-200 text-red-600 hover:bg-red-50 shadow-sm"
                        title="Tolak Setoran"
                      >
                         <XCircle className="w-5 h-5" />
                      </Button>
                   </div>
                </div>
              ))}
           </div>
        </div>
      )}

      <div ref={slipRef} className="eco-card p-0 overflow-hidden shadow-2xl border-2 border-green-600/20 print-section bg-white/70 backdrop-blur-sm rounded-[3rem]">
        {/* Slip Header */}
        <div className="bg-gradient-to-r from-green-600 to-[#0F3D2E] p-8 text-white text-center relative overflow-hidden">
          <div className="absolute right-0 top-0 opacity-10 transform translate-x-1/4 -translate-y-1/4">
             <Recycle className="w-48 h-48" />
          </div>
          <h2 className="text-3xl font-black uppercase tracking-[0.2em]">Slip Setoran Sampah</h2>
          <p className="text-green-100/70 text-xs font-black mt-2 uppercase tracking-widest">Bank Sampah BPI Lestari • Kedamaian</p>
        </div>

        <div className="p-6 sm:p-10 space-y-8 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:24px_24px]">
          <div className="flex flex-col sm:flex-row justify-between items-center bg-gray-50/80 backdrop-blur-md p-5 rounded-3xl border border-white gap-4 shadow-inner">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-sm">
                 <Clock className="w-5 h-5 text-green-600" />
              </div>
              <span className="text-sm font-black text-[#0F3D2E] uppercase tracking-tighter">
                {new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
              </span>
            </div>
            <div className="flex gap-2 no-print">
              <Button
                type="button"
                onClick={() => setShowAddSampah(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-[10px] sm:text-xs font-black shadow-lg shadow-blue-600/20 px-5 h-11"
              >
                <Plus className="w-3 h-3 mr-1" />
                TAMBAH BARANG
              </Button>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nasabah (Penyetor)</label>
                  <Select value={selectedNasabah} onValueChange={setSelectedNasabah}>
                    <SelectTrigger className="eco-input border-2 border-gray-100 h-12 bg-white">
                      <SelectValue placeholder="Pilih nasabah" />
                    </SelectTrigger>
                    <SelectContent>
                      {nasabahList.map((nasabah) => (
                        <SelectItem key={nasabah.id} value={nasabah.id}>{nasabah.id} - {nasabah.nama}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Lapak / Kamibox (Tujuan)</label>
                <Select value={selectedLapak} onValueChange={setSelectedLapak}>
                  <SelectTrigger className="eco-input border-2 border-gray-100 h-12">
                    <SelectValue placeholder="Pilih unit lapak" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kamibox1">Kamibox Unit 1</SelectItem>
                    <SelectItem value="kamibox2">Kamibox Unit 2</SelectItem>
                    <SelectItem value="kamibox3">Kamibox Unit 3</SelectItem>
                    <SelectItem value="mandiri">Mandiri Bank Sampah</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center px-1 no-print">
                <label className="block text-xs font-bold text-green-700 uppercase">Daftar Barang</label>
                <button
                  type="button"
                  onClick={addItem}
                  className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors"
                >
                  <Plus className="w-4 h-4" /> Tambah Baris
                </button>
              </div>

              {items.map((item) => (
                <div key={item.id} className="flex flex-col sm:flex-row gap-4 p-4 bg-green-50 rounded-2xl border-2 border-green-100 relative group animate-in slide-in-from-left-4 duration-300 print:bg-white print:border-green-600 print:border-solid">
                  {items.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-2 -top-2 w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-sm border border-red-200 z-10 no-print"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                  <div className="flex-1">
                    <Select value={item.sampahId} onValueChange={(val) => updateItem(item.id, 'sampahId', val)}>
                      <SelectTrigger className="eco-input border-white bg-white h-12 shadow-sm">
                        <SelectValue placeholder="Pilih jenis sampah" />
                      </SelectTrigger>
                      <SelectContent>
                        {wasteTypes.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.nama} - Rp {s.hargaBeli.toLocaleString('id-ID')}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-full sm:w-32">
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.01"
                        value={item.berat}
                        onChange={(e) => updateItem(item.id, 'berat', e.target.value)}
                        className="eco-input border-white bg-white h-12 shadow-sm pr-10"
                        placeholder="0.00"
                        required
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-bold text-gray-400">KG</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="bg-gray-900 rounded-2xl p-6 text-white shadow-xl">
              <div className="flex justify-between items-center mb-4 opacity-70">
                <span className="text-xs font-bold uppercase tracking-widest text-green-400">Rincian Transaksi</span>
                <span className="font-mono text-lg">{items.length} Barang</span>
              </div>
              <div className="flex justify-between items-end border-t border-white/10 pt-4">
                <div>
                  <span className="text-xs font-bold uppercase text-gray-400">Total Yang Diterima Nasabah</span>
                  <p className="text-4xl font-bold mt-1 tracking-tight">Rp {total.toLocaleString('id-ID')}</p>
                </div>
                <div className="text-right no-print">
                  <div className="flex -space-x-2 justify-end mb-2">
                    {items.slice(0, 3).map((_, i) => (
                      <div key={i} className="w-8 h-8 rounded-full bg-green-500/20 border-2 border-white/10 flex items-center justify-center">
                        <Package className="w-4 h-4 text-green-500" />
                      </div>
                    ))}
                  </div>
                  <span className="text-[10px] uppercase font-bold text-white/40 tracking-widest">Transaksi Valid & Terverifikasi</span>
                </div>
              </div>
            </div>

            {/* Print Signatures */}
            <div className="hidden print:grid grid-cols-2 gap-12 mt-12 pt-12 border-t border-dashed border-gray-300">
              <div className="text-center space-y-16">
                <p className="text-xs font-bold uppercase text-gray-500">Nasabah (Penyetor)</p>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-bold text-[#0F3D2E]">{nasabahList.find(n => n.id === selectedNasabah)?.nama || '........................'}</p>
              </div>
              <div className="text-center space-y-16">
                <p className="text-xs font-bold uppercase text-gray-500">Petugas / Staff</p>
                <div className="border-b border-gray-400 w-32 mx-auto"></div>
                <p className="text-sm font-bold text-[#0F3D2E]">{user?.nama}</p>
              </div>
            </div>

            <Button
              type="submit"
              className="w-full bg-[#22C55E] hover:bg-black text-white py-10 text-2xl font-bold rounded-2xl shadow-2xl shadow-green-600/20 transition-all active:scale-95 no-print uppercase tracking-widest"
            >
              SIMPAN & CETAK STRUK
            </Button>
          </form>
        </div>
      </div>

      <Dialog open={showAddSampah} onOpenChange={setShowAddSampah}>
        <DialogContent className="rounded-3xl border-0 shadow-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0F3D2E]">Tambah Jenis Barang</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Nama Barang</label>
              <Input placeholder="Misal: Plastik HD Putih" className="eco-input h-12" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Harga Beli</label>
                <Input type="number" placeholder="Rp 0" className="eco-input h-12" />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-2">Harga Jual</label>
                <Input type="number" placeholder="Rp 0" className="eco-input h-12" />
              </div>
            </div>
            <Button onClick={() => setShowAddSampah(false)} className="w-full bg-[#0F3D2E] hover:bg-black text-white h-14 rounded-2xl font-bold mt-4 shadow-lg">SIMPAN BARANG BARU</Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// Saldo Nasabah Page (Riwayat Transaksi)
const SaldoNasabahPage: React.FC = () => {
  const { user, role } = useAuth();
  const [searchTerm, setSearchTerm] = useState('');
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [personalHistory, setPersonalHistory] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (role === 'nasabah') {
      fetch(`${API_URL}/transaksi.php?nasabahId=${user?.id}`)
        .then(res => res.json())
        .then(res => {
          if (res.status === 'success') setPersonalHistory(res.data);
          setLoading(false);
        });
    } else {
      fetch(`${API_URL}/nasabah.php`)
        .then(res => res.json())
        .then(res => {
          if (res.status === 'success') setNasabahList(res.data);
          setLoading(false);
        });
      // Also fetch all transactions for history
      fetch(`${API_URL}/transaksi.php`)
        .then(res => res.json())
        .then(res => {
          if (res.status === 'success') setPersonalHistory(res.data);
        });
    }
  }, [role, user]);

  const filteredNasabah = nasabahList.filter((n: User) =>
    n.nama.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [selectedTrx, setSelectedTrx] = useState<Transaksi | null>(null);

  if (loading) return <div className="text-center py-20 font-bold text-[#0F3D2E]">Memuat data transaksi...</div>;

  if (role === 'nasabah') {
    return (
      <div className="space-y-6 animate-in fade-in duration-500">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-black text-[#0F3D2E]">Riwayat Transaksi</h2>
            <p className="text-sm font-medium text-[#2A6B52]">Daftar aktivitas setoran dan penarikan Anda</p>
          </div>
          <div className="bg-white p-4 rounded-2xl shadow-sm border border-green-100 flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center text-green-600">
              <Wallet className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Saldo Aktif</p>
              <p className="text-lg font-black text-[#0F3D2E]">Rp {user?.saldo?.toLocaleString('id-ID')}</p>
            </div>
          </div>
        </div>

        <div className="eco-card overflow-hidden rounded-[2rem] border-none shadow-xl bg-white/80 backdrop-blur-md">
          <div className="overflow-x-auto custom-scrollbar">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/50">
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">ID & Tanggal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Informasi Sampah</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Berat (kg)</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Nominal</th>
                  <th className="px-6 py-5 text-[10px] font-black text-gray-400 uppercase tracking-widest border-b border-gray-100">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {personalHistory.length > 0 ? personalHistory.map((trx) => (
                  <tr 
                    key={trx.id} 
                    className="hover:bg-green-50/50 transition-all cursor-pointer group"
                    onClick={() => setSelectedTrx(trx)}
                  >
                    <td className="px-6 py-5">
                      <p className="font-black text-[#0F3D2E] leading-none mb-1 group-hover:text-green-600">{trx.id}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">{trx.tanggal}</p>
                    </td>
                    <td className="px-6 py-5">
                      <div className="flex items-center gap-3">
                         <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${trx.jenisTransaksi === 'setor' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                           {trx.jenisTransaksi === 'setor' ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                         </div>
                         <div>
                            <p className="font-black text-[#0F3D2E] text-sm leading-none mb-1 capitalize">{trx.jenisSampahNama || trx.jenisTransaksi}</p>
                            <p className="text-[10px] font-bold text-gray-400 uppercase">{trx.jenisTransaksi}</p>
                         </div>
                      </div>
                    </td>
                    <td className="px-6 py-5">
                      {trx.berat ? (
                        <p className="font-black text-[#2A6B52]">{parseFloat(trx.berat.toString()).toFixed(2)} kg</p>
                      ) : (
                        <p className="text-gray-300 font-bold">-</p>
                      )}
                    </td>
                    <td className="px-6 py-5">
                      <p className={`font-black ${trx.jenisTransaksi === 'setor' ? 'text-green-600' : 'text-red-600'}`}>
                        {trx.jenisTransaksi === 'setor' ? '+' : '-'} Rp {trx.jumlah?.toLocaleString('id-ID')}
                      </p>
                    </td>
                    <td className="px-6 py-5">
                       <Badge className={`${
                         trx.status === 'success' ? 'bg-green-500/10 text-green-600 border-green-500/20' : 
                         trx.status === 'pending' ? 'bg-amber-500/10 text-amber-600 border-amber-500/20' : 
                         'bg-red-500/10 text-red-600 border-red-500/20'
                       } border px-3 py-1 rounded-full font-black text-[10px] uppercase tracking-widest`}>
                         {trx.status}
                       </Badge>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-20 text-center text-gray-400 font-bold italic">Belum ada riwayat transaksi</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Transaction Modal */}
        <Dialog open={!!selectedTrx} onOpenChange={(open) => !open && setSelectedTrx(null)}>
          <DialogContent className="sm:max-w-md rounded-[2.5rem] p-0 border-none overflow-hidden shadow-2xl">
            {selectedTrx && (
              <>
                <div className={`p-8 pb-12 text-white relative overflow-hidden ${selectedTrx.jenisTransaksi === 'setor' ? 'bg-[#0F3D2E]' : 'bg-red-900'}`}>
                  <div className="absolute -right-8 -top-8 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
                  <DialogHeader className="relative z-10">
                    <p className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em] mb-2">Detail Transaksi</p>
                    <DialogTitle className="text-3xl font-black text-white leading-tight">
                      {selectedTrx.jenisTransaksi === 'setor' ? 'Setoran Sampah' : 'Penarikan Tunai'}
                    </DialogTitle>
                  </DialogHeader>
                </div>
                
                <div className="px-8 pb-8 -mt-6 relative z-20">
                  <div className="bg-white rounded-[2rem] p-6 shadow-xl border border-gray-100 space-y-6">
                    <div className="flex justify-between items-center pb-4 border-b border-gray-50">
                      <div>
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">ID Transaksi</p>
                        <p className="font-black text-[#0F3D2E]">{selectedTrx.id}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Tanggal</p>
                        <p className="font-black text-[#0F3D2E]">{selectedTrx.tanggal}</p>
                      </div>
                    </div>

                    <div className="space-y-4">
                      {selectedTrx.jenisTransaksi === 'setor' && (
                        <>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-500">Jenis Sampah</span>
                            <span className="font-black text-[#0F3D2E]">{selectedTrx.jenisSampahNama}</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-500">Berat</span>
                            <span className="font-black text-[#2A6B52]">{selectedTrx.berat} kg</span>
                          </div>
                          <div className="flex justify-between items-center text-sm">
                            <span className="font-bold text-gray-500">Harga/Kg</span>
                            <span className="font-black text-[#0F3D2E]">Rp {selectedTrx.hargaPerKg?.toLocaleString('id-ID')}</span>
                          </div>
                        </>
                      )}
                      
                      <div className="flex justify-between items-center pt-4 border-t border-gray-50">
                        <span className="font-black text-[#0F3D2E] uppercase text-xs tracking-widest">Total Nominal</span>
                        <span className={`text-2xl font-black ${selectedTrx.jenisTransaksi === 'setor' ? 'text-green-600' : 'text-red-600'}`}>
                          Rp {selectedTrx.jumlah?.toLocaleString('id-ID')}
                        </span>
                      </div>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-2xl">
                       <p className="text-[10px] font-black text-gray-400 uppercase mb-1">Keterangan</p>
                       <p className="text-xs font-bold text-[#2A6B52] italic">"{selectedTrx.keterangan || 'Tanpa keterangan'}"</p>
                    </div>

                    <div className={`p-4 rounded-2xl border ${selectedTrx.status === 'success' ? 'bg-green-50 border-green-100 text-green-700' : 'bg-blue-50 border-blue-100 text-blue-700'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        <ShieldCheck className={`w-5 h-5 ${selectedTrx.status === 'success' ? 'text-green-600' : 'text-blue-600'}`} />
                        <div>
                          <p className={`text-[10px] font-black uppercase leading-none mb-1 ${selectedTrx.status === 'success' ? 'text-green-400' : 'text-blue-400'}`}>Status Verifikasi</p>
                          <p className="text-xs font-black uppercase tracking-widest">{selectedTrx.status}</p>
                        </div>
                      </div>
                      
                      {(selectedTrx.processed_by || selectedTrx.processed_at) && (
                        <div className="pt-3 border-t border-current/10 space-y-1">
                          {selectedTrx.processed_by && (
                            <p className="text-[10px] font-bold">Diverifikasi oleh: <span className="font-black underline">{selectedTrx.processed_by}</span></p>
                          )}
                          {selectedTrx.processed_at && (
                            <p className="text-[10px] font-bold opacity-70 italic">Pada: {selectedTrx.processed_at}</p>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Button 
                    onClick={() => setSelectedTrx(null)}
                    className="w-full mt-6 bg-[#0F3D2E] hover:bg-black text-white h-14 rounded-2xl font-bold shadow-lg shadow-green-900/20"
                  >
                    TUTUP DETAIL
                  </Button>
                </div>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A6B52]" />
        <Input
          placeholder="Cari nasabah..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="eco-input pl-10"
        />
      </div>

      <div className="eco-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>ID Nasabah</th>
                <th>Nama Nasabah</th>
                <th>Total Setoran</th>
                <th>Total Saldo</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {filteredNasabah.map((nasabah: User) => (
                <tr key={nasabah.id}>
                  <td className="font-medium text-[#0F3D2E]">{nasabah.id}</td>
                  <td>{nasabah.nama}</td>
                  <td>Rp {nasabah.totalSetoran.toLocaleString('id-ID')}</td>
                  <td className="font-bold text-[#22C55E]">
                    Rp {nasabah.saldo.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div className="flex gap-2">
                       <button className="p-2 hover:bg-green-50 rounded-lg text-green-600 flex items-center gap-1 text-xs font-bold border border-green-100">
                        <Plus className="w-3 h-3" /> Simpan
                      </button>
                      <button className="p-2 hover:bg-amber-50 rounded-lg text-amber-600 flex items-center gap-1 text-xs font-bold border border-amber-100">
                        <Banknote className="w-3 h-3" /> Tarik
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const PenarikanPage: React.FC = () => {
  const { user, role } = useAuth();
  const [selectedNasabahId, setSelectedNasabahId] = useState('');
  const [jumlah, setJumlah] = useState('');
  const [nasabahList, setNasabahList] = useState<any[]>([]);
  const [pendingWithdrawals, setPendingWithdrawals] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tujuanInfo, setTujuanInfo] = useState({
    rekening: '',
    nomor: '',
    nama: ''
  });
  
  const withdrawalQuickAmounts = [5000, 10000, 50000, 100000, 200000, 500000];

  const fetchPending = async () => {
    const res = await fetch(`${API_URL}/transaksi.php`);
    const data = await res.json();
    if (data.status === 'success') {
      setPendingWithdrawals(data.data.filter((t: any) => t.jenisTransaksi === 'tarik' && t.status === 'pending'));
    }
  };

  useEffect(() => {
    fetch(`${API_URL}/nasabah.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          const list = res.data.map((n: any) => ({ ...n, saldo: Number(n.saldo) }));
          setNasabahList(list);
          if (role === 'nasabah' && user) {
             setSelectedNasabahId(user.id);
          }
        }
      });
    fetchPending().finally(() => setLoading(false));
  }, [role, user]);

  useEffect(() => {
    const sn = nasabahList.find(n => n.id === selectedNasabahId);
    if (sn) {
      setTujuanInfo({
        rekening: sn.rekening_bank || '',
        nomor: sn.nomor_rekening || '',
        nama: sn.nama_rekening || sn.nama || ''
      });
    }
  }, [selectedNasabahId, nasabahList]);

  const selectedNasabah = nasabahList.find(n => n.id === selectedNasabahId);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedNasabah) return alert('Pilih nasabah!');
    const amount = parseFloat(jumlah);
    if (amount > selectedNasabah.saldo) return alert(`Saldo tidak mencukupi! Maksimal Rp ${selectedNasabah.saldo.toLocaleString('id-ID')}`);
    if (amount < 5000) return alert('Minimal penarikan Rp 5.000!');

    try {
      const resp = await fetch(`${API_URL}/transaksi.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nasabahId: selectedNasabah.id,
          nasabahNama: selectedNasabah.nama,
          jenisTransaksi: 'tarik',
          jumlah: amount,
          status: 'pending',
          keterangan: role === 'nasabah' ? 'Penarikan mandiri oleh nasabah' : 'Penarikan via petugas',
          rekening_tujuan: tujuanInfo.rekening,
          nomor_tujuan: tujuanInfo.nomor,
          nama_tujuan: tujuanInfo.nama
        })
      });
      const res = await resp.json();
      if (res.status === 'success') {
        setIsSuccess(true);
        setJumlah('');
        setTimeout(() => setIsSuccess(false), 5000);
        fetchPending();
      }
    } catch (err) {
      alert('Gagal sistem');
    }
  };

  const handleAction = async (id: string, status: 'success' | 'rejected') => {
    try {
      const resp = await fetch(`${API_URL}/transaksi.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status, processed_by: user?.nama })
      });
      if ((await resp.json()).status === 'success') {
        alert(status === 'success' ? 'Berhasil disetujui! Saldo nasabah telah diperbarui.' : 'Ditolak!');
        fetchPending();
        // Refresh nasabah list for updated saldo
        fetch(`${API_URL}/nasabah.php`).then(res => res.json()).then(res => {
          if (res.status === 'success') setNasabahList(res.data.map((n: any) => ({...n, saldo: Number(n.saldo)})));
        });
      }
    } catch { alert('Gagal memproses'); }
  };

  if (loading) return <div className="text-center py-20 font-bold text-[#0F3D2E] animate-pulse italic">Menyiapkan Brankas...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 sm:space-y-10 animate-in slide-in-from-bottom duration-700 px-4 sm:px-0 pb-10">
      
      {/* Pengurus Approval Section */}
      {role === 'pengurus' && pendingWithdrawals.length > 0 && (
        <div className="eco-card p-6 border-l-4 border-amber-500 bg-amber-50/50 backdrop-blur-xl mb-10">
          <h3 className="text-xl font-black text-[#0F3D2E] mb-6 flex items-center gap-3">
            <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center shadow-lg transform rotate-3">
               <Clock className="w-6 h-6 text-amber-600" />
            </div>
            Persetujuan Penarikan
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingWithdrawals.map((w) => (
              <div key={w.id} className="p-5 bg-white rounded-[1.5rem] border border-amber-100 shadow-sm space-y-4 hover:scale-[1.02] transition-all">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-black text-[#0F3D2E] text-lg leading-tight">{w.nasabahNama}</p>
                    <p className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">{w.tanggal}</p>
                    {(w.rekening_tujuan || w.rekening_bank) ? (
                      <div className="mt-2 p-3 bg-blue-50/50 rounded-xl border border-blue-100 group/item relative">
                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-tighter mb-1">Tujuan Transfer ({w.rekening_tujuan || w.rekening_bank}):</p>
                        <div className="flex items-center justify-between gap-2">
                          <p className="text-sm font-black text-[#0F3D2E] leading-tight">{w.nomor_tujuan || w.nomor_rekening}</p>
                          <div 
                            onClick={() => { navigator.clipboard.writeText(w.nomor_tujuan || w.nomor_rekening || ''); alert('Copied!'); }}
                            className="text-[8px] font-bold text-blue-600 bg-white px-2 py-0.5 rounded-full shadow-sm cursor-pointer hover:bg-blue-600 hover:text-white transition-all">SALIN</div>
                        </div>
                        <p className="text-[10px] font-bold text-gray-500 italic mt-1 leading-tight">a.n {w.nama_tujuan || w.nama_rekening || w.nasabahNama}</p>
                      </div>
                    ) : (
                      <div className="mt-2 p-3 bg-red-50 rounded-xl border border-red-100">
                        <p className="text-[10px] font-black text-red-500 uppercase leading-none">⚠️ Rekening Belum Diisi</p>
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black text-[#0F3D2E]">Rp {w.jumlah.toLocaleString('id-ID')}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button onClick={() => handleAction(w.id, 'success')} className="flex-1 bg-green-600 hover:bg-green-700 h-11 rounded-xl font-bold">Setujui</Button>
                  <Button onClick={() => handleAction(w.id, 'rejected')} variant="outline" className="flex-1 text-red-600 border-red-200 h-11 rounded-xl font-bold hover:bg-red-50">Tolak</Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main Withdrawal UI */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Balance Card Container */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-8 sm:p-10 bg-gradient-to-br from-[#0F3D2E] via-[#1a5d4a] to-[#22C55E] rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden group min-h-[220px] flex flex-col justify-between">
            <div className="absolute right-0 bottom-0 opacity-10 transform translate-x-4 translate-y-4 group-hover:scale-125 transition-all duration-700">
               <Wallet className="w-64 h-64 text-white" />
            </div>
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.1),transparent)]" />
            
            <div className="relative z-10">
              <div className="flex justify-between items-start">
                <div>
                   <p className="text-[10px] font-black text-green-200/60 uppercase tracking-[0.2em] mb-1">Tabungan Bank Sampah</p>
                   {selectedNasabah ? (
                      <h4 className="text-xl font-black">{selectedNasabah.nama}</h4>
                   ) : <h4 className="text-xl font-black italic opacity-50">Nasabah Belum Dipilih</h4>}
                </div>
                <div className="w-12 h-8 bg-white/20 backdrop-blur-md rounded-lg flex items-center justify-center border border-white/10">
                   <div className="w-6 h-6 bg-amber-400 rounded-full opacity-80 shadow-inner" />
                </div>
              </div>
            </div>

            <div className="relative z-10 mt-10">
              <p className="text-xs font-bold text-green-200 uppercase tracking-widest mb-1">Total Saldo Tersedia</p>
              <h3 className="text-4xl sm:text-5xl font-black tracking-tight">
                Rp {selectedNasabah ? selectedNasabah.saldo.toLocaleString('id-ID') : '0'}
              </h3>
            </div>
          </div>

          <div className="bg-amber-50 p-6 rounded-[2rem] border border-amber-100/50 space-y-3">
             <div className="flex items-center gap-3">
                <Info className="w-5 h-5 text-amber-600" />
                <p className="text-sm font-bold text-amber-800">Kebijakan Penarikan</p>
             </div>
             <ul className="text-xs text-amber-700/70 space-y-2 font-medium">
                <li>• Minimal penarikan saldo adalah Rp 5.000</li>
                <li>• Penarikan akan diproses maksimal 1x24 jam</li>
                <li>• Status penarikan dapat dilihat di riwayat transaksi</li>
             </ul>
          </div>
        </div>

        {/* Withdrawal Form */}
        <div className="lg:col-span-7 bg-white/40 backdrop-blur-xl p-8 sm:p-10 rounded-[3rem] border border-white shadow-xl">
          <div className="flex items-center gap-4 mb-8">
             <div className="w-14 h-14 bg-blue-100 rounded-[1.5rem] flex items-center justify-center shadow-inner">
                {isSuccess ? <CheckCircle className="w-7 h-7 text-green-600 animate-bounce" /> : <Banknote className="w-7 h-7 text-blue-600" />}
             </div>
             <div>
                <h2 className="text-2xl font-black text-[#0F3D2E]">{isSuccess ? 'Berhasil Terkirim!' : 'Ajukan Penarikan'}</h2>
                <p className="text-sm font-bold text-blue-600/60 uppercase tracking-widest">{isSuccess ? 'Silakan Tunggu Konfirmasi' : 'Input Nominal'}</p>
             </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
             {role === 'pengurus' && (
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Pilih Nasabah</label>
                  <Select value={selectedNasabahId} onValueChange={setSelectedNasabahId}>
                    <SelectTrigger className="eco-input h-14 rounded-2xl bg-white">
                       <SelectValue placeholder="Klik untuk mencari nasabah" />
                    </SelectTrigger>
                    <SelectContent className="rounded-2xl border-none shadow-2xl overflow-y-auto max-h-[300px]">
                       {nasabahList.map(n => (
                          <SelectItem key={n.id} value={n.id} className="rounded-xl">{n.nama} (ID: {n.id})</SelectItem>
                       ))}
                    </SelectContent>
                  </Select>
                </div>
             )}

             <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-2">Jumlah Yang Ingin Ditarik</label>
                  <div className="relative group">
                    <Input
                      type="number"
                      placeholder="0"
                      value={jumlah}
                      onChange={(e) => setJumlah(e.target.value)}
                      className="eco-input h-20 rounded-[1.8rem] text-3xl font-black pl-20 focus:ring-4 focus:ring-blue-100 transition-all border-none bg-white shadow-sm"
                      required
                    />
                    <span className="absolute left-8 top-1/2 -translate-y-1/2 text-2xl font-black text-gray-300">Rp</span>
                  </div>
                </div>

                <div className="pt-6 border-t border-[#0F3D2E]/10 space-y-4">
                  <h3 className="text-sm font-black text-[#0F3D2E] uppercase tracking-widest">Tujuan Pengiriman Uang</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Bank / E-Wallet</label>
                      <Input 
                        placeholder="BCA, Dana, dll" 
                        value={tujuanInfo.rekening}
                        onChange={(e) => setTujuanInfo({...tujuanInfo, rekening: e.target.value})}
                        className="eco-input rounded-xl"
                        required
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Nomor Rekening / HP</label>
                      <Input 
                        placeholder="Nomor akun" 
                        value={tujuanInfo.nomor}
                        onChange={(e) => setTujuanInfo({...tujuanInfo, nomor: e.target.value})}
                        className="eco-input rounded-xl"
                        required
                      />
                    </div>
                    <div className="sm:col-span-2 space-y-1">
                      <label className="text-[10px] font-bold text-gray-400 uppercase">Nama Penerima (Atas Nama)</label>
                      <Input 
                        placeholder="Nama lengkap di akun" 
                        value={tujuanInfo.nama}
                        onChange={(e) => setTujuanInfo({...tujuanInfo, nama: e.target.value})}
                        className="eco-input rounded-xl"
                        required
                      />
                      <p className="text-[9px] text-gray-400 italic">*Secara otomatis terisi dari profil, namun bisa Anda sesuaikan jika ingin ke rekening lain.</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                   {withdrawalQuickAmounts.map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setJumlah(amt.toString())}
                        className={`py-3 rounded-2xl font-bold text-xs transition-all border-2 ${
                          jumlah === amt.toString() 
                          ? 'bg-[#0F3D2E] text-white border-[#0F3D2E] scale-95 shadow-lg' 
                          : 'bg-white/50 text-gray-500 border-transparent hover:border-gray-200'
                        }`}
                      >
                         {amt >= 1000 ? (amt/1000) + 'K' : amt}
                      </button>
                   ))}
                </div>
             </div>

             <Button 
                type="submit"
                disabled={!selectedNasabah || !jumlah || parseFloat(jumlah) < 5000}
                className="w-full bg-[#0F3D2E] hover:bg-black text-white h-16 sm:h-20 rounded-[2rem] font-bold text-lg sm:text-xl shadow-2xl shadow-green-900/40 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-4"
             >
                <ShieldCheck className="w-6 h-6" />
                KONFIRMASI PENARIKAN
             </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// Berita Page
const BeritaPage: React.FC = () => {
  const { user } = useAuth();
  const [beritaList, setBeritaList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [formData, setFormData] = useState({
    judul: '',
    deskripsi: '',
    kategori: 'kegiatan',
    gambar: '',
    tanggal: new Date().toISOString().split('T')[0]
  });

  useEffect(() => {
    fetch(`${API_URL}/berita.php`)
      .then(res => res.json())
      .then(res => res.status === 'success' && setBeritaList(res.data));
  }, [user, refreshTrigger]);

  const resetForm = () => {
    setFormData({
      judul: '',
      deskripsi: '',
      kategori: 'kegiatan',
      gambar: '',
      tanggal: new Date().toISOString().split('T')[0]
    });
    setError(null);
    setSuccess(false);
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    setShowAddDialog(true);
  };

  const handleOpenEdit = (berita: any) => {
    setFormData({
      judul: berita.judul,
      deskripsi: berita.deskripsi,
      kategori: berita.kategori,
      gambar: berita.gambar || '',
      tanggal: berita.tanggal
    });
    setEditingId(berita.id);
    setError(null);
    setSuccess(false);
    setShowEditDialog(true);
  };

  const validateForm = () => {
    if (!formData.judul.trim()) {
      setError('Judul berita tidak boleh kosong!');
      return false;
    }
    if (!formData.deskripsi.trim()) {
      setError('Deskripsi tidak boleh kosong!');
      return false;
    }
    if (!formData.kategori.trim()) {
      setError('Kategori harus dipilih!');
      return false;
    }
    return true;
  };

  const handleAdd = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/berita.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          judul: formData.judul.trim(),
          deskripsi: formData.deskripsi.trim(),
          kategori: formData.kategori,
          gambar: formData.gambar || '/ill_news_1.jpg',
          tanggal: formData.tanggal
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowAddDialog(false);
          resetForm();
          setRefreshTrigger(prev => prev + 1);
        }, 1500);
      } else {
        setError(result.message || 'Gagal menambah berita');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = async () => {
    setError(null);
    setSuccess(false);

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/berita.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingId,
          judul: formData.judul.trim(),
          deskripsi: formData.deskripsi.trim(),
          kategori: formData.kategori,
          gambar: formData.gambar || '/ill_news_1.jpg',
          tanggal: formData.tanggal
        })
      });

      const result = await response.json();

      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowEditDialog(false);
          resetForm();
          setRefreshTrigger(prev => prev + 1);
        }, 1500);
      } else {
        setError(result.message || 'Gagal mengubah berita');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteBerita = async (id: string, judul: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus berita "${judul}"?`)) return;

    try {
      const response = await fetch(`${API_URL}/berita.php`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });

      const result = await response.json();

      if (result.status === 'success') {
        alert('✓ Berita berhasil dihapus!');
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Gagal menghapus: ' + result.message);
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-end">
        <Button onClick={handleOpenAdd} className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl">
          <Plus className="w-4 h-4 mr-2" />
          Tambah Berita
        </Button>
      </div>

      {/* Dialog Tambah Berita */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Tambah Berita & Kegiatan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                ✓ Berita berhasil ditambahkan!
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Judul</label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="eco-input"
                placeholder="Judul berita"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="eco-input w-full h-32 resize-none"
                placeholder="Deskripsi berita"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Kategori</label>
                <Select value={formData.kategori} onValueChange={(val) => setFormData({ ...formData, kategori: val })}>
                  <SelectTrigger className="eco-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kegiatan">Kegiatan</SelectItem>
                    <SelectItem value="edukasi">Edukasi</SelectItem>
                    <SelectItem value="pengumuman">Pengumuman</SelectItem>
                    <SelectItem value="pencapaian">Pencapaian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Tanggal</label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="eco-input"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowAddDialog(false)} className="flex-1" disabled={isLoading}>
                Batal
              </Button>
              <Button type="button" onClick={handleAdd} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Dialog Edit Berita */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Berita & Kegiatan</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            {error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 text-red-700 text-sm">
                {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border border-green-200 rounded-lg p-3 text-green-700 text-sm">
                ✓ Berita berhasil diubah!
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Judul</label>
              <Input
                value={formData.judul}
                onChange={(e) => setFormData({ ...formData, judul: e.target.value })}
                className="eco-input"
                placeholder="Judul berita"
                disabled={isLoading}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Deskripsi</label>
              <textarea
                value={formData.deskripsi}
                onChange={(e) => setFormData({ ...formData, deskripsi: e.target.value })}
                className="eco-input w-full h-32 resize-none"
                placeholder="Deskripsi berita"
                disabled={isLoading}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Kategori</label>
                <Select value={formData.kategori} onValueChange={(val) => setFormData({ ...formData, kategori: val })}>
                  <SelectTrigger className="eco-input">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="kegiatan">Kegiatan</SelectItem>
                    <SelectItem value="edukasi">Edukasi</SelectItem>
                    <SelectItem value="pengumuman">Pengumuman</SelectItem>
                    <SelectItem value="pencapaian">Pencapaian</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[#0F3D2E] mb-1">Tanggal</label>
                <Input
                  type="date"
                  value={formData.tanggal}
                  onChange={(e) => setFormData({ ...formData, tanggal: e.target.value })}
                  className="eco-input"
                  disabled={isLoading}
                />
              </div>
            </div>
            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} className="flex-1" disabled={isLoading}>
                Batal
              </Button>
              <Button type="button" onClick={handleEdit} className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white" disabled={isLoading}>
                {isLoading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {beritaList.map((berita: any) => (
          <div key={berita.id} className="eco-card overflow-hidden group">
            <div className="h-48 overflow-hidden">
              <img
                src={berita.gambar}
                alt={berita.judul}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              />
            </div>
            <div className="p-5">
              <div className="flex items-center gap-2 mb-2">
                <Badge variant="outline" className="capitalize">{berita.kategori}</Badge>
                <span className="text-xs text-[#2A6B52]">{berita.tanggal}</span>
              </div>
              <h3 className="font-bold text-[#0F3D2E] mb-2">{berita.judul}</h3>
              <p className="text-sm text-[#2A6B52] line-clamp-2">
                {berita.deskripsi.length > 150 
                  ? berita.deskripsi.substring(0, 150) + '...' 
                  : berita.deskripsi}
              </p>
              <div className="flex gap-2 mt-4">
                <button 
                  onClick={() => handleOpenEdit(berita)}
                  className="flex-1 py-2 text-sm text-[#22C55E] hover:bg-[#22C55E]/10 rounded-lg transition-colors font-medium"
                >
                  Edit
                </button>
                <button 
                  onClick={() => handleDeleteBerita(berita.id, berita.judul)}
                  className="flex-1 py-2 text-sm text-red-500 hover:bg-red-50 rounded-lg transition-colors font-medium"
                >
                  Hapus
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Laporan Page
const LaporanPage: React.FC = () => {
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [transactions, setTransactions] = useState<Transaksi[]>([]);
  const [loading, setLoading] = useState(true);

  const { user } = useAuth();
  useEffect(() => {
    fetch(`${API_URL}/transaksi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setTransactions(res.data);
      })
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="text-center py-20 font-bold text-[#0F3D2E] animate-pulse italic">Memuat Laporan...</div>;

  const filteredTransaksi = transactions.filter(t =>
    filterStatus === 'all' || t.status === filterStatus
  );

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="eco-input w-full sm:w-48">
            <SelectValue placeholder="Semua Laporan" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Laporan</SelectItem>
            <SelectItem value="penimbangan">Laporan Penimbangan</SelectItem>
            <SelectItem value="penjualan">Laporan Penjualan (Lapak)</SelectItem>
          </SelectContent>
        </Select>
        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export Excel
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="eco-card p-5">
          <p className="text-sm text-[#2A6B52]">Rekap Harga Beli (Nasabah)</p>
          <p className="text-xl font-bold text-blue-600">
            Rp {transactions.filter(t => t.jenisTransaksi === 'setor').reduce((acc, t) => acc + t.jumlah, 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="eco-card p-5">
          <p className="text-sm text-[#2A6B52]">Rekap Harga Jual (Lapak)</p>
          <p className="text-xl font-bold text-green-600">
            Rp {transactions.filter(t => t.jenisTransaksi === 'setor').reduce((acc, t) => acc + (t.berat || 0) * (t.hargaJualPerKg || 0), 0).toLocaleString('id-ID')}
          </p>
        </div>
        <div className="eco-card p-5">
          <p className="text-sm text-[#2A6B52]">Total Kg Sampah</p>
          <p className="text-xl font-bold text-[#0F3D2E]">
            {transactions.filter(t => t.jenisTransaksi === 'setor').reduce((acc, t) => acc + (t.berat || 0), 0).toFixed(2)} kg
          </p>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="eco-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Nama Nasabah</th>
                <th>Jenis Transaksi</th>
                <th>Jumlah</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredTransaksi.map((trx) => (
                <tr key={trx.id}>
                  <td>{trx.tanggal}</td>
                  <td className="font-medium text-[#0F3D2E]">{trx.nasabahNama}</td>
                  <td>
                    <Badge className={trx.jenisTransaksi === 'setor' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}>
                      {trx.jenisTransaksi === 'setor' ? 'Setor' : 'Tarik'}
                    </Badge>
                  </td>
                  <td className="font-semibold">
                    Rp {trx.jumlah.toLocaleString('id-ID')}
                  </td>
                  <td>
                    <div className="flex items-center gap-1">
                      {trx.status === 'success' && <CheckCircle className="w-4 h-4 text-green-500" />}
                      {trx.status === 'pending' && <Clock className="w-4 h-4 text-amber-500" />}
                      {trx.status === 'cancelled' && <XCircle className="w-4 h-4 text-red-500" />}
                      <span className={`text-sm capitalize ${trx.status === 'success' ? 'text-green-600' :
                        trx.status === 'pending' ? 'text-amber-600' : 'text-red-600'
                        }`}>
                        {trx.status}
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};



// Profil Page - Modern Tab-Based Design
const ProfilPage: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('ringkasan');
  const [recentTransactions, setRecentTransactions] = useState<Transaksi[]>([]);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [formData, setFormData] = useState({
    nama: user?.nama || '',
    telepon: user?.telepon || '',
    alamat: user?.alamat || '',
    rekening_bank: user?.rekening_bank || '',
    nomor_rekening: user?.nomor_rekening || '',
    nama_rekening: user?.nama_rekening || '',
  });

  useEffect(() => {
    // Fetch transactions untuk menampilkan penimbangan pertama
    if (user?.id) {
      fetch(`${API_URL}/transaksi.php?nasabahId=${user.id}`)
        .then(res => res.json())
        .then(res => res.status === 'success' && setRecentTransactions(res.data));
    }
  }, [user]);

  // Ambil data penimbangan pertama dari transaksi setor paling awal
  const penimbanganPertama = recentTransactions
    .filter(t => t.jenisTransaksi === 'setor')
    .sort((a, b) => new Date(a.tanggal).getTime() - new Date(b.tanggal).getTime())[0];

  const handleEditData = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/nasabah.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: user?.id, ...formData })
      });
      const res = await response.json();
      if (res.status === 'success') {
        updateUser(formData);
        alert('Data berhasil diperbaharui!');
      } else {
        alert('Gagal update: ' + res.message);
      }
    } catch (err) {
      alert('Gagal sistem');
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('Password baru tidak cocok!');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      alert('Password minimal 6 karakter!');
      return;
    }

    try {
      const response = await fetch(`${API_URL}/nasabah.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: user?.id,
          oldPassword: passwordForm.oldPassword,
          newPassword: passwordForm.newPassword
        })
      });
      const res = await response.json();
      if (res.status === 'success') {
        alert('Password berhasil diubah!');
        setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordDialog(false);
      } else {
        alert('Gagal ubah password: ' + res.message);
      }
    } catch (err) {
      alert('Gagal sistem');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Profile Card */}
      <div className="relative overflow-hidden rounded-3xl shadow-xl">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E] via-[#1a5d4a] to-[#0F3D2E]" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-72 h-72 bg-[#22C55E]/10 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl" />
        
        <div className="relative p-10 text-white">
          <div className="flex items-center gap-8">
            <div className="w-32 h-32 bg-white/20 rounded-3xl flex items-center justify-center text-5xl font-black backdrop-blur-sm border border-white/30">
              {user?.nama?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1">
              <h1 className="text-4xl font-black mb-2">{user?.nama}</h1>
              <p className="text-white/80 text-lg font-semibold mb-1">Anggota Bank Sampah</p>
              <p className="text-white/60 text-sm">{user?.email}</p>
              <div className="mt-4 flex gap-4">
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-white/60 text-xs uppercase tracking-wider">Saldo</p>
                  <p className="text-white font-bold text-lg">Rp {(user?.saldo || 0).toLocaleString('id-ID')}</p>
                </div>
                <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-2 border border-white/20">
                  <p className="text-white/60 text-xs uppercase tracking-wider">Total Setoran</p>
                  <p className="text-white font-bold text-lg">{(user?.totalSetoran || 0).toLocaleString('id-ID')} kg</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="space-y-6">
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          <button
            onClick={() => setActiveTab('ringkasan')}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'ringkasan'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            📊 Ringkasan
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'edit'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            ✏️ Edit Data
          </button>
          <button
            onClick={() => setActiveTab('keamanan')}
            className={`px-6 py-3 font-bold text-sm whitespace-nowrap transition-all border-b-2 ${
              activeTab === 'keamanan'
                ? 'border-[#22C55E] text-[#22C55E]'
                : 'border-transparent text-gray-600 hover:text-gray-900'
            }`}
          >
            🔒 Keamanan
          </button>
        </div>

        {/* Tab: Ringkasan */}
        {activeTab === 'ringkasan' && (
          <div className="space-y-6">
            {/* Penimbangan Pertama */}
            {penimbanganPertama && (
            <div className="eco-card p-8 bg-gradient-to-br from-blue-50 to-blue-25 border-2 border-blue-200 rounded-3xl shadow-lg">
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-black text-[#0F3D2E] text-2xl">Penimbangan Pertama</h3>
                <div className="w-14 h-14 bg-blue-100 rounded-2xl flex items-center justify-center text-blue-600">
                  <Scale className="w-7 h-7" />
                </div>
              </div>
              <div className="space-y-4">
                <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
                  <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Jenis Sampah</p>
                  <p className="font-bold text-[#0F3D2E] text-lg">{penimbanganPertama.jenisSampahNama}</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Berat</p>
                    <p className="font-bold text-[#0F3D2E] text-2xl">{typeof penimbanganPertama.berat === 'number' ? penimbanganPertama.berat.toFixed(2) : penimbanganPertama.berat} <span className="text-sm">kg</span></p>
                  </div>
                  <div className="bg-white rounded-2xl p-4 border-2 border-blue-100">
                    <p className="text-xs font-bold text-gray-400 uppercase mb-2 tracking-wider">Tanggal</p>
                    <p className="font-bold text-[#0F3D2E]">{penimbanganPertama.tanggal}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Informasi Pribadi - Read Only */}
          <div className="eco-card p-8 rounded-3xl shadow-lg border-l-4 border-l-[#22C55E]">
            <h3 className="text-2xl font-black text-[#0F3D2E] mb-6 flex items-center gap-3">
              <div className="w-12 h-12 bg-[#22C55E]/20 rounded-2xl flex items-center justify-center">
                <UserCircle className="w-6 h-6 text-[#22C55E]" />
              </div>
              Informasi Pribadi
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nama Lengkap</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.nama}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Email</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.email}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nomor Telepon</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.telepon || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Alamat</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.alamat || '-'}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Data Penarikan - Read Only */}
          <div className="eco-card p-8 rounded-3xl shadow-lg border-l-4 border-l-amber-500">
            <h3 className="text-2xl font-black text-[#0F3D2E] mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                <Banknote className="w-6 h-6 text-amber-600" />
              </div>
              Data Penarikan
            </h3>
            <p className="text-sm text-gray-600 mb-6 italic">Data ini digunakan untuk proses penarikan saldo Anda</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Bank / E-Wallet</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.rekening_bank || '-'}</p>
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Nomor Rekening / HP</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.nomor_rekening || '-'}</p>
                </div>
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs font-bold text-gray-500 mb-2 uppercase tracking-wider">Atas Nama</label>
                <div className="bg-gray-50 rounded-2xl p-4 border-2 border-gray-200">
                  <p className="font-bold text-[#0F3D2E] text-lg">{user?.nama_rekening || '-'}</p>
                </div>
              </div>
            </div>
          </div>
          </div>
        )}

        {/* Tab: Edit Data */}
        {activeTab === 'edit' && (
          <form onSubmit={handleEditData} className="space-y-6">
            {/* Personal Information */}
            <div className="eco-card p-8 rounded-3xl shadow-lg border-l-4 border-l-[#22C55E]">
              <h3 className="text-2xl font-black text-[#0F3D2E] mb-6 flex items-center gap-3">
                <div className="w-12 h-12 bg-[#22C55E]/20 rounded-2xl flex items-center justify-center">
                  <UserCircle className="w-6 h-6 text-[#22C55E]" />
                </div>
                Edit Informasi Pribadi
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Nama Lengkap</label>
                  <Input
                    value={formData.nama}
                    onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-[#22C55E]/30 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Nomor Telepon</label>
                  <Input
                    value={formData.telepon}
                    onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-[#22C55E]/30 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Alamat Lengkap</label>
                  <Input
                    value={formData.alamat}
                    onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-[#22C55E]/30 focus:border-[#22C55E] focus:ring-2 focus:ring-[#22C55E]/20"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Payment Information */}
            <div className="eco-card p-8 rounded-3xl shadow-lg border-l-4 border-l-amber-500">
              <h3 className="text-2xl font-black text-[#0F3D2E] mb-2 flex items-center gap-3">
                <div className="w-12 h-12 bg-amber-100 rounded-2xl flex items-center justify-center">
                  <Banknote className="w-6 h-6 text-amber-600" />
                </div>
                Edit Data Penarikan
              </h3>
              <p className="text-sm text-gray-600 mb-6 italic">Data ini digunakan untuk proses penarikan saldo Anda</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Bank / E-Wallet</label>
                  <Input
                    placeholder="Misal: BCA, Mandiri, Dana, OVO"
                    value={formData.rekening_bank}
                    onChange={(e) => setFormData({ ...formData, rekening_bank: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-amber-300/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Nomor Rekening / HP</label>
                  <Input
                    placeholder="08xxxxxxxxxx atau 123456789"
                    value={formData.nomor_rekening}
                    onChange={(e) => setFormData({ ...formData, nomor_rekening: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-amber-300/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-xs font-bold text-[#0F3D2E] mb-3 uppercase tracking-wider">Atas Nama</label>
                  <Input
                    value={formData.nama_rekening}
                    onChange={(e) => setFormData({ ...formData, nama_rekening: e.target.value })}
                    className="eco-input rounded-2xl border-2 border-amber-300/30 focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 border-t border-amber-200 mt-6">
                <Button
                  type="button"
                  onClick={() => {
                    setFormData({
                      nama: user?.nama || '',
                      telepon: user?.telepon || '',
                      alamat: user?.alamat || '',
                      rekening_bank: user?.rekening_bank || '',
                      nomor_rekening: user?.nomor_rekening || '',
                      nama_rekening: user?.nama_rekening || '',
                    });
                  }}
                  className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-base font-bold rounded-2xl transition-colors"
                >
                  Reset
                </Button>
                <Button
                  type="submit"
                  className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-3 text-base font-bold rounded-2xl transition-colors"
                >
                  Simpan Perubahan
                </Button>
              </div>
            </div>
          </form>
        )}

        {/* Tab: Keamanan */}
        {activeTab === 'keamanan' && (
          <div className="eco-card p-8 rounded-3xl shadow-lg border-l-4 border-l-red-500">
            <h3 className="text-2xl font-black text-[#0F3D2E] mb-2 flex items-center gap-3">
              <div className="w-12 h-12 bg-red-100 rounded-2xl flex items-center justify-center">
                <Lock className="w-6 h-6 text-red-600" />
              </div>
              Keamanan Akun
            </h3>
            <p className="text-sm text-gray-600 mb-8 italic">Kelola password dan keamanan akun Anda</p>

            <Dialog open={showPasswordDialog} onOpenChange={setShowPasswordDialog}>
              <DialogTrigger asChild>
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-bold rounded-2xl transition-colors flex items-center justify-center gap-2">
                  <Lock className="w-5 h-5" />
                  Ubah Password
                </Button>
              </DialogTrigger>
              <DialogContent className="rounded-3xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-black text-[#0F3D2E]">Ubah Password</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleChangePassword} className="space-y-6 mt-6">
                  <div>
                    <label className="block text-sm font-bold text-[#0F3D2E] mb-3">Password Lama</label>
                    <div className="relative">
                      <Input
                        type={showPassword ? 'text' : 'password'}
                        value={passwordForm.oldPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, oldPassword: e.target.value })}
                        className="eco-input rounded-2xl border-2 border-gray-300 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0F3D2E] mb-3">Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.newPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                        className="eco-input rounded-2xl border-2 border-gray-300 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showNewPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-bold text-[#0F3D2E] mb-3">Konfirmasi Password Baru</label>
                    <div className="relative">
                      <Input
                        type={showConfirmPassword ? 'text' : 'password'}
                        value={passwordForm.confirmPassword}
                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                        className="eco-input rounded-2xl border-2 border-gray-300 pr-12"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      >
                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                      </button>
                    </div>
                  </div>

                  <div className="flex gap-4 pt-4">
                    <Button
                      type="button"
                      onClick={() => setShowPasswordDialog(false)}
                      className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 text-base font-bold rounded-2xl transition-colors"
                    >
                      Batal
                    </Button>
                    <Button
                      type="submit"
                      className="w-full bg-red-500 hover:bg-red-600 text-white py-3 text-base font-bold rounded-2xl transition-colors"
                    >
                      Ubah Password
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>

            <div className="mt-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-2xl">
              <div className="flex gap-3">
                <Info className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-bold text-blue-900 mb-2">Tips Keamanan</p>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Gunakan password yang kuat dengan kombinasi huruf, angka, dan simbol</li>
                    <li>• Jangan bagikan password Anda kepada siapa pun</li>
                    <li>• Ubah password secara berkala untuk keamanan maksimal</li>
                    <li>• Logout dari perangkat yang tidak Anda kenal</li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Jemput Sampah Page
const JemputSampahPage: React.FC = () => {
  const { user } = useAuth();
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');
  const [alamat, setAlamat] = useState(user?.alamat || '');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/penjemputan.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nasabahId: user?.id,
          nasabahNama: user?.nama,
          tanggal,
          waktu,
          alamat
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert('Permintaan penjemputan sampah berhasil dikirim! Petugas akan segera memproses.');
      }
    } catch (err) {
      alert('Gagal mengirim permintaan.');
    }
  };


  return (
    <div className="max-w-2xl mx-auto">
      <div className="eco-card p-8">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
            <Package className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-[#0F3D2E]">Permintaan Jemput Sampah</h2>
        </div>
        <p className="text-[#2A6B52] mb-8">
          Isi form di bawah ini jika Anda ingin petugas kami menjemput sampah Anda secara langsung di rumah tangga atau fasilitas Anda.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Tanggal Jemput</label>
            <Input
              type="date"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              className="eco-input"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Perkiraan Waktu</label>
            <Select value={waktu} onValueChange={setWaktu}>
              <SelectTrigger className="eco-input">
                <SelectValue placeholder="Pilih jangka waktu" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pagi">Pagi (08:00 - 12:00)</SelectItem>
                <SelectItem value="siang">Siang (13:00 - 15:00)</SelectItem>
                <SelectItem value="sore">Sore (15:00 - 17:00)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Alamat Penjemputan</label>
            <textarea
              value={alamat}
              onChange={(e) => setAlamat(e.target.value)}
              className="eco-input w-full h-32 resize-none"
              placeholder="Detail alamat Anda..."
              required
            />
            <p className="text-xs text-[#2A6B52] mt-2">*Pastikan alamat sudah lengkap agar mudah ditemukan petugas.</p>
          </div>

          <Button
            type="submit"
            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white py-6 text-xl font-semibold rounded-xl"
          >
            Kirim Permintaan
          </Button>
        </form>
      </div>
    </div>
  );
};

// Setor Mandiri Page (Rencana Setor)
const SetorMandiriPage: React.FC = () => {
  const { user } = useAuth();
  const [wasteTypes, setWasteTypes] = useState<JenisSampah[]>([]);
  const [items, setItems] = useState<any[]>([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
  const [tanggal, setTanggal] = useState('');
  const [waktu, setWaktu] = useState('');

  useEffect(() => {
    fetch(`${API_URL}/sampah.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setWasteTypes(res.data);
        }
      });
  }, [user]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
  };

  const removeItem = (id: number) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: number, field: string, value: any) => {
    setItems(items.map(item => {
      if (item.id === id) {
        let updated = { ...item, [field]: value };
        if (field === 'jenisSampahId') {
          const waste = wasteTypes.find(w => w.id === value);
          if (waste) {
            updated.harga = waste.hargaBeli;
            updated.nama = waste.nama;
          }
        }
        return updated;
      }
      return item;
    }));
  };

  const totalEstimasi = items.reduce((sum, item) => {
    const b = parseFloat(item.berat) || 0;
    return sum + (b * item.harga);
  }, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const validItems = items.filter(i => i.jenisSampahId && parseFloat(i.berat) > 0);
    if (validItems.length === 0) return alert('Pilih jenis sampah dan berat minimal satu baris!');

    try {
      for (const item of validItems) {
        const response = await fetch(`${API_URL}/transaksi.php`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nasabahId: user?.id,
            nasabahNama: user?.nama,
            jenisTransaksi: 'setor',
            jenisSampahId: item.jenisSampahId,
            jenisSampahNama: item.nama,
            berat: parseFloat(item.berat),
            hargaPerKg: item.harga,
            jumlah: parseFloat(item.berat) * item.harga,
            tanggal: tanggal || new Date().toISOString().split('T')[0],
            status: 'pending',
            keterangan: `Rencana setor mandiri (${waktu})`
          })
        });
        const respText = await response.text();
        const result = JSON.parse(respText);
        if (result.status !== 'success') {
          throw new Error(result.message);
        }
      }
      alert('Rencana Setor berhasil disimpan! Silakan antar sampah Anda ke lokasi.');
      // Reset form after successful submission
      setItems([{ id: Date.now(), kategori: 'anorganik', jenisSampahId: '', berat: '', harga: 0, nama: '' }]);
      setTanggal('');
      setWaktu('');
    } catch (err) {
      alert('Gagal sistem: ' + (err instanceof Error ? err.message : 'Koneksi terputus'));
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-2 sm:px-0">
      <div className="eco-card p-5 sm:p-8 bg-white/70 backdrop-blur-xl border-white shadow-2xl rounded-[1.5rem] sm:rounded-[2.5rem]">
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div className="flex items-center gap-3 sm:gap-4">
            <div className="w-10 h-10 sm:w-14 sm:h-14 bg-blue-100 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-inner flex-shrink-0">
              <MapPin className="w-5 h-5 sm:w-7 sm:h-7 text-blue-600" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-black text-[#0F3D2E]">Rencana Setor</h2>
              <p className="text-[10px] sm:text-sm font-bold text-blue-600/60 uppercase tracking-widest">Mandiri • Pilih Jadwal</p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50/50 p-4 sm:p-6 rounded-2xl sm:rounded-3xl border border-blue-100 mb-6 sm:mb-8">
          <div className="flex gap-3 sm:gap-4">
            <div className="w-8 h-8 sm:w-10 sm:h-10 bg-white rounded-full flex items-center justify-center flex-shrink-0 shadow-sm">
               <Package className="w-4 h-4 sm:w-5 h-5 text-blue-500" />
            </div>
            <div>
              <h4 className="font-bold text-[#0F3D2E] text-xs sm:text-sm">Lokasi Drop-off</h4>
              <p className="text-[#2A6B52] text-[10px] sm:text-xs leading-relaxed">
                Bukit Pamulang Indah C11/6. RT 001 RW 004 Pamulang Timur.
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 sm:space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between px-1 sm:px-2">
              <h4 className="text-xs sm:text-sm font-black text-[#0F3D2E] uppercase tracking-widest">Daftar Sampah</h4>
              <span className="text-[8px] sm:text-[10px] bg-[#E9F3EC] text-[#2A6B52] px-2 sm:px-3 py-1 rounded-full font-bold">{items.length} JENIS</span>
            </div>
            
            {items.map((item) => (
              <div key={item.id} className="p-4 sm:p-6 bg-white rounded-2xl sm:rounded-[2rem] border border-gray-100 shadow-sm relative group">
                 {items.length > 1 && (
                    <button 
                      type="button"
                      onClick={() => removeItem(item.id)}
                      className="absolute -right-1 -top-1 sm:-right-2 sm:-top-2 w-7 h-7 sm:w-8 sm:h-8 bg-red-500 text-white rounded-full flex items-center justify-center opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all shadow-lg z-10"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Kategori</label>
                    <Select value={item.kategori} onValueChange={(val) => updateItem(item.id, 'kategori', val)}>
                      <SelectTrigger className="bg-gray-50 border-none h-10 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                        <SelectItem value="anorganik">Anorganik</SelectItem>
                        <SelectItem value="organik">Organik</SelectItem>
                        <SelectItem value="B3">B3</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Jenis Sampah</label>
                    <Select value={item.jenisSampahId} onValueChange={(val) => updateItem(item.id, 'jenisSampahId', val)}>
                      <SelectTrigger className="bg-gray-50 border-none h-10 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm">
                        <SelectValue placeholder="Pilih" />
                      </SelectTrigger>
                      <SelectContent className="rounded-2xl border-none shadow-2xl">
                         {wasteTypes.filter(w => w.kategori === item.kategori).map(w => (
                          <SelectItem key={w.id} value={w.id}>{w.nama}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-1.5 sm:space-y-2">
                    <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Berat (kg)</label>
                    <div className="relative">
                      <Input
                        type="number"
                        step="0.1"
                        placeholder="0.0"
                        value={item.berat}
                        onChange={(e) => updateItem(item.id, 'berat', e.target.value)}
                        className="bg-gray-50 border-none h-10 sm:h-14 rounded-xl sm:rounded-2xl font-black text-sm sm:text-lg pl-4 sm:pl-6"
                      />
                      <span className="absolute right-4 sm:right-6 top-1/2 -translate-y-1/2 text-[8px] sm:text-xs font-black text-gray-300">KG</span>
                    </div>
                  </div>
                  <div className="flex flex-col justify-end pb-1 text-left sm:text-right">
                    <p className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase mb-0.5 sm:mb-1">Subtotal</p>
                    <p className="text-lg sm:text-xl font-black text-[#0F3D2E]">Rp {((parseFloat(item.berat) || 0) * item.harga).toLocaleString('id-ID')}</p>
                  </div>
                </div>
              </div>
            ))}

            <Button 
              type="button"
              onClick={addItem}
              variant="outline"
              className="w-full border-dashed border-2 border-blue-200 h-12 sm:h-16 rounded-2xl sm:rounded-3xl font-bold text-blue-400 hover:bg-blue-50 transition-all text-xs sm:text-sm"
            >
              <Plus className="w-4 h-4 sm:w-5 h-5 mr-2" />
              Tambah Baris Sampah Lainnya
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 pt-2 sm:pt-4">
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Tanggal Datang</label>
              <Input
                type="date"
                value={tanggal}
                onChange={(e) => setTanggal(e.target.value)}
                className="bg-gray-50 border-none h-10 sm:h-14 rounded-xl sm:rounded-2xl font-bold px-4 sm:px-6 text-xs sm:text-sm"
                required
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <label className="text-[8px] sm:text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Waktu Kedatangan</label>
              <Select value={waktu} onValueChange={setWaktu} required>
                <SelectTrigger className="bg-gray-50 border-none h-10 sm:h-14 rounded-xl sm:rounded-2xl font-bold text-xs sm:text-sm">
                  <SelectValue placeholder="Pilih Waktu" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-none shadow-2xl">
                  <SelectItem value="pagi">Pagi (08:00 - 12:00)</SelectItem>
                  <SelectItem value="siang">Siang (12:00 - 15:00)</SelectItem>
                  <SelectItem value="sore">Sore (15:00 - 17:00)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="p-5 sm:p-8 bg-gradient-to-br from-[#0F3D2E] to-[#1a5d4a] rounded-2xl sm:rounded-[2.5rem] shadow-2xl relative overflow-hidden">
             <div className="absolute right-0 top-0 opacity-10">
                <Coins className="w-32 h-32 sm:w-48 sm:h-48 -mr-8 -mt-8 sm:-mr-12 sm:-mt-12 text-white" />
              </div>
            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-6">
              <div>
                <p className="text-[8px] sm:text-xs font-bold text-green-200 uppercase tracking-widest mb-0.5 sm:mb-1">Total Estimasi Saldo</p>
                <h3 className="text-2xl sm:text-4xl font-black text-white">Rp {totalEstimasi.toLocaleString('id-ID')}</h3>
              </div>
              <Button
                type="submit"
                className="bg-[#22C55E] hover:bg-white hover:text-[#22C55E] text-white px-6 sm:px-10 h-12 sm:h-16 rounded-[1.2rem] sm:rounded-[1.8rem] font-bold text-base sm:text-lg shadow-xl transition-all active:scale-95"
              >
                SIMPAN RENCANA
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

// Keuangan Bank Sampah Page
const KeuanganBankSampahPage: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [history, setHistory] = useState<Transaksi[]>([]);

  useEffect(() => {
    fetch(`${API_URL}/stats.php`)
      .then(res => res.json())
      .then(res => res.status === 'success' && setStats(res.data));
    fetch(`${API_URL}/transaksi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          setHistory(res.data.filter((t: Transaksi) => t.jenisTransaksi === 'setor'));
        }
      });
  }, [user]);

  if (!stats) return <div className="text-center py-12">Memuat data keuangan...</div>;


  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#0F3D2E] mb-2">Keuangan Bank Sampah</h1>
        <p className="text-gray-600">Ringkasan keuangan dan arus kas bank sampah</p>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Kas Bank Sampah */}
        <div className="relative overflow-hidden rounded-3xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-[#0F3D2E] via-[#1a5d4a] to-[#0F3D2E]" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/70 text-sm font-semibold uppercase tracking-wider mb-2">Kas Bank Sampah</p>
                <h3 className="text-4xl font-black">Rp {stats.keuanganBankSampah.toLocaleString('id-ID')}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Banknote className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="pt-6 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white/70 text-sm font-medium">Total Margin Profit</span>
                <span className="text-lg font-bold text-green-300">+Rp 1.250.000</span>
              </div>
            </div>
          </div>
        </div>

        {/* Total Tabungan Nasabah */}
        <div className="relative overflow-hidden rounded-3xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-amber-400 via-orange-400 to-amber-500" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">Total Tabungan Nasabah</p>
                <h3 className="text-4xl font-black">Rp {stats.totalSaldoNasabah.toLocaleString('id-ID')}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Wallet className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="pt-6 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm font-medium">Terikat di Saldo</span>
                <span className="text-lg font-bold text-white">Saldo Nasabah</span>
              </div>
            </div>
          </div>
        </div>

        {/* Transaksi Bulan Ini */}
        <div className="relative overflow-hidden rounded-3xl shadow-lg">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-400 via-teal-400 to-emerald-500" />
          <div className="absolute top-0 right-0 w-40 h-40 bg-white/20 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl" />
          <div className="relative p-8 text-white">
            <div className="flex items-start justify-between mb-6">
              <div>
                <p className="text-white/80 text-sm font-semibold uppercase tracking-wider mb-2">Transaksi Bulan Ini</p>
                <h3 className="text-4xl font-black">{stats.transaksiBulanIni}</h3>
              </div>
              <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <TrendingUp className="w-7 h-7 text-white" />
              </div>
            </div>
            <div className="pt-6 border-t border-white/20">
              <div className="flex justify-between items-center">
                <span className="text-white/80 text-sm font-medium">Total Sampah</span>
                <span className="text-lg font-bold text-white">{stats.sampahBulanIni} Kg</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Arus Keuangan Table */}
      <div className="eco-card p-8 rounded-3xl shadow-lg">
        <div className="mb-8">
          <h3 className="font-black text-[#0F3D2E] text-2xl mb-2">Arus Keuangan Penjualan</h3>
          <p className="text-gray-600 text-sm">Rincian profit dari penjualan sampah ke lapak</p>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table w-full">
            <thead>
              <tr className="bg-gradient-to-r from-[#0F3D2E]/5 to-[#22C55E]/5 border-b-2 border-[#0F3D2E]/20">
                <th className="px-6 py-4 text-left text-sm font-bold text-[#0F3D2E]">Tanggal</th>
                <th className="px-6 py-4 text-left text-sm font-bold text-[#0F3D2E]">Jenis Sampah</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#0F3D2E]">Berat (Kg)</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#0F3D2E]">Harga Beli</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#0F3D2E]">Harga Jual</th>
                <th className="px-6 py-4 text-right text-sm font-bold text-[#0F3D2E]">Profit Bank</th>
              </tr>
            </thead>
            <tbody>
              {history.map((t: Transaksi, idx) => {
                const profit = (t.berat || 0) * ((t.hargaJualPerKg || 0) - (t.hargaPerKg || 0));
                return (
                  <tr key={t.id} className={`border-b border-gray-100 transition-colors ${idx % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'} hover:bg-[#22C55E]/5`}>
                    <td className="px-6 py-4 text-sm text-[#0F3D2E] font-medium">{t.tanggal}</td>
                    <td className="px-6 py-4 text-sm text-[#0F3D2E] font-semibold">{t.jenisSampahNama}</td>
                    <td className="px-6 py-4 text-sm text-right text-[#0F3D2E]">{(t.berat || 0).toFixed(2)}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-blue-700">Rp {t.hargaPerKg?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm text-right font-semibold text-green-700">Rp {t.hargaJualPerKg?.toLocaleString('id-ID')}</td>
                    <td className="px-6 py-4 text-sm text-right font-bold text-green-800 bg-green-50/50 rounded-lg">+Rp {profit.toLocaleString('id-ID')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

// Notifikasi Page
const NotifikasiPage: React.FC = () => {
  const { user } = useAuth();
  const [notifs, setNotifs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const url = user?.role === 'nasabah' 
          ? `${API_URL}/notifikasi.php?nasabahId=${user.id}&includeRead=false`
          : `${API_URL}/notifikasi.php`;
        
        const res = await fetch(url);
        const data = await res.json();
        if (data.status === 'success') {
          setNotifs(data.data);
        }
      } catch (err) {
        console.error('Error fetching notifications:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
    // Polling setiap 5 detik untuk update real-time
    const interval = setInterval(fetchNotifications, 5000);
    return () => clearInterval(interval);
  }, [user]);

  const handleMarkAsRead = async (notifId: string) => {
    try {
      const res = await fetch(`${API_URL}/notifikasi.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: notifId,
          isRead: true
        })
      });
      
      const data = await res.json();
      if (data.status === 'success') {
        // Remove from list
        setNotifs(prev => prev.filter(n => n.id !== notifId));
      }
    } catch (err) {
      console.error('Error marking notification as read:', err);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-12 h-12 border-4 border-[#22C55E]/20 border-t-[#22C55E] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-4">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-12 h-12 bg-[#22C55E]/10 rounded-xl flex items-center justify-center">
          <Bell className="w-6 h-6 text-[#22C55E]" />
        </div>
        <div>
          <h2 className="text-2xl font-bold text-[#0F3D2E]">Pusat Notifikasi</h2>
          <p className="text-sm text-[#2A6B52]">Total: {notifs.length} notifikasi belum dibaca</p>
        </div>
      </div>

      {notifs.length === 0 ? (
        <div className="eco-card p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-medium">Belum ada notifikasi</p>
          <p className="text-sm text-gray-400 mt-2">Notifikasi dari admin akan muncul di sini</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifs.map((n: any) => (
            <div 
              key={n.id} 
              onClick={() => handleMarkAsRead(n.id)}
              className="eco-card p-5 border-l-4 border-[#22C55E] hover:shadow-lg transition-all cursor-pointer hover:bg-[#22C55E]/5"
            >
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-[#22C55E]/10 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                  <Bell className="w-5 h-5 text-[#22C55E]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start gap-4 mb-2">
                    <h3 className="font-bold text-[#0F3D2E] text-lg">{n.title}</h3>
                    <span className="text-xs text-gray-400 whitespace-nowrap flex-shrink-0">
                      {new Date(n.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-sm text-[#2A6B52] leading-relaxed">{n.msg}</p>
                  <div className="mt-3 flex items-center gap-2">
                    <Badge className="bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/20">
                      {n.status === 'Published' ? '✓ Diterima' : 'Draft'}
                    </Badge>
                    <span className="text-xs text-gray-400">Klik untuk tandai sebagai dibaca</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};


// Kelola Notifikasi (Pengurus)
const KelolaNotifikasiPage: React.FC = () => {
  const { user } = useAuth();
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newMessage, setNewMessage] = useState('');
  const [selectedNasabah, setSelectedNasabah] = useState<string>('all');
  const [notifs, setNotifs] = useState<any[]>([]);
  const [nasabahList, setNasabahList] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'draft' | 'published'>('all');

  useEffect(() => {
    fetch(`${API_URL}/notifikasi.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setNotifs(res.data);
      });
    
    fetch(`${API_URL}/nasabah.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') setNasabahList(res.data);
      });
  }, [user, refreshTrigger]);

  const filteredNotifs = notifs.filter(n => {
    const matchesSearch = n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         n.msg.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || n.status?.toLowerCase() === filterStatus;
    return matchesSearch && matchesStatus;
  });

  const resetForm = () => {
    setNewTitle('');
    setNewMessage('');
    setSelectedNasabah('all');
    setError(null);
    setSuccess(false);
  };

  const handleSave = async () => {
    setError(null);
    setSuccess(false);
    
    if (!newTitle.trim()) {
      setError('Judul notifikasi tidak boleh kosong!');
      return;
    }
    if (!newMessage.trim()) {
      setError('Isi pesan tidak boleh kosong!');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch(`${API_URL}/notifikasi.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle.trim(),
          msg: newMessage.trim(),
          nasabahId: selectedNasabah === 'all' ? null : selectedNasabah,
          status: 'Draft'
        })
      });
      const result = await response.json();
      
      if (result.status === 'success') {
        setSuccess(true);
        setTimeout(() => {
          setShowAddDialog(false);
          resetForm();
          setRefreshTrigger(prev => prev + 1);
        }, 1500);
      } else {
        setError(result.message || 'Gagal menyimpan notifikasi');
      }
    } catch (err) {
      setError('Gagal menghubungi server. Pastikan XAMPP Apache & MySQL sudah berjalan.');
    } finally {
      setIsLoading(false);
    }
  };

  const handlePush = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin push notifikasi "${title}" ke semua nasabah?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/notifikasi.php`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: id,
          status: 'Published'
        })
      });
      const result = await response.json();
      if (result.status === 'success') {
        alert(`✅ Notifikasi "${title}" berhasil dipush ke semua nasabah!`);
        setRefreshTrigger(prev => prev + 1);
      } else {
        alert('Gagal push notifikasi: ' + result.message);
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Apakah Anda yakin ingin menghapus notifikasi "${title}"?`)) return;
    
    try {
      const response = await fetch(`${API_URL}/notifikasi.php`, { 
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id })
      });
      const result = await response.json();
      if (result.status === 'success') {
        setNotifs(prev => prev.filter((n: any) => n.id !== id));
        alert('✓ Notifikasi berhasil dihapus!');
      } else {
        alert('Gagal menghapus notifikasi: ' + result.message);
      }
    } catch (err) {
      alert('Gagal menghubungi server.');
    }
  };

  const draftCount = notifs.filter(n => n.status !== 'Published').length;
  const publishedCount = notifs.filter(n => n.status === 'Published').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-black text-[#0F3D2E] flex items-center gap-3">
            <div className="w-12 h-12 bg-blue-100 rounded-2xl flex items-center justify-center shadow-lg">
              <Bell className="w-6 h-6 text-blue-600" />
            </div>
            Kelola Notifikasi
          </h2>
          <p className="text-sm text-[#2A6B52] mt-2">Kelola dan push notifikasi ke semua nasabah</p>
        </div>
        <Button 
          onClick={() => setShowAddDialog(true)}
          className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl h-12 px-6 font-bold shadow-lg flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Buat Notifikasi
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="eco-card p-5 bg-gradient-to-br from-blue-50 to-blue-100/50 border-l-4 border-blue-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-blue-600 uppercase tracking-widest">Total</p>
              <p className="text-3xl font-black text-blue-700 mt-2">{notifs.length}</p>
            </div>
            <div className="w-14 h-14 bg-blue-200/50 rounded-2xl flex items-center justify-center">
              <Bell className="w-7 h-7 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="eco-card p-5 bg-gradient-to-br from-yellow-50 to-yellow-100/50 border-l-4 border-yellow-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-yellow-600 uppercase tracking-widest">Draft</p>
              <p className="text-3xl font-black text-yellow-700 mt-2">{draftCount}</p>
            </div>
            <div className="w-14 h-14 bg-yellow-200/50 rounded-2xl flex items-center justify-center">
              <FileText className="w-7 h-7 text-yellow-600" />
            </div>
          </div>
        </div>

        <div className="eco-card p-5 bg-gradient-to-br from-green-50 to-green-100/50 border-l-4 border-green-500">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-green-600 uppercase tracking-widest">Published</p>
              <p className="text-3xl font-black text-green-700 mt-2">{publishedCount}</p>
            </div>
            <div className="w-14 h-14 bg-green-200/50 rounded-2xl flex items-center justify-center">
              <CheckCircle className="w-7 h-7 text-green-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#2A6B52]" />
          <Input
            placeholder="Cari notifikasi..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="eco-input pl-10"
          />
        </div>
        <Select value={filterStatus} onValueChange={(val: any) => setFilterStatus(val)}>
          <SelectTrigger className="eco-input w-full sm:w-48">
            <SelectValue placeholder="Filter status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="published">Published</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Notifikasi List */}
      {filteredNotifs.length === 0 ? (
        <div className="eco-card p-12 text-center">
          <Bell className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 font-bold text-lg">Belum ada notifikasi</p>
          <p className="text-sm text-gray-400 mt-2">Buat notifikasi baru untuk memulai</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredNotifs.map((notif) => (
            <div key={notif.id} className="eco-card p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all group">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-start gap-3 mb-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center flex-shrink-0 mt-1">
                      <Bell className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-bold text-[#0F3D2E] text-lg">{notif.title}</h3>
                      <p className="text-sm text-[#2A6B52] mt-1 line-clamp-2">{notif.msg}</p>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 items-center mt-4">
                    <Badge className={notif.status === 'Published' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}>
                      {notif.status === 'Published' ? '✓ Published' : '📝 Draft'}
                    </Badge>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {notif.nasabahId ? `👤 ${notif.nasabahId}` : '📢 Semua'}
                    </Badge>
                    <span className="text-xs text-gray-400">
                      {new Date(notif.createdAt).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>

                <div className="flex gap-2 flex-shrink-0">
                  {notif.status !== 'Published' && (
                    <button 
                      onClick={() => handlePush(notif.id, notif.title)}
                      className="p-3 hover:bg-blue-50 text-blue-600 rounded-xl border border-blue-200 transition-all hover:shadow-md"
                      title="Push ke nasabah"
                    >
                      <Send className="w-5 h-5" />
                    </button>
                  )}
                  <button 
                    onClick={() => handleDelete(notif.id, notif.title)}
                    className="p-3 hover:bg-red-50 text-red-600 rounded-xl border border-red-200 transition-all hover:shadow-md"
                    title="Hapus notifikasi"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent className="sm:max-w-2xl rounded-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-[#0F3D2E]">Buat Notifikasi Baru</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-[#2A6B52] -mt-2">Buat dan push notifikasi ke semua nasabah</p>
          
          <div className="space-y-5 py-4 max-h-[60vh] overflow-y-auto">
            {error && (
              <div className="bg-red-50 border-l-4 border-red-500 rounded-lg p-4 text-red-700 text-sm font-medium">
                ⚠️ {error}
              </div>
            )}
            {success && (
              <div className="bg-green-50 border-l-4 border-green-500 rounded-lg p-4 text-green-700 text-sm font-medium">
                ✓ Notifikasi berhasil dibuat! Silakan push untuk mengirim ke nasabah.
              </div>
            )}
            
            <div>
              <label className="block text-sm font-bold text-[#0F3D2E] mb-2 uppercase tracking-widest">Judul Notifikasi</label>
              <Input
                placeholder="Contoh: Promo Tukar Sampah Bulan Ini"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="eco-input h-12"
                disabled={isLoading}
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F3D2E] mb-2 uppercase tracking-widest">Isi Pesan</label>
              <textarea
                placeholder="Tulis pesan notifikasi di sini... Contoh: Dapatkan bonus 10% untuk setiap setoran hari ini!"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                className="eco-input w-full h-32 resize-none"
                disabled={isLoading}
              />
              <p className="text-xs text-gray-400 mt-2">{newMessage.length} karakter</p>
            </div>

            <div>
              <label className="block text-sm font-bold text-[#0F3D2E] mb-2 uppercase tracking-widest">Tujuan Notifikasi</label>
              <Select value={selectedNasabah} onValueChange={setSelectedNasabah} disabled={isLoading}>
                <SelectTrigger className="eco-input h-12">
                  <SelectValue placeholder="Pilih tujuan" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">📢 Broadcast ke Semua Nasabah</SelectItem>
                  {nasabahList.map((n) => (
                    <SelectItem key={n.id} value={n.id}>
                      👤 {n.nama} ({n.id})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => {
                setShowAddDialog(false);
                resetForm();
              }}
              className="flex-1 h-12 rounded-xl font-bold"
              disabled={isLoading}
            >
              Batal
            </Button>
            <Button 
              onClick={handleSave}
              className="flex-1 bg-[#22C55E] hover:bg-[#16A34A] text-white h-12 rounded-xl font-bold shadow-lg"
              disabled={isLoading}
            >
              {isLoading ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  Menyimpan...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  Simpan Notifikasi
                </span>
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Dashboard;
