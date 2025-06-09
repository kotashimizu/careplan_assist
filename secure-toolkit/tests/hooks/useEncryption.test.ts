import { renderHook, act } from '@testing-library/react';
import { ReactNode } from 'react';
import { EncryptionProvider } from '../../src/providers/EncryptionProvider';
import { useEncryption } from '../../src/hooks/useEncryption';

const createWrapper = () => ({ children }: { children: ReactNode }) => (
  <EncryptionProvider config={{ algorithm: 'AES-256', autoEncryptPII: true }}>
    {children}
  </EncryptionProvider>
);

describe('useEncryption', () => {
  it('should throw error when used outside EncryptionProvider', () => {
    const { result } = renderHook(() => {
      try {
        return useEncryption();
      } catch (error) {
        return error;
      }
    });

    expect(result.current).toBeInstanceOf(Error);
    expect((result.current as Error).message).toContain('must be used within an EncryptionProvider');
  });

  it('should provide encryption methods', () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    expect(result.current).toHaveProperty('encrypt');
    expect(result.current).toHaveProperty('decrypt');
    expect(result.current).toHaveProperty('hashPassword');
    expect(result.current).toHaveProperty('verifyPassword');
    expect(result.current).toHaveProperty('generateKey');
    expect(result.current).toHaveProperty('config');
  });

  it('should encrypt and decrypt data', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    const originalData = 'This is sensitive data';
    let encryptedData: string;
    let decryptedData: string;

    await act(async () => {
      encryptedData = await result.current.encrypt(originalData);
    });

    expect(encryptedData!).not.toBe(originalData);
    expect(encryptedData!).toContain(':'); // Contains IV separator

    await act(async () => {
      decryptedData = await result.current.decrypt(encryptedData!);
    });

    expect(decryptedData!).toBe(originalData);
  });

  it('should handle empty data encryption', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    await expect(
      act(async () => {
        await result.current.encrypt('');
      })
    ).rejects.toThrow();
  });

  it('should generate unique keys', () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    const key1 = result.current.generateKey();
    const key2 = result.current.generateKey();

    expect(key1).toBeTruthy();
    expect(key2).toBeTruthy();
    expect(key1).not.toBe(key2);
  });

  it('should hash and verify passwords', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    const password = 'mySecurePassword123';
    let hashedPassword: string;

    await act(async () => {
      hashedPassword = await result.current.hashPassword(password);
    });

    expect(hashedPassword!).not.toBe(password);
    expect(hashedPassword!).toContain(':'); // Contains salt separator

    let isValid: boolean;
    await act(async () => {
      isValid = await result.current.verifyPassword(password, hashedPassword!);
    });

    expect(isValid!).toBe(true);

    // Test with wrong password
    await act(async () => {
      isValid = await result.current.verifyPassword('wrongPassword', hashedPassword!);
    });

    expect(isValid!).toBe(false);
  });

  it('should handle invalid encrypted data format', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    await expect(
      act(async () => {
        await result.current.decrypt('invalid-format');
      })
    ).rejects.toThrow();
  });

  it('should encrypt different data to different values', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    let encrypted1: string;
    let encrypted2: string;

    await act(async () => {
      encrypted1 = await result.current.encrypt('data1');
      encrypted2 = await result.current.encrypt('data2');
    });

    expect(encrypted1!).not.toBe(encrypted2!);
  });

  it('should maintain data integrity through encryption/decryption', async () => {
    const { result } = renderHook(() => useEncryption(), {
      wrapper: createWrapper()
    });

    const testCases = [
      'Simple text',
      'Text with special characters: !@#$%^&*()',
      'Unicode text: 🔐 セキュリティ',
      JSON.stringify({ key: 'value', nested: { data: true } }),
      'Very long text '.repeat(100)
    ];

    for (const testData of testCases) {
      let encrypted: string;
      let decrypted: string;

      await act(async () => {
        encrypted = await result.current.encrypt(testData);
        decrypted = await result.current.decrypt(encrypted!);
      });

      expect(decrypted!).toBe(testData);
    }
  });
});