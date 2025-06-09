import { useState, useCallback, useRef } from 'react';

interface RateLimitConfig {
  max: number; // 最大試行回数
  windowMs: number; // 時間枠（ミリ秒）
  onLimitExceeded?: () => void; // 制限超過時のコールバック
}

interface RateLimitState {
  remaining: number;
  resetTime: number | null;
  isLimited: boolean;
}

/**
 * useRateLimit - クライアントサイドのレート制限フック
 * 
 * @example
 * ```tsx
 * const { checkLimit, remaining, isLimited, reset } = useRateLimit({
 *   max: 5,
 *   windowMs: 60000, // 1分
 *   onLimitExceeded: () => alert('試行回数を超えました')
 * });
 * 
 * const handleSubmit = () => {
 *   if (!checkLimit()) return;
 *   // 処理を実行
 * };
 * ```
 */
export function useRateLimit(config: RateLimitConfig) {
  const [state, setState] = useState<RateLimitState>({
    remaining: config.max,
    resetTime: null,
    isLimited: false
  });

  const attemptsRef = useRef<{ count: number; resetTime: number }>({
    count: 0,
    resetTime: 0
  });

  // 制限チェック
  const checkLimit = useCallback((): boolean => {
    const now = Date.now();
    const attempts = attemptsRef.current;

    // リセット時間を過ぎていたらカウントをリセット
    if (now > attempts.resetTime) {
      attempts.count = 0;
      attempts.resetTime = now + config.windowMs;
    }

    // 制限チェック
    if (attempts.count >= config.max) {
      const remaining = Math.ceil((attempts.resetTime - now) / 1000);
      
      setState({
        remaining: 0,
        resetTime: attempts.resetTime,
        isLimited: true
      });

      config.onLimitExceeded?.();
      return false;
    }

    // カウント増加
    attempts.count++;
    
    setState({
      remaining: config.max - attempts.count,
      resetTime: attempts.resetTime,
      isLimited: false
    });

    return true;
  }, [config]);

  // 手動リセット
  const reset = useCallback(() => {
    attemptsRef.current = {
      count: 0,
      resetTime: 0
    };
    
    setState({
      remaining: config.max,
      resetTime: null,
      isLimited: false
    });
  }, [config.max]);

  // 残り時間の取得（秒）
  const getRemainingTime = useCallback((): number => {
    if (!state.resetTime) return 0;
    
    const remaining = Math.ceil((state.resetTime - Date.now()) / 1000);
    return Math.max(0, remaining);
  }, [state.resetTime]);

  return {
    checkLimit,
    remaining: state.remaining,
    isLimited: state.isLimited,
    resetTime: state.resetTime,
    getRemainingTime,
    reset
  };
}