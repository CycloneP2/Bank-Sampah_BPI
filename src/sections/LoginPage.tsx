import { useState } from 'react';
import { Recycle, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/context/AuthContext';


interface LoginPageProps {
  onNavigate: (page: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, loginError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const success = await login({ email, password });

    if (success) {
      onNavigate('dashboard');
    }

    setIsLoading(false);
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

        <div className="relative z-10 flex flex-col justify-center px-16 text-white">
          <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mb-8 shadow-lg">
            <img src="/logopat.png" className="w-16 h-16 object-contain" alt="Logo" />
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold mb-6 leading-tight">
            Bank Sampah<br />BPI Lestari
          </h1>
          <p className="text-lg text-white/80 mb-8 max-w-md">
            Setor sampah, dapatkan poin, wujudkan kebaikan.
            Bersama-sama menjaga lingkungan untuk generasi mendatang.
          </p>


        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex flex-col justify-center px-8 sm:px-12 lg:px-16 xl:px-24" style={{ background: '#E9F3EC' }}>
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-[#22C55E] rounded-xl flex items-center justify-center">
            <Recycle className="w-6 h-6 text-white" />
          </div>
          <span className="font-bold text-xl text-[#0F3D2E]">Bank Sampah</span>
        </div>

        <button
          onClick={() => onNavigate('landing')}
          className="flex items-center gap-2 text-[#2A6B52] hover:text-[#0F3D2E] mb-6 w-fit transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
          Kembali
        </button>

        <div className="max-w-md w-full mx-auto">
          <h2 className="text-3xl font-bold text-[#0F3D2E] mb-2">Selamat Datang</h2>
          <p className="text-[#2A6B52] mb-8">Masuk ke akun Anda untuk melanjutkan</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-2">
                Email
              </label>
              <Input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Masukkan email Anda"
                className="eco-input w-full"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0F3D2E] mb-2">
                Password
              </label>
              <div className="relative">
                <Input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
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

            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-600 text-sm">
                {loginError}
              </div>
            )}

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 rounded border-[#0F3D2E]/20 text-[#22C55E] focus:ring-[#22C55E]" />
                <span className="text-sm text-[#2A6B52]">Ingat saya</span>
              </label>
              <button type="button" className="text-sm text-[#22C55E] hover:underline">
                Lupa password?
              </button>
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-6 text-base font-semibold disabled:opacity-70 transition-all active:scale-95 shadow-lg shadow-[#22C55E]/20"
            >
              {isLoading ? 'Memuat...' : 'Masuk'}
            </Button>
          </form>



          <div className="mt-8 text-center">
            <p className="text-[#2A6B52]">
              Belum punya akun?{' '}
              <button onClick={() => onNavigate('register')} type="button" className="text-[#22C55E] font-semibold hover:underline">
                Daftar sekarang
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;

