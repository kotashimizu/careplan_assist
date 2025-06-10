import { cryptoService } from './cryptoService';
import { auditLogService } from './auditLogService';
import { securityMonitor } from './securityMonitor';

// 鍵の種類
export type KeyType = 'master' | 'data' | 'session' | 'tenant';

// 鍵の用途
export type KeyUsage = 'encrypt' | 'decrypt' | 'sign' | 'verify';

// 鍵のアルゴリズム
export type KeyAlgorithm = 'AES-256' | 'RSA-2048' | 'RSA-4096' | 'ECDSA-P256';

// 鍵の状態
export type KeyState = 'active' | 'pending_rotation' | 'rotated' | 'revoked' | 'expired';

// 鍵ポリシー
export interface KeyPolicy {
  algorithm: KeyAlgorithm;
  keyType: KeyType;
  usage: KeyUsage[];
  rotationPeriod?: number; // 日数
  expirationDate?: Date;
  allowedUsers?: string[];
  allowedRoles?: string[];
  allowedServices?: string[];
  requireMFA?: boolean;
  autoRotate?: boolean;
}

// 鍵メタデータ
export interface KeyMetadata {
  keyId: string;
  keyType: KeyType;
  algorithm: KeyAlgorithm;
  state: KeyState;
  createdAt: Date;
  createdBy: string;
  lastUsed?: Date;
  rotatedFrom?: string;
  rotatedTo?: string;
  version: number;
  policy: KeyPolicy;
}

// データ鍵
export interface DataKey {
  keyId: string;
  plaintext: string; // メモリ内でのみ使用
  ciphertext: string; // 保存用
  masterKeyId: string;
}

// 暗号化されたデータ
export interface EncryptedData {
  ciphertext: string;
  keyId: string;
  algorithm: KeyAlgorithm;
  metadata?: Record<string, any>;
}

// KMSプロバイダーインターフェース
interface KMSProvider {
  generateKey(policy: KeyPolicy): Promise<string>;
  encrypt(keyId: string, data: string): Promise<EncryptedData>;
  decrypt(encryptedData: EncryptedData): Promise<string>;
  rotateKey(keyId: string): Promise<string>;
  revokeKey(keyId: string): Promise<void>;
  getKeyMetadata(keyId: string): Promise<KeyMetadata>;
}

// ローカルKMSプロバイダー（開発・テスト用）
class LocalKMSProvider implements KMSProvider {
  private keys: Map<string, {
    key: string;
    metadata: KeyMetadata;
  }> = new Map();

  async generateKey(policy: KeyPolicy): Promise<string> {
    const keyId = `key_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const key = this.generateKeyMaterial(policy.algorithm);
    
    const metadata: KeyMetadata = {
      keyId,
      keyType: policy.keyType,
      algorithm: policy.algorithm,
      state: 'active',
      createdAt: new Date(),
      createdBy: 'system',
      version: 1,
      policy
    };

    this.keys.set(keyId, { key, metadata });
    return keyId;
  }

  async encrypt(keyId: string, data: string): Promise<EncryptedData> {
    const keyData = this.keys.get(keyId);
    if (!keyData) throw new Error('Key not found');

    // 実際の暗号化（簡易実装）
    const ciphertext = await cryptoService.encrypt(data, keyData.key);
    
    return {
      ciphertext,
      keyId,
      algorithm: keyData.metadata.algorithm
    };
  }

  async decrypt(encryptedData: EncryptedData): Promise<string> {
    const keyData = this.keys.get(encryptedData.keyId);
    if (!keyData) throw new Error('Key not found');

    return await cryptoService.decrypt(encryptedData.ciphertext, keyData.key);
  }

  async rotateKey(keyId: string): Promise<string> {
    const oldKeyData = this.keys.get(keyId);
    if (!oldKeyData) throw new Error('Key not found');

    const newKeyId = await this.generateKey(oldKeyData.metadata.policy);
    const newKeyData = this.keys.get(newKeyId)!;

    // 古い鍵を更新
    oldKeyData.metadata.state = 'rotated';
    oldKeyData.metadata.rotatedTo = newKeyId;

    // 新しい鍵を更新
    newKeyData.metadata.rotatedFrom = keyId;
    newKeyData.metadata.version = oldKeyData.metadata.version + 1;

    return newKeyId;
  }

  async revokeKey(keyId: string): Promise<void> {
    const keyData = this.keys.get(keyId);
    if (!keyData) throw new Error('Key not found');

    keyData.metadata.state = 'revoked';
  }

  async getKeyMetadata(keyId: string): Promise<KeyMetadata> {
    const keyData = this.keys.get(keyId);
    if (!keyData) throw new Error('Key not found');

    return { ...keyData.metadata };
  }

  private generateKeyMaterial(algorithm: KeyAlgorithm): string {
    // 実際の実装では適切な鍵生成を行う
    const length = algorithm.includes('256') ? 32 : 64;
    return cryptoService.generateRandomKey(length);
  }
}

// KMSサービス
class KMSService {
  private provider: KMSProvider;
  private keyCache: Map<string, {
    key: DataKey;
    cachedAt: Date;
  }> = new Map();
  private readonly CACHE_TTL = 300000; // 5分
  private masterKeyId?: string;

  constructor(provider?: KMSProvider) {
    this.provider = provider || new LocalKMSProvider();
    this.initializeMasterKey();
  }

  /**
   * マスターキーの初期化
   */
  private async initializeMasterKey(): Promise<void> {
    const policy: KeyPolicy = {
      algorithm: 'AES-256',
      keyType: 'master',
      usage: ['encrypt', 'decrypt'],
      rotationPeriod: 90, // 90日
      autoRotate: true,
      requireMFA: true
    };

    this.masterKeyId = await this.createKey(policy);
  }

  /**
   * 鍵の作成
   */
  async createKey(policy: KeyPolicy, userId?: string): Promise<string> {
    try {
      const keyId = await this.provider.generateKey(policy);

      // 監査ログ
      await auditLogService.log({
        action: 'KEY_CREATED',
        userId: userId || 'system',
        resourceType: 'kms',
        resourceId: keyId,
        details: {
          keyType: policy.keyType,
          algorithm: policy.algorithm
        },
        severity: 'info'
      });

      return keyId;
    } catch (error) {
      // セキュリティイベント記録
      await securityMonitor.recordEvent({
        type: 'KEY_CREATION_FAILED',
        userId,
        severity: 'high',
        metadata: { error: error instanceof Error ? error.message : 'Unknown error' }
      });
      throw error;
    }
  }

  /**
   * データキーの生成（エンベロープ暗号化用）
   */
  async generateDataKey(masterKeyId?: string): Promise<DataKey> {
    const keyId = `datakey_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const plaintext = cryptoService.generateRandomKey(32); // 256ビット
    
    // マスターキーで暗号化
    const encryptedKey = await this.provider.encrypt(
      masterKeyId || this.masterKeyId!,
      plaintext
    );

    const dataKey: DataKey = {
      keyId,
      plaintext,
      ciphertext: encryptedKey.ciphertext,
      masterKeyId: masterKeyId || this.masterKeyId!
    };

    // キャッシュに保存
    this.keyCache.set(keyId, {
      key: dataKey,
      cachedAt: new Date()
    });

    return dataKey;
  }

  /**
   * データの暗号化
   */
  async encrypt(data: string, keyId?: string, userId?: string): Promise<EncryptedData> {
    try {
      // キーIDが指定されていない場合は新しいデータキーを生成
      if (!keyId) {
        const dataKey = await this.generateDataKey();
        keyId = dataKey.keyId;
      }

      const result = await this.provider.encrypt(keyId, data);

      // 監査ログ
      await auditLogService.log({
        action: 'DATA_ENCRYPTED',
        userId: userId || 'system',
        resourceType: 'kms',
        resourceId: keyId,
        details: {
          dataSize: data.length,
          algorithm: result.algorithm
        },
        severity: 'info'
      });

      return result;
    } catch (error) {
      await securityMonitor.recordEvent({
        type: 'ENCRYPTION_FAILED',
        userId,
        severity: 'high',
        metadata: { keyId }
      });
      throw error;
    }
  }

  /**
   * データの復号化
   */
  async decrypt(encryptedData: EncryptedData, userId?: string): Promise<string> {
    try {
      // アクセス権限チェック
      await this.checkKeyAccess(encryptedData.keyId, userId);

      const result = await this.provider.decrypt(encryptedData);

      // 監査ログ
      await auditLogService.log({
        action: 'DATA_DECRYPTED',
        userId: userId || 'system',
        resourceType: 'kms',
        resourceId: encryptedData.keyId,
        details: {
          algorithm: encryptedData.algorithm
        },
        severity: 'info'
      });

      return result;
    } catch (error) {
      await securityMonitor.recordEvent({
        type: 'DECRYPTION_FAILED',
        userId,
        severity: 'high',
        metadata: { keyId: encryptedData.keyId }
      });
      throw error;
    }
  }

  /**
   * 鍵のローテーション
   */
  async rotateKey(keyId: string, userId?: string): Promise<string> {
    try {
      const metadata = await this.provider.getKeyMetadata(keyId);
      
      // ポリシーチェック
      if (metadata.policy.requireMFA) {
        // MFA検証が必要（実装は省略）
      }

      const newKeyId = await this.provider.rotateKey(keyId);

      // キャッシュをクリア
      this.keyCache.delete(keyId);

      // 監査ログ
      await auditLogService.log({
        action: 'KEY_ROTATED',
        userId: userId || 'system',
        resourceType: 'kms',
        resourceId: keyId,
        details: {
          oldKeyId: keyId,
          newKeyId,
          keyType: metadata.keyType
        },
        severity: 'high'
      });

      // セキュリティイベント
      await securityMonitor.recordEvent({
        type: 'KEY_ROTATION',
        userId,
        severity: 'medium',
        metadata: { oldKeyId: keyId, newKeyId }
      });

      return newKeyId;
    } catch (error) {
      await securityMonitor.recordEvent({
        type: 'KEY_ROTATION_FAILED',
        userId,
        severity: 'critical',
        metadata: { keyId }
      });
      throw error;
    }
  }

  /**
   * 鍵の無効化
   */
  async revokeKey(keyId: string, reason: string, userId?: string): Promise<void> {
    try {
      await this.provider.revokeKey(keyId);

      // キャッシュをクリア
      this.keyCache.delete(keyId);

      // 監査ログ
      await auditLogService.log({
        action: 'KEY_REVOKED',
        userId: userId || 'system',
        resourceType: 'kms',
        resourceId: keyId,
        details: { reason },
        severity: 'critical'
      });

      // セキュリティアラート
      await securityMonitor.recordEvent({
        type: 'KEY_REVOCATION',
        userId,
        severity: 'high',
        metadata: { keyId, reason }
      });
    } catch (error) {
      throw error;
    }
  }

  /**
   * 鍵へのアクセス権限チェック
   */
  private async checkKeyAccess(keyId: string, userId?: string): Promise<void> {
    const metadata = await this.provider.getKeyMetadata(keyId);
    
    // 鍵の状態チェック
    if (metadata.state !== 'active') {
      throw new Error(`Key is ${metadata.state}`);
    }

    // 有効期限チェック
    if (metadata.policy.expirationDate && new Date() > metadata.policy.expirationDate) {
      throw new Error('Key has expired');
    }

    // ユーザー権限チェック
    if (userId && metadata.policy.allowedUsers && !metadata.policy.allowedUsers.includes(userId)) {
      throw new Error('Access denied');
    }
  }

  /**
   * 自動鍵ローテーション
   */
  async performAutoRotation(): Promise<void> {
    // 実際の実装では、定期的なジョブとして実行
    const allKeys = await this.listKeys();
    
    for (const keyMetadata of allKeys) {
      if (keyMetadata.policy.autoRotate && this.shouldRotate(keyMetadata)) {
        try {
          await this.rotateKey(keyMetadata.keyId, 'system');
        } catch (error) {
          console.error(`Failed to auto-rotate key ${keyMetadata.keyId}:`, error);
        }
      }
    }
  }

  /**
   * ローテーションが必要かチェック
   */
  private shouldRotate(metadata: KeyMetadata): boolean {
    if (!metadata.policy.rotationPeriod) return false;
    
    const rotationDate = new Date(metadata.createdAt);
    rotationDate.setDate(rotationDate.getDate() + metadata.policy.rotationPeriod);
    
    return new Date() > rotationDate;
  }

  /**
   * 鍵のリスト取得（実装は省略）
   */
  private async listKeys(): Promise<KeyMetadata[]> {
    // 実際の実装では、永続化層から取得
    return [];
  }

  /**
   * キャッシュのクリーンアップ
   */
  cleanupCache(): void {
    const now = new Date();
    
    for (const [keyId, cached] of this.keyCache.entries()) {
      if (now.getTime() - cached.cachedAt.getTime() > this.CACHE_TTL) {
        // 平文鍵を安全に削除
        cached.key.plaintext = '';
        this.keyCache.delete(keyId);
      }
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    totalKeys: number;
    activeKeys: number;
    rotatedKeys: number;
    revokedKeys: number;
    cacheSize: number;
  } {
    // 実際の実装では、永続化層から集計
    return {
      totalKeys: 0,
      activeKeys: 0,
      rotatedKeys: 0,
      revokedKeys: 0,
      cacheSize: this.keyCache.size
    };
  }
}

// プロバイダー選択（環境変数で切り替え）
const createKMSProvider = (): KMSProvider => {
  const provider = process.env.KMS_PROVIDER;
  
  switch (provider) {
    case 'aws':
      // return new AWSKMSProvider();
    case 'azure':
      // return new AzureKeyVaultProvider();
    case 'gcp':
      // return new GoogleCloudKMSProvider();
    default:
      return new LocalKMSProvider();
  }
};

export const kmsService = new KMSService(createKMSProvider());