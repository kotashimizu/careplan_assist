import React, { useState, useEffect } from 'react';
import { securityMonitor, SecurityAlert, SecurityIncident } from '../services/securityMonitor';
import { LoadingSpinner } from './common';

interface SecurityDashboardProps {
  className?: string;
  refreshInterval?: number; // ミリ秒
}

export const SecurityDashboard: React.FC<SecurityDashboardProps> = ({
  className = '',
  refreshInterval = 5000 // 5秒ごとに更新
}) => {
  const [stats, setStats] = useState<any>(null);
  const [activeAlerts, setActiveAlerts] = useState<SecurityAlert[]>([]);
  const [recentIncidents, setRecentIncidents] = useState<SecurityIncident[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 初期データ取得
    loadData();

    // 定期更新
    const interval = setInterval(loadData, refreshInterval);

    // イベントリスナー
    const handleAlertTriggered = (alert: SecurityAlert) => {
      setActiveAlerts(prev => [alert, ...prev].slice(0, 10));
    };

    const handleIncidentCreated = (incident: SecurityIncident) => {
      setRecentIncidents(prev => [incident, ...prev].slice(0, 5));
    };

    securityMonitor.on('alert:triggered', handleAlertTriggered);
    securityMonitor.on('incident:created', handleIncidentCreated);

    // クリーンアップ
    return () => {
      clearInterval(interval);
      securityMonitor.off('alert:triggered', handleAlertTriggered);
      securityMonitor.off('incident:created', handleIncidentCreated);
    };
  }, [refreshInterval]);

  const loadData = () => {
    setStats(securityMonitor.getStats());
    setIsLoading(false);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'text-red-600 bg-red-100';
      case 'high': return 'text-orange-600 bg-orange-100';
      case 'medium': return 'text-yellow-600 bg-yellow-100';
      case 'low': return 'text-blue-600 bg-blue-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'new': return 'text-red-600';
      case 'acknowledged': return 'text-yellow-600';
      case 'resolved': return 'text-green-600';
      case 'false_positive': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* ヘッダー */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">セキュリティダッシュボード</h2>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-sm text-gray-600">監視中</span>
        </div>
      </div>

      {/* 統計カード */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">総イベント数</div>
          <div className="text-3xl font-bold mt-2">{stats?.totalEvents || 0}</div>
          <div className="text-xs text-gray-500 mt-1">過去24時間</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">アクティブアラート</div>
          <div className="text-3xl font-bold mt-2 text-orange-600">
            {stats?.activeAlerts || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">要対応</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">未解決インシデント</div>
          <div className="text-3xl font-bold mt-2 text-red-600">
            {stats?.openIncidents || 0}
          </div>
          <div className="text-xs text-gray-500 mt-1">調査中</div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <div className="text-sm text-gray-600">脅威レベル</div>
          <div className="mt-2">
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                stats?.activeAlerts > 5 ? 'bg-red-100 text-red-600' :
                stats?.activeAlerts > 2 ? 'bg-yellow-100 text-yellow-600' :
                'bg-green-100 text-green-600'
              }`}>
                {stats?.activeAlerts > 5 ? '高' : 
                 stats?.activeAlerts > 2 ? '中' : '低'}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* イベントタイプ別統計 */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">イベントタイプ別統計</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(stats?.eventsByType || {}).map(([type, count]) => (
            <div key={type} className="text-center">
              <div className="text-2xl font-bold">{count}</div>
              <div className="text-xs text-gray-600">{type.replace(/_/g, ' ')}</div>
            </div>
          ))}
        </div>
      </div>

      {/* アクティブアラート */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">アクティブアラート</h3>
        {activeAlerts.length === 0 ? (
          <p className="text-gray-500">現在アクティブなアラートはありません</p>
        ) : (
          <div className="space-y-3">
            {activeAlerts.slice(0, 5).map(alert => (
              <div key={alert.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        getSeverityColor(alert.event.severity)
                      }`}>
                        {alert.event.severity.toUpperCase()}
                      </span>
                      <span className={`text-sm font-medium ${
                        getStatusColor(alert.status)
                      }`}>
                        {alert.status === 'new' ? '新規' : 
                         alert.status === 'acknowledged' ? '確認済み' : 
                         alert.status}
                      </span>
                    </div>
                    <div className="mt-2">
                      <div className="font-medium">{alert.event.type.replace(/_/g, ' ')}</div>
                      <div className="text-sm text-gray-600">
                        {alert.event.userId && `ユーザー: ${alert.event.userId}`}
                        {alert.event.ipAddress && ` | IP: ${alert.event.ipAddress}`}
                      </div>
                    </div>
                  </div>
                  <div className="text-xs text-gray-500">
                    {new Date(alert.triggeredAt).toLocaleString('ja-JP')}
                  </div>
                </div>
                
                {alert.status === 'new' && (
                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => securityMonitor.acknowledgeAlert(alert.id, 'current-user')}
                      className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                      確認
                    </button>
                    <button
                      onClick={() => securityMonitor.resolveAlert(alert.id, '誤検知')}
                      className="px-3 py-1 text-sm bg-gray-600 text-white rounded hover:bg-gray-700"
                    >
                      誤検知
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 重要度別アラート */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">重要度別アラート分布</h3>
        <div className="grid grid-cols-4 gap-4">
          {['critical', 'high', 'medium', 'low'].map(severity => (
            <div key={severity} className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full ${
                getSeverityColor(severity)
              }`}>
                <span className="text-2xl font-bold">
                  {stats?.alertsBySeverity[severity] || 0}
                </span>
              </div>
              <div className="mt-2 text-sm text-gray-600 capitalize">{severity}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 最近のインシデント */}
      <div className="bg-white p-6 rounded-lg shadow">
        <h3 className="text-lg font-semibold mb-4">最近のインシデント</h3>
        {recentIncidents.length === 0 ? (
          <p className="text-gray-500">インシデントはありません</p>
        ) : (
          <div className="space-y-3">
            {recentIncidents.map(incident => (
              <div key={incident.id} className="border rounded-lg p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      getSeverityColor(incident.severity)
                    }`}>
                      {incident.severity.toUpperCase()}
                    </span>
                    <span className="ml-2 text-sm text-gray-600">
                      {incident.alerts.length}件のアラート
                    </span>
                  </div>
                  <span className={`text-sm ${
                    incident.status === 'open' ? 'text-red-600' :
                    incident.status === 'investigating' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {incident.status === 'open' ? 'オープン' :
                     incident.status === 'investigating' ? '調査中' :
                     incident.status === 'contained' ? '封じ込め済み' :
                     '解決済み'}
                  </span>
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  作成: {new Date(incident.createdAt).toLocaleString('ja-JP')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};