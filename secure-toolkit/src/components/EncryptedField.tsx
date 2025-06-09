import React, { useState, useEffect, useCallback } from 'react';
import { useEncryption } from '../hooks/useEncryption';

interface EncryptedFieldProps {
  value?: string;
  onChange?: (encryptedValue: string, decryptedValue: string) => void;
  onDecrypt?: (decryptedValue: string) => void;
  type?: 'text' | 'textarea' | 'creditcard';
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoDecrypt?: boolean;
  maskValue?: boolean;
  maxLength?: number;
}

/**
 * EncryptedField - 自動的に暗号化/復号化する入力フィールド
 * 
 * @example
 * ```tsx
 * <EncryptedField
 *   type="creditcard"
 *   onChange={(encrypted, decrypted) => {
 *     setCardData(encrypted); // 暗号化された値を保存
 *   }}
 * />
 * ```
 */
export const EncryptedField = React.memo<EncryptedFieldProps>(({
  value = '',
  onChange,
  onDecrypt,
  type = 'text',
  placeholder,
  className = '',
  disabled = false,
  autoDecrypt = false,
  maskValue = true,
  maxLength
}) => {
  const { encrypt, decrypt } = useEncryption();
  const [displayValue, setDisplayValue] = useState('');
  const [isDecrypted, setIsDecrypted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // マスク処理をメモ化
  const maskCreditCard = useCallback((value: string): string => {
    if (value.length <= 4) return value;
    return '*'.repeat(value.length - 4) + value.slice(-4);
  }, []);

  // 初期値の処理
  useEffect(() => {
    if (value && autoDecrypt) {
      handleDecrypt();
    } else if (value && maskValue && type === 'creditcard') {
      setDisplayValue(maskCreditCard(value));
    }
  }, [value, autoDecrypt, maskValue, type, maskCreditCard]);

  const handleDecrypt = useCallback(async () => {
    if (!value) return;

    try {
      const decrypted = await decrypt(value);
      setDisplayValue(decrypted);
      setIsDecrypted(true);
      onDecrypt?.(decrypted);
      setError(null);
    } catch (err) {
      setError('復号化に失敗しました');
      console.error('Decryption error:', err);
    }
  }, [value, decrypt, onDecrypt]);

  const handleChange = useCallback(async (newValue: string) => {
    setDisplayValue(newValue);
    setIsDecrypted(true);

    // 暗号化
    try {
      const encrypted = await encrypt(newValue);
      onChange?.(encrypted, newValue);
      setError(null);
    } catch (err) {
      setError('暗号化に失敗しました');
      console.error('Encryption error:', err);
    }
  }, [encrypt, onChange]);

  const formatCreditCard = useCallback((value: string): string => {
    // クレジットカード番号を4桁ごとにスペースで区切る
    const cleaned = value.replace(/\s/g, '');
    const groups = cleaned.match(/.{1,4}/g) || [];
    return groups.join(' ');
  }, []);

  const handleCreditCardChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const cleaned = e.target.value.replace(/[^\d]/g, '');
    if (cleaned.length <= 16) {
      const formatted = formatCreditCard(cleaned);
      handleChange(cleaned); // 暗号化は番号のみ
      setDisplayValue(formatted); // 表示はフォーマット済み
    }
  }, [handleChange, formatCreditCard]);

  if (type === 'textarea') {
    return (
      <div>
        <textarea
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} ${error ? 'border-red-500' : ''}`}
          disabled={disabled}
        />
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  if (type === 'creditcard') {
    return (
      <div>
        <div className="relative">
          <input
            type="text"
            value={displayValue}
            onChange={handleCreditCardChange}
            placeholder={placeholder || '0000 0000 0000 0000'}
            className={`${className} ${error ? 'border-red-500' : ''}`}
            disabled={disabled}
            maxLength={19} // 16 digits + 3 spaces
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400">
            🔒
          </div>
        </div>
        {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
      </div>
    );
  }

  return (
    <div>
      <div className="relative">
        <input
          type={isDecrypted ? 'text' : 'password'}
          value={displayValue}
          onChange={(e) => handleChange(e.target.value)}
          placeholder={placeholder}
          className={`${className} ${error ? 'border-red-500' : ''}`}
          disabled={disabled}
          maxLength={maxLength}
        />
        {value && !isDecrypted && !autoDecrypt && (
          <button
            type="button"
            onClick={handleDecrypt}
            className="absolute right-2 top-1/2 transform -translate-y-1/2 text-sm text-blue-600 hover:text-blue-700"
          >
            復号化
          </button>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
});

EncryptedField.displayName = 'EncryptedField';