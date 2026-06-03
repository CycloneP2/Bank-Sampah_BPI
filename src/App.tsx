import { useState, useEffect } from 'react';
import LandingPage from './sections/LandingPage';
import LoginPage from './sections/LoginPage';
import RegisterPage from './sections/RegisterPage';
import Dashboard from './sections/Dashboard';
import { AuthProvider, useAuth } from './context/AuthContext';
import './App.css';

type AppPage = 'landing' | 'login' | 'register' | 'dashboard';

// Inner component yang bisa akses useAuth
function AppContent() {
  const { user } = useAuth();
  const [currentPage, setCurrentPage] = useState<AppPage>('landing');

  // Determine halaman berdasarkan auth state
  useEffect(() => {
    if (user) {
      // User sudah login, tampilkan dashboard
      // Dashboard component akan handle tab restoration sendiri
      setCurrentPage('dashboard');
    } else {
      // User belum login, tampilkan landing
      setCurrentPage('landing');
      // Clear saved tab saat logout
      localStorage.removeItem('bank_sampah_current_tab');
    }
  }, [user]);

  // Handle navigation
  const handleNavigate = (page: string) => {
    setCurrentPage(page as AppPage);
    window.scrollTo(0, 0);
  };

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'landing':
        return <LandingPage onNavigate={handleNavigate} />;
      case 'login':
        return <LoginPage onNavigate={handleNavigate} />;
      case 'register':
        return <RegisterPage onNavigate={handleNavigate} />;
      case 'dashboard':
        return user ? <Dashboard onNavigate={handleNavigate} /> : <LandingPage onNavigate={handleNavigate} />;
      default:
        return <LandingPage onNavigate={handleNavigate} />;
    }
  };

  return (
    <div className="relative">
      {/* Grain Overlay */}
      <div className="grain-overlay" />

      {/* Main Content */}
      {renderPage()}
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
