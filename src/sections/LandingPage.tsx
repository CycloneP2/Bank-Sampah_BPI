import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ArrowRight, Recycle, Wallet, Banknote, Leaf, Menu, X, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

gsap.registerPlugin(ScrollTrigger);

interface LandingPageProps {
  onNavigate: (page: string) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const heroRef = useRef<HTMLDivElement>(null);
  const headlineRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);
  const [beritaList, setBeritaList] = React.useState<any[]>([]);

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Hero entrance animation
      const tl = gsap.timeline({ defaults: { ease: 'power2.out' } });

      tl.fromTo('.bg-hills',
        { opacity: 0, scale: 1.06 },
        { opacity: 1, scale: 1, duration: 1.2 }
      )
        .fromTo('.motif-bg',
          { opacity: 0, y: 24 },
          { opacity: 0.08, y: 0, duration: 0.8 },
          '-=0.8'
        )
        .fromTo(headlineRef.current?.querySelectorAll('.headline-line') || [],
          { opacity: 0, y: 40 },
          { opacity: 1, y: 0, stagger: 0.1, duration: 0.8 },
          '-=0.8'
        )
        .fromTo(cardRef.current,
          { opacity: 0, y: 40, scale: 0.95 },
          { opacity: 1, y: 0, scale: 1, duration: 0.8 },
          '-=0.6'
        )
        .fromTo(ctaRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.6 },
          '-=0.4'
        );

      let mm = gsap.matchMedia();

      // Desktop Animations (Pinning + Parallax)
      mm.add("(min-width: 1024px)", () => {
        const sections = gsap.utils.toArray<HTMLElement>('.pinned-section');
        sections.forEach((section) => {
          if (section === sections[0]) return; // Skip hero

          ScrollTrigger.create({
            trigger: section,
            start: 'top top',
            end: '+=130%',
            pin: true,
            scrub: 0.6,
          });

          // Entrance animation
          gsap.fromTo(section.querySelector('.section-bg'),
            { opacity: 0, scale: 1.08 },
            {
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=30%',
                scrub: true,
              }
            }
          );

          gsap.fromTo(section.querySelector('.section-headline'),
            { y: 60, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=30%',
                scrub: true,
              }
            }
          );

          gsap.fromTo(section.querySelector('.section-card'),
            { y: 60, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: section,
                start: 'top top',
                end: '+=30%',
                scrub: true,
              }
            }
          );

          // Exit animation
          gsap.to(section.querySelector('.section-headline'),
            {
              y: -60,
              opacity: 0,
              scrollTrigger: {
                trigger: section,
                start: '+=70%',
                end: '+=30%',
                scrub: true,
              }
            }
          );

          gsap.to(section.querySelector('.section-card'),
            {
              y: -60,
              scale: 0.95,
              opacity: 0,
              scrollTrigger: {
                trigger: section,
                start: '+=70%',
                end: '+=30%',
                scrub: true,
              }
            }
          );
        });
      });

      // Mobile Animations (Simple Fade Up, No Pinning)
      mm.add("(max-width: 1023px)", () => {
        const sections = gsap.utils.toArray<HTMLElement>('.pinned-section');
        sections.forEach((section) => {
          if (section === sections[0]) return;

          gsap.fromTo(section.querySelector('.section-headline'),
            { y: 40, opacity: 0 },
            {
              y: 0,
              opacity: 1,
              scrollTrigger: {
                trigger: section,
                start: 'top 80%',
                end: 'top 40%',
                scrub: true,
              }
            }
          );

          gsap.fromTo(section.querySelector('.section-card'),
            { y: 40, opacity: 0, scale: 0.95 },
            {
              y: 0,
              opacity: 1,
              scale: 1,
              scrollTrigger: {
                trigger: section.querySelector('.section-card'),
                start: 'top 85%',
                end: 'top 50%',
                scrub: true,
              }
            }
          );
        });
      });
    }, heroRef);

    return () => ctx.revert();
  }, []);

  // Fetch berita dari API
  React.useEffect(() => {
    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';
    fetch(`${API_URL}/berita.php`)
      .then(res => res.json())
      .then(res => {
        if (res.status === 'success') {
          // Ambil 3 berita terbaru
          setBeritaList(res.data.slice(0, 3));
        }
      })
      .catch(err => console.error('Error fetching berita:', err));
  }, []);

  const navItems = [
    { label: 'Beranda', href: '#hero' },
    { label: 'Cara Kerja', href: '#how-it-works' },
    { label: 'Testimoni', href: '#testimonials' },
    { label: 'Kegiatan', href: '#news' },
    { label: 'Kontak', href: '#contact' },
  ];

  return (
    <div className="relative">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#22C55E] rounded-xl flex items-center justify-center">
              <Recycle className="w-6 h-6 text-white" />
            </div>
            <span className="font-bold text-lg text-[#0F3D2E] hidden sm:block">
              Bank Sampah BPI Lestari
            </span>
          </div>

          {/* Desktop Nav */}
          <div className="hidden md:flex items-center gap-8 bg-white/40 backdrop-blur-md px-6 py-2 rounded-full border border-white/50 shadow-sm">
            {navItems.map((item) => (
              <a
                key={item.label}
                href={item.href}
                className="text-sm font-bold text-[#2A6B52] hover:text-[#0F3D2E] transition-colors"
              >
                {item.label}
              </a>
            ))}
          </div>
          <div className="hidden md:block">
            <Button
              onClick={() => onNavigate('login')}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-8 py-5 text-base shadow-sm font-semibold"
            >
              Masuk
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 bg-white/50 backdrop-blur-sm rounded-lg"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-6 h-6 text-[#0F3D2E]" /> : <Menu className="w-6 h-6 text-[#0F3D2E]" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-lg shadow-lg p-6 border-t border-[#0F3D2E]/5">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  className="text-base font-bold text-[#2A6B52] hover:text-[#0F3D2E] text-center"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {item.label}
                </a>
              ))}
              <Button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNavigate('login');
                }}
                className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-xl py-6 mt-4 w-full shadow-md font-bold text-lg"
              >
                Masuk / Daftar
              </Button>
            </div>
          </div>
        )}
      </nav>

      {/* Section 1: Hero */}
      <section
        id="hero"
        ref={heroRef}
        className="pinned-section relative w-full min-h-[100dvh] lg:h-screen overflow-hidden"
        style={{ zIndex: 10 }}
      >
        {/* Background */}
        <div className="bg-hills absolute inset-0 z-[1] pointer-events-none">
          <img
            src="/bg_hills.jpg"
            alt="Green hills"
            className="w-full h-full object-cover"
          />
        </div>

        {/* Motif Text */}
        <div className="motif-bg absolute inset-0 z-[2] flex items-center justify-center overflow-hidden pointer-events-none">
          <span className="motif-text opacity-10 blur-sm">BANK SAMPAH</span>
        </div>

        {/* Content */}
        <div className="relative z-10 w-full h-full flex flex-col md:flex-row items-center justify-center md:justify-between px-6 md:px-12 lg:px-24 max-w-7xl mx-auto pt-[120px] pb-32 lg:py-0 min-h-[100dvh] lg:min-h-0">
          {/* Left Headline */}
          <div
            ref={headlineRef}
            className="w-full md:w-[55%] text-center md:text-left z-10"
          >
            <h1 className="text-4xl sm:text-5xl md:text-6xl xl:text-7xl font-bold text-[#0F3D2E] leading-tight filter drop-shadow-md">
              <span className="headline-line block mb-2">Setor Sampah.</span>
              <span className="headline-line block mb-2">Dapatkan Poin.</span>
              <span className="headline-line block text-[#22C55E]">Wujudkan Kebaikan.</span>
            </h1>
            <p className="headline-line mt-6 lg:mt-8 text-base sm:text-lg md:text-xl text-[#0F3D2E] font-bold bg-white/40 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/50 inline-block shadow-sm">
              Program bank sampah BPI Lestari: pilah, setor, dan ubah sampah menjadi manfaat yang nyata.
            </p>
          </div>

          {/* Right Card */}
          <div
            ref={cardRef}
            className="w-full md:w-[40%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl mt-12 md:mt-0 z-10 hidden sm:block"
          >
            <h3 className="text-2xl font-extrabold text-[#0F3D2E] mb-6 border-b border-[#0F3D2E]/10 pb-4">Aksi Komunitas</h3>
            <ul className="space-y-6">
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#22C55E]">
                  <Leaf className="w-7 h-7" />
                </div>
                Pilah di Rumah Saja
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#22C55E]">
                  <Recycle className="w-7 h-7" />
                </div>
                Setor atau Jemput
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-white/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform text-[#22C55E]">
                  <Wallet className="w-7 h-7" />
                </div>
                Cairkan Tabungan
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Buttons */}
        <div
          ref={ctaRef}
          className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-4 w-full flex-col sm:flex-row items-center justify-center px-6"
        >
          <Button
            onClick={() => onNavigate('login')}
            className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-12 py-7 text-lg font-bold shadow-xl shadow-[#22C55E]/30 w-full sm:w-auto"
          >
            Daftar Sekarang
            <ArrowRight className="w-6 h-6 ml-3" />
          </Button>
          <Button
            variant="outline"
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth' })}
            className="border-[3px] border-[#0F3D2E]/20 text-[#0F3D2E] hover:bg-[#0F3D2E]/10 bg-white/30 backdrop-blur-md rounded-full px-10 py-7 text-lg font-bold hidden md:flex"
          >
            Lihat Cara Kerja
          </Button>
        </div>
      </section>

      {/* Section 2: Feature 1 - Setor Sampah */}
      <section
        className="pinned-section relative w-full min-h-[100dvh] lg:h-screen overflow-hidden"
        style={{ zIndex: 20 }}
      >
        <div className="section-bg absolute inset-0 z-[1] pointer-events-none">
          <img
            src="/bg_lake.jpg"
            alt="Lake scene"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden pointer-events-none">
          <span className="motif-text opacity-10 blur-sm">BANK SAMPAH</span>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 max-w-7xl mx-auto py-24 lg:py-0 min-h-[100dvh] lg:min-h-0">
          <div className="section-headline w-full lg:w-[50%] text-center lg:text-left mb-8 lg:mb-0">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F3D2E] leading-tight">
              <span className="bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block mb-3 border border-white/30 drop-shadow-sm">Setor Sampah</span><br />
              <span className="text-[#22C55E] bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block border border-white/30 drop-shadow-sm">di Lokasi Terdekat</span>
            </h2>
            <p className="mt-6 lg:mt-8 text-base sm:text-xl text-[#0F3D2E] font-bold bg-white/50 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-md max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Catat jenis dan berat sampah secara langsung di aplikasi. Segala data dan poinmu tersimpan rapi serta transparan.
            </p>
          </div>

          <div className="section-card w-full lg:w-[40%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl relative">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-green-100 rounded-full blur-2xl opacity-60"></div>
            <h3 className="text-2xl font-extrabold text-[#0F3D2E] mb-6 border-b border-[#0F3D2E]/10 pb-4 relative z-10">Layanan Optimal</h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Recycle className="w-7 h-7 text-[#22C55E]" />
                </div>
                Plastik, Kertas, Botol
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-[#22C55E]" />
                </div>
                Harga Update Terus
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-green-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Banknote className="w-7 h-7 text-[#22C55E]" />
                </div>
                Struk Digital via WA
              </li>
            </ul>
            <button className="mt-8 text-[#22C55E] font-extrabold flex items-center justify-center gap-3 hover:gap-4 transition-all bg-green-100/50 hover:bg-green-100 p-5 rounded-2xl w-full shadow-sm">
              Lihat Daftar Harga <ChevronRight className="w-6 h-6" />
            </button>
          </div>
        </div>
      </section>

      {/* Section 3: Feature 2 - Pantau Saldo */}
      <section
        className="pinned-section relative w-full min-h-[100dvh] lg:h-screen overflow-hidden"
        style={{ zIndex: 30 }}
      >
        <div className="section-bg absolute inset-0 z-[1] pointer-events-none">
          <img
            src="/bg_sunset.jpg"
            alt="Sunset scene"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden pointer-events-none">
          <span className="motif-text opacity-10 blur-sm">BANK SAMPAH</span>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row-reverse items-center justify-center lg:justify-between px-6 lg:px-24 max-w-7xl mx-auto py-24 lg:py-0 min-h-[100dvh] lg:min-h-0">
          <div className="section-headline w-full lg:w-[50%] text-center lg:text-right mb-8 lg:mb-0">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F3D2E] leading-tight">
              <span className="bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block mb-3 border border-white/30 drop-shadow-sm">Pantau Saldo</span><br />
              <span className="text-[#22C55E] bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block border border-white/30 drop-shadow-sm">Secara Fleksibel</span>
            </h2>
            <p className="mt-6 lg:mt-8 text-base sm:text-xl text-[#0F3D2E] font-bold bg-white/50 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-md max-w-xl mx-auto lg:mx-0 lg:ml-auto leading-relaxed">
              Kapanpun, di manapun, Anda bisa memastikan uang tabungan Anda terkumpul jelas. Terorganisir tanpa ribet.
            </p>
          </div>

          <div className="section-card w-full lg:w-[40%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl relative">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-100 rounded-full blur-2xl opacity-60"></div>
            <h3 className="text-2xl font-extrabold text-[#0F3D2E] mb-6 border-b border-[#0F3D2E]/10 pb-4 relative z-10">Real-Time Akses</h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-[#22C55E]" />
                </div>
                Notifikasi Berjalan
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Banknote className="w-7 h-7 text-[#22C55E]" />
                </div>
                Riwayat Transparan
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Leaf className="w-7 h-7 text-[#22C55E]" />
                </div>
                Rekap Dapat Diunduh
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* Section 4: Feature 3 - Tarik Tabungan */}
      <section
        className="pinned-section relative w-full min-h-[100dvh] lg:h-screen overflow-hidden"
        style={{ zIndex: 40 }}
      >
        <div className="section-bg absolute inset-0 z-[1] pointer-events-none">
          <img
            src="/bg_sunset.jpg"
            alt="Sunset scene"
            className="w-full h-full object-cover"
          />
        </div>
        <div className="absolute inset-0 z-[2] flex items-center justify-center overflow-hidden pointer-events-none">
          <span className="motif-text opacity-10 blur-sm">BANK SAMPAH</span>
        </div>

        <div className="relative z-10 w-full h-full flex flex-col lg:flex-row items-center justify-center lg:justify-between px-6 lg:px-24 max-w-7xl mx-auto py-24 lg:py-0 min-h-[100dvh] lg:min-h-0">
          <div className="section-headline w-full lg:w-[50%] text-center lg:text-left mb-8 lg:mb-0">
            <h2 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-[#0F3D2E] leading-tight">
              <span className="bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block mb-3 border border-white/30 drop-shadow-sm">Tarik Tabungan</span><br />
              <span className="text-amber-500 bg-white/40 backdrop-blur-md px-6 py-2 rounded-2xl inline-block border border-white/30 drop-shadow-sm">Sesuai Kebutuhan</span>
            </h2>
            <p className="mt-6 lg:mt-8 text-base sm:text-xl text-[#0F3D2E] font-bold bg-white/50 backdrop-blur-lg p-6 rounded-2xl border border-white/50 shadow-md max-w-xl mx-auto lg:mx-0 leading-relaxed">
              Tarik poinmu menjadi uang tunai langsung ke rekening atau alokasikan untuk berbagi melalui program masjid.
            </p>
          </div>

          <div className="section-card w-full lg:w-[40%] max-w-md bg-white/80 backdrop-blur-xl rounded-[2.5rem] p-8 border border-white shadow-2xl relative">
            <div className="absolute -top-6 -right-6 w-20 h-20 bg-amber-100 rounded-full blur-2xl opacity-60"></div>
            <h3 className="text-2xl font-extrabold text-[#0F3D2E] mb-6 border-b border-[#0F3D2E]/10 pb-4 relative z-10">Cepat & Aman</h3>
            <ul className="space-y-6 relative z-10">
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Wallet className="w-7 h-7 text-amber-500" />
                </div>
                Pengajuan 24 Jam
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Banknote className="w-7 h-7 text-amber-500" />
                </div>
                Cair dalam 1x24 Jam
              </li>
              <li className="flex items-center gap-5 text-lg text-[#2A6B52] font-bold group">
                <div className="w-14 h-14 bg-amber-50/80 rounded-2xl flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                  <Recycle className="w-7 h-7 text-amber-500" />
                </div>
                Bukti Transfer Valid
              </li>
            </ul>
            <Button className="mt-8 bg-amber-500 hover:bg-amber-600 shadow-xl shadow-amber-500/30 text-white rounded-2xl py-6 text-lg font-bold w-full relative z-10">
              Ajukan Penarikan
            </Button>
          </div>
        </div>
      </section>

      {/* Section 5: How It Works */}
      <section
        id="how-it-works"
        className="relative py-32 px-4"
        style={{ background: '#E9F3EC' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F3D2E] mb-6">Mulai dalam 3 Langkah Mudah</h2>
            <p className="text-xl text-[#2A6B52] max-w-2xl mx-auto font-medium">Bantu selamatkan lingkungan dan dapatkan keuntungannya langsung.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                img: '/ill_step_1.jpg',
                title: 'Daftar',
                desc: 'Isi data diri di aplikasi atau loket.'
              },
              {
                img: '/ill_step_2.jpg',
                title: 'Setor',
                desc: 'Bawa sampah sesuai jadwal dan kategori.'
              },
              {
                img: '/ill_step_3.jpg',
                title: 'Dapatkan Manfaat',
                desc: 'Pantau saldo dan tarik tabungan.'
              },
            ].map((step, index) => (
              <div
                key={index}
                className="eco-card p-10 text-center hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border-2 border-transparent hover:border-[#22C55E]/20"
              >
                <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden shadow-lg border-4 border-white">
                  <img src={step.img} alt={step.title} className="w-full h-full object-cover" />
                </div>
                <div className="w-12 h-12 bg-[#22C55E] rounded-2xl flex items-center justify-center text-white font-extrabold text-xl mx-auto mb-6 shadow-md -mt-14 relative z-10">
                  {index + 1}
                </div>
                <h3 className="text-2xl font-bold text-[#0F3D2E] mb-3">{step.title}</h3>
                <p className="text-[#2A6B52] font-medium text-lg">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 6: Testimonials */}
      <section
        id="testimonials"
        className="relative py-32 px-4"
        style={{ background: '#E9F3EC' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F3D2E] mb-6">Cerita Nasabah</h2>
            <p className="text-xl text-[#2A6B52] max-w-2xl mx-auto font-medium">Pengalaman mereka bersama Bank Sampah BPI Lestari.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                quote: 'Saya jadi lebih rajin memilah sampah karena hasilnya bisa ditabung.',
                name: 'Bu Rina',
                role: 'Warga RT 04'
              },
              {
                quote: 'Anak-anak ikut antar sampah setiap minggu. Edukasi yang menyenangkan!',
                name: 'Pak Budi',
                role: 'Tokoh Masyarakat'
              },
              {
                quote: 'Penarikan mudah, transparan, dan langsung masuk rekening.',
                name: 'Mba Siti',
                role: 'Ibu Rumah Tangga'
              },
            ].map((testi, index) => (
              <div
                key={index}
                className="bg-white rounded-[2rem] p-10 hover:shadow-2xl transition-all duration-300 relative mt-8"
              >
                <div className="absolute -top-6 left-10 w-12 h-12 bg-[#22C55E] rounded-full flex items-center justify-center text-white text-3xl font-serif">"</div>
                <p className="text-[#0F3D2E] text-lg font-medium leading-relaxed mb-8 mt-2">{testi.quote}</p>
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center">
                    <span className="text-[#22C55E] font-bold text-xl">{testi.name[0]}</span>
                  </div>
                  <div>
                    <p className="font-bold text-[#0F3D2E] text-lg">{testi.name}</p>
                    <p className="text-[#2A6B52] font-medium">{testi.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 7: News */}
      <section
        id="news"
        className="relative py-32 px-4"
        style={{ background: '#E9F3EC' }}
      >
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F3D2E] mb-6">Kegiatan Kami</h2>
            <p className="text-xl text-[#2A6B52] font-medium max-w-2xl mx-auto">Acara, pencapaian, dan kegiatan sosial terkini.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {beritaList.length > 0 ? (
              beritaList.map((news: any) => (
                <div
                  key={news.id}
                  className="bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={news.gambar || '/ill_news_1.jpg'}
                      alt={news.judul}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-[#2A6B52] shadow-sm">
                      {news.tanggal}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-[#0F3D2E] mb-4 leading-tight group-hover:text-[#22C55E] transition-colors">{news.judul}</h3>
                    <p className="text-[#2A6B52] text-lg font-medium leading-relaxed line-clamp-3">{news.deskripsi}</p>
                  </div>
                </div>
              ))
            ) : (
              // Fallback jika tidak ada berita
              [
                {
                  img: '/ill_news_1.jpg',
                  title: 'Edukasi Daur Ulang',
                  date: '12 Feb 2026',
                  desc: 'Kegiatan edukasi daur ulang yang diikuti oleh anak-anak sekitar.'
                },
                {
                  img: '/ill_news_2.jpg',
                  title: 'Penimbangan Massal',
                  date: '05 Feb 2026',
                  desc: 'Acara bersih-bersih dan penimbangan sampah massal warga.'
                },
                {
                  img: '/ill_news_3.jpg',
                  title: 'Distribusi Sosial',
                  date: '28 Jan 2026',
                  desc: 'Penyaluran hasil tabungan sampah untuk santunan masjid.'
                },
              ].map((news, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[2rem] overflow-hidden hover:shadow-2xl transition-all duration-300 cursor-pointer group flex flex-col"
                >
                  <div className="h-56 overflow-hidden relative">
                    <img
                      src={news.img}
                      alt={news.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                    />
                    <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-xl text-sm font-bold text-[#2A6B52] shadow-sm">
                      {news.date}
                    </div>
                  </div>
                  <div className="p-8 flex-1 flex flex-col">
                    <h3 className="text-2xl font-bold text-[#0F3D2E] mb-4 leading-tight group-hover:text-[#22C55E] transition-colors">{news.title}</h3>
                    <p className="text-[#2A6B52] text-lg font-medium leading-relaxed">{news.desc}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* Section 8: Contact / Footer */}
      <section
        id="contact"
        className="relative pt-32 pb-16 px-4 rounded-t-[4rem] -mt-10"
        style={{ background: '#C8E3D9', zIndex: 50 }}
      >
        <div className="max-w-4xl mx-auto text-center mb-24">
          <div className="w-20 h-20 bg-[#22C55E] rounded-3xl mx-auto flex items-center justify-center shadow-lg mb-8">
            <Recycle className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-4xl md:text-5xl font-extrabold text-[#0F3D2E] mb-6">Siap Menabung Sampah?</h2>
          <p className="text-xl text-[#2A6B52] mb-12 font-medium max-w-xl mx-auto">
            Daftar gratis dan mulailah aksi nyata menuju lingkungan yang bersih hari ini.
          </p>
          <div className="flex flex-col sm:flex-row gap-5 justify-center">
            <Button
              onClick={() => onNavigate('login')}
              className="bg-[#22C55E] hover:bg-[#16A34A] text-white rounded-full px-12 py-7 text-lg font-bold shadow-xl shadow-[#22C55E]/30"
            >
              Daftar Sekarang
            </Button>
            <Button
              variant="outline"
              className="border-4 border-[#0F3D2E]/20 text-[#0F3D2E] bg-transparent hover:bg-[#0F3D2E]/5 rounded-full px-12 py-7 text-lg font-bold"
            >
              Hubungi Admin
            </Button>
          </div>
        </div>

        <div className="max-w-6xl mx-auto">
          <div className="grid sm:grid-cols-3 gap-10 lg:gap-16 mb-16 bg-white/40 backdrop-blur-md rounded-[3rem] p-10 lg:p-14">
            <div className="text-center sm:text-left">
              <h4 className="font-extrabold text-xl text-[#0F3D2E] mb-4">Kontak</h4>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">WA: 0812-3456-7890</p>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">Jl. Mawar No. 12, Masjid BPI Lestari</p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-extrabold text-xl text-[#0F3D2E] mb-4">Operasional</h4>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">Senin–Jumat</p>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">08.00–11.00 & 15.00–17.00</p>
            </div>
            <div className="text-center sm:text-left">
              <h4 className="font-extrabold text-xl text-[#0F3D2E] mb-4">Sosial Media</h4>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">IG: @banksampah_al</p>
              <p className="text-[#2A6B52] font-medium text-lg leading-relaxed">FB: Bank Sampah DKM</p>
            </div>
          </div>

          <div className="border-t-2 border-[#0F3D2E]/10 pt-10 text-center">
            <p className="text-[#2A6B52] font-bold text-lg">
              © 2026 Bank Sampah BPI Lestari.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LandingPage;

