import { useContext } from 'react';
import { AuditLogContext } from '../providers/AuditLogProvider';

/**
 * useAuditLog - 監査ログ機能にアクセスするためのフック
 * 
 * @example
 * ```tsx
 * const { logAction } = useAuditLog();
 * 
 * await logAction({
 *   action: 'DELETE_USER',
 *   resource: 'user',
 *   resourceId: userId,
 *   details: { reason: 'Account violation' }
 * });
 * ```
 */
export function useAuditLog() {
  const context = useContext(AuditLogContext);
  
  if (!context) {
    throw new Error(
      'useAuditLog must be used within an AuditLogProvider. ' +
      'Make sure your app is wrapped with <SecureProvider> or <AuditLogProvider>.'
    );
  }
  
  return context;
}