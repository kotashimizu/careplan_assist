import { AuditLogEntry, AuditLogQuery, AuditLogStats } from '../types/audit';

class AuditLogService {
  private logs: AuditLogEntry[] = [];
  private readonly storageKey = 'secure-toolkit-audit-logs';
  private readonly maxLogs = 10000; // メモリ制限

  constructor() {
    this.loadLogs();
  }

  private loadLogs() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Failed to load audit logs:', error);
    }
  }

  private saveLogs() {
    try {
      // 最新のログのみ保存（メモリ制限）
      const logsToSave = this.logs.slice(-this.maxLogs);
      localStorage.setItem(this.storageKey, JSON.stringify(logsToSave));
    } catch (error) {
      console.error('Failed to save audit logs:', error);
    }
  }

  async log(entry: AuditLogEntry): Promise<void> {
    // ログを追加
    this.logs.push(entry);
    
    // メモリ制限をチェック
    if (this.logs.length > this.maxLogs) {
      this.logs = this.logs.slice(-this.maxLogs);
    }
    
    // 保存
    this.saveLogs();
    
    // 重大度が高い場合は追加処理
    if (entry.severity === 'critical' || entry.severity === 'high') {
      console.warn('High severity audit event:', entry);
      // 実際の実装では、アラート送信やリアルタイム通知を行う
    }
  }

  async query(query: AuditLogQuery = {}): Promise<AuditLogEntry[]> {
    let results = [...this.logs];
    
    // フィルタリング
    if (query.userId) {
      results = results.filter(log => log.userId === query.userId);
    }
    
    if (query.action) {
      const actions = Array.isArray(query.action) ? query.action : [query.action];
      results = results.filter(log => actions.includes(log.action));
    }
    
    if (query.resource) {
      results = results.filter(log => log.resource === query.resource);
    }
    
    if (query.startDate) {
      const start = new Date(query.startDate).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() >= start);
    }
    
    if (query.endDate) {
      const end = new Date(query.endDate).getTime();
      results = results.filter(log => new Date(log.timestamp).getTime() <= end);
    }
    
    if (query.severity && query.severity.length > 0) {
      results = results.filter(log => log.severity && query.severity!.includes(log.severity));
    }
    
    if (query.status && query.status.length > 0) {
      results = results.filter(log => query.status!.includes(log.status));
    }
    
    // ソート
    const orderBy = query.orderBy || 'timestamp';
    const order = query.order || 'desc';
    
    results.sort((a, b) => {
      let aVal: any = a[orderBy as keyof AuditLogEntry];
      let bVal: any = b[orderBy as keyof AuditLogEntry];
      
      if (orderBy === 'timestamp') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      }
      
      if (order === 'asc') {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });
    
    // ページネーション
    const offset = query.offset || 0;
    const limit = query.limit || 100;
    
    return results.slice(offset, offset + limit);
  }

  async getStats(query: AuditLogQuery = {}): Promise<AuditLogStats> {
    const logs = await this.query(query);
    
    const stats: AuditLogStats = {
      totalEntries: logs.length,
      byAction: {},
      bySeverity: {},
      byStatus: {},
      byUser: [],
      timeRange: {
        start: logs.length > 0 ? logs[logs.length - 1].timestamp : new Date().toISOString(),
        end: logs.length > 0 ? logs[0].timestamp : new Date().toISOString()
      }
    };
    
    // アクション別集計
    logs.forEach(log => {
      stats.byAction[log.action] = (stats.byAction[log.action] || 0) + 1;
      
      if (log.severity) {
        stats.bySeverity[log.severity] = (stats.bySeverity[log.severity] || 0) + 1;
      }
      
      stats.byStatus[log.status] = (stats.byStatus[log.status] || 0) + 1;
    });
    
    // ユーザー別集計
    const userMap = new Map<string, { userName?: string; count: number }>();
    logs.forEach(log => {
      const existing = userMap.get(log.userId) || { count: 0 };
      userMap.set(log.userId, {
        userName: log.userName || existing.userName,
        count: existing.count + 1
      });
    });
    
    stats.byUser = Array.from(userMap.entries())
      .map(([userId, data]) => ({
        userId,
        userName: data.userName,
        count: data.count
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10); // 上位10ユーザー
    
    return stats;
  }

  async clear(): Promise<void> {
    this.logs = [];
    localStorage.removeItem(this.storageKey);
  }

  async export(format: 'json' | 'csv' = 'json', query?: AuditLogQuery): Promise<string> {
    const logs = await this.query(query);
    
    if (format === 'json') {
      return JSON.stringify(logs, null, 2);
    } else if (format === 'csv') {
      // CSV形式でエクスポート
      const headers = [
        'ID', 'Timestamp', 'User ID', 'User Name', 'Action', 
        'Resource', 'Resource ID', 'Severity', 'Status'
      ];
      
      const rows = logs.map(log => [
        log.id,
        log.timestamp,
        log.userId,
        log.userName || '',
        log.action,
        log.resource || '',
        log.resourceId || '',
        log.severity || '',
        log.status
      ]);
      
      const csv = [
        headers.join(','),
        ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
      ].join('\n');
      
      return csv;
    }
    
    throw new Error(`Unsupported export format: ${format}`);
  }

  async rotate(retentionDays: number = 90): Promise<number> {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - retentionDays);
    
    const before = this.logs.length;
    this.logs = this.logs.filter(log => 
      new Date(log.timestamp).getTime() > cutoffDate.getTime()
    );
    const after = this.logs.length;
    
    this.saveLogs();
    
    return before - after; // 削除されたログ数
  }
}

export const auditLogService = new AuditLogService();