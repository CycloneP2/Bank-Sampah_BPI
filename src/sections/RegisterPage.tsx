import { useState } from 'react';
import { Recycle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { API_URL } from '@/lib/api';

interface RegisterPageProps {
    onNavigate: (page: string) => void;
}

const RegisterPage: React.FC<RegisterPageProps> = ({ onNavigate }) => {
    const [formData, setFormData] = useState({
        nama: '',
        email: '',
        telepon: '',
        alamat: '',
        password: '',
        confirmPassword: ''
    });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Password tidak sama');
            return;
        }
        setError('');
        setIsLoading(true);

        // Real API registration
        try {
            const response = await fetch(`${API_URL}/register.php`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    nama: formData.nama,
                    email: formData.email,
                    telepon: formData.telepon,
                    alamat: formData.alamat,
                    password: formData.password
                })
            });
            const result = await response.json();
            if (result.status === 'success') {
                alert('Registrasi berhasil! Silahkan login.');
                onNavigate('login');
            } else {
                setError(result.message || 'Gagal daftar akun.');
            }
        } catch (err) {
            setError('Gagal menghubungi server. Pastikan XAMPP Apache menyala.');
        } finally {
            setIsLoading(false);
        }

    };

    return (
        <div className="min-h-screen flex">
            {/* Left Side - Image/Illustration */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
                <div className="absolute inset-0">
                    <img
                        src="/bg_hills.jpg"
                        alt="Eco background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-br from-[#22C55E]/80 to-[#0F3D2E]/90" />
                </div>

                <div className="relative z-10 flex flex-col justify-center px-16 text-white h-full">
                    <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-xl">
                        <img src="/logopat.png" className="w-16 h-16 object-contain" alt="Logo" />
                    </div>
                    <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
                        Bergabunglah<br />Bersama Kami
                    </h1>
                    <p className="text-lg text-white/80 max-w-md">
                        Mulai langkah kecilmu untuk perubahan besar. Daftarkan dirimu sebagai nasabah dan ubah sampahmu menjadi berkah.
                    </p>
                </div>
            </div>

            {/* Right Side - Register Form */}
            <div className="w-full lg:w-1/2 flex flex-col px-8 py-8 sm:px-12 lg:px-16 xl:px-24 h-screen overflow-y-auto" style={{ background: '#E9F3EC' }}>
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center gap-3 mb-8">
                    <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center shrink-0">
                        <Recycle className="w-6 h-6 text-white" />
                    </div>
                    <span className="font-bold text-xl text-[#0F3D2E]">Bank Sampah</span>
                </div>

                <button
                    onClick={() => onNavigate('landing')}
                    className="flex items-center gap-2 text-[#2A6B52] hover:text-[#0F3D2E] mb-6 w-fit transition-colors shrink-0"
                >
                    <ArrowLeft className="w-5 h-5" />
                    Kembali
                </button>

                <div className="max-w-md w-full mx-auto my-auto py-4">
                    <h2 className="text-3xl font-bold text-[#0F3D2E] mb-2">Buat Akun Baru</h2>
                    <p className="text-[#2A6B52] mb-8">Lengkapi data diri Anda untuk mendaftar</p>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Nama Lengkap</label>
                            <Input
                                value={formData.nama}
                                onChange={(e) => setFormData({ ...formData, nama: e.target.value })}
                                placeholder="Masukkan nama lengkap"
                                className="eco-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Email</label>
                            <Input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                placeholder="Masukkan email Anda"
                                className="eco-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Nomor Telepon</label>
                            <Input
                                type="tel"
                                value={formData.telepon}
                                onChange={(e) => setFormData({ ...formData, telepon: e.target.value })}
                                placeholder="Masukkan nomor telepon aktif"
                                className="eco-input w-full"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Alamat Lengkap</label>
                            <textarea
                                value={formData.alamat}
                                onChange={(e) => setFormData({ ...formData, alamat: e.target.value })}
                                placeholder="Masukkan alamat lengkap"
                                className="eco-input w-full h-24 resize-none py-3"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Password</label>
                            <div className="relative">
                                <Input
                                    type={showPassword ? 'text' : 'password'}
                                    value={formData.password}
                                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                    placeholder="Buat password"
                                    className="eco-input w-full pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2A6B52] hover:text-[#0F3D2E]"
                                >
                                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-[#0F3D2E] mb-2">Konfirmasi Password</label>
                            <div className="relative">
                                <Input
                                    type={showConfirmPassword ? 'text' : 'password'}
                                    value={formData.confirmPassword}
                                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                    placeholder="Ulangi password"
                                    className="eco-input w-full pr-12"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-[#2A6B52] hover:text-[#0F3D2E]"
                                >
                                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                                {error}
                            </div>
                        )}

                        <Button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-6 text-base font-semibold disabled:opacity-70 mt-4"
                        >
                            {isLoading ? 'Memproses...' : 'Daftar Sekarang'}
                        </Button>
                    </form>

                    <div className="mt-8 text-center pb-8">
                        <p className="text-[#2A6B52]">
                            Sudah punya akun?{' '}
                            <button
                                onClick={() => onNavigate('login')}
                                className="text-[#22C55E] font-semibold hover:underline"
                            >
                                Masuk di sini
                            </button>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
