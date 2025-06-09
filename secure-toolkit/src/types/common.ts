// 共通の型定義

export type SecurityLevel = 'standard' | 'high' | 'maximum';

export type ComplianceStandard = 
  | 'HIPAA'
  | 'GDPR'
  | 'PCI-DSS'
  | 'SOC2'
  | 'ISO27001'
  | 'FERPA'
  | 'CCPA';

export type UserRole = 'admin' | 'moderator' | 'user' | 'guest' | string;

export interface Permission {
  resource: string;
  action: string;
  scope?: 'own' | 'team' | 'all';
  conditions?: Record<string, any>;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
    details?: any;
  };
  metadata?: {
    timestamp: string;
    requestId: string;
    version: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasNext: boolean;
  hasPrevious: boolean;
}

export interface ValidationError {
  field: string;
  message: string;
  code?: string;
  value?: any;
}

export interface TimeRange {
  start: Date | string;
  end: Date | string;
}

export interface SortOptions {
  field: string;
  order: 'asc' | 'desc';
}

export interface FilterOptions {
  field: string;
  operator: 'eq' | 'ne' | 'gt' | 'gte' | 'lt' | 'lte' | 'in' | 'contains';
  value: any;
}

export interface BaseEntity {
  id: string;
  createdAt: string;
  updatedAt: string;
  createdBy?: string;
  updatedBy?: string;
  version?: number;
}

export interface ErrorBoundaryState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export type AsyncState<T> = 
  | { status: 'idle'; data?: undefined; error?: undefined }
  | { status: 'loading'; data?: T; error?: undefined }
  | { status: 'success'; data: T; error?: undefined }
  | { status: 'error'; data?: undefined; error: Error };

export interface NotificationType {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message?: string;
  duration?: number;
  action?: {
    label: string;
    handler: () => void;
  };
}