import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { User } from '../types/auth';
import { auditLogService } from './auditLogService';
import { cryptoService } from './cryptoService';

interface MFASecret {
  userId: string;
  secret: string;
  backupCodes: string[];
  createdAt: Date;
  lastUsed?: Date;
}

interface SMSSession {
  sessionId: string;
  phoneNumber: string;
  code: string;
  attempts: number;
  expiresAt: Date;
}

class MFAService {
  private secrets: Map<string, MFASecret> = new Map();
  private smsSessions: Map<string, SMSSession> = new Map();
  private readonly MAX_SMS_ATTEMPTS = 3;
  private readonly SMS_EXPIRY_MINUTES = 5;
  private readonly BACKUP_CODE_COUNT = 10;

  /**
   * TOTP認証の設定
   */
  async setupTOTP(user: User): Promise<{ secret: string; qrCode: string; backupCodes: string[] }> {
    // 秘密鍵を生成
    const secret = speakeasy.generateSecret({
      name: `${(user as any).tenantName || 'SecureApp'} (${user.email})`,
      length: 32
    });

    // バックアップコードを生成
    const backupCodes = this.generateBackupCodes();

    // 暗号化して保存
    const encryptedSecret = await cryptoService.encrypt(secret.base32);
    const mfaSecret: MFASecret = {
      userId: user.id,
      secret: encryptedSecret,
      backupCodes: await Promise.all(
        backupCodes.map(code => cryptoService.encrypt(code))
      ),
      createdAt: new Date()
    };

    this.secrets.set(user.id, mfaSecret);

    // QRコードを生成
    const qrCode = await QRCode.toDataURL(secret.otpauth_url!);

    // 監査ログ
    await auditLogService.log({
      action: 'MFA_SETUP',
      userId: user.id,
      resourceType: 'authentication',
      resourceId: user.id,
      details: {
        method: 'TOTP',
        timestamp: new Date().toISOString()
      },
      severity: 'info'
    });

    return {
      secret: secret.base32,
      qrCode,
      backupCodes
    };
  }

  /**
   * TOTPトークンの検証
   */
  async verifyTOTP(userId: string, token: string): Promise<boolean> {
    const mfaSecret = this.secrets.get(userId);
    if (!mfaSecret) {
      return false;
    }

    try {
      const decryptedSecret = await cryptoService.decrypt(mfaSecret.secret);
      const verified = speakeasy.totp.verify({
        secret: decryptedSecret,
        encoding: 'base32',
        token,
        window: 2 // 前後2つの時間枠を許容
      });

      if (verified) {
        mfaSecret.lastUsed = new Date();
        await auditLogService.log({
          action: 'MFA_VERIFY_SUCCESS',
          userId,
          resourceType: 'authentication',
          resourceId: userId,
          details: { method: 'TOTP' },
          severity: 'info'
        });
      } else {
        await auditLogService.log({
          action: 'MFA_VERIFY_FAILED',
          userId,
          resourceType: 'authentication',
          resourceId: userId,
          details: { method: 'TOTP' },
          severity: 'warning'
        });
      }

      return verified;
    } catch (error) {
      console.error('TOTP verification error:', error);
      return false;
    }
  }

  /**
   * SMS認証コードの送信
   */
  async sendSMSCode(userId: string, phoneNumber: string): Promise<string> {
    // 6桁のコードを生成
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const sessionId = cryptoService.generateId();

    const session: SMSSession = {
      sessionId,
      phoneNumber,
      code,
      attempts: 0,
      expiresAt: new Date(Date.now() + this.SMS_EXPIRY_MINUTES * 60 * 1000)
    };

    this.smsSessions.set(sessionId, session);

    // 実際のSMS送信はTwilioなどのサービスを使用
    // await twilioClient.messages.create({
    //   body: `あなたの認証コード: ${code}`,
    //   from: process.env.TWILIO_PHONE,
    //   to: phoneNumber
    // });

    await auditLogService.log({
      action: 'MFA_SMS_SENT',
      userId,
      resourceType: 'authentication',
      resourceId: userId,
      details: { 
        phoneNumber: phoneNumber.replace(/\d(?=\d{4})/g, '*'),
        sessionId 
      },
      severity: 'info'
    });

    return sessionId;
  }

  /**
   * SMSコードの検証
   */
  async verifySMSCode(sessionId: string, code: string): Promise<boolean> {
    const session = this.smsSessions.get(sessionId);
    
    if (!session) {
      return false;
    }

    // 有効期限チェック
    if (new Date() > session.expiresAt) {
      this.smsSessions.delete(sessionId);
      return false;
    }

    // 試行回数チェック
    if (session.attempts >= this.MAX_SMS_ATTEMPTS) {
      this.smsSessions.delete(sessionId);
      return false;
    }

    session.attempts++;

    if (session.code === code) {
      this.smsSessions.delete(sessionId);
      return true;
    }

    return false;
  }

  /**
   * バックアップコードの生成
   */
  private generateBackupCodes(): string[] {
    const codes: string[] = [];
    for (let i = 0; i < this.BACKUP_CODE_COUNT; i++) {
      const code = Math.random().toString(36).substring(2, 10).toUpperCase();
      codes.push(code);
    }
    return codes;
  }

  /**
   * バックアップコードの検証
   */
  async verifyBackupCode(userId: string, code: string): Promise<boolean> {
    const mfaSecret = this.secrets.get(userId);
    if (!mfaSecret) {
      return false;
    }

    // 各バックアップコードをチェック
    for (let i = 0; i < mfaSecret.backupCodes.length; i++) {
      const encryptedCode = mfaSecret.backupCodes[i];
      const decryptedCode = await cryptoService.decrypt(encryptedCode);
      
      if (decryptedCode === code) {
        // 使用済みのコードを削除
        mfaSecret.backupCodes.splice(i, 1);
        
        await auditLogService.log({
          action: 'MFA_BACKUP_CODE_USED',
          userId,
          resourceType: 'authentication',
          resourceId: userId,
          details: { 
            remainingCodes: mfaSecret.backupCodes.length 
          },
          severity: 'warning'
        });
        
        return true;
      }
    }

    return false;
  }

  /**
   * MFA設定の無効化
   */
  async disableMFA(userId: string): Promise<void> {
    this.secrets.delete(userId);
    
    await auditLogService.log({
      action: 'MFA_DISABLED',
      userId,
      resourceType: 'authentication',
      resourceId: userId,
      details: { timestamp: new Date().toISOString() },
      severity: 'warning'
    });
  }

  /**
   * MFAが有効かチェック
   */
  isMFAEnabled(userId: string): boolean {
    return this.secrets.has(userId);
  }
}

export const mfaService = new MFAService();