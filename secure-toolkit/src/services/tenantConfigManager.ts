import { TenantConfig, ComplianceStandard, SecurityLevel } from '../types/tenant';
import { COMPLIANCE_MAPPINGS } from '../constants/compliance';

export interface TenantConfigService {
  getConfig(tenantId: string): Promise<TenantConfig | null>;
  updateConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig>;
  createConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig>;
  deleteConfig(tenantId: string): Promise<boolean>;
  validateConfig(config: Partial<TenantConfig>): Promise<ConfigValidationResult>;
  getDefaultConfig(industry?: string): TenantConfig;
}

export interface ConfigValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * TenantConfigManager - テナント設定管理サービス
 * 
 * @example
 * ```typescript
 * const manager = new TenantConfigManager();
 * const config = await manager.getConfig('tenant-123');
 * 
 * // 設定更新
 * await manager.updateConfig('tenant-123', {
 *   security: { level: 'high' }
 * });
 * ```
 */
export class TenantConfigManager implements TenantConfigService {
  private configs: Map<string, TenantConfig> = new Map();
  
  constructor(private storageAdapter?: StorageAdapter) {}

  /**
   * テナント設定を取得
   */
  async getConfig(tenantId: string): Promise<TenantConfig | null> {
    // まずメモリキャッシュから確認
    if (this.configs.has(tenantId)) {
      return this.configs.get(tenantId)!;
    }

    // ストレージアダプターから取得
    if (this.storageAdapter) {
      const config = await this.storageAdapter.get(tenantId);
      if (config) {
        this.configs.set(tenantId, config);
        return config;
      }
    }

    return null;
  }

  /**
   * テナント設定を更新
   */
  async updateConfig(tenantId: string, updates: Partial<TenantConfig>): Promise<TenantConfig> {
    const existing = await this.getConfig(tenantId);
    if (!existing) {
      throw new Error(`テナント設定が見つかりません: ${tenantId}`);
    }

    const newConfig = this.mergeConfig(existing, updates);
    
    // バリデーション
    const validation = await this.validateConfig(newConfig);
    if (!validation.isValid) {
      throw new Error(`設定が無効です: ${validation.errors.join(', ')}`);
    }

    // 保存
    this.configs.set(tenantId, newConfig);
    if (this.storageAdapter) {
      await this.storageAdapter.save(tenantId, newConfig);
    }

    return newConfig;
  }

  /**
   * 新しいテナント設定を作成
   */
  async createConfig(tenantId: string, config: Partial<TenantConfig>): Promise<TenantConfig> {
    const existing = await this.getConfig(tenantId);
    if (existing) {
      throw new Error(`テナント設定が既に存在します: ${tenantId}`);
    }

    const defaultConfig = this.getDefaultConfig(config.industry);
    const newConfig = this.mergeConfig(defaultConfig, config);

    // バリデーション
    const validation = await this.validateConfig(newConfig);
    if (!validation.isValid) {
      throw new Error(`設定が無効です: ${validation.errors.join(', ')}`);
    }

    // 保存
    this.configs.set(tenantId, newConfig);
    if (this.storageAdapter) {
      await this.storageAdapter.save(tenantId, newConfig);
    }

    return newConfig;
  }

  /**
   * テナント設定を削除
   */
  async deleteConfig(tenantId: string): Promise<boolean> {
    this.configs.delete(tenantId);
    
    if (this.storageAdapter) {
      return await this.storageAdapter.delete(tenantId);
    }
    
    return true;
  }

  /**
   * 設定をバリデーション
   */
  async validateConfig(config: Partial<TenantConfig>): Promise<ConfigValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // 必須フィールドチェック
    if (!config.app?.name) {
      errors.push('アプリケーション名は必須です');
    }

    if (!config.tenantId) {
      errors.push('テナントIDは必須です');
    }

    // セキュリティ設定チェック
    if (config.security) {
      if (config.security.level === 'maximum' && !config.security.authentication?.requireMFA) {
        warnings.push('最高セキュリティレベルでは二要素認証を推奨します');
      }

      if (config.security.encryption?.autoEncryptPII && !config.security.encryption.algorithm) {
        errors.push('PII自動暗号化が有効な場合、暗号化アルゴリズムの指定は必須です');
      }
    }

    // 業界別コンプライアンスチェック
    if (config.industry && config.compliance?.standards) {
      const requiredStandards = COMPLIANCE_MAPPINGS[config.industry as keyof typeof COMPLIANCE_MAPPINGS];
      if (requiredStandards) {
        const missing = requiredStandards.filter(
          standard => !config.compliance!.standards!.includes(standard as ComplianceStandard)
        );
        if (missing.length > 0) {
          warnings.push(`${config.industry}業界では以下の基準を推奨します: ${missing.join(', ')}`);
        }
      }
    }

    // 機能の整合性チェック
    if (config.features?.mfa && !config.security?.authentication?.requireMFA) {
      warnings.push('MFA機能が有効ですが、認証設定で必須になっていません');
    }

    if (config.features?.audit && !config.audit?.enabled) {
      warnings.push('監査機能が有効ですが、監査ログが無効になっています');
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  }

  /**
   * デフォルト設定を取得
   */
  getDefaultConfig(industry?: string): TenantConfig {
    const baseConfig: TenantConfig = {
      tenantId: '',
      app: {
        name: 'アプリケーション',
        version: '1.0.0',
        description: ''
      },
      industry: industry as any || 'general',
      security: {
        level: 'standard' as SecurityLevel,
        authentication: {
          requireMFA: false,
          sessionTimeout: 3600,
          maxLoginAttempts: 5,
          lockoutDuration: 900
        },
        encryption: {
          algorithm: 'AES-256',
          autoEncryptPII: false,
          keyRotationInterval: 30
        },
        accessControl: {
          rbacEnabled: true,
          defaultRole: 'user',
          inheritanceEnabled: true
        }
      },
      features: {
        auth: true,
        encryption: true,
        audit: true,
        mfa: false,
        audioProcessing: false,
        videoCall: false,
        chat: false,
        notifications: true,
        fileUpload: false,
        billing: false,
        inventory: false,
        appointments: false,
        analytics: false
      },
      compliance: {
        standards: industry ? [...(COMPLIANCE_MAPPINGS[industry as keyof typeof COMPLIANCE_MAPPINGS] || [])] as ComplianceStandard[] : [],
        dataRetention: {
          enabled: true,
          days: 90,
          autoDelete: false
        },
        privacyPolicy: {
          version: '1.0',
          lastUpdated: new Date(),
          consentRequired: true
        }
      },
      audit: {
        enabled: true,
        retentionDays: 365,
        exportFormats: ['json', 'csv'],
        realTimeAlerts: false
      },
      theme: {
        primaryColor: '#3B82F6',
        mode: 'light',
        customCSS: ''
      },
      api: {
        rateLimit: {
          requests: 1000,
          window: 3600
        },
        allowedOrigins: ['*'],
        apiKeys: []
      },
      notifications: {
        email: {
          enabled: true,
          templates: {}
        },
        push: {
          enabled: false,
          vapidKey: ''
        },
        sms: {
          enabled: false,
          provider: ''
        }
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // 業界別の追加設定
    if (industry === 'healthcare') {
      baseConfig.security.level = 'high';
      baseConfig.security.authentication!.requireMFA = true;
      baseConfig.security.encryption!.autoEncryptPII = true;
      baseConfig.features.mfa = true;
      baseConfig.compliance.dataRetention = { enabled: true, days: 2555, autoDelete: false }; // 7年
    } else if (industry === 'finance') {
      baseConfig.security.level = 'maximum';
      baseConfig.security.authentication!.requireMFA = true;
      baseConfig.security.encryption!.autoEncryptPII = true;
      baseConfig.features.mfa = true;
      baseConfig.audit!.realTimeAlerts = true;
    } else if (industry === 'gaming') {
      baseConfig.features.chat = true;
      baseConfig.features.notifications = true;
      baseConfig.features.analytics = true;
    } else if (industry === 'ecommerce') {
      baseConfig.features.billing = true;
      baseConfig.features.inventory = true;
      baseConfig.features.analytics = true;
      baseConfig.security.encryption!.autoEncryptPII = true;
    }

    return baseConfig;
  }

  /**
   * 設定をマージ
   */
  private mergeConfig(base: TenantConfig, updates: Partial<TenantConfig>): TenantConfig {
    const merged = { ...base };

    // 深いマージを実行
    if (updates.app) {
      merged.app = { ...merged.app, ...updates.app };
    }

    if (updates.security) {
      merged.security = {
        ...merged.security,
        ...updates.security,
        authentication: updates.security.authentication 
          ? { ...merged.security.authentication, ...updates.security.authentication }
          : merged.security.authentication,
        encryption: updates.security.encryption
          ? { ...merged.security.encryption, ...updates.security.encryption }
          : merged.security.encryption,
        accessControl: updates.security.accessControl
          ? { ...merged.security.accessControl, ...updates.security.accessControl }
          : merged.security.accessControl
      };
    }

    if (updates.features) {
      merged.features = { ...merged.features, ...updates.features };
    }

    if (updates.compliance) {
      merged.compliance = {
        ...merged.compliance,
        ...updates.compliance,
        dataRetention: updates.compliance.dataRetention
          ? { ...merged.compliance.dataRetention, ...updates.compliance.dataRetention }
          : merged.compliance.dataRetention,
        privacyPolicy: updates.compliance.privacyPolicy
          ? { ...merged.compliance.privacyPolicy, ...updates.compliance.privacyPolicy }
          : merged.compliance.privacyPolicy
      };
    }

    if (updates.audit) {
      merged.audit = { ...merged.audit, ...updates.audit };
    }

    if (updates.theme) {
      merged.theme = { ...merged.theme, ...updates.theme };
    }

    if (updates.api) {
      merged.api = {
        ...merged.api,
        ...updates.api,
        rateLimit: updates.api.rateLimit
          ? { ...merged.api.rateLimit, ...updates.api.rateLimit }
          : merged.api.rateLimit
      };
    }

    if (updates.notifications) {
      merged.notifications = {
        ...merged.notifications,
        ...updates.notifications,
        email: updates.notifications.email
          ? { ...merged.notifications.email, ...updates.notifications.email }
          : merged.notifications.email,
        push: updates.notifications.push
          ? { ...merged.notifications.push, ...updates.notifications.push }
          : merged.notifications.push,
        sms: updates.notifications.sms
          ? { ...merged.notifications.sms, ...updates.notifications.sms }
          : merged.notifications.sms
      };
    }

    // その他のフィールド
    Object.keys(updates).forEach(key => {
      if (!['app', 'security', 'features', 'compliance', 'audit', 'theme', 'api', 'notifications'].includes(key)) {
        (merged as any)[key] = (updates as any)[key];
      }
    });

    merged.updatedAt = new Date();

    return merged;
  }
}

/**
 * ストレージアダプターインターface
 */
export interface StorageAdapter {
  get(tenantId: string): Promise<TenantConfig | null>;
  save(tenantId: string, config: TenantConfig): Promise<void>;
  delete(tenantId: string): Promise<boolean>;
  list(): Promise<string[]>;
}

/**
 * LocalStorageアダプター
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix = 'secure-toolkit-config-';

  async get(tenantId: string): Promise<TenantConfig | null> {
    try {
      const data = localStorage.getItem(this.prefix + tenantId);
      return data ? JSON.parse(data) : null;
    } catch {
      return null;
    }
  }

  async save(tenantId: string, config: TenantConfig): Promise<void> {
    localStorage.setItem(this.prefix + tenantId, JSON.stringify(config));
  }

  async delete(tenantId: string): Promise<boolean> {
    localStorage.removeItem(this.prefix + tenantId);
    return true;
  }

  async list(): Promise<string[]> {
    const keys: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith(this.prefix)) {
        keys.push(key.replace(this.prefix, ''));
      }
    }
    return keys;
  }
}

/**
 * メモリアダプター（開発・テスト用）
 */
export class MemoryStorageAdapter implements StorageAdapter {
  private storage: Map<string, TenantConfig> = new Map();

  async get(tenantId: string): Promise<TenantConfig | null> {
    return this.storage.get(tenantId) || null;
  }

  async save(tenantId: string, config: TenantConfig): Promise<void> {
    this.storage.set(tenantId, config);
  }

  async delete(tenantId: string): Promise<boolean> {
    return this.storage.delete(tenantId);
  }

  async list(): Promise<string[]> {
    return Array.from(this.storage.keys());
  }
}

// デフォルトのマネージャーインスタンス
export const tenantConfigManager = new TenantConfigManager(new LocalStorageAdapter());