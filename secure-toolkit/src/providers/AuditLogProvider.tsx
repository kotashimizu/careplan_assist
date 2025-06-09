import React, { createContext, useCallback, ReactNode } from 'react';
import { AuditLogEntry, AuditAction, AuditMetadata } from '../types/audit';
import { auditLogService } from '../services/auditLogService';
import { useAuth } from '../hooks/useAuth';

interface AuditLogContextType {
  logAction: (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId' | 'userName' | 'status'>) => Promise<void>;
  getLogs: (query?: any) => Promise<AuditLogEntry[]>;
  clearLogs: () => Promise<void>;
}

export const AuditLogContext = createContext<AuditLogContextType | null>(null);

interface AuditLogProviderProps {
  children: ReactNode;
  config: any;
}

export const AuditLogProvider: React.FC<AuditLogProviderProps> = ({ 
  children, 
  config 
}) => {
  const { user } = useAuth();

  // アクションをログに記録
  const logAction = useCallback(async (
    entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'userId' | 'userName' | 'status'>
  ) => {
    if (!config?.enabled) return;

    try {
      // メタデータを収集
      const metadata: AuditMetadata = {
        userAgent: navigator.userAgent,
        ...entry.metadata
      };

      // ログエントリーを作成
      const logEntry: AuditLogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        timestamp: new Date().toISOString(),
        userId: user?.id || 'anonymous',
        userName: user?.name,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details,
        metadata,
        severity: entry.severity || 'low',
        status: 'success'
      };

      // サービスに記録
      await auditLogService.log(logEntry);
    } catch (error) {
      console.error('Audit log error:', error);
    }
  }, [user, config?.enabled]);

  // ログを取得
  const getLogs = useCallback(async (query?: any) => {
    return auditLogService.query(query);
  }, []);

  // ログをクリア
  const clearLogs = useCallback(async () => {
    return auditLogService.clear();
  }, []);

  const value: AuditLogContextType = {
    logAction,
    getLogs,
    clearLogs
  };

  return (
    <AuditLogContext.Provider value={value}>
      {children}
    </AuditLogContext.Provider>
  );
};