import CryptoJS from 'crypto-js';
import { EncryptionConfig } from '../types/encryption';

class CryptoService {
  private config: EncryptionConfig = {
    algorithm: 'AES-256',
    autoEncryptPII: true
  };
  
  private masterKey: string = '';

  initialize(config: EncryptionConfig) {
    this.config = { ...this.config, ...config };
    // マスターキーの生成または取得
    this.masterKey = this.getMasterKey();
  }

  private getMasterKey(): string {
    // 実際の実装では、環境変数や安全なキーストアから取得
    let key = localStorage.getItem('secure-toolkit-master-key');
    
    if (!key) {
      // 初回は新しいキーを生成
      key = this.generateKey();
      localStorage.setItem('secure-toolkit-master-key', key);
    }
    
    return key;
  }

  generateKey(): string {
    // 256ビットのランダムキーを生成
    return CryptoJS.lib.WordArray.random(256/8).toString();
  }

  async encrypt(data: string): Promise<string> {
    try {
      if (!data) {
        throw new Error('Encryption data cannot be empty');
      }

      // IVを生成
      const iv = CryptoJS.lib.WordArray.random(128/8);
      
      // データを暗号化
      const encrypted = CryptoJS.AES.encrypt(data, this.masterKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      // IVと暗号文を結合して返す
      const combined = iv.toString() + ':' + encrypted.toString();
      return combined;
    } catch (error) {
      console.error('Encryption error:', error);
      throw new Error('データの暗号化に失敗しました');
    }
  }

  async decrypt(encryptedData: string): Promise<string> {
    try {
      if (!encryptedData) {
        throw new Error('Encrypted data cannot be empty');
      }

      // IVと暗号文を分離
      const parts = encryptedData.split(':');
      if (parts.length !== 2) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = CryptoJS.enc.Hex.parse(parts[0]);
      const encrypted = parts[1];

      // 復号化
      const decrypted = CryptoJS.AES.decrypt(encrypted, this.masterKey, {
        iv: iv,
        mode: CryptoJS.mode.CBC,
        padding: CryptoJS.pad.Pkcs7
      });

      const result = decrypted.toString(CryptoJS.enc.Utf8);
      if (!result) {
        throw new Error('Decryption failed');
      }

      return result;
    } catch (error) {
      console.error('Decryption error:', error);
      throw new Error('データの復号化に失敗しました');
    }
  }

  async hashPassword(password: string): Promise<string> {
    // PBKDF2でパスワードをハッシュ化
    const salt = CryptoJS.lib.WordArray.random(128/8);
    const hash = CryptoJS.PBKDF2(password, salt, {
      keySize: 256/32,
      iterations: 10000
    });
    
    // ソルトとハッシュを結合して返す
    return salt.toString() + ':' + hash.toString();
  }

  async verifyPassword(password: string, storedHash: string): Promise<boolean> {
    try {
      const parts = storedHash.split(':');
      if (parts.length !== 2) {
        return false;
      }

      const salt = CryptoJS.enc.Hex.parse(parts[0]);
      const hash = CryptoJS.PBKDF2(password, salt, {
        keySize: 256/32,
        iterations: 10000
      });

      return hash.toString() === parts[1];
    } catch {
      return false;
    }
  }

  // 特定のフィールドがPIIかどうかを判定
  isPII(fieldName: string): boolean {
    const piiFields = [
      'email', 'phone', 'ssn', 'address', 'name', 'birthdate',
      'creditcard', 'bankaccount', 'passport', 'license',
      'medical', 'health', 'diagnosis', 'prescription'
    ];
    
    const lowerFieldName = fieldName.toLowerCase();
    return piiFields.some(field => lowerFieldName.includes(field));
  }

  // オブジェクト内のPIIフィールドを自動的に暗号化
  async encryptObject(obj: any): Promise<any> {
    if (!this.config.autoEncryptPII) {
      return obj;
    }

    const encrypted: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'string' && this.isPII(key)) {
        encrypted[key] = await this.encrypt(value);
        encrypted[`${key}_encrypted`] = true;
      } else if (typeof value === 'object' && value !== null) {
        encrypted[key] = await this.encryptObject(value);
      } else {
        encrypted[key] = value;
      }
    }
    
    return encrypted;
  }

  // 暗号化されたオブジェクトを復号化
  async decryptObject(obj: any): Promise<any> {
    const decrypted: any = {};
    
    for (const [key, value] of Object.entries(obj)) {
      if (key.endsWith('_encrypted') && value === true) {
        continue;
      }
      
      const isEncrypted = obj[`${key}_encrypted`] === true;
      
      if (isEncrypted && typeof value === 'string') {
        decrypted[key] = await this.decrypt(value);
      } else if (typeof value === 'object' && value !== null) {
        decrypted[key] = await this.decryptObject(value);
      } else {
        decrypted[key] = value;
      }
    }
    
    return decrypted;
  }

  // ファイル暗号化（Base64）
  async encryptFile(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = async (e) => {
        try {
          const content = e.target?.result as string;
          const encrypted = await this.encrypt(content);
          resolve(encrypted);
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => reject(new Error('ファイル読み込みエラー'));
      reader.readAsDataURL(file);
    });
  }

  // ファイル復号化
  async decryptFile(encryptedData: string, filename: string): Promise<File> {
    const decrypted = await this.decrypt(encryptedData);
    
    // Base64からBlobに変換
    const arr = decrypted.split(',');
    const mime = arr[0].match(/:(.*?);/)?.[1] || 'application/octet-stream';
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    
    for (let i = 0; i < n; i++) {
      u8arr[i] = bstr.charCodeAt(i);
    }
    
    return new File([u8arr], filename, { type: mime });
  }
}

export const cryptoService = new CryptoService();