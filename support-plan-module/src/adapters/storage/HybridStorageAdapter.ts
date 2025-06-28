import { StorageAdapter } from '../../types';

/**
 * 同期戦略インターフェース
 */
export interface SyncStrategy {
  shouldSync(): boolean;
  queueForRetry(key: string, data: any): void;
  processRetryQueue(): Promise<void>;
}

/**
 * スマート同期戦略
 * ネットワーク状態やユーザー設定に基づいて同期を制御
 */
export class SmartSyncStrategy implements SyncStrategy {
  private retryQueue: Map<string, any> = new Map();
  private isOnline: boolean = navigator.onLine;
  private syncEnabled: boolean = true;

  constructor() {
    // ネットワーク状態の監視
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.processRetryQueue();
    });
    
    window.addEventListener('offline', () => {
      this.isOnline = false;
    });
  }

  shouldSync(): boolean {
    return this.isOnline && this.syncEnabled;
  }

  queueForRetry(key: string, data: any): void {
    this.retryQueue.set(key, data);
  }

  async processRetryQueue(): Promise<void> {
    if (!this.shouldSync() || this.retryQueue.size === 0) {
      return;
    }

    const entries = Array.from(this.retryQueue.entries());
    this.retryQueue.clear();

    // 再試行処理はHybridStorageAdapterで実行される
    console.log(`${entries.length}件のデータを再同期します`);
  }

  setSyncEnabled(enabled: boolean): void {
    this.syncEnabled = enabled;
  }
}

/**
 * ハイブリッドストレージアダプター
 * ローカルとオンラインの両方のストレージを管理
 */
export class HybridStorageAdapter implements StorageAdapter {
  private localAdapter: StorageAdapter;
  private onlineAdapter: StorageAdapter;
  private syncStrategy: SyncStrategy;
  private conflictResolver: ConflictResolver;

  constructor(
    localAdapter: StorageAdapter,
    onlineAdapter: StorageAdapter,
    syncStrategy: SyncStrategy = new SmartSyncStrategy(),
    conflictResolver: ConflictResolver = new LastWriteWinsResolver()
  ) {
    this.localAdapter = localAdapter;
    this.onlineAdapter = onlineAdapter;
    this.syncStrategy = syncStrategy;
    this.conflictResolver = conflictResolver;
  }

  async save(key: string, data: any): Promise<void> {
    // 常にローカルに保存
    await this.localAdapter.save(key, {
      ...data,
      _syncMetadata: {
        lastModified: new Date().toISOString(),
        synced: false
      }
    });

    // オンライン同期を試行
    if (this.syncStrategy.shouldSync()) {
      try {
        await this.onlineAdapter.save(key, data);
        
        // 同期成功をマーク
        const localData = await this.localAdapter.load(key);
        if (localData) {
          localData._syncMetadata.synced = true;
          await this.localAdapter.save(key, localData);
        }
      } catch (error) {
        console.error('オンライン同期に失敗しました:', error);
        this.syncStrategy.queueForRetry(key, data);
      }
    }
  }

  async load(key: string): Promise<any> {
    let localData = await this.localAdapter.load(key);
    let onlineData = null;

    // オンラインデータの取得を試行
    if (this.syncStrategy.shouldSync()) {
      try {
        onlineData = await this.onlineAdapter.load(key);
      } catch (error) {
        console.error('オンラインデータの取得に失敗しました:', error);
      }
    }

    // データの競合解決
    if (localData && onlineData) {
      return await this.conflictResolver.resolve(localData, onlineData);
    }

    // オンラインデータのみ存在する場合
    if (!localData && onlineData) {
      // ローカルにキャッシュ
      await this.localAdapter.save(key, {
        ...onlineData,
        _syncMetadata: {
          lastModified: new Date().toISOString(),
          synced: true
        }
      });
      return onlineData;
    }

    // ローカルデータのみ、またはどちらも存在しない
    return localData;
  }

  async delete(key: string): Promise<void> {
    // ローカルから削除
    await this.localAdapter.delete(key);

    // オンラインからも削除を試行
    if (this.syncStrategy.shouldSync()) {
      try {
        await this.onlineAdapter.delete(key);
      } catch (error) {
        console.error('オンラインデータの削除に失敗しました:', error);
        // 削除操作もキューに入れる
        this.syncStrategy.queueForRetry(`delete:${key}`, null);
      }
    }
  }

  async list(prefix?: string): Promise<string[]> {
    const localKeys = await this.localAdapter.list(prefix);
    let onlineKeys: string[] = [];

    if (this.syncStrategy.shouldSync()) {
      try {
        onlineKeys = await this.onlineAdapter.list(prefix);
      } catch (error) {
        console.error('オンラインキーの取得に失敗しました:', error);
      }
    }

    // 重複を除去して統合
    return Array.from(new Set([...localKeys, ...onlineKeys]));
  }

  async clear(): Promise<void> {
    await this.localAdapter.clear();

    if (this.syncStrategy.shouldSync()) {
      try {
        await this.onlineAdapter.clear();
      } catch (error) {
        console.error('オンラインストレージのクリアに失敗しました:', error);
      }
    }
  }

  async exists(key: string): Promise<boolean> {
    const localExists = await this.localAdapter.exists(key);
    
    if (localExists) {
      return true;
    }

    if (this.syncStrategy.shouldSync()) {
      try {
        return await this.onlineAdapter.exists(key);
      } catch (error) {
        console.error('オンライン存在確認に失敗しました:', error);
      }
    }

    return false;
  }

  /**
   * 未同期データの同期を実行
   */
  async syncPendingData(): Promise<void> {
    if (!this.syncStrategy.shouldSync()) {
      return;
    }

    const allKeys = await this.localAdapter.list();
    
    for (const key of allKeys) {
      const data = await this.localAdapter.load(key);
      
      if (data && data._syncMetadata && !data._syncMetadata.synced) {
        try {
          await this.onlineAdapter.save(key, data);
          data._syncMetadata.synced = true;
          await this.localAdapter.save(key, data);
        } catch (error) {
          console.error(`${key}の同期に失敗しました:`, error);
        }
      }
    }
  }

  /**
   * 同期状態の取得
   */
  async getSyncStatus(): Promise<{
    total: number;
    synced: number;
    pending: number;
  }> {
    const allKeys = await this.localAdapter.list();
    let synced = 0;
    let pending = 0;

    for (const key of allKeys) {
      const data = await this.localAdapter.load(key);
      if (data && data._syncMetadata) {
        if (data._syncMetadata.synced) {
          synced++;
        } else {
          pending++;
        }
      }
    }

    return {
      total: allKeys.length,
      synced,
      pending
    };
  }
}

/**
 * 競合解決インターフェース
 */
interface ConflictResolver {
  resolve(localData: any, onlineData: any): Promise<any>;
}

/**
 * 最終更新優先の競合解決
 */
class LastWriteWinsResolver implements ConflictResolver {
  async resolve(localData: any, onlineData: any): Promise<any> {
    const localTime = new Date(localData._syncMetadata?.lastModified || 0).getTime();
    const onlineTime = new Date(onlineData.metadata?.updatedAt || 0).getTime();
    
    return localTime > onlineTime ? localData : onlineData;
  }
}

/**
 * マージベースの競合解決
 */
export class MergeResolver implements ConflictResolver {
  async resolve(localData: any, onlineData: any): Promise<any> {
    // 両方のデータをマージ（より複雑な実装が必要）
    return {
      ...onlineData,
      ...localData,
      _syncMetadata: {
        ...localData._syncMetadata,
        merged: true,
        mergedAt: new Date().toISOString()
      }
    };
  }
}