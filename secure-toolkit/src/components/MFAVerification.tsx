import React, { useState, useEffect } from 'react';
import { mfaService } from '../services/mfaService';
import { LoadingSpinner, ErrorMessage } from './common';

interface MFAVerificationProps {
  userId: string;
  onSuccess: (verified: boolean) => void;
  onCancel?: () => void;
  method?: 'totp' | 'sms' | 'backup';
  className?: string;
}

export const MFAVerification: React.FC<MFAVerificationProps> = ({
  userId,
  onSuccess,
  onCancel,
  method = 'totp',
  className = ''
}) => {
  const [verificationCode, setVerificationCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [attemptsRemaining, setAttemptsRemaining] = useState(3);
  const [isLocked, setIsLocked] = useState(false);
  const [lockoutEndTime, setLockoutEndTime] = useState<Date | null>(null);

  useEffect(() => {
    // ロックアウトタイマーの設定
    if (lockoutEndTime) {
      const timer = setInterval(() => {
        if (new Date() >= lockoutEndTime) {
          setIsLocked(false);
          setLockoutEndTime(null);
          setAttemptsRemaining(3);
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [lockoutEndTime]);

  const handleVerify = async () => {
    if (isLocked) {
      setError('アカウントが一時的にロックされています');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      let verified = false;

      switch (method) {
        case 'totp':
          verified = await mfaService.verifyTOTP(userId, verificationCode);
          break;
        case 'backup':
          verified = await mfaService.verifyBackupCode(userId, verificationCode);
          break;
        // SMS検証は事前にセッションIDが必要なため、ここでは省略
      }

      if (verified) {
        onSuccess(true);
      } else {
        const remaining = attemptsRemaining - 1;
        setAttemptsRemaining(remaining);
        
        if (remaining === 0) {
          // 5分間のロックアウト
          const lockoutEnd = new Date(Date.now() + 5 * 60 * 1000);
          setIsLocked(true);
          setLockoutEndTime(lockoutEnd);
          setError('試行回数の上限に達しました。5分後に再試行してください。');
        } else {
          setError(`認証コードが正しくありません。残り${remaining}回`);
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検証に失敗しました');
    } finally {
      setIsLoading(false);
      setVerificationCode('');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && verificationCode.length === 6 && !isLoading && !isLocked) {
      handleVerify();
    }
  };

  const formatRemainingTime = () => {
    if (!lockoutEndTime) return '';
    
    const remaining = Math.ceil((lockoutEndTime.getTime() - Date.now()) / 1000);
    const minutes = Math.floor(remaining / 60);
    const seconds = remaining % 60;
    
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white p-6 rounded-lg shadow-md space-y-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔐</div>
          <h3 className="text-lg font-semibold">二要素認証</h3>
          <p className="text-sm text-gray-600 mt-2">
            {method === 'totp' && '認証アプリに表示された6桁のコードを入力してください'}
            {method === 'backup' && 'バックアップコードを入力してください'}
          </p>
        </div>

        <div>
          <input
            type="text"
            value={verificationCode}
            onChange={(e) => {
              const value = e.target.value.replace(/\D/g, '');
              setVerificationCode(method === 'backup' ? e.target.value.toUpperCase() : value.slice(0, 6));
            }}
            onKeyPress={handleKeyPress}
            placeholder={method === 'backup' ? 'XXXXXXXX' : '000000'}
            className="w-full px-4 py-3 text-center text-2xl font-mono border rounded-md focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
            disabled={isLoading || isLocked}
            autoComplete="one-time-code"
            autoFocus
          />
        </div>

        {error && <ErrorMessage message={error} />}

        {isLocked && lockoutEndTime && (
          <div className="text-center text-sm text-red-600">
            再試行可能まで: {formatRemainingTime()}
          </div>
        )}

        <div className="flex gap-3">
          {onCancel && (
            <button
              onClick={onCancel}
              className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              disabled={isLoading}
            >
              キャンセル
            </button>
          )}
          <button
            onClick={handleVerify}
            disabled={
              isLoading || 
              isLocked || 
              (method === 'totp' && verificationCode.length !== 6) ||
              (method === 'backup' && verificationCode.length !== 8)
            }
            className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            {isLoading ? <LoadingSpinner size="small" /> : '確認'}
          </button>
        </div>

        <div className="text-center space-y-2">
          {method === 'totp' && (
            <button
              onClick={() => {/* バックアップコード使用画面へ */}}
              className="text-sm text-blue-600 hover:text-blue-700"
              disabled={isLoading || isLocked}
            >
              バックアップコードを使用
            </button>
          )}
          
          <div className="text-xs text-gray-500">
            問題がある場合は管理者にお問い合わせください
          </div>
        </div>
      </div>
    </div>
  );
};