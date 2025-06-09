import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginCredentials } from '../types/auth';
import { ErrorMessage, LoadingSpinner } from './common';

interface LoginFormProps {
  onSuccess?: () => void;
  onError?: (error: string) => void;
  showRememberMe?: boolean;
  showForgotPassword?: boolean;
  className?: string;
}

/**
 * LoginForm - カスタマイズ可能なログインフォーム
 * 
 * @example
 * ```tsx
 * <LoginForm
 *   onSuccess={() => navigate('/dashboard')}
 *   onError={(error) => toast.error(error)}
 * />
 * ```
 */
export const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  onError,
  showRememberMe = true,
  showForgotPassword = true,
  className = ''
}) => {
  const { login, isLoading } = useAuth();
  const [credentials, setCredentials] = useState<LoginCredentials>({
    email: '',
    password: '',
    rememberMe: false
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!credentials.email) {
      newErrors.email = 'メールアドレスを入力してください';
    } else if (!/\S+@\S+\.\S+/.test(credentials.email)) {
      newErrors.email = '有効なメールアドレスを入力してください';
    }

    if (!credentials.password) {
      newErrors.password = 'パスワードを入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    try {
      await login(credentials);
      onSuccess?.();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'ログインに失敗しました';
      setErrors({ general: message });
      onError?.(message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`space-y-4 ${className}`}>
      {errors.general && (
        <ErrorMessage message={errors.general} />
      )}

      <div>
        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
          メールアドレス
        </label>
        <input
          id="email"
          type="email"
          value={credentials.email}
          onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          autoComplete="email"
        />
        {errors.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>

      <div>
        <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
          パスワード
        </label>
        <input
          id="password"
          type="password"
          value={credentials.password}
          onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
          className={`w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          }`}
          disabled={isLoading}
          autoComplete="current-password"
        />
        {errors.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
      </div>

      <div className="flex items-center justify-between">
        {showRememberMe && (
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={credentials.rememberMe}
              onChange={(e) => setCredentials({ ...credentials, rememberMe: e.target.checked })}
              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              disabled={isLoading}
            />
            <span className="ml-2 text-sm text-gray-600">ログイン状態を保持</span>
          </label>
        )}

        {showForgotPassword && (
          <a href="#" className="text-sm text-blue-600 hover:text-blue-500">
            パスワードを忘れた場合
          </a>
        )}
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-2 px-4 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <span className="flex items-center justify-center">
            <LoadingSpinner size="small" className="mr-2" />
            ログイン中...
          </span>
        ) : (
          'ログイン'
        )}
      </button>

      <div className="text-center text-sm text-gray-600">
        アカウントをお持ちでない方は
        <a href="#" className="ml-1 text-blue-600 hover:text-blue-500">
          新規登録
        </a>
      </div>
    </form>
  );
};