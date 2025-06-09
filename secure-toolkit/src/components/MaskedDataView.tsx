import React, { useMemo, useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { dataMaskingService } from '../services/dataMaskingService';

interface MaskedDataViewProps {
  data: any;
  className?: string;
  showToggle?: boolean; // マスク表示/非表示の切り替えを許可
  allowedRoles?: string[]; // マスク解除を許可するロール
}

export const MaskedDataView: React.FC<MaskedDataViewProps> = ({
  data,
  className = '',
  showToggle = false,
  allowedRoles = ['admin', 'doctor', 'data_admin']
}) => {
  const { user } = useAuth();
  const [showUnmasked, setShowUnmasked] = useState(false);

  // ユーザーがマスク解除権限を持っているかチェック
  const canUnmask = useMemo(() => {
    return user && allowedRoles.includes(user.role);
  }, [user, allowedRoles]);

  // マスクされたデータ
  const maskedData = useMemo(() => {
    return dataMaskingService.maskData(data, user?.role, user?.id);
  }, [data, user]);

  // 表示するデータ
  const displayData = showUnmasked && canUnmask ? data : maskedData;

  // データを見やすく表示
  const renderData = (obj: any, depth: number = 0): React.ReactNode => {
    if (obj === null || obj === undefined) {
      return <span className="text-gray-400">null</span>;
    }

    if (typeof obj !== 'object') {
      return <span className="text-gray-800">{String(obj)}</span>;
    }

    if (Array.isArray(obj)) {
      return (
        <div className="ml-4">
          [
          {obj.map((item, index) => (
            <div key={index} className="ml-4">
              {index}: {renderData(item, depth + 1)}
              {index < obj.length - 1 && ','}
            </div>
          ))}
          ]
        </div>
      );
    }

    return (
      <div className={depth > 0 ? 'ml-4' : ''}>
        {'{'}
        {Object.entries(obj).map(([key, value], index, array) => (
          <div key={key} className="ml-4">
            <span className="text-blue-600">"{key}"</span>: {renderData(value, depth + 1)}
            {index < array.length - 1 && ','}
          </div>
        ))}
        {'}'}
      </div>
    );
  };

  return (
    <div className={`${className}`}>
      {showToggle && canUnmask && (
        <div className="mb-4 flex items-center justify-between">
          <div className="text-sm text-gray-600">
            データマスキング: {showUnmasked ? 'オフ' : 'オン'}
          </div>
          <button
            onClick={() => setShowUnmasked(!showUnmasked)}
            className={`px-3 py-1 text-sm rounded ${
              showUnmasked 
                ? 'bg-red-100 text-red-700 hover:bg-red-200' 
                : 'bg-green-100 text-green-700 hover:bg-green-200'
            }`}
          >
            {showUnmasked ? 'マスクを有効化' : 'マスクを解除'}
          </button>
        </div>
      )}

      {!canUnmask && showToggle && (
        <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
          データマスク解除には適切な権限が必要です
        </div>
      )}

      <div className="bg-gray-50 p-4 rounded-lg overflow-auto">
        <pre className="text-sm font-mono">
          {renderData(displayData)}
        </pre>
      </div>

      {showUnmasked && (
        <div className="mt-2 text-xs text-red-600">
          ⚠️ センシティブデータが表示されています。取り扱いにご注意ください。
        </div>
      )}
    </div>
  );
};