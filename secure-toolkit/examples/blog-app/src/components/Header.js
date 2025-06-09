import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth, SecurityBadge } from '@your-org/secure-toolkit';

function Header() {
  const { user, login, logout, isAuthenticated } = useAuth();

  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="text-2xl font-bold text-gray-900">
              📝 SecureBlog
            </Link>
            <nav className="hidden md:flex space-x-4">
              <Link to="/" className="text-gray-600 hover:text-gray-900">
                ホーム
              </Link>
              {isAuthenticated && (
                <>
                  {(user?.role === 'author' || user?.role === 'admin') && (
                    <Link to="/dashboard" className="text-gray-600 hover:text-gray-900">
                      ダッシュボード
                    </Link>
                  )}
                  <Link to="/settings" className="text-gray-600 hover:text-gray-900">
                    設定
                  </Link>
                </>
              )}
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <SecurityBadge />
            
            {isAuthenticated ? (
              <div className="flex items-center space-x-4">
                <div className="text-sm">
                  <div className="text-gray-900 font-medium">{user.name}</div>
                  <div className="text-gray-500 text-xs">{user.role}</div>
                </div>
                <button
                  onClick={logout}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
                >
                  ログアウト
                </button>
              </div>
            ) : (
              <button
                onClick={login}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
              >
                ログイン
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;