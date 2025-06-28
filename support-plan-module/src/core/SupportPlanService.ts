import {
  ModuleConfig,
  StorageAdapter,
  AIProvider,
  SupportPlanTemplate,
  SupportPlanData,
  SupportPlanRecord,
  AnalysisResult,
  ExportOptions,
  ModuleEvent,
  EventListener,
  StorageMode
} from '../types';

import { LocalStorageAdapter } from '../adapters/storage/LocalStorageAdapter';
import { HybridStorageAdapter } from '../adapters/storage/HybridStorageAdapter';
import { GeminiAIProvider } from '../adapters/ai/GeminiAIProvider';

/**
 * 個別支援計画書サービス
 * モジュールのメインエントリーポイント
 */
export class SupportPlanService {
  private config: ModuleConfig;
  private storage: StorageAdapter;
  private aiProvider: AIProvider;
  private eventListeners: Set<EventListener> = new Set();
  private templates: Map<string, SupportPlanTemplate> = new Map();

  constructor(config: ModuleConfig) {
    this.config = this.mergeWithDefaults(config);
    this.storage = this.initializeStorage();
    this.aiProvider = this.initializeAIProvider();
    
    // 自動保存の設定
    if (this.config.ui?.autoSave) {
      this.setupAutoSave();
    }
  }

  /**
   * デフォルト設定とマージ
   */
  private mergeWithDefaults(config: ModuleConfig): ModuleConfig {
    return {
      mode: config.mode || 'local',
      storage: {
        encryption: true,
        compressionEnabled: false,
        autoSync: config.mode === 'hybrid',
        syncInterval: 60000, // 1分
        retentionDays: 30,
        ...config.storage
      },
      ai: {
        provider: 'gemini',
        model: 'gemini-1.5-flash',
        temperature: 0.1,
        maxTokens: 2048,
        fallbackEnabled: true,
        cacheEnabled: true,
        cacheTTL: 3600, // 1時間
        ...config.ai
      },
      security: {
        allowExport: true,
        allowSharing: config.mode !== 'local',
        requireAuth: false,
        auditLog: false,
        dataRetentionDays: 30,
        ...config.security
      },
      ui: {
        theme: 'light',
        language: 'ja',
        showAdvancedOptions: false,
        autoSave: true,
        autoSaveInterval: 30000, // 30秒
        ...config.ui
      }
    };
  }

  /**
   * ストレージの初期化
   */
  private initializeStorage(): StorageAdapter {
    const localAdapter = new LocalStorageAdapter({
      prefix: 'sp_',
      encryption: this.config.storage?.encryption,
      compressionEnabled: this.config.storage?.compressionEnabled
    });

    if (this.config.mode === 'local') {
      return localAdapter;
    }

    if (this.config.mode === 'online' && this.config.storage?.adapter) {
      return this.config.storage.adapter;
    }

    if (this.config.mode === 'hybrid' && this.config.storage?.adapter) {
      return new HybridStorageAdapter(
        localAdapter,
        this.config.storage.adapter
      );
    }

    // フォールバック
    console.warn('ストレージアダプターが指定されていません。ローカルストレージを使用します。');
    return localAdapter;
  }

  /**
   * AIプロバイダーの初期化
   */
  private initializeAIProvider(): AIProvider {
    switch (this.config.ai?.provider) {
      case 'gemini':
        return new GeminiAIProvider(this.config.ai);
      
      // 他のプロバイダーも追加可能
      // case 'openai':
      //   return new OpenAIProvider(this.config.ai);
      
      default:
        return new GeminiAIProvider(this.config.ai!);
    }
  }

  /**
   * テンプレートの登録
   */
  async registerTemplate(template: SupportPlanTemplate): Promise<void> {
    this.templates.set(template.id, template);
    await this.storage.save(`template_${template.id}`, template);
  }

  /**
   * テンプレートの取得
   */
  async getTemplate(templateId: string): Promise<SupportPlanTemplate | null> {
    if (this.templates.has(templateId)) {
      return this.templates.get(templateId)!;
    }

    const saved = await this.storage.load(`template_${templateId}`);
    if (saved) {
      this.templates.set(templateId, saved);
      return saved;
    }

    return null;
  }

  /**
   * 全テンプレートの取得
   */
  async getTemplates(): Promise<SupportPlanTemplate[]> {
    const keys = await this.storage.list('template_');
    const templates: SupportPlanTemplate[] = [];

    for (const key of keys) {
      const template = await this.storage.load(key);
      if (template) {
        templates.push(template);
      }
    }

    return templates;
  }

  /**
   * AI分析の実行
   */
  async analyze(text: string, templateId: string): Promise<AnalysisResult> {
    const template = await this.getTemplate(templateId);
    if (!template) {
      throw new Error(`テンプレート ${templateId} が見つかりません`);
    }

    const result = await this.aiProvider.analyze(text, template);
    
    this.emitEvent({
      type: 'analyze',
      data: { templateId, success: result.success }
    } as any);

    return result;
  }

  /**
   * 支援計画書の作成
   */
  async create(data: {
    templateId: string;
    values: Record<string, any>;
    metadata?: any;
  }): Promise<SupportPlanData> {
    const template = await this.getTemplate(data.templateId);
    if (!template) {
      throw new Error(`テンプレート ${data.templateId} が見つかりません`);
    }

    const planData: SupportPlanData = {
      id: this.generateId(),
      templateId: data.templateId,
      templateVersion: template.version,
      values: data.values,
      metadata: {
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: 'draft',
        storageMode: this.config.mode === 'hybrid' ? 'local' : this.config.mode,
        ...data.metadata
      }
    };

    await this.save(planData);
    return planData;
  }

  /**
   * 支援計画書の保存
   */
  async save(data: SupportPlanData): Promise<void> {
    // 更新日時を設定
    data.metadata.updatedAt = new Date().toISOString();

    // 保存
    await this.storage.save(data.id, data);

    // 履歴の追加
    const historyKey = `history_${data.id}`;
    const history = await this.storage.load(historyKey) || [];
    history.push({
      ...data,
      savedAt: new Date().toISOString()
    });
    
    // 履歴は最新10件のみ保持
    if (history.length > 10) {
      history.splice(0, history.length - 10);
    }
    
    await this.storage.save(historyKey, history);

    this.emitEvent({ type: 'save', data });
  }

  /**
   * 支援計画書の読み込み
   */
  async load(id: string): Promise<SupportPlanRecord | null> {
    const data = await this.storage.load(id);
    if (!data) {
      return null;
    }

    // 履歴の読み込み
    const history = await this.storage.load(`history_${id}`) || [];

    const record: SupportPlanRecord = {
      ...data,
      history
    };

    this.emitEvent({ type: 'load', data });
    return record;
  }

  /**
   * 支援計画書の削除
   */
  async delete(id: string): Promise<void> {
    await this.storage.delete(id);
    await this.storage.delete(`history_${id}`);
    
    this.emitEvent({ type: 'delete', id });
  }

  /**
   * 支援計画書の一覧取得
   */
  async list(): Promise<SupportPlanData[]> {
    const keys = await this.storage.list();
    const plans: SupportPlanData[] = [];

    for (const key of keys) {
      // テンプレートと履歴を除外
      if (!key.startsWith('template_') && !key.startsWith('history_')) {
        const data = await this.storage.load(key);
        if (data && data.id) {
          plans.push(data);
        }
      }
    }

    // 更新日時でソート（新しい順）
    plans.sort((a, b) => {
      const dateA = new Date(a.metadata.updatedAt).getTime();
      const dateB = new Date(b.metadata.updatedAt).getTime();
      return dateB - dateA;
    });

    return plans;
  }

  /**
   * エクスポート
   */
  async export(id: string, options: ExportOptions): Promise<Blob> {
    if (!this.config.security?.allowExport) {
      throw new Error('エクスポートは許可されていません');
    }

    const record = await this.load(id);
    if (!record) {
      throw new Error('支援計画書が見つかりません');
    }

    // エクスポート機能は別モジュールで実装
    // ここではプレースホルダー
    const jsonData = JSON.stringify(record, null, 2);
    const blob = new Blob([jsonData], { type: 'application/json' });

    this.emitEvent({ type: 'export', format: options.format });
    return blob;
  }

  /**
   * 改善提案の生成
   */
  async generateSuggestions(id: string): Promise<string[]> {
    const data = await this.load(id);
    if (!data) {
      throw new Error('支援計画書が見つかりません');
    }

    return await this.aiProvider.generateSuggestions(data);
  }

  /**
   * バージョン比較
   */
  async compareVersions(id: string, version1Index: number, version2Index: number): Promise<string> {
    const record = await this.load(id);
    if (!record || !record.history) {
      throw new Error('履歴が見つかりません');
    }

    const v1 = record.history[version1Index];
    const v2 = record.history[version2Index];

    if (!v1 || !v2) {
      throw new Error('指定されたバージョンが見つかりません');
    }

    return await this.aiProvider.compareVersions(v1, v2);
  }

  /**
   * ストレージモードの変更（ハイブリッドモードのみ）
   */
  async changeStorageMode(id: string, mode: 'local' | 'online'): Promise<void> {
    if (this.config.mode !== 'hybrid') {
      throw new Error('ストレージモードの変更はハイブリッドモードでのみ可能です');
    }

    const data = await this.load(id);
    if (!data) {
      throw new Error('支援計画書が見つかりません');
    }

    data.metadata.storageMode = mode;
    await this.save(data);
  }

  /**
   * イベントリスナーの登録
   */
  addEventListener(listener: EventListener): void {
    this.eventListeners.add(listener);
  }

  /**
   * イベントリスナーの削除
   */
  removeEventListener(listener: EventListener): void {
    this.eventListeners.delete(listener);
  }

  /**
   * イベントの発行
   */
  private emitEvent(event: ModuleEvent): void {
    this.eventListeners.forEach(listener => {
      try {
        listener(event);
      } catch (error) {
        console.error('イベントリスナーエラー:', error);
      }
    });
  }

  /**
   * IDの生成
   */
  private generateId(): string {
    return `sp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * 自動保存の設定
   */
  private setupAutoSave(): void {
    // 実装は使用側で行う（UIコンポーネントと連携）
    console.log('自動保存が有効になりました');
  }

  /**
   * データのクリーンアップ
   */
  async cleanup(): Promise<void> {
    if (!this.config.storage?.retentionDays) {
      return;
    }

    const plans = await this.list();
    const cutoffTime = Date.now() - (this.config.storage.retentionDays * 24 * 60 * 60 * 1000);

    for (const plan of plans) {
      const updatedTime = new Date(plan.metadata.updatedAt).getTime();
      if (updatedTime < cutoffTime) {
        await this.delete(plan.id);
      }
    }
  }

  /**
   * モジュールの破棄
   */
  destroy(): void {
    this.eventListeners.clear();
    this.templates.clear();
  }
}