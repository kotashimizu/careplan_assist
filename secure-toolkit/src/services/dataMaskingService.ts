import { User } from '../types/auth';

// マスキングルールの型定義
export interface MaskingRule {
  field: string;
  type: 'partial' | 'full' | 'custom' | 'hash' | 'encrypt';
  showFirst?: number;
  showLast?: number;
  maskChar?: string;
  customFunction?: (value: any) => any;
  allowedRoles?: string[];
}

// マスキング設定
export interface MaskingConfig {
  rules: MaskingRule[];
  defaultMaskChar: string;
  preserveDataType: boolean;
  enableAudit: boolean;
}

// PHI（Protected Health Information）フィールド
const PHI_FIELDS = [
  'ssn', 'socialSecurityNumber',
  'driverLicense', 'licenseNumber',
  'passport', 'passportNumber',
  'creditCard', 'cardNumber',
  'bankAccount', 'accountNumber',
  'medicalRecordNumber', 'mrn',
  'healthPlanNumber',
  'deviceId', 'ipAddress',
  'biometric', 'faceImage', 'fingerprint'
];

// PII（Personally Identifiable Information）フィールド
const PII_FIELDS = [
  'email', 'emailAddress',
  'phone', 'phoneNumber', 'mobile',
  'address', 'streetAddress', 'homeAddress',
  'dateOfBirth', 'dob', 'birthDate',
  'firstName', 'lastName', 'fullName',
  'maidenName', 'mothersMaidenName'
];

class DataMaskingService {
  private defaultConfig: MaskingConfig = {
    rules: this.generateDefaultRules(),
    defaultMaskChar: '*',
    preserveDataType: true,
    enableAudit: true
  };

  private config: MaskingConfig;

  constructor(config?: Partial<MaskingConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * デフォルトのマスキングルールを生成
   */
  private generateDefaultRules(): MaskingRule[] {
    return [
      // SSN: XXX-XX-1234 形式
      {
        field: 'ssn',
        type: 'partial',
        showLast: 4,
        maskChar: 'X'
      },
      // クレジットカード: **** **** **** 1234
      {
        field: 'creditCard',
        type: 'partial',
        showLast: 4,
        maskChar: '*'
      },
      // メールアドレス: u***@example.com
      {
        field: 'email',
        type: 'custom',
        customFunction: (email: string) => {
          const [local, domain] = email.split('@');
          if (!local || !domain) return email;
          const masked = local[0] + '***';
          return `${masked}@${domain}`;
        }
      },
      // 電話番号: ***-***-1234
      {
        field: 'phone',
        type: 'partial',
        showLast: 4,
        maskChar: '*'
      },
      // 生年月日: 19XX-XX-XX
      {
        field: 'dateOfBirth',
        type: 'custom',
        customFunction: (date: string | Date) => {
          const d = new Date(date);
          return `${d.getFullYear()}-XX-XX`;
        }
      },
      // 医療記録番号: 完全マスク（権限なし）
      {
        field: 'medicalRecordNumber',
        type: 'full',
        allowedRoles: ['doctor', 'nurse', 'admin']
      },
      // IPアドレス: 192.168.X.X
      {
        field: 'ipAddress',
        type: 'custom',
        customFunction: (ip: string) => {
          const parts = ip.split('.');
          if (parts.length !== 4) return ip;
          return `${parts[0]}.${parts[1]}.X.X`;
        }
      }
    ];
  }

  /**
   * データをマスク
   */
  maskData(data: any, userRole?: string, userId?: string): any {
    if (data === null || data === undefined) return data;

    // 配列の場合
    if (Array.isArray(data)) {
      return data.map(item => this.maskData(item, userRole, userId));
    }

    // オブジェクトの場合
    if (typeof data === 'object') {
      const masked: any = {};
      
      for (const [key, value] of Object.entries(data)) {
        // フィールドがPHI/PIIかチェック
        if (this.isSensitiveField(key)) {
          const rule = this.findRule(key);
          
          if (rule) {
            // ロールチェック
            if (rule.allowedRoles && userRole && rule.allowedRoles.includes(userRole)) {
              masked[key] = value; // マスクしない
            } else {
              masked[key] = this.applyMask(value, rule);
            }
          } else {
            // デフォルトマスキング
            masked[key] = this.applyDefaultMask(value);
          }
        } else if (typeof value === 'object') {
          // ネストされたオブジェクトを再帰的に処理
          masked[key] = this.maskData(value, userRole, userId);
        } else {
          masked[key] = value;
        }
      }

      // 監査ログ
      if (this.config.enableAudit && this.hasBeenMasked(data, masked)) {
        this.logMaskingActivity(userId || 'unknown', userRole || 'unknown');
      }

      return masked;
    }

    // プリミティブ値はそのまま返す
    return data;
  }

  /**
   * 動的マスキング（リアルタイム）
   */
  maskPHI(data: any, userRole: string, context?: any): any {
    // コンテキストに基づいた動的ルール適用
    const dynamicRules = this.generateDynamicRules(context);
    const extendedConfig = {
      ...this.config,
      rules: [...this.config.rules, ...dynamicRules]
    };

    // 一時的に設定を変更してマスキング
    const originalConfig = this.config;
    this.config = extendedConfig;
    const result = this.maskData(data, userRole);
    this.config = originalConfig;

    return result;
  }

  /**
   * 静的マスキング（開発環境用）
   */
  createMaskedDataset(sourceData: any[], preserveStructure: boolean = true): any[] {
    return sourceData.map(item => {
      if (preserveStructure) {
        // 構造を保持しながらマスク
        return this.maskData(item);
      } else {
        // 完全な匿名化
        return this.anonymizeData(item);
      }
    });
  }

  /**
   * マスキングルールを適用
   */
  private applyMask(value: any, rule: MaskingRule): any {
    if (value === null || value === undefined) return value;

    const strValue = String(value);

    switch (rule.type) {
      case 'partial':
        return this.partialMask(strValue, rule);
      
      case 'full':
        return this.fullMask(strValue, rule);
      
      case 'custom':
        return rule.customFunction ? rule.customFunction(value) : value;
      
      case 'hash':
        return this.hashValue(strValue);
      
      case 'encrypt':
        return this.encryptValue(strValue);
      
      default:
        return value;
    }
  }

  /**
   * 部分マスキング
   */
  private partialMask(value: string, rule: MaskingRule): string {
    const maskChar = rule.maskChar || this.config.defaultMaskChar;
    const showFirst = rule.showFirst || 0;
    const showLast = rule.showLast || 0;

    if (value.length <= showFirst + showLast) {
      return maskChar.repeat(value.length);
    }

    const first = value.substring(0, showFirst);
    const last = value.substring(value.length - showLast);
    const middle = maskChar.repeat(value.length - showFirst - showLast);

    return first + middle + last;
  }

  /**
   * 完全マスキング
   */
  private fullMask(value: string, rule: MaskingRule): string {
    const maskChar = rule.maskChar || this.config.defaultMaskChar;
    
    if (this.config.preserveDataType) {
      // データ型を保持
      if (/^\d+$/.test(value)) {
        return '0'.repeat(value.length);
      }
      if (/^[A-Z]+$/.test(value)) {
        return 'X'.repeat(value.length);
      }
    }

    return maskChar.repeat(value.length);
  }

  /**
   * ハッシュ化
   */
  private hashValue(value: string): string {
    // 簡易ハッシュ（実際の実装では適切なハッシュ関数を使用）
    let hash = 0;
    for (let i = 0; i < value.length; i++) {
      const char = value.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `HASH_${Math.abs(hash).toString(16).toUpperCase()}`;
  }

  /**
   * 暗号化（実際の実装では適切な暗号化を使用）
   */
  private encryptValue(value: string): string {
    return `ENC_${Buffer.from(value).toString('base64')}`;
  }

  /**
   * デフォルトマスキング
   */
  private applyDefaultMask(value: any): any {
    if (typeof value === 'string') {
      return this.config.defaultMaskChar.repeat(value.length);
    }
    return '[MASKED]';
  }

  /**
   * センシティブフィールドかチェック
   */
  private isSensitiveField(fieldName: string): boolean {
    const lowerField = fieldName.toLowerCase();
    return PHI_FIELDS.some(field => lowerField.includes(field.toLowerCase())) ||
           PII_FIELDS.some(field => lowerField.includes(field.toLowerCase()));
  }

  /**
   * フィールドに対するルールを検索
   */
  private findRule(fieldName: string): MaskingRule | undefined {
    const lowerField = fieldName.toLowerCase();
    return this.config.rules.find(rule => 
      lowerField.includes(rule.field.toLowerCase())
    );
  }

  /**
   * データが匿名化されたかチェック
   */
  private anonymizeData(data: any): any {
    const anonymized: any = {};
    
    for (const [key, value] of Object.entries(data)) {
      if (this.isSensitiveField(key)) {
        // センシティブフィールドは完全に削除またはダミーデータに置換
        anonymized[key] = this.generateDummyData(key, value);
      } else if (typeof value === 'object') {
        anonymized[key] = this.anonymizeData(value);
      } else {
        anonymized[key] = value;
      }
    }

    return anonymized;
  }

  /**
   * ダミーデータを生成
   */
  private generateDummyData(fieldName: string, originalValue: any): any {
    const lowerField = fieldName.toLowerCase();
    
    if (lowerField.includes('email')) return 'user@example.com';
    if (lowerField.includes('phone')) return '000-0000-0000';
    if (lowerField.includes('ssn')) return '000-00-0000';
    if (lowerField.includes('name')) return 'Anonymous User';
    if (lowerField.includes('address')) return '123 Main St, City, State 00000';
    if (lowerField.includes('date')) return '1970-01-01';
    
    return '[REDACTED]';
  }

  /**
   * 動的ルールを生成
   */
  private generateDynamicRules(context: any): MaskingRule[] {
    const rules: MaskingRule[] = [];

    // コンテキストに基づいたルール生成
    if (context?.exportingData) {
      // データエクスポート時は厳格なマスキング
      rules.push({
        field: '*',
        type: 'full',
        allowedRoles: ['data_admin']
      });
    }

    if (context?.publicAccess) {
      // 公開アクセス時は全てマスク
      PHI_FIELDS.concat(PII_FIELDS).forEach(field => {
        rules.push({
          field,
          type: 'full'
        });
      });
    }

    return rules;
  }

  /**
   * マスキングがされたかチェック
   */
  private hasBeenMasked(original: any, masked: any): boolean {
    return JSON.stringify(original) !== JSON.stringify(masked);
  }

  /**
   * マスキング活動をログに記録
   */
  private logMaskingActivity(userId: string, userRole: string): void {
    // 実際の実装では監査ログサービスを使用
    console.log('Data masking activity:', {
      userId,
      userRole,
      timestamp: new Date().toISOString()
    });
  }

  /**
   * カスタムルールを追加
   */
  addRule(rule: MaskingRule): void {
    this.config.rules.push(rule);
  }

  /**
   * ルールを削除
   */
  removeRule(fieldName: string): void {
    this.config.rules = this.config.rules.filter(
      rule => rule.field !== fieldName
    );
  }

  /**
   * 設定を更新
   */
  updateConfig(config: Partial<MaskingConfig>): void {
    this.config = { ...this.config, ...config };
  }
}

export const dataMaskingService = new DataMaskingService();