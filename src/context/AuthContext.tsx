import { createContext, useContext, useState, useCallback } from 'react';
import type { User, UserRole, LoginCredentials } from '@/types';

// URL API backend - set VITE_API_URL di file .env untuk production
const API_URL = import.meta.env.VITE_API_URL || 'https://bank-sampahbpi.vercel.app/api';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isNewLogin: boolean;
  login: (credentials: LoginCredentials) => Promise<boolean>;
  logout: () => void;
  updateUser: (data: Partial<User>) => void;
  refreshUser: () => Promise<void>;
  clearNewLoginFlag: () => void;
  loginError: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('bank_sampah_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [role, setRole] = useState<UserRole | null>(() => {
    try {
      const saved = localStorage.getItem('bank_sampah_user');
      return saved ? JSON.parse(saved).role : null;
    } catch {
      return null;
    }
  });

  const [isNewLogin, setIsNewLogin] = useState(false);
  const [loginError, setLoginError] = useState<string | null>(null);

  const login = useCallback(async (credentials: LoginCredentials): Promise<boolean> => {
    setLoginError(null);

    try {
      const response = await fetch(`${API_URL}/login.php`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const result = await response.json();

      if (response.ok && result.status === 'success') {
        const userData: User = result.data;
        userData.saldo        = Number(userData.saldo);
        userData.totalSetoran = Number(userData.totalSetoran);

        setUser(userData);
        setRole(userData.role);
        setIsNewLogin(true); // Mark as new login
        localStorage.setItem('bank_sampah_user', JSON.stringify(userData));
        return true;
      } else {
        setLoginError(result.message || 'Email atau password salah. Silakan coba lagi.');
        return false;
      }
    } catch {
      setLoginError('Koneksi ke server backend gagal. Silakan coba beberapa saat lagi.');
      return false;
    }
  }, []);

  const updateUser = useCallback((data: Partial<User>) => {
    setUser(prev => {
      if (!prev) return null;
      const updated = { ...prev, ...data };
      localStorage.setItem('bank_sampah_user', JSON.stringify(updated));
      return updated;
    });
  }, []);

  const refreshUser = useCallback(async () => {
    if (!user) return;
    try {
      const response = await fetch(`${API_URL}/nasabah.php?id=${user.id}`);
      const result = await response.json();
      if (result.status === 'success') {
        const userData: User = result.data;
        userData.saldo        = Number(userData.saldo);
        userData.totalSetoran = Number(userData.totalSetoran);
        setUser(userData);
        localStorage.setItem('bank_sampah_user', JSON.stringify(userData));
      }
    } catch (err) {
      console.error('Failed to refresh user:', err);
    }
  }, [user]);

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setIsNewLogin(false);
    setLoginError(null);
    localStorage.removeItem('bank_sampah_user');
    localStorage.removeItem('bank_sampah_current_tab');
  }, []);

  const clearNewLoginFlag = useCallback(() => {
    setIsNewLogin(false);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAuthenticated: !!user,
        isNewLogin,
        login,
        logout,
        updateUser,
        refreshUser,
        clearNewLoginFlag,
        loginError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export { API_URL };
