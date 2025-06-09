import React, { useMemo } from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
  className?: string;
  showRequirements?: boolean;
}

interface PasswordRequirement {
  test: (password: string) => boolean;
  message: string;
  weight: number;
}

/**
 * PasswordStrengthIndicator - パスワード強度表示コンポーネント
 * 
 * @example
 * ```tsx
 * <PasswordStrengthIndicator 
 *   password={userPassword}
 *   showRequirements={true}
 * />
 * ```
 */
export const PasswordStrengthIndicator = React.memo<PasswordStrengthIndicatorProps>(({
  password,
  className = '',
  showRequirements = false
}) => {
  const requirements: PasswordRequirement[] = [
    {
      test: (pwd) => pwd.length >= 8,
      message: '8文字以上',
      weight: 2
    },
    {
      test: (pwd) => /[a-z]/.test(pwd),
      message: '小文字を含む',
      weight: 1
    },
    {
      test: (pwd) => /[A-Z]/.test(pwd),
      message: '大文字を含む',
      weight: 1
    },
    {
      test: (pwd) => /[0-9]/.test(pwd),
      message: '数字を含む',
      weight: 1
    },
    {
      test: (pwd) => /[^a-zA-Z0-9]/.test(pwd),
      message: '特殊文字を含む',
      weight: 2
    },
    {
      test: (pwd) => pwd.length >= 12,
      message: '12文字以上（推奨）',
      weight: 1
    },
    {
      test: (pwd) => !/(123|abc|password|qwerty)/i.test(pwd),
      message: '一般的なパターンを避ける',
      weight: 1
    }
  ];

  // 強度計算をメモ化
  const strength = useMemo(() => {
    if (!password) return { score: 0, level: 'none', color: 'gray' };

    const passedRequirements = requirements.filter(req => req.test(password));
    const totalWeight = passedRequirements.reduce((sum, req) => sum + req.weight, 0);
    const maxWeight = requirements.reduce((sum, req) => sum + req.weight, 0);
    
    const score = (totalWeight / maxWeight) * 100;

    if (score < 30) {
      return { score, level: 'weak', color: 'red' };
    } else if (score < 60) {
      return { score, level: 'fair', color: 'yellow' };
    } else if (score < 80) {
      return { score, level: 'good', color: 'blue' };
    } else {
      return { score, level: 'strong', color: 'green' };
    }
  }, [password]);

  const getLevelText = (level: string) => {
    switch (level) {
      case 'weak': return '弱い';
      case 'fair': return '普通';
      case 'good': return '良い';
      case 'strong': return '強い';
      default: return '';
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'red':
        return {
          bg: 'bg-red-500',
          text: 'text-red-600',
          border: 'border-red-200'
        };
      case 'yellow':
        return {
          bg: 'bg-yellow-500',
          text: 'text-yellow-600',
          border: 'border-yellow-200'
        };
      case 'blue':
        return {
          bg: 'bg-blue-500',
          text: 'text-blue-600',
          border: 'border-blue-200'
        };
      case 'green':
        return {
          bg: 'bg-green-500',
          text: 'text-green-600',
          border: 'border-green-200'
        };
      default:
        return {
          bg: 'bg-gray-300',
          text: 'text-gray-600',
          border: 'border-gray-200'
        };
    }
  };

  const colors = useMemo(() => getColorClasses(strength.color), [strength.color]);

  if (!password) {
    return null;
  }

  return (
    <div className={`mt-2 ${className}`}>
      {/* 強度バー */}
      <div className="mb-2">
        <div className="flex justify-between items-center mb-1">
          <span className="text-xs text-gray-600">パスワード強度</span>
          <span className={`text-xs font-medium ${colors.text}`}>
            {getLevelText(strength.level)}
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${colors.bg}`}
            style={{ width: `${strength.score}%` }}
          />
        </div>
      </div>

      {/* 要件リスト */}
      {showRequirements && (
        <div className={`p-3 border rounded-md ${colors.border} bg-gray-50`}>
          <div className="text-xs font-medium text-gray-700 mb-2">
            パスワード要件:
          </div>
          <ul className="space-y-1">
            {requirements.map((req, index) => {
              const isPassed = req.test(password);
              return (
                <li
                  key={index}
                  className={`text-xs flex items-center ${
                    isPassed ? 'text-green-600' : 'text-gray-500'
                  }`}
                >
                  <span className="mr-2">
                    {isPassed ? '✓' : '○'}
                  </span>
                  {req.message}
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* セキュリティヒント */}
      {strength.level === 'weak' && (
        <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-xs text-red-700">
          💡 より強力なパスワードを使用することを強く推奨します
        </div>
      )}
      
      {strength.level === 'strong' && (
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-xs text-green-700">
          ✅ 非常に強力なパスワードです！
        </div>
      )}
    </div>
  );
});

PasswordStrengthIndicator.displayName = 'PasswordStrengthIndicator';