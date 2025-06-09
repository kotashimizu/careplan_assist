import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { mfaService } from '../services/mfaService';
import { LoadingSpinner, ErrorMessage } from './common';

interface MFASetupProps {
  onComplete?: () => void;
  onCancel?: () => void;
  className?: string;
}

export const MFASetup: React.FC<MFASetupProps> = ({
  onComplete,
  onCancel,
  className = ''
}) => {
  const { user } = useAuth();
  const [step, setStep] = useState<'select' | 'setup' | 'verify' | 'complete'>('select');
  const [method, setMethod] = useState<'totp' | 'sms'>('totp');
  const [setupData, setSetupData] = useState<any>(null);
  const [verificationCode, setVerificationCode] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleMethodSelect = (selectedMethod: 'totp' | 'sms') => {
    setMethod(selectedMethod);
    setStep('setup');
    setError(null);
  };

  const handleSetup = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      if (method === 'totp') {
        const result = await mfaService.setupTOTP(user);
        setSetupData(result);
        setStep('verify');
      } else if (method === 'sms' && phoneNumber) {
        const sessionId = await mfaService.sendSMSCode(user.id, phoneNumber);
        setSetupData({ sessionId });
        setStep('verify');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'セットアップに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!user) return;
    setIsLoading(true);
    setError(null);

    try {
      let verified = false;
      
      if (method === 'totp') {
        verified = await mfaService.verifyTOTP(user.id, verificationCode);
      } else if (method === 'sms' && setupData?.sessionId) {
        verified = await mfaService.verifySMSCode(setupData.sessionId, verificationCode);
      }

      if (verified) {
        setStep('complete');
        setTimeout(() => onComplete?.(), 2000);
      } else {
        setError('認証コードが正しくありません');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : '検証に失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const renderMethodSelection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">二要素認証の設定</h3>
      <p className="text-sm text-gray-600">
        アカウントのセキュリティを強化するため、二要素認証を設定してください。
      </p>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <button
          onClick={() => handleMethodSelect('totp')}
          className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📱</div>
            <div className="font-medium">認証アプリ</div>
            <div className="text-sm text-gray-600 mt-1">
              Google AuthenticatorやMicrosoft Authenticatorを使用
            </div>
          </div>
        </button>

        <button
          onClick={() => handleMethodSelect('sms')}
          className="p-4 border rounded-lg hover:border-blue-500 transition-colors"
        >
          <div className="text-center">
            <div className="text-3xl mb-2">📲</div>
            <div className="font-medium">SMS認証</div>
            <div className="text-sm text-gray-600 mt-1">
              携帯電話番号にコードを送信
            </div>
          </div>
        </button>
      </div>

      {onCancel && (
        <button
          onClick={onCancel}
          className="w-full py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
        >
          あとで設定
        </button>
      )}
    </div>
  );

  const renderSetup = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">
        {method === 'totp' ? '認証アプリの設定' : 'SMS認証の設定'}
      </h3>

      {method === 'totp' && setupData && (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-600 mb-4">
              1. 認証アプリ（Google Authenticator等）をインストール<br />
              2. 以下のQRコードをスキャン<br />
              3. 表示された6桁のコードを入力
            </p>
            
            <div className="flex justify-center my-4">
              <img src={setupData.qrCode} alt="QR Code" className="w-48 h-48" />
            </div>
            
            <details className="mt-4">
              <summary className="cursor-pointer text-sm text-blue-600">
                QRコードが読み取れない場合
              </summary>
              <div className="mt-2 p-2 bg-white rounded">
                <p className="text-xs text-gray-600">手動でキーを入力:</p>
                <code className="text-xs font-mono bg-gray-100 p-1 rounded break-all">
                  {setupData.secret}
                </code>
              </div>
            </details>
          </div>

          {setupData.backupCodes && (
            <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm font-medium text-yellow-800 mb-2">
                バックアップコード（重要）
              </p>
              <p className="text-xs text-yellow-700 mb-3">
                認証アプリが使用できない場合に使用します。安全な場所に保管してください。
              </p>
              <div className="grid grid-cols-2 gap-2">
                {setupData.backupCodes.map((code: string, index: number) => (
                  <code key={index} className="text-xs font-mono bg-white p-1 rounded">
                    {code}
                  </code>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {method === 'sms' && (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              携帯電話番号
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="090-1234-5678"
              className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
          </div>
        </div>
      )}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('select')}
          className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          disabled={isLoading}
        >
          戻る
        </button>
        <button
          onClick={method === 'totp' || phoneNumber ? () => setStep('verify') : handleSetup}
          disabled={isLoading || (method === 'sms' && !phoneNumber)}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="small" /> : '次へ'}
        </button>
      </div>
    </div>
  );

  const renderVerify = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold">認証コードの入力</h3>
      
      <p className="text-sm text-gray-600">
        {method === 'totp' 
          ? '認証アプリに表示された6桁のコードを入力してください'
          : '携帯電話に送信された6桁のコードを入力してください'
        }
      </p>

      <div>
        <input
          type="text"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
          placeholder="000000"
          className="w-full px-4 py-3 text-center text-2xl font-mono border rounded-md focus:ring-2 focus:ring-blue-500"
          disabled={isLoading}
          autoComplete="one-time-code"
        />
      </div>

      {error && <ErrorMessage message={error} />}

      <div className="flex gap-3">
        <button
          onClick={() => setStep('setup')}
          className="flex-1 py-2 px-4 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
          disabled={isLoading}
        >
          戻る
        </button>
        <button
          onClick={handleVerify}
          disabled={isLoading || verificationCode.length !== 6}
          className="flex-1 py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? <LoadingSpinner size="small" /> : '確認'}
        </button>
      </div>

      {method === 'sms' && (
        <button
          onClick={handleSetup}
          disabled={isLoading}
          className="w-full text-sm text-blue-600 hover:text-blue-700"
        >
          コードを再送信
        </button>
      )}
    </div>
  );

  const renderComplete = () => (
    <div className="text-center space-y-4">
      <div className="text-5xl">✅</div>
      <h3 className="text-lg font-semibold">二要素認証の設定が完了しました</h3>
      <p className="text-sm text-gray-600">
        アカウントのセキュリティが強化されました。
        次回のログインから二要素認証が必要になります。
      </p>
    </div>
  );

  return (
    <div className={`max-w-md mx-auto ${className}`}>
      <div className="bg-white p-6 rounded-lg shadow-md">
        {step === 'select' && renderMethodSelection()}
        {step === 'setup' && renderSetup()}
        {step === 'verify' && renderVerify()}
        {step === 'complete' && renderComplete()}
      </div>
    </div>
  );
};