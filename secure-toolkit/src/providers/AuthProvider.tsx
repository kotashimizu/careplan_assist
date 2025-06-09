import React, { createContext, useState, useCallback, useEffect, ReactNode } from 'react';
import { AuthState, AuthUser, LoginCredentials, AuthConfig } from '../types/auth';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (credentials?: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
  register: (credentials: LoginCredentials & { name: string }) => Promise<void>;
  updateUser: (updates: Partial<AuthUser>) => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

interface AuthProviderProps {
  children: ReactNode;
  config: AuthConfig;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children, config }) => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null
  });

  // 初期化時にセッションを復元
  useEffect(() => {
    const restoreSession = async () => {
      try {
        const savedSession = localStorage.getItem('secure-toolkit-session');
        if (savedSession) {
          const session = JSON.parse(savedSession);
          const isExpired = Date.now() > session.expiresAt;
          
          if (!isExpired) {
            setAuthState({
              user: session.user,
              isAuthenticated: true,
              isLoading: false,
              error: null
            });
          } else {
            localStorage.removeItem('secure-toolkit-session');
            setAuthState(prev => ({ ...prev, isLoading: false }));
          }
        } else {
          setAuthState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        console.error('Session restore error:', error);
        setAuthState(prev => ({ ...prev, isLoading: false }));
      }
    };

    restoreSession();
  }, []);

  // ログイン
  const login = useCallback(async (credentials?: LoginCredentials) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      // デモ用の簡易認証
      const user = await authService.login(credentials || { 
        email: 'demo@example.com', 
        password: 'demo123' 
      });

      // セッション保存
      const session = {
        user,
        expiresAt: Date.now() + (config.sessionTimeout * 1000)
      };
      localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: error instanceof Error ? error.message : '認証エラー'
      });
      throw error;
    }
  }, [config.sessionTimeout]);

  // ログアウト
  const logout = useCallback(async () => {
    try {
      await authService.logout();
      localStorage.removeItem('secure-toolkit-session');
      
      setAuthState({
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      });
    } catch (error) {
      console.error('Logout error:', error);
    }
  }, []);

  // 新規登録
  const register = useCallback(async (credentials: LoginCredentials & { name: string }) => {
    setAuthState(prev => ({ ...prev, isLoading: true, error: null }));
    
    try {
      const user = await authService.register(credentials);
      
      // 登録後は自動ログイン
      const session = {
        user,
        expiresAt: Date.now() + (config.sessionTimeout * 1000)
      };
      localStorage.setItem('secure-toolkit-session', JSON.stringify(session));

      setAuthState({
        user,
        isAuthenticated: true,
        isLoading: false,
        error: null
      });
    } catch (error) {
      setAuthState(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : '登録エラー'
      }));
      throw error;
    }
  }, [config.sessionTimeout]);

  // ユーザー情報更新
  const updateUser = useCallback((updates: Partial<AuthUser>) => {
    setAuthState(prev => {
      if (!prev.user) return prev;
      
      const updatedUser = { ...prev.user, ...updates };
      
      // セッション更新
      const savedSession = localStorage.getItem('secure-toolkit-session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        session.user = updatedUser;
        localStorage.setItem('secure-toolkit-session', JSON.stringify(session));
      }
      
      return {
        ...prev,
        user: updatedUser
      };
    });
  }, []);

  // セッションタイムアウトチェック
  useEffect(() => {
    if (!authState.isAuthenticated) return;

    const checkSession = setInterval(() => {
      const savedSession = localStorage.getItem('secure-toolkit-session');
      if (savedSession) {
        const session = JSON.parse(savedSession);
        if (Date.now() > session.expiresAt) {
          logout();
        }
      }
    }, 60000); // 1分ごとにチェック

    return () => clearInterval(checkSession);
  }, [authState.isAuthenticated, logout]);

  const value: AuthContextType = {
    ...authState,
    login,
    logout,
    register,
    updateUser
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};