import React from 'react';
import { useAuditLog } from '../../hooks/useAuditLog';

interface ConsentManagerProps {
  className?: string;
}

export const ConsentManager: React.FC<ConsentManagerProps> = ({ className = '' }) => {
  const { logAction } = useAuditLog();

  const handleConsentUpdate = (type: string, value: boolean) => {
    localStorage.setItem(`${type}-consent`, value.toString());
    localStorage.setItem(`${type}-consent-date`, new Date().toISOString());
    
    logAction({
      action: 'CONSENT_UPDATE',
      details: {
        consentType: type,
        granted: value,
        date: new Date().toISOString()
      }
    });
  };

  return (
    <div className={`mb-6 ${className}`}>
      <h3 className="text-lg font-medium mb-3">同意状況</h3>
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <div className="font-medium">基本的なデータ処理</div>
            <div className="text-sm text-gray-600">サービス提供に必要な最小限のデータ</div>
          </div>
          <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
            必須
          </span>
        </div>
        
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <div className="font-medium">マーケティング</div>
            <div className="text-sm text-gray-600">製品更新や特別オファーのお知らせ</div>
          </div>
          <button
            onClick={() => {
              const current = localStorage.getItem('marketing-consent') === 'true';
              handleConsentUpdate('marketing', !current);
              window.location.reload();
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              localStorage.getItem('marketing-consent') === 'true'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {localStorage.getItem('marketing-consent') === 'true' ? '同意済み' : '未同意'}
          </button>
        </div>

        <div className="flex items-center justify-between p-3 bg-gray-50 rounded">
          <div>
            <div className="font-medium">分析・改善</div>
            <div className="text-sm text-gray-600">サービス改善のための匿名データ分析</div>
          </div>
          <button
            onClick={() => {
              const current = localStorage.getItem('analytics-consent') === 'true';
              handleConsentUpdate('analytics', !current);
              window.location.reload();
            }}
            className={`px-3 py-1 rounded-full text-sm ${
              localStorage.getItem('analytics-consent') === 'true'
                ? 'bg-green-100 text-green-800'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {localStorage.getItem('analytics-consent') === 'true' ? '同意済み' : '未同意'}
          </button>
        </div>
      </div>
    </div>
  );
};