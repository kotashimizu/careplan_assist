import { useEffect, useCallback, useState } from 'react';
import { securityMonitor, SecurityEvent, SecurityAlert, SecurityIncident } from '../services/securityMonitor';
import { useAuth } from './useAuth';

interface UseSecurityMonitorOptions {
  autoStart?: boolean;
  onAlert?: (alert: SecurityAlert) => void;
  onIncident?: (incident: SecurityIncident) => void;
  onBlocked?: (event: any) => void;
}

interface UseSecurityMonitorResult {
  isMonitoring: boolean;
  startMonitoring: () => void;
  stopMonitoring: () => void;
  recordEvent: (event: Omit<SecurityEvent, 'id' | 'timestamp'>) => Promise<void>;
  stats: any;
  alerts: SecurityAlert[];
  incidents: SecurityIncident[];
}

/**
 * useSecurityMonitor - セキュリティ監視フック
 * 
 * @example
 * ```tsx
 * const { 
 *   isMonitoring, 
 *   recordEvent, 
 *   alerts 
 * } = useSecurityMonitor({
 *   autoStart: true,
 *   onAlert: (alert) => console.log('New alert:', alert)
 * });
 * ```
 */
export function useSecurityMonitor(
  options: UseSecurityMonitorOptions = {}
): UseSecurityMonitorResult {
  const { user } = useAuth();
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [stats, setStats] = useState<any>({});
  const [alerts, setAlerts] = useState<SecurityAlert[]>([]);
  const [incidents, setIncidents] = useState<SecurityIncident[]>([]);

  // 監視開始
  const startMonitoring = useCallback(() => {
    securityMonitor.startMonitoring();
    setIsMonitoring(true);
  }, []);

  // 監視停止
  const stopMonitoring = useCallback(() => {
    securityMonitor.stopMonitoring();
    setIsMonitoring(false);
  }, []);

  // イベント記録
  const recordEvent = useCallback(async (
    event: Omit<SecurityEvent, 'id' | 'timestamp'>
  ) => {
    await securityMonitor.recordEvent({
      ...event,
      userId: event.userId || user?.id
    });
  }, [user]);

  // 統計情報の更新
  const updateStats = useCallback(() => {
    setStats(securityMonitor.getStats());
  }, []);

  useEffect(() => {
    // 自動開始
    if (options.autoStart) {
      startMonitoring();
    }

    // イベントリスナーの設定
    const handleAlertTriggered = (alert: SecurityAlert) => {
      setAlerts(prev => [alert, ...prev].slice(0, 50));
      updateStats();
      options.onAlert?.(alert);
    };

    const handleIncidentCreated = (incident: SecurityIncident) => {
      setIncidents(prev => [incident, ...prev].slice(0, 20));
      updateStats();
      options.onIncident?.(incident);
    };

    const handleTargetBlocked = (event: any) => {
      options.onBlocked?.(event);
    };

    const handleAlertResolved = () => {
      updateStats();
    };

    securityMonitor.on('alert:triggered', handleAlertTriggered);
    securityMonitor.on('incident:created', handleIncidentCreated);
    securityMonitor.on('target:blocked', handleTargetBlocked);
    securityMonitor.on('alert:resolved', handleAlertResolved);
    securityMonitor.on('alert:acknowledged', handleAlertResolved);

    // 初期統計情報の取得
    updateStats();

    // 定期的な統計更新
    const statsInterval = setInterval(updateStats, 10000); // 10秒ごと

    // クリーンアップ
    return () => {
      if (options.autoStart) {
        stopMonitoring();
      }
      clearInterval(statsInterval);
      securityMonitor.off('alert:triggered', handleAlertTriggered);
      securityMonitor.off('incident:created', handleIncidentCreated);
      securityMonitor.off('target:blocked', handleTargetBlocked);
      securityMonitor.off('alert:resolved', handleAlertResolved);
      securityMonitor.off('alert:acknowledged', handleAlertResolved);
    };
  }, []);

  // 認証関連イベントの自動記録
  useEffect(() => {
    if (!isMonitoring || !user) return;

    // ログイン成功の記録
    const handleLoginSuccess = async () => {
      await recordEvent({
        type: 'LOGIN_SUCCESS',
        severity: 'low',
        metadata: {
          timestamp: new Date().toISOString()
        }
      });
    };

    // ページ離脱時の記録
    const handleBeforeUnload = () => {
      recordEvent({
        type: 'SESSION_ENDED',
        severity: 'low',
        metadata: {
          duration: Date.now() - (window as any).sessionStart
        }
      });
    };

    // セッション開始時刻を記録
    (window as any).sessionStart = Date.now();

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isMonitoring, user, recordEvent]);

  return {
    isMonitoring,
    startMonitoring,
    stopMonitoring,
    recordEvent,
    stats,
    alerts,
    incidents
  };
}