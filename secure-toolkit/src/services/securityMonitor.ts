import { auditLogService } from './auditLogService';
import { EventEmitter } from 'events';

// セキュリティイベントの種類
export type SecurityEventType = 
  | 'LOGIN_FAILED'
  | 'LOGIN_SUCCESS'
  | 'SUSPICIOUS_ACTIVITY'
  | 'UNAUTHORIZED_ACCESS'
  | 'DATA_BREACH_ATTEMPT'
  | 'PRIVILEGE_ESCALATION'
  | 'MASS_DATA_ACCESS'
  | 'ACCOUNT_LOCKOUT'
  | 'MFA_BYPASS_ATTEMPT'
  | 'SESSION_HIJACK_ATTEMPT'
  | 'API_ABUSE'
  | 'DDOS_ATTACK';

// セキュリティイベント
export interface SecurityEvent {
  id: string;
  type: SecurityEventType;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
  resource?: string;
  action?: string;
  metadata?: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// セキュリティルール
export interface SecurityRule {
  id: string;
  name: string;
  description: string;
  enabled: boolean;
  conditions: SecurityCondition[];
  actions: SecurityAction[];
  severity: 'low' | 'medium' | 'high' | 'critical';
}

// セキュリティ条件
export interface SecurityCondition {
  type: 'threshold' | 'pattern' | 'anomaly' | 'time_based';
  field: string;
  operator: 'equals' | 'contains' | 'greater_than' | 'less_than' | 'regex';
  value: any;
  timeWindow?: number; // 秒単位
}

// セキュリティアクション
export interface SecurityAction {
  type: 'alert' | 'block' | 'lockout' | 'notify' | 'log';
  target?: 'user' | 'ip' | 'session';
  duration?: number; // 秒単位
  notification?: {
    channels: ('email' | 'sms' | 'slack' | 'webhook')[];
    template: string;
    recipients?: string[];
  };
}

// セキュリティアラート
export interface SecurityAlert {
  id: string;
  ruleId: string;
  event: SecurityEvent;
  triggeredAt: Date;
  status: 'new' | 'acknowledged' | 'resolved' | 'false_positive';
  assignee?: string;
  notes?: string;
}

// インシデント
export interface SecurityIncident {
  id: string;
  alerts: SecurityAlert[];
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'contained' | 'resolved';
  createdAt: Date;
  updatedAt: Date;
  responder?: string;
  timeline: IncidentTimelineEntry[];
}

interface IncidentTimelineEntry {
  timestamp: Date;
  action: string;
  actor: string;
  details?: string;
}

class SecurityMonitor extends EventEmitter {
  private rules: Map<string, SecurityRule> = new Map();
  private events: SecurityEvent[] = [];
  private alerts: Map<string, SecurityAlert> = new Map();
  private incidents: Map<string, SecurityIncident> = new Map();
  private eventCounters: Map<string, number> = new Map();
  private isMonitoring: boolean = false;

  constructor() {
    super();
    this.initializeDefaultRules();
  }

  /**
   * デフォルトのセキュリティルールを初期化
   */
  private initializeDefaultRules() {
    // 連続ログイン失敗の検知
    this.addRule({
      id: 'login_failures',
      name: '連続ログイン失敗',
      description: '5分間に5回以上のログイン失敗を検知',
      enabled: true,
      conditions: [
        {
          type: 'threshold',
          field: 'LOGIN_FAILED',
          operator: 'greater_than',
          value: 5,
          timeWindow: 300 // 5分
        }
      ],
      actions: [
        {
          type: 'lockout',
          target: 'user',
          duration: 1800 // 30分
        },
        {
          type: 'alert',
          notification: {
            channels: ['email', 'slack'],
            template: 'login_failure_alert'
          }
        }
      ],
      severity: 'high'
    });

    // 大量データアクセスの検知
    this.addRule({
      id: 'mass_data_access',
      name: '大量データアクセス',
      description: '10分間に1000件以上のデータアクセスを検知',
      enabled: true,
      conditions: [
        {
          type: 'threshold',
          field: 'data_access_count',
          operator: 'greater_than',
          value: 1000,
          timeWindow: 600 // 10分
        }
      ],
      actions: [
        {
          type: 'alert',
          notification: {
            channels: ['email', 'slack'],
            template: 'mass_data_access_alert'
          }
        },
        {
          type: 'block',
          target: 'session'
        }
      ],
      severity: 'critical'
    });

    // 権限昇格の試み
    this.addRule({
      id: 'privilege_escalation',
      name: '権限昇格の試み',
      description: '権限のないリソースへのアクセス試行を検知',
      enabled: true,
      conditions: [
        {
          type: 'pattern',
          field: 'action',
          operator: 'contains',
          value: 'admin'
        }
      ],
      actions: [
        {
          type: 'alert',
          notification: {
            channels: ['email', 'slack', 'sms'],
            template: 'privilege_escalation_alert'
          }
        },
        {
          type: 'log'
        }
      ],
      severity: 'critical'
    });

    // 異常なアクセスパターン
    this.addRule({
      id: 'anomaly_detection',
      name: '異常アクセスパターン',
      description: '通常と異なるアクセスパターンを検知',
      enabled: true,
      conditions: [
        {
          type: 'anomaly',
          field: 'access_pattern',
          operator: 'equals',
          value: 'unusual'
        }
      ],
      actions: [
        {
          type: 'alert',
          notification: {
            channels: ['email'],
            template: 'anomaly_alert'
          }
        }
      ],
      severity: 'medium'
    });
  }

  /**
   * 監視を開始
   */
  startMonitoring(): void {
    this.isMonitoring = true;
    this.emit('monitoring:started');
    
    // 定期的なクリーンアップ
    setInterval(() => this.cleanup(), 3600000); // 1時間ごと
  }

  /**
   * 監視を停止
   */
  stopMonitoring(): void {
    this.isMonitoring = false;
    this.emit('monitoring:stopped');
  }

  /**
   * セキュリティイベントを記録
   */
  async recordEvent(event: Omit<SecurityEvent, 'id' | 'timestamp'>): Promise<void> {
    if (!this.isMonitoring) return;

    const fullEvent: SecurityEvent = {
      ...event,
      id: this.generateId(),
      timestamp: new Date()
    };

    this.events.push(fullEvent);
    this.emit('event:recorded', fullEvent);

    // イベントカウンターを更新
    const key = `${event.type}:${event.userId || event.ipAddress || 'unknown'}`;
    this.eventCounters.set(key, (this.eventCounters.get(key) || 0) + 1);

    // ルールをチェック
    await this.checkRules(fullEvent);

    // 監査ログに記録
    await auditLogService.log({
      action: 'SECURITY_EVENT',
      userId: event.userId || 'system',
      resourceType: 'security',
      resourceId: fullEvent.id,
      details: {
        eventType: event.type,
        severity: event.severity
      },
      severity: event.severity
    });
  }

  /**
   * ルールをチェック
   */
  private async checkRules(event: SecurityEvent): Promise<void> {
    for (const rule of this.rules.values()) {
      if (!rule.enabled) continue;

      const isTriggered = this.evaluateRule(rule, event);
      if (isTriggered) {
        await this.triggerAlert(rule, event);
      }
    }
  }

  /**
   * ルールを評価
   */
  private evaluateRule(rule: SecurityRule, event: SecurityEvent): boolean {
    return rule.conditions.every(condition => {
      switch (condition.type) {
        case 'threshold':
          return this.evaluateThresholdCondition(condition, event);
        case 'pattern':
          return this.evaluatePatternCondition(condition, event);
        case 'anomaly':
          return this.evaluateAnomalyCondition(condition, event);
        case 'time_based':
          return this.evaluateTimeBasedCondition(condition, event);
        default:
          return false;
      }
    });
  }

  /**
   * 閾値条件を評価
   */
  private evaluateThresholdCondition(condition: SecurityCondition, event: SecurityEvent): boolean {
    const key = `${event.type}:${event.userId || event.ipAddress || 'unknown'}`;
    const count = this.getEventCount(key, condition.timeWindow || 300);

    switch (condition.operator) {
      case 'greater_than':
        return count > condition.value;
      case 'less_than':
        return count < condition.value;
      case 'equals':
        return count === condition.value;
      default:
        return false;
    }
  }

  /**
   * パターン条件を評価
   */
  private evaluatePatternCondition(condition: SecurityCondition, event: SecurityEvent): boolean {
    const fieldValue = (event as any)[condition.field] || event.metadata?.[condition.field];
    
    switch (condition.operator) {
      case 'contains':
        return fieldValue?.toString().includes(condition.value);
      case 'equals':
        return fieldValue === condition.value;
      case 'regex':
        return new RegExp(condition.value).test(fieldValue?.toString() || '');
      default:
        return false;
    }
  }

  /**
   * 異常検知条件を評価
   */
  private evaluateAnomalyCondition(condition: SecurityCondition, event: SecurityEvent): boolean {
    // 簡易的な異常検知（実際には機械学習モデルを使用）
    const isUnusualTime = new Date().getHours() < 6 || new Date().getHours() > 22;
    const isUnusualLocation = event.metadata?.location !== event.metadata?.usual_location;
    const isRapidAccess = this.getEventCount(`access:${event.userId}`, 60) > 100;

    return isUnusualTime || isUnusualLocation || isRapidAccess;
  }

  /**
   * 時間ベース条件を評価
   */
  private evaluateTimeBasedCondition(condition: SecurityCondition, event: SecurityEvent): boolean {
    const hour = new Date().getHours();
    const dayOfWeek = new Date().getDay();

    // 営業時間外のアクセスなど
    if (condition.field === 'outside_business_hours') {
      return hour < 8 || hour > 18 || dayOfWeek === 0 || dayOfWeek === 6;
    }

    return false;
  }

  /**
   * イベント数を取得
   */
  private getEventCount(key: string, timeWindow: number): number {
    const cutoff = new Date(Date.now() - timeWindow * 1000);
    const [eventType, identifier] = key.split(':');
    
    return this.events.filter(e => 
      e.type === eventType &&
      (e.userId === identifier || e.ipAddress === identifier) &&
      e.timestamp > cutoff
    ).length;
  }

  /**
   * アラートをトリガー
   */
  private async triggerAlert(rule: SecurityRule, event: SecurityEvent): Promise<void> {
    const alert: SecurityAlert = {
      id: this.generateId(),
      ruleId: rule.id,
      event,
      triggeredAt: new Date(),
      status: 'new'
    };

    this.alerts.set(alert.id, alert);
    this.emit('alert:triggered', alert);

    // アクションを実行
    for (const action of rule.actions) {
      await this.executeAction(action, event, alert);
    }

    // 高度なアラートの場合はインシデントを作成
    if (rule.severity === 'high' || rule.severity === 'critical') {
      await this.createIncident([alert]);
    }
  }

  /**
   * アクションを実行
   */
  private async executeAction(
    action: SecurityAction, 
    event: SecurityEvent, 
    alert: SecurityAlert
  ): Promise<void> {
    switch (action.type) {
      case 'alert':
        await this.sendNotification(action.notification!, event, alert);
        break;
      
      case 'block':
        await this.blockTarget(action.target!, event);
        break;
      
      case 'lockout':
        await this.lockoutUser(event.userId!, action.duration!);
        break;
      
      case 'log':
        console.log('[SECURITY ALERT]', alert);
        break;
    }
  }

  /**
   * 通知を送信
   */
  private async sendNotification(
    notification: NonNullable<SecurityAction['notification']>,
    event: SecurityEvent,
    alert: SecurityAlert
  ): Promise<void> {
    // 実際の実装では各チャンネルのAPIを使用
    console.log('Sending notification:', {
      channels: notification.channels,
      event: event.type,
      severity: event.severity
    });

    this.emit('notification:sent', {
      channels: notification.channels,
      alert
    });
  }

  /**
   * ターゲットをブロック
   */
  private async blockTarget(target: 'user' | 'ip' | 'session', event: SecurityEvent): Promise<void> {
    // 実際の実装では各種ブロック処理を実行
    console.log('Blocking target:', {
      target,
      identifier: event.userId || event.ipAddress
    });

    this.emit('target:blocked', {
      target,
      event
    });
  }

  /**
   * ユーザーをロックアウト
   */
  private async lockoutUser(userId: string, duration: number): Promise<void> {
    // 実際の実装ではユーザーサービスと連携
    console.log('Locking out user:', {
      userId,
      duration
    });

    this.emit('user:locked', {
      userId,
      until: new Date(Date.now() + duration * 1000)
    });
  }

  /**
   * インシデントを作成
   */
  private async createIncident(alerts: SecurityAlert[]): Promise<SecurityIncident> {
    const incident: SecurityIncident = {
      id: this.generateId(),
      alerts,
      severity: this.calculateIncidentSeverity(alerts),
      status: 'open',
      createdAt: new Date(),
      updatedAt: new Date(),
      timeline: [{
        timestamp: new Date(),
        action: 'INCIDENT_CREATED',
        actor: 'system',
        details: `インシデントが${alerts.length}件のアラートから作成されました`
      }]
    };

    this.incidents.set(incident.id, incident);
    this.emit('incident:created', incident);

    return incident;
  }

  /**
   * インシデントの重要度を計算
   */
  private calculateIncidentSeverity(alerts: SecurityAlert[]): SecurityIncident['severity'] {
    const severities = alerts.map(a => a.event.severity);
    if (severities.includes('critical')) return 'critical';
    if (severities.includes('high')) return 'high';
    if (severities.includes('medium')) return 'medium';
    return 'low';
  }

  /**
   * ルールを追加
   */
  addRule(rule: SecurityRule): void {
    this.rules.set(rule.id, rule);
    this.emit('rule:added', rule);
  }

  /**
   * ルールを削除
   */
  removeRule(ruleId: string): void {
    this.rules.delete(ruleId);
    this.emit('rule:removed', ruleId);
  }

  /**
   * ルールを更新
   */
  updateRule(ruleId: string, updates: Partial<SecurityRule>): void {
    const rule = this.rules.get(ruleId);
    if (rule) {
      this.rules.set(ruleId, { ...rule, ...updates });
      this.emit('rule:updated', ruleId);
    }
  }

  /**
   * アラートを確認
   */
  acknowledgeAlert(alertId: string, assignee: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'acknowledged';
      alert.assignee = assignee;
      this.emit('alert:acknowledged', alert);
    }
  }

  /**
   * アラートを解決
   */
  resolveAlert(alertId: string, notes?: string): void {
    const alert = this.alerts.get(alertId);
    if (alert) {
      alert.status = 'resolved';
      alert.notes = notes;
      this.emit('alert:resolved', alert);
    }
  }

  /**
   * 統計情報を取得
   */
  getStats(): {
    totalEvents: number;
    activeAlerts: number;
    openIncidents: number;
    eventsByType: Record<string, number>;
    alertsBySeverity: Record<string, number>;
  } {
    const eventsByType: Record<string, number> = {};
    const alertsBySeverity: Record<string, number> = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.events.forEach(event => {
      eventsByType[event.type] = (eventsByType[event.type] || 0) + 1;
    });

    Array.from(this.alerts.values())
      .filter(alert => alert.status === 'new' || alert.status === 'acknowledged')
      .forEach(alert => {
        alertsBySeverity[alert.event.severity]++;
      });

    return {
      totalEvents: this.events.length,
      activeAlerts: Array.from(this.alerts.values())
        .filter(a => a.status === 'new' || a.status === 'acknowledged').length,
      openIncidents: Array.from(this.incidents.values())
        .filter(i => i.status === 'open' || i.status === 'investigating').length,
      eventsByType,
      alertsBySeverity
    };
  }

  /**
   * クリーンアップ
   */
  private cleanup(): void {
    const cutoff = new Date(Date.now() - 86400000); // 24時間前
    
    // 古いイベントを削除
    this.events = this.events.filter(e => e.timestamp > cutoff);
    
    // 解決済みのアラートを削除
    Array.from(this.alerts.entries()).forEach(([id, alert]) => {
      if (alert.status === 'resolved' && alert.triggeredAt < cutoff) {
        this.alerts.delete(id);
      }
    });
  }

  /**
   * IDを生成
   */
  private generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }
}

export const securityMonitor = new SecurityMonitor();