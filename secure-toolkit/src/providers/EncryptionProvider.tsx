import React, { createContext, ReactNode } from 'react';
import { EncryptionConfig } from '../types/encryption';
import { cryptoService } from '../services/cryptoService';

interface EncryptionContextType {
  encrypt: (data: string) => Promise<string>;
  decrypt: (encryptedData: string) => Promise<string>;
  hashPassword: (password: string) => Promise<string>;
  verifyPassword: (password: string, hash: string) => Promise<boolean>;
  generateKey: () => string;
  config: EncryptionConfig;
}

export const EncryptionContext = createContext<EncryptionContextType | null>(null);

interface EncryptionProviderProps {
  children: ReactNode;
  config: EncryptionConfig;
}

export const EncryptionProvider: React.FC<EncryptionProviderProps> = ({ 
  children, 
  config 
}) => {
  // 暗号化サービスを初期化
  cryptoService.initialize(config);

  const value: EncryptionContextType = {
    encrypt: (data: string) => cryptoService.encrypt(data),
    decrypt: (encryptedData: string) => cryptoService.decrypt(encryptedData),
    hashPassword: (password: string) => cryptoService.hashPassword(password),
    verifyPassword: (password: string, hash: string) => cryptoService.verifyPassword(password, hash),
    generateKey: () => cryptoService.generateKey(),
    config
  };

  return (
    <EncryptionContext.Provider value={value}>
      {children}
    </EncryptionContext.Provider>
  );
};