import jwt from 'jsonwebtoken';
import { User } from '../types/auth';
import { auditLogService } from './auditLogService';
import { cryptoService } from './cryptoService';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  tenantId?: string;
  sessionId: string;
  deviceId?: string;
  mfaVerified?: boolean;
}

interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  refreshExpiresIn: number;
}

interface DecodedToken extends TokenPayload {
  iat: number;
  exp: number;
  jti: string;
}

interface JWTConfig {
  accessTokenExpiry: number; // 秒単位
  refreshTokenExpiry: number; // 秒単位
  algorithm: jwt.Algorithm;
  issuer: string;
  audience: string;
}

class JWTService {
  private readonly defaultConfig: JWTConfig = {
    accessTokenExpiry: 900, // 15分
    refreshTokenExpiry: 604800, // 7日
    algorithm: 'RS256',
    issuer: 'secure-toolkit',
    audience: 'secure-app'
  };

  private config: JWTConfig;
  private blacklistedTokens: Set<string> = new Set();
  private refreshTokenRotation: Map<string, string> = new Map();

  // 実際の運用では、環境変数や安全な鍵管理システムから取得
  private readonly privateKey = process.env.JWT_PRIVATE_KEY || this.generateKeyPair().privateKey;
  private readonly publicKey = process.env.JWT_PUBLIC_KEY || this.generateKeyPair().publicKey;

  constructor(config?: Partial<JWTConfig>) {
    this.config = { ...this.defaultConfig, ...config };
  }

  /**
   * トークンペアの生成
   */
  async generateTokenPair(user: User, deviceId?: string, mfaVerified: boolean = false): Promise<TokenPair> {
    const sessionId = cryptoService.generateId();
    const jti = cryptoService.generateId();

    const payload: TokenPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      sessionId,
      deviceId,
      mfaVerified
    };

    // アクセストークン生成
    const accessToken = jwt.sign(payload, this.privateKey, {
      algorithm: this.config.algorithm,
      expiresIn: this.config.accessTokenExpiry,
      issuer: this.config.issuer,
      audience: this.config.audience,
      jwtid: jti
    });

    // リフレッシュトークン生成
    const refreshJti = cryptoService.generateId();
    const refreshToken = jwt.sign(
      { ...payload, type: 'refresh' },
      this.privateKey,
      {
        algorithm: this.config.algorithm,
        expiresIn: this.config.refreshTokenExpiry,
        issuer: this.config.issuer,
        audience: this.config.audience,
        jwtid: refreshJti
      }
    );

    // リフレッシュトークンのローテーション管理
    this.refreshTokenRotation.set(refreshJti, sessionId);

    // 監査ログ
    await auditLogService.log({
      action: 'TOKEN_GENERATED',
      userId: user.id,
      resourceType: 'authentication',
      resourceId: sessionId,
      details: {
        tokenType: 'access_refresh_pair',
        deviceId,
        mfaVerified
      },
      severity: 'info'
    });

    return {
      accessToken,
      refreshToken,
      expiresIn: this.config.accessTokenExpiry,
      refreshExpiresIn: this.config.refreshTokenExpiry
    };
  }

  /**
   * アクセストークンの検証
   */
  async verifyAccessToken(token: string): Promise<DecodedToken> {
    try {
      const decoded = jwt.verify(token, this.publicKey, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience
      }) as DecodedToken;

      // ブラックリストチェック
      if (this.blacklistedTokens.has(decoded.jti)) {
        throw new Error('Token has been revoked');
      }

      // MFA必須の操作で未検証の場合
      if (this.requiresMFA(decoded) && !decoded.mfaVerified) {
        throw new Error('MFA verification required');
      }

      return decoded;
    } catch (error) {
      await auditLogService.log({
        action: 'TOKEN_VERIFICATION_FAILED',
        userId: 'unknown',
        resourceType: 'authentication',
        resourceId: 'unknown',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        severity: 'warning'
      });
      throw error;
    }
  }

  /**
   * リフレッシュトークンによるトークン更新
   */
  async refreshTokens(refreshToken: string): Promise<TokenPair> {
    try {
      const decoded = jwt.verify(refreshToken, this.publicKey, {
        algorithms: [this.config.algorithm],
        issuer: this.config.issuer,
        audience: this.config.audience
      }) as DecodedToken & { type: string };

      if (decoded.type !== 'refresh') {
        throw new Error('Invalid token type');
      }

      // ローテーションチェック
      const sessionId = this.refreshTokenRotation.get(decoded.jti);
      if (!sessionId || sessionId !== decoded.sessionId) {
        throw new Error('Invalid refresh token');
      }

      // 古いリフレッシュトークンを無効化
      this.refreshTokenRotation.delete(decoded.jti);
      this.blacklistedTokens.add(decoded.jti);

      // 新しいトークンペアを生成
      const user: User = {
        id: decoded.userId,
        email: decoded.email,
        role: decoded.role,
        tenantId: decoded.tenantId
      } as User;

      return await this.generateTokenPair(user, decoded.deviceId, decoded.mfaVerified);
    } catch (error) {
      await auditLogService.log({
        action: 'TOKEN_REFRESH_FAILED',
        userId: 'unknown',
        resourceType: 'authentication',
        resourceId: 'unknown',
        details: {
          error: error instanceof Error ? error.message : 'Unknown error'
        },
        severity: 'warning'
      });
      throw error;
    }
  }

  /**
   * トークンの無効化
   */
  async revokeToken(token: string): Promise<void> {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (decoded && decoded.jti) {
        this.blacklistedTokens.add(decoded.jti);
        
        await auditLogService.log({
          action: 'TOKEN_REVOKED',
          userId: decoded.userId,
          resourceType: 'authentication',
          resourceId: decoded.sessionId,
          details: {
            tokenId: decoded.jti
          },
          severity: 'info'
        });
      }
    } catch (error) {
      console.error('Token revocation error:', error);
    }
  }

  /**
   * セッション無効化
   */
  async revokeSession(sessionId: string): Promise<void> {
    // セッションに関連するすべてのトークンを無効化
    // 実際の実装では、データベースやRedisで管理
    await auditLogService.log({
      action: 'SESSION_REVOKED',
      userId: 'system',
      resourceType: 'authentication',
      resourceId: sessionId,
      details: {
        timestamp: new Date().toISOString()
      },
      severity: 'info'
    });
  }

  /**
   * トークンの残り有効期限を取得
   */
  getTokenExpiry(token: string): number | null {
    try {
      const decoded = jwt.decode(token) as DecodedToken;
      if (decoded && decoded.exp) {
        const now = Math.floor(Date.now() / 1000);
        return decoded.exp - now;
      }
      return null;
    } catch {
      return null;
    }
  }

  /**
   * MFAが必要な操作かチェック
   */
  private requiresMFA(token: DecodedToken): boolean {
    // 管理者権限や機密データアクセスにはMFA必須
    const mfaRequiredRoles = ['admin', 'superuser', 'doctor', 'nurse'];
    return mfaRequiredRoles.includes(token.role);
  }

  /**
   * RSA鍵ペアの生成（開発用）
   */
  private generateKeyPair() {
    // 実際の運用では適切な鍵管理システムを使用
    const { generateKeyPairSync } = require('crypto');
    const { publicKey, privateKey } = generateKeyPairSync('rsa', {
      modulusLength: 2048,
      publicKeyEncoding: {
        type: 'spki',
        format: 'pem'
      },
      privateKeyEncoding: {
        type: 'pkcs8',
        format: 'pem'
      }
    });
    return { publicKey, privateKey };
  }

  /**
   * ブラックリストのクリーンアップ
   */
  async cleanupBlacklist(): Promise<void> {
    // 期限切れトークンをブラックリストから削除
    // 実際の運用では定期的なジョブで実行
    const cleaned = this.blacklistedTokens.size;
    this.blacklistedTokens.clear();
    
    console.log(`Cleaned ${cleaned} expired tokens from blacklist`);
  }
}

export const jwtService = new JWTService();