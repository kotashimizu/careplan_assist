import { cryptoService } from '../services/cryptoService';

class SecureStorage {
  private prefix = 'secure-toolkit-';

  /**
   * 暗号化してlocalStorageに保存
   */
  async setItem(key: string, value: any): Promise<void> {
    try {
      const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
      const encrypted = await cryptoService.encrypt(stringValue);
      localStorage.setItem(this.prefix + key, encrypted);
    } catch (error) {
      console.error('SecureStorage setItem error:', error);
      throw new Error('Failed to store encrypted data');
    }
  }

  /**
   * localStorageから復号化して取得
   */
  async getItem<T = any>(key: string): Promise<T | null> {
    try {
      const encrypted = localStorage.getItem(this.prefix + key);
      if (!encrypted) return null;

      const decrypted = await cryptoService.decrypt(encrypted);
      
      // JSONパースを試行
      try {
        return JSON.parse(decrypted);
      } catch {
        // 文字列として返す
        return decrypted as T;
      }
    } catch (error) {
      console.error('SecureStorage getItem error:', error);
      return null;
    }
  }

  /**
   * アイテムを削除
   */
  removeItem(key: string): void {
    localStorage.removeItem(this.prefix + key);
  }

  /**
   * すべてのSecureToolkit関連アイテムをクリア
   */
  clear(): void {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
      if (key.startsWith(this.prefix)) {
        localStorage.removeItem(key);
      }
    });
  }

  /**
   * 保存されているキーの一覧を取得
   */
  keys(): string[] {
    const keys = Object.keys(localStorage);
    return keys
      .filter(key => key.startsWith(this.prefix))
      .map(key => key.substring(this.prefix.length));
  }

  /**
   * セッション用の一時的な暗号化ストレージ
   */
  session = {
    setItem: async (key: string, value: any): Promise<void> => {
      try {
        const stringValue = typeof value === 'string' ? value : JSON.stringify(value);
        const encrypted = await cryptoService.encrypt(stringValue);
        sessionStorage.setItem(this.prefix + key, encrypted);
      } catch (error) {
        console.error('SecureStorage session setItem error:', error);
        throw new Error('Failed to store encrypted session data');
      }
    },

    getItem: async <T = any>(key: string): Promise<T | null> => {
      try {
        const encrypted = sessionStorage.getItem(this.prefix + key);
        if (!encrypted) return null;

        const decrypted = await cryptoService.decrypt(encrypted);
        
        try {
          return JSON.parse(decrypted);
        } catch {
          return decrypted as T;
        }
      } catch (error) {
        console.error('SecureStorage session getItem error:', error);
        return null;
      }
    },

    removeItem: (key: string): void => {
      sessionStorage.removeItem(this.prefix + key);
    },

    clear: (): void => {
      const keys = Object.keys(sessionStorage);
      keys.forEach(key => {
        if (key.startsWith(this.prefix)) {
          sessionStorage.removeItem(key);
        }
      });
    }
  };
}

export const secureStorage = new SecureStorage();