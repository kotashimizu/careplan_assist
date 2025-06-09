import { cryptoService } from '../../src/services/cryptoService';

describe('CryptoService', () => {
  beforeEach(() => {
    cryptoService.initialize({
      algorithm: 'AES-256',
      autoEncryptPII: true
    });
  });

  describe('encrypt/decrypt', () => {
    it('should encrypt and decrypt text correctly', async () => {
      const plainText = 'This is a secret message';
      const encrypted = await cryptoService.encrypt(plainText);
      
      expect(encrypted).not.toBe(plainText);
      expect(encrypted).toContain(':'); // IV separator
      
      const decrypted = await cryptoService.decrypt(encrypted);
      expect(decrypted).toBe(plainText);
    });

    it('should generate different encrypted values for same input', async () => {
      const plainText = 'Same message';
      const encrypted1 = await cryptoService.encrypt(plainText);
      const encrypted2 = await cryptoService.encrypt(plainText);
      
      expect(encrypted1).not.toBe(encrypted2); // Different IVs
      
      // But both should decrypt to same value
      expect(await cryptoService.decrypt(encrypted1)).toBe(plainText);
      expect(await cryptoService.decrypt(encrypted2)).toBe(plainText);
    });

    it('should handle special characters and unicode', async () => {
      const specialText = '特殊文字: !@#$%^&*() 🔐 🚀';
      const encrypted = await cryptoService.encrypt(specialText);
      const decrypted = await cryptoService.decrypt(encrypted);
      
      expect(decrypted).toBe(specialText);
    });

    it('should throw error for empty data', async () => {
      await expect(cryptoService.encrypt('')).rejects.toThrow('Encryption data cannot be empty');
    });

    it('should throw error for invalid encrypted data', async () => {
      await expect(cryptoService.decrypt('invalid')).rejects.toThrow('Invalid encrypted data format');
      await expect(cryptoService.decrypt('invalid:data:format')).rejects.toThrow();
    });
  });

  describe('password hashing', () => {
    it('should hash password with salt', async () => {
      const password = 'MySecurePassword123!';
      const hash = await cryptoService.hashPassword(password);
      
      expect(hash).not.toBe(password);
      expect(hash).toContain(':'); // Salt separator
    });

    it('should verify correct password', async () => {
      const password = 'TestPassword456';
      const hash = await cryptoService.hashPassword(password);
      
      const isValid = await cryptoService.verifyPassword(password, hash);
      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'CorrectPassword';
      const hash = await cryptoService.hashPassword(password);
      
      const isValid = await cryptoService.verifyPassword('WrongPassword', hash);
      expect(isValid).toBe(false);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'SamePassword';
      const hash1 = await cryptoService.hashPassword(password);
      const hash2 = await cryptoService.hashPassword(password);
      
      expect(hash1).not.toBe(hash2); // Different salts
      
      // But both should verify correctly
      expect(await cryptoService.verifyPassword(password, hash1)).toBe(true);
      expect(await cryptoService.verifyPassword(password, hash2)).toBe(true);
    });

    it('should handle invalid hash format', async () => {
      const isValid = await cryptoService.verifyPassword('password', 'invalid-hash');
      expect(isValid).toBe(false);
    });
  });

  describe('key generation', () => {
    it('should generate unique keys', () => {
      const keys = new Set();
      for (let i = 0; i < 100; i++) {
        keys.add(cryptoService.generateKey());
      }
      
      expect(keys.size).toBe(100); // All unique
    });

    it('should generate keys of consistent length', () => {
      const key = cryptoService.generateKey();
      expect(key.length).toBeGreaterThan(0);
      expect(key.length).toBe(64); // 256 bits in hex = 64 characters
    });
  });

  describe('PII detection', () => {
    it('should identify PII fields', () => {
      const piiFields = [
        'email', 'user_email', 'emailAddress',
        'phone', 'phoneNumber', 'mobile_phone',
        'ssn', 'social_security_number',
        'creditcard', 'credit_card_number',
        'address', 'home_address', 'billing_address',
        'name', 'full_name', 'firstName',
        'medical_record', 'health_data'
      ];

      piiFields.forEach(field => {
        expect(cryptoService.isPII(field)).toBe(true);
      });
    });

    it('should not identify non-PII fields', () => {
      const nonPiiFields = [
        'id', 'timestamp', 'status', 'type',
        'count', 'total', 'description', 'notes'
      ];

      nonPiiFields.forEach(field => {
        expect(cryptoService.isPII(field)).toBe(false);
      });
    });
  });

  describe('object encryption', () => {
    it('should auto-encrypt PII fields in objects', async () => {
      const obj = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        age: 30,
        notes: 'Some notes'
      };

      const encrypted = await cryptoService.encryptObject(obj);
      
      expect(encrypted.id).toBe(obj.id); // Non-PII unchanged
      expect(encrypted.age).toBe(obj.age);
      expect(encrypted.notes).toBe(obj.notes);
      
      expect(encrypted.email).not.toBe(obj.email); // PII encrypted
      expect(encrypted.email_encrypted).toBe(true);
      expect(encrypted.name).not.toBe(obj.name);
      expect(encrypted.name_encrypted).toBe(true);
    });

    it('should decrypt encrypted objects', async () => {
      const original = {
        id: '123',
        email: 'user@example.com',
        name: 'John Doe',
        phone: '+1234567890'
      };

      const encrypted = await cryptoService.encryptObject(original);
      const decrypted = await cryptoService.decryptObject(encrypted);
      
      expect(decrypted).toEqual(original);
    });

    it('should handle nested objects', async () => {
      const obj = {
        user: {
          id: '123',
          email: 'user@example.com',
          profile: {
            name: 'John Doe',
            bio: 'Developer'
          }
        },
        settings: {
          theme: 'dark'
        }
      };

      const encrypted = await cryptoService.encryptObject(obj);
      expect(encrypted.user.email).not.toBe(obj.user.email);
      expect(encrypted.user.profile.name).not.toBe(obj.user.profile.name);
      expect(encrypted.settings.theme).toBe(obj.settings.theme);

      const decrypted = await cryptoService.decryptObject(encrypted);
      expect(decrypted).toEqual(obj);
    });

    it('should respect autoEncryptPII setting', async () => {
      cryptoService.initialize({
        algorithm: 'AES-256',
        autoEncryptPII: false
      });

      const obj = {
        email: 'user@example.com',
        name: 'John Doe'
      };

      const result = await cryptoService.encryptObject(obj);
      expect(result).toEqual(obj); // No encryption when disabled
    });
  });

  describe('file encryption', () => {
    it('should encrypt and decrypt files', async () => {
      const fileContent = 'This is file content';
      const file = new File([fileContent], 'test.txt', { type: 'text/plain' });
      
      const encrypted = await cryptoService.encryptFile(file);
      expect(encrypted).toContain('data:text/plain;base64,');
      
      const decryptedFile = await cryptoService.decryptFile(encrypted, 'test.txt');
      expect(decryptedFile.name).toBe('test.txt');
      expect(decryptedFile.type).toBe('text/plain');
      
      // Read decrypted file content
      const reader = new FileReader();
      const content = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsText(decryptedFile);
      });
      
      expect(content).toBe(fileContent);
    });
  });
});