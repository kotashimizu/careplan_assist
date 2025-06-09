import { useContext } from 'react';
import { EncryptionContext } from '../providers/EncryptionProvider';

/**
 * useEncryption - 暗号化機能にアクセスするためのフック
 * 
 * @example
 * ```tsx
 * const { encrypt, decrypt } = useEncryption();
 * 
 * // データを暗号化
 * const encrypted = await encrypt('sensitive data');
 * 
 * // データを復号化
 * const decrypted = await decrypt(encrypted);
 * ```
 */
export function useEncryption() {
  const context = useContext(EncryptionContext);
  
  if (!context) {
    throw new Error(
      'useEncryption must be used within an EncryptionProvider. ' +
      'Make sure your app is wrapped with <SecureProvider> or <EncryptionProvider>.'
    );
  }
  
  return context;
}