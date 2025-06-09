// 監査ログ関連の型定義

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName?: string;
  action: AuditAction;
  resource?: string;
  resourceId?: string;
  details?: Record<string, any>;
  metadata?: AuditMetadata;
  severity?: 'low' | 'medium' | 'high' | 'critical';
  status: 'success' | 'failure' | 'error';
  errorMessage?: string;
}

export type AuditAction = 
  // 認証関連
  | 'LOGIN'
  | 'LOGOUT'
  | 'LOGIN_FAILED'
  | 'PASSWORD_CHANGE'
  | 'PASSWORD_RESET'
  | 'MFA_ENABLE'
  | 'MFA_DISABLE'
  
  // データ操作
  | 'CREATE'
  | 'READ'
  | 'UPDATE'
  | 'DELETE'
  | 'EXPORT'
  | 'IMPORT'
  
  // 権限関連
  | 'PERMISSION_GRANT'
  | 'PERMISSION_REVOKE'
  | 'ROLE_ASSIGN'
  | 'ROLE_REMOVE'
  
  // セキュリティ
  | 'ACCESS_DENIED'
  | 'SUSPICIOUS_ACTIVITY'
  | 'SECURITY_ALERT'
  | 'DATA_BREACH_ATTEMPT'
  
  // システム
  | 'SYSTEM_CONFIG_CHANGE'
  | 'BACKUP_CREATE'
  | 'BACKUP_RESTORE'
  | 'MAINTENANCE_START'
  | 'MAINTENANCE_END'
  
  // カスタム
  | string;

export interface AuditMetadata {
  ipAddress?: string;
  userAgent?: string;
  location?: {
    country?: string;
    city?: string;
    latitude?: number;
    longitude?: number;
  };
  device?: {
    type?: 'desktop' | 'mobile' | 'tablet';
    os?: string;
    browser?: string;
  };
  sessionId?: string;
  requestId?: string;
  duration?: number;
}

export interface AuditLogQuery {
  userId?: string;
  action?: AuditAction | AuditAction[];
  resource?: string;
  startDate?: Date | string;
  endDate?: Date | string;
  severity?: string[];
  status?: string[];
  limit?: number;
  offset?: number;
  orderBy?: 'timestamp' | 'severity' | 'action';
  order?: 'asc' | 'desc';
}

export interface AuditLogStats {
  totalEntries: number;
  byAction: Record<string, number>;
  bySeverity: Record<string, number>;
  byStatus: Record<string, number>;
  byUser: Array<{
    userId: string;
    userName?: string;
    count: number;
  }>;
  timeRange: {
    start: string;
    end: string;
  };
}

export interface AuditLogExport {
  format: 'json' | 'csv' | 'pdf';
  query: AuditLogQuery;
  includeMetadata?: boolean;
  encryptExport?: boolean;
}

export interface AuditLogRetention {
  enabled: boolean;
  retentionDays: number;
  archiveBeforeDelete?: boolean;
  excludeActions?: AuditAction[];
}