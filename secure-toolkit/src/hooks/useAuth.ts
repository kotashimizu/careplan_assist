import { useContext } from 'react';
import { AuthContext } from '../providers/AuthProvider';

/**
 * useAuth - 認証機能にアクセスするためのフック
 * 
 * @example
 * ```tsx
 * const { user, login, logout, isAuthenticated } = useAuth();
 * 
 * const handleLogin = async () => {
 *   await login({ email: 'user@example.com', password: 'password' });
 * };
 * ```
 */
export function useAuth() {
  const context = useContext(AuthContext);
  
  if (!context) {
    throw new Error(
      'useAuth must be used within an AuthProvider. ' +
      'Make sure your app is wrapped with <SecureProvider> or <AuthProvider>.'
    );
  }
  
  return context;
}