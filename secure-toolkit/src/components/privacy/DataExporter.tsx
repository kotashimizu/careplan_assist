import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useEncryption } from '../../hooks/useEncryption';
import { useAuditLog } from '../../hooks/useAuditLog';

interface DataExporterProps {
  onExportData?: (data: string) => void;
  className?: string;
}

export const DataExporter: React.FC<DataExporterProps> = ({
  onExportData,
  className = ''
}) => {
  const { user } = useAuth();
  const { encrypt } = useEncryption();
  const { logAction } = useAuditLog();
  const [isExporting, setIsExporting] = useState(false);

  const handleExportData = async () => {
    if (!user) return;

    setIsExporting(true);
    try {
      // ユーザーのすべてのデータを収集
      const userData = {
        profile: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          createdAt: user.createdAt,
          updatedAt: user.updatedAt
        },
        preferences: {
          theme: localStorage.getItem('theme'),
          language: localStorage.getItem('language'),
          notifications: localStorage.getItem('notification-settings')
        },
        consent: {
          status: localStorage.getItem('privacy-consent'),
          date: localStorage.getItem('privacy-consent-date'),
          marketing: localStorage.getItem('marketing-consent')
        },
        metadata: {
          lastLogin: localStorage.getItem('last-login'),
          sessionCount: localStorage.getItem('session-count'),
          exportDate: new Date().toISOString()
        }
      };

      // データを暗号化
      const encryptedData = await encrypt(JSON.stringify(userData, null, 2));
      
      // 監査ログに記録
      await logAction({
        action: 'DATA_EXPORT',
        details: {
          format: 'JSON',
          encrypted: true,
          includePersonalData: true
        }
      });

      onExportData?.(encryptedData);
      
      // デフォルトの動作: ファイルダウンロード
      if (!onExportData) {
        const blob = new Blob([encryptedData], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `user-data-${user.id}-${Date.now()}.json`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }

    } catch (error) {
      console.error('Data export failed:', error);
      alert('データのエクスポートに失敗しました。');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <div className={`p-4 border border-gray-200 rounded-lg ${className}`}>
      <h4 className="font-medium mb-2">データのエクスポート</h4>
      <p className="text-sm text-gray-600 mb-3">
        あなたの個人データのコピーをダウンロードできます
      </p>
      <button
        onClick={handleExportData}
        disabled={isExporting}
        className="w-full py-2 px-4 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isExporting ? 'エクスポート中...' : 'データをエクスポート'}
      </button>
    </div>
  );
};