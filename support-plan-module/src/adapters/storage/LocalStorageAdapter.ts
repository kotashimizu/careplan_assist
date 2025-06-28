import { StorageAdapter } from '../../types';

/**
 * ローカルストレージアダプター
 * ブラウザのlocalStorageを使用してデータを保存
 */
export class LocalStorageAdapter implements StorageAdapter {
  private prefix: string;
  private encryption: boolean;
  private compressionEnabled: boolean;

  constructor(options: {
    prefix?: string;
    encryption?: boolean;
    compressionEnabled?: boolean;
  } = {}) {
    this.prefix = options.prefix || 'sp_';
    this.encryption = options.encryption || false;
    this.compressionEnabled = options.compressionEnabled || false;
  }

  async save(key: string, data: any): Promise<void> {
    try {
      let processedData = JSON.stringify(data);
      
      // 圧縮処理（必要に応じて）
      if (this.compressionEnabled) {
        processedData = this.compress(processedData);
      }
      
      // 暗号化処理（必要に応じて）
      if (this.encryption) {
        processedData = this.encrypt(processedData);
      }
      
      localStorage.setItem(this.getKey(key), processedData);
    } catch (error) {
      if (error instanceof Error && error.name === 'QuotaExceededError') {
        throw new Error('ローカルストレージの容量が不足しています');
      }
      throw error;
    }
  }

  async load(key: string): Promise<any> {
    const data = localStorage.getItem(this.getKey(key));
    if (!data) {
      return null;
    }

    try {
      let processedData = data;
      
      // 復号化処理
      if (this.encryption) {
        processedData = this.decrypt(processedData);
      }
      
      // 解凍処理
      if (this.compressionEnabled) {
        processedData = this.decompress(processedData);
      }
      
      return JSON.parse(processedData);
    } catch (error) {
      console.error('データの読み込みに失敗しました:', error);
      return null;
    }
  }

  async delete(key: string): Promise<void> {
    localStorage.removeItem(this.getKey(key));
  }

  async list(prefix?: string): Promise<string[]> {
    const keys: string[] = [];
    const searchPrefix = this.getKey(prefix || '');
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(searchPrefix)) {
        keys.push(key.substring(this.prefix.length));
      }
    }
    
    return keys;
  }

  async clear(): Promise<void> {
    const keys = await this.list();
    for (const key of keys) {
      await this.delete(key);
    }
  }

  async exists(key: string): Promise<boolean> {
    return localStorage.getItem(this.getKey(key)) !== null;
  }

  // ヘルパーメソッド
  private getKey(key: string): string {
    return this.prefix + key;
  }

  private encrypt(data: string): string {
    // 簡易暗号化（本番環境では適切な暗号化ライブラリを使用）
    // ここではBase64エンコードのみ（デモ用）
    try {
      return btoa(unescape(encodeURIComponent(data)));
    } catch {
      return btoa(data);
    }
  }

  private decrypt(data: string): string {
    // 簡易復号化
    try {
      return decodeURIComponent(escape(atob(data)));
    } catch {
      return atob(data);
    }
  }

  private compress(data: string): string {
    // 簡易圧縮（本番環境では適切な圧縮ライブラリを使用）
    // ここでは実装をスキップ
    return data;
  }

  private decompress(data: string): string {
    // 簡易解凍
    return data;
  }

  // ストレージ容量チェック
  async getStorageInfo(): Promise<{
    used: number;
    available: number;
    percentage: number;
  }> {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      const used = estimate.usage || 0;
      const available = estimate.quota || 0;
      return {
        used,
        available,
        percentage: available > 0 ? (used / available) * 100 : 0,
      };
    }
    
    // フォールバック: localStorageのサイズを推定
    let totalSize = 0;
    for (let key in localStorage) {
      if (localStorage.hasOwnProperty(key)) {
        totalSize += localStorage[key].length + key.length;
      }
    }
    
    // 一般的なlocalStorageの制限は5-10MB
    const estimatedLimit = 5 * 1024 * 1024; // 5MB
    return {
      used: totalSize,
      available: estimatedLimit,
      percentage: (totalSize / estimatedLimit) * 100,
    };
  }

  // データの自動削除（保持期間設定）
  async cleanupOldData(retentionDays: number): Promise<void> {
    const keys = await this.list();
    const cutoffTime = Date.now() - (retentionDays * 24 * 60 * 60 * 1000);
    
    for (const key of keys) {
      const data = await this.load(key);
      if (data && data.metadata && data.metadata.updatedAt) {
        const updatedTime = new Date(data.metadata.updatedAt).getTime();
        if (updatedTime < cutoffTime) {
          await this.delete(key);
        }
      }
    }
  }
}