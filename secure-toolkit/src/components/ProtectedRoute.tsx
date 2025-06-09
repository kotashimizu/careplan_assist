import React, { ReactNode } from 'react';
import { useAuth } from '../hooks/useAuth';
import { UserRole } from '../types/auth';

interface ProtectedRouteProps {
  children: ReactNode;
  role?: UserRole | UserRole[];
  fallback?: ReactNode;
  redirectTo?: string;
}

/**
 * ProtectedRoute - 認証が必要なルートを保護するコンポーネント
 * 
 * @example
 * ```tsx
 * // 認証が必要なページ
 * <ProtectedRoute>
 *   <PrivatePage />
 * </ProtectedRoute>
 * 
 * // 特定のロールが必要なページ
 * <ProtectedRoute role="admin">
 *   <AdminPanel />
 * </ProtectedRoute>
 * 
 * // 複数のロールを許可
 * <ProtectedRoute role={['admin', 'moderator']}>
 *   <ModeratorPanel />
 * </ProtectedRoute>
 * ```
 */
export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ 
  children, 
  role,
  fallback,
  redirectTo = '/login'
}) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // ローディング中
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  // 未認証
  if (!isAuthenticated) {
    if (fallback) {
      return <>{fallback}</>;
    }
    
    // リダイレクト処理（実際の実装ではreact-routerなどを使用）
    if (typeof window !== 'undefined' && window.location.pathname !== redirectTo) {
      window.location.href = redirectTo;
    }
    
    return null;
  }

  // ロールチェック
  if (role && user) {
    const allowedRoles = Array.isArray(role) ? role : [role];
    const hasRole = allowedRoles.includes(user.role);
    
    if (!hasRole) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen">
          <h1 className="text-2xl font-bold text-red-600 mb-4">アクセス拒否</h1>
          <p className="text-gray-600">このページにアクセスする権限がありません。</p>
        </div>
      );
    }
  }

  return <>{children}</>;
};