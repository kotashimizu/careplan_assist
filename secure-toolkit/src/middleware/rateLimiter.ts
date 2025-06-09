import { auditLogService } from '../services/auditLogService';

interface RateLimitConfig {
  windowMs: number; // 時間枠（ミリ秒）
  max: number; // 最大リクエスト数
  message?: string; // エラーメッセージ
  skipSuccessfulRequests?: boolean; // 成功したリクエストをカウントしない
  skipFailedRequests?: boolean; // 失敗したリクエストをカウントしない
}

interface RateLimitStore {
  [key: string]: {
    count: number;
    resetTime: number;
  };
}

interface DDoSProtectionConfig {
  threshold: number; // DDoSと判断するリクエスト数/秒
  blockDuration: number; // ブロック時間（ミリ秒）
}

class RateLimiter {
  private store: RateLimitStore = {};
  private blacklist: Set<string> = new Set();
  private whitelist: Set<string> = new Set();
  private ddosProtection: DDoSProtectionConfig = {
    threshold: 100,
    blockDuration: 3600000 // 1時間
  };
  
  // エンドポイント別の設定
  private endpointConfigs: Map<string, RateLimitConfig> = new Map([
    ['/api/auth/login', { windowMs: 900000, max: 5 }], // 15分で5回
    ['/api/auth/mfa', { windowMs: 300000, max: 3 }], // 5分で3回
    ['/api/auth/register', { windowMs: 3600000, max: 10 }], // 1時間で10回
    ['/api/password/reset', { windowMs: 3600000, max: 3 }], // 1時間で3回
    ['default', { windowMs: 60000, max: 100 }] // 1分で100回（デフォルト）
  ]);

  /**
   * レート制限チェック
   */
  async checkLimit(
    identifier: string, 
    endpoint: string,
    options?: { 
      isSuccess?: boolean;
      userId?: string;
    }
  ): Promise<{ allowed: boolean; retryAfter?: number; reason?: string }> {
    // ホワイトリストチェック
    if (this.whitelist.has(identifier)) {
      return { allowed: true };
    }

    // ブラックリストチェック
    if (this.blacklist.has(identifier)) {
      return { 
        allowed: false, 
        reason: 'IP address is blacklisted' 
      };
    }

    // DDoS検知
    if (this.detectDDoS(identifier)) {
      this.blacklist.add(identifier);
      
      await auditLogService.log({
        action: 'DDOS_DETECTED',
        userId: options?.userId || 'unknown',
        resourceType: 'security',
        resourceId: identifier,
        details: {
          endpoint,
          timestamp: new Date().toISOString()
        },
        severity: 'critical'
      });

      return { 
        allowed: false, 
        reason: 'DDoS attack detected' 
      };
    }

    // エンドポイント設定の取得
    const config = this.endpointConfigs.get(endpoint) || this.endpointConfigs.get('default')!;
    
    // Skip条件のチェック
    if (
      (config.skipSuccessfulRequests && options?.isSuccess) ||
      (config.skipFailedRequests && !options?.isSuccess)
    ) {
      return { allowed: true };
    }

    const now = Date.now();
    const key = `${identifier}:${endpoint}`;
    const record = this.store[key];

    // 新規レコードまたはリセット時間経過
    if (!record || now > record.resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + config.windowMs
      };
      return { allowed: true };
    }

    // カウントチェック
    if (record.count >= config.max) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      await auditLogService.log({
        action: 'RATE_LIMIT_EXCEEDED',
        userId: options?.userId || 'unknown',
        resourceType: 'api',
        resourceId: endpoint,
        details: {
          identifier,
          count: record.count,
          max: config.max,
          retryAfter
        },
        severity: 'warning'
      });

      return {
        allowed: false,
        retryAfter,
        reason: config.message || `Too many requests. Please retry after ${retryAfter} seconds.`
      };
    }

    // カウント増加
    record.count++;
    return { allowed: true };
  }

  /**
   * DDoS攻撃の検知
   */
  private detectDDoS(identifier: string): boolean {
    const key = `ddos:${identifier}`;
    const now = Date.now();
    const window = 1000; // 1秒
    
    if (!this.store[key] || now > this.store[key].resetTime) {
      this.store[key] = {
        count: 1,
        resetTime: now + window
      };
      return false;
    }

    this.store[key].count++;
    return this.store[key].count > this.ddosProtection.threshold;
  }

  /**
   * IPアドレスをホワイトリストに追加
   */
  addToWhitelist(ip: string): void {
    this.whitelist.add(ip);
    this.blacklist.delete(ip); // ブラックリストから削除
  }

  /**
   * IPアドレスをブラックリストに追加
   */
  addToBlacklist(ip: string): void {
    this.blacklist.add(ip);
    this.whitelist.delete(ip); // ホワイトリストから削除
  }

  /**
   * レート制限のリセット
   */
  reset(identifier?: string, endpoint?: string): void {
    if (identifier && endpoint) {
      delete this.store[`${identifier}:${endpoint}`];
    } else if (identifier) {
      Object.keys(this.store)
        .filter(key => key.startsWith(`${identifier}:`))
        .forEach(key => delete this.store[key]);
    } else {
      this.store = {};
    }
  }

  /**
   * 統計情報の取得
   */
  getStats(): {
    activeIdentifiers: number;
    blacklistedIPs: number;
    whitelistedIPs: number;
    topOffenders: Array<{ identifier: string; count: number }>;
  } {
    const identifierCounts = new Map<string, number>();
    
    Object.entries(this.store).forEach(([key, record]) => {
      const [identifier] = key.split(':');
      identifierCounts.set(
        identifier,
        (identifierCounts.get(identifier) || 0) + record.count
      );
    });

    const topOffenders = Array.from(identifierCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([identifier, count]) => ({ identifier, count }));

    return {
      activeIdentifiers: identifierCounts.size,
      blacklistedIPs: this.blacklist.size,
      whitelistedIPs: this.whitelist.size,
      topOffenders
    };
  }

  /**
   * クリーンアップ（期限切れレコードの削除）
   */
  cleanup(): void {
    const now = Date.now();
    Object.entries(this.store).forEach(([key, record]) => {
      if (now > record.resetTime) {
        delete this.store[key];
      }
    });
  }

  /**
   * カスタム設定の追加
   */
  setEndpointConfig(endpoint: string, config: RateLimitConfig): void {
    this.endpointConfigs.set(endpoint, config);
  }

  /**
   * DDoS保護設定の更新
   */
  setDDoSProtection(config: Partial<DDoSProtectionConfig>): void {
    this.ddosProtection = { ...this.ddosProtection, ...config };
  }
}

export const rateLimiter = new RateLimiter();

// Express middleware用のラッパー
export const createRateLimitMiddleware = (endpoint?: string) => {
  return async (req: any, res: any, next: any) => {
    const identifier = req.ip || req.connection.remoteAddress || 'unknown';
    const path = endpoint || req.path;
    const userId = req.user?.id;

    const result = await rateLimiter.checkLimit(identifier, path, { userId });

    if (!result.allowed) {
      res.status(429).json({
        error: 'Too Many Requests',
        message: result.reason,
        retryAfter: result.retryAfter
      });
      return;
    }

    next();
  };
};