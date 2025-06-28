// メインエクスポート
export { SupportPlanService } from './core/SupportPlanService';

// 型定義
export * from './types';

// ストレージアダプター
export { LocalStorageAdapter } from './adapters/storage/LocalStorageAdapter';
export { HybridStorageAdapter, SmartSyncStrategy } from './adapters/storage/HybridStorageAdapter';

// AIプロバイダー
export { BaseAIAnalyzer } from './core/AIAnalyzer';
export { GeminiAIProvider } from './adapters/ai/GeminiAIProvider';

// デフォルトテンプレート
export { 
  getDefaultTemplates, 
  getTemplateById,
  MHLW_TEMPLATE,
  SIMPLE_TEMPLATE,
  DETAILED_TEMPLATE
} from './templates/defaultTemplates';

// バージョン情報
export const VERSION = '1.0.0';

/**
 * クイックスタート用のヘルパー関数
 */
export const createSupportPlanService = (config?: Partial<import('./types').ModuleConfig>) => {
  return new SupportPlanService({
    mode: 'local',
    ...config
  } as import('./types').ModuleConfig);
};