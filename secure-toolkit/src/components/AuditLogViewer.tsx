import React, { useState, useEffect } from 'react';
import { useAuditLog } from '../hooks/useAuditLog';
import { AuditLogEntry } from '../types/audit';

interface AuditLogViewerProps {
  userId?: string;
  limit?: number;
  showFilters?: boolean;
  className?: string;
}

/**
 * AuditLogViewer - 監査ログを表示するコンポーネント
 * 
 * @example
 * ```tsx
 * <AuditLogViewer 
 *   userId={currentUser.id}
 *   limit={50}
 *   showFilters={true}
 * />
 * ```
 */
export const AuditLogViewer: React.FC<AuditLogViewerProps> = ({
  userId,
  limit = 100,
  showFilters = true,
  className = ''
}) => {
  const { getLogs } = useAuditLog();
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    action: '',
    severity: '',
    dateFrom: '',
    dateTo: ''
  });

  useEffect(() => {
    loadLogs();
  }, [userId, filters]);

  const loadLogs = async () => {
    setLoading(true);
    try {
      const query: any = { limit };
      
      if (userId) query.userId = userId;
      if (filters.action) query.action = filters.action;
      if (filters.severity) query.severity = [filters.severity];
      if (filters.dateFrom) query.startDate = filters.dateFrom;
      if (filters.dateTo) query.endDate = filters.dateTo;

      const result = await getLogs(query);
      setLogs(result);
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity?: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-green-600 bg-green-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getActionIcon = (action: string) => {
    if (action.includes('LOGIN')) return '🔐';
    if (action.includes('CREATE')) return '➕';
    if (action.includes('UPDATE')) return '✏️';
    if (action.includes('DELETE')) return '🗑️';
    if (action.includes('EXPORT')) return '📤';
    if (action.includes('SECURITY')) return '🛡️';
    return '📝';
  };

  const formatDate = (timestamp: string) => {
    const date = new Date(timestamp);
    return date.toLocaleString('ja-JP', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {showFilters && (
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-medium mb-3">フィルター</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <select
              value={filters.action}
              onChange={(e) => setFilters({ ...filters, action: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">すべてのアクション</option>
              <option value="LOGIN">ログイン</option>
              <option value="CREATE">作成</option>
              <option value="UPDATE">更新</option>
              <option value="DELETE">削除</option>
            </select>

            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">すべての重要度</option>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>

            <input
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="開始日"
            />

            <input
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="px-3 py-2 border border-gray-300 rounded-md"
              placeholder="終了日"
            />
          </div>
        </div>
      )}

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                日時
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                アクション
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                ユーザー
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                重要度
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                詳細
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {logs.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                  ログが見つかりません
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {formatDate(log.timestamp)}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm">
                    <span className="flex items-center">
                      <span className="mr-2">{getActionIcon(log.action)}</span>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                    {log.userName || log.userId}
                  </td>
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getSeverityColor(log.severity)}`}>
                      {log.severity || 'info'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-500">
                    {log.resource && <span className="font-medium">{log.resource}</span>}
                    {log.resourceId && <span className="ml-1">#{log.resourceId}</span>}
                    {log.details && (
                      <details className="inline ml-2">
                        <summary className="cursor-pointer text-blue-600">詳細</summary>
                        <pre className="mt-1 text-xs bg-gray-100 p-2 rounded">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </details>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {logs.length >= limit && (
        <div className="text-center text-sm text-gray-600">
          表示件数が上限（{limit}件）に達しています
        </div>
      )}
    </div>
  );
};