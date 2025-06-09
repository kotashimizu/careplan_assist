import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { useAuditLog } from '../../hooks/useAuditLog';

interface AccountDeleterProps {
  onDeleteAccount?: () => void;
  className?: string;
}

export const AccountDeleter: React.FC<AccountDeleterProps> = ({
  onDeleteAccount,
  className = ''
}) => {
  const { user, logout } = useAuth();
  const { logAction } = useAuditLog();
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteAccount = async () => {
    if (!user) return;

    setIsDeletingAccount(true);
    try {
      // 監査ログに記録
      await logAction({
        action: 'ACCOUNT_DELETION_REQUEST',
        details: {
          userId: user.id,
          requestDate: new Date().toISOString(),
          reason: 'User requested account deletion'
        },
        severity: 'high'
      });

      // ローカルデータを削除
      const keysToRemove = [
        'secure-toolkit-session',
        'secure-toolkit-config',
        'privacy-consent',
        'privacy-consent-date',
        'marketing-consent',
        'theme',
        'language',
        'notification-settings'
      ];

      keysToRemove.forEach(key => {
        localStorage.removeItem(key);
      });

      onDeleteAccount?.();
      
      // ログアウト
      await logout();
      
      alert('アカウントの削除リクエストが送信されました。30日以内に完全に削除されます。');

    } catch (error) {
      console.error('Account deletion failed:', error);
      alert('アカウント削除リクエストに失敗しました。');
    } finally {
      setIsDeletingAccount(false);
      setShowDeleteConfirm(false);
    }
  };

  return (
    <>
      <div className={`p-4 border border-red-200 rounded-lg ${className}`}>
        <h4 className="font-medium mb-2 text-red-600">アカウント削除</h4>
        <p className="text-sm text-gray-600 mb-3">
          アカウントとすべてのデータを完全に削除
        </p>
        <button
          onClick={() => setShowDeleteConfirm(true)}
          className="w-full py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700"
        >
          アカウントを削除
        </button>
      </div>

      {/* 削除確認モーダル */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg max-w-md w-full mx-4">
            <h3 className="text-lg font-bold text-red-600 mb-4">
              アカウント削除の確認
            </h3>
            <p className="text-gray-600 mb-6">
              この操作は取り消せません。アカウントとすべてのデータが完全に削除されます。
              削除前にデータをエクスポートすることを強く推奨します。
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 py-2 px-4 bg-gray-600 text-white rounded-md hover:bg-gray-700"
              >
                キャンセル
              </button>
              <button
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 py-2 px-4 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isDeletingAccount ? '削除中...' : '完全に削除'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};