// 個別支援計画書モジュールの型定義

// 動作モード
export type StorageMode = 'local' | 'online' | 'hybrid';

// フィールドのデータ型
export type FieldDataType = 
  | 'text'           // テキスト
  | 'longtext'       // 長文テキスト
  | 'number'         // 数値
  | 'date'           // 日付
  | 'multiselect'    // 複数選択
  | 'boolean'        // 真偽値
  | 'nesteddata'     // ネストデータ
  | 'dynamic'        // 動的データ
  | 'object';        // オブジェクト

// テンプレートフィールド定義
export interface TemplateField {
  id: string;
  name: string;
  label: string;
  type: FieldDataType;
  required: boolean;
  description?: string;
  placeholder?: string;
  tooltip?: string;
  options?: string[];
  defaultValue?: any;
  validation?: {
    min?: number;
    max?: number;
    pattern?: string;
    message?: string;
  };
  dependsOn?: string;
  dynamicOptions?: (values: Record<string, any>) => string[];
}

// テンプレート定義
export interface SupportPlanTemplate {
  id: string;
  name: string;
  description: string;
  version: string;
  fields: TemplateField[];
  sections?: {
    id: string;
    name: string;
    fields: string[];
  }[];
  metadata?: {
    author?: string;
    createdAt?: string;
    updatedAt?: string;
    tags?: string[];
  };
}

// 支援計画書データ
export interface SupportPlanData {
  id: string;
  templateId: string;
  templateVersion: string;
  values: Record<string, any>;
  metadata: {
    createdAt: string;
    updatedAt: string;
    createdBy?: string;
    status: 'draft' | 'completed' | 'approved';
    storageMode?: 'local' | 'online';
  };
}

// 支援計画書レコード（保存用）
export interface SupportPlanRecord extends SupportPlanData {
  history?: SupportPlanData[];
  attachments?: Attachment[];
  comments?: Comment[];
}

// 添付ファイル
export interface Attachment {
  id: string;
  filename: string;
  mimeType: string;
  size: number;
  url?: string;
  data?: string; // Base64 for local storage
  uploadedAt: string;
}

// コメント
export interface Comment {
  id: string;
  text: string;
  author: string;
  createdAt: string;
}

// AI分析結果
export interface AnalysisResult {
  success: boolean;
  data?: Record<string, any>;
  confidence?: number;
  suggestions?: string[];
  error?: string;
}

// エクスポートオプション
export interface ExportOptions {
  format: 'pdf' | 'excel' | 'csv' | 'json';
  template?: string;
  includeHistory?: boolean;
  includeComments?: boolean;
  password?: string; // PDF暗号化用
}

// モジュール設定
export interface ModuleConfig {
  mode: StorageMode;
  storage?: StorageConfig;
  ai?: AIConfig;
  security?: SecurityConfig;
  ui?: UIConfig;
}

// ストレージ設定
export interface StorageConfig {
  adapter?: StorageAdapter;
  encryption?: boolean;
  compressionEnabled?: boolean;
  autoSync?: boolean;
  syncInterval?: number; // ミリ秒
  retentionDays?: number; // ローカルデータ保持期間
}

// AI設定
export interface AIConfig {
  provider: 'gemini' | 'openai' | 'anthropic' | 'local';
  apiKey?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
  fallbackEnabled?: boolean;
  cacheEnabled?: boolean;
  cacheTTL?: number; // 秒
}

// セキュリティ設定
export interface SecurityConfig {
  encryptionKey?: string;
  allowExport?: boolean;
  allowSharing?: boolean;
  requireAuth?: boolean;
  auditLog?: boolean;
  dataRetentionDays?: number;
}

// UI設定
export interface UIConfig {
  theme?: 'light' | 'dark' | 'auto';
  language?: 'ja' | 'en';
  showAdvancedOptions?: boolean;
  autoSave?: boolean;
  autoSaveInterval?: number; // ミリ秒
}

// ストレージアダプター インターフェース
export interface StorageAdapter {
  save(key: string, data: any): Promise<void>;
  load(key: string): Promise<any>;
  delete(key: string): Promise<void>;
  list(prefix?: string): Promise<string[]>;
  clear(): Promise<void>;
  exists(key: string): Promise<boolean>;
}

// AI プロバイダー インターフェース
export interface AIProvider {
  analyze(text: string, template: SupportPlanTemplate): Promise<AnalysisResult>;
  generateSuggestions(data: SupportPlanData): Promise<string[]>;
  compareVersions(v1: SupportPlanData, v2: SupportPlanData): Promise<string>;
}

// エクスポーター インターフェース
export interface Exporter {
  export(data: SupportPlanData, options: ExportOptions): Promise<Blob | string>;
  canExport(format: string): boolean;
}

// イベントタイプ
export type ModuleEvent = 
  | { type: 'save'; data: SupportPlanData }
  | { type: 'load'; data: SupportPlanData }
  | { type: 'delete'; id: string }
  | { type: 'export'; format: string }
  | { type: 'sync'; status: 'start' | 'success' | 'error' }
  | { type: 'error'; error: Error };

// イベントリスナー
export type EventListener = (event: ModuleEvent) => void;

// プラグイン インターフェース
export interface Plugin {
  name: string;
  version: string;
  init(module: any): void;
  destroy?(): void;
}