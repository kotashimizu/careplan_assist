import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { useTenantConfig } from '../hooks/useTenantConfig';
import { ConsentManager, DataExporter, AccountDeleter } from './privacy';

interface DataPrivacySettingsProps {
  onDeleteAccount?: () => void;
  onExportData?: (data: string) => void;
  className?: string;
}

/**
 * DataPrivacySettings - GDPR/CCPA準拠のデータプライバシー設定
 * 
 * @example
 * ```tsx
 * <DataPrivacySettings 
 *   onDeleteAccount={() => handleAccountDeletion()}
 *   onExportData={(data) => downloadFile(data)}
 * />
 * ```
 */
export const DataPrivacySettings: React.FC<DataPrivacySettingsProps> = ({
  onDeleteAccount,
  onExportData,
  className = ''
}) => {
  const { user } = useAuth();
  const { getConfig } = useTenantConfig();
  
  const complianceStandards = getConfig('compliance.standards') || [];
  const isGDPREnabled = complianceStandards.includes('GDPR');
  const isCCPAEnabled = complianceStandards.includes('CCPA');

  if (!user) {
    return (
      <div className="p-4 text-center text-gray-500">
        プライバシー設定を表示するにはログインが必要です。
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="bg-white p-6 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">データプライバシー設定</h2>
        
        {/* 現在の同意状況 */}
        <ConsentManager />

        {/* GDPR/CCPA 権利 */}
        {(isGDPREnabled || isCCPAEnabled) && (
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-3">
              {isGDPREnabled ? 'GDPR' : 'CCPA'} に基づくあなたの権利
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* データエクスポート */}
              <DataExporter onExportData={onExportData} />

              {/* データ修正 */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">データの修正</h4>
                <p className="text-sm text-gray-600 mb-3">
                  不正確なデータの修正を要求できます
                </p>
                <button
                  onClick={() => window.location.href = '/profile/edit'}
                  className="w-full py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
                >
                  プロフィール編集
                </button>
              </div>

              {/* データポータビリティ */}
              <div className="p-4 border border-gray-200 rounded-lg">
                <h4 className="font-medium mb-2">データポータビリティ</h4>
                <p className="text-sm text-gray-600 mb-3">
                  他のサービスに移行可能な形式でデータを取得
                </p>
                <button
                  onClick={() => alert('この機能は準備中です')}
                  className="w-full py-2 px-4 bg-gray-400 text-white rounded-md cursor-not-allowed"
                  disabled
                >
                  準備中
                </button>
              </div>

              {/* アカウント削除 */}
              <AccountDeleter onDeleteAccount={onDeleteAccount} />
            </div>
          </div>
        )}

        {/* データ保持ポリシー */}
        <div className="p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">データ保持ポリシー</h4>
          <ul className="text-sm text-gray-600 space-y-1">
            <li>• プロフィールデータ: アカウント削除まで</li>
            <li>• ログデータ: {getConfig('compliance.dataRetention.days') || 90}日間</li>
            <li>• 監査ログ: 法的要件に基づき最大7年間</li>
            <li>• 削除されたデータ: 30日後に完全削除</li>
          </ul>
        </div>
      </div>
    </div>
  );
};