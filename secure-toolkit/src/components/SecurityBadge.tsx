import React from 'react';
import { useTenantConfig } from '../hooks/useTenantConfig';

interface SecurityBadgeProps {
  className?: string;
  showDetails?: boolean;
}

/**
 * SecurityBadge - 現在のセキュリティレベルを表示するバッジ
 * 
 * @example
 * ```tsx
 * <SecurityBadge />
 * <SecurityBadge showDetails={true} />
 * ```
 */
export const SecurityBadge: React.FC<SecurityBadgeProps> = ({ 
  className = '',
  showDetails = false 
}) => {
  const { getConfig } = useTenantConfig();
  const securityLevel = getConfig('security.level') || 'standard';
  
  const getLevelInfo = () => {
    switch (securityLevel) {
      case 'maximum':
        return {
          label: '最高',
          color: 'text-purple-600 bg-purple-100',
          icon: '🛡️',
          description: '最高レベルのセキュリティ保護'
        };
      case 'high':
        return {
          label: '高',
          color: 'text-red-600 bg-red-100',
          icon: '🔒',
          description: '強化されたセキュリティ保護'
        };
      case 'standard':
      default:
        return {
          label: '標準',
          color: 'text-green-600 bg-green-100',
          icon: '✓',
          description: '標準的なセキュリティ保護'
        };
    }
  };
  
  const levelInfo = getLevelInfo();
  
  return (
    <div className={`inline-flex items-center ${className}`}>
      <span className={`px-3 py-1 rounded-full text-xs font-medium ${levelInfo.color}`}>
        <span className="mr-1">{levelInfo.icon}</span>
        セキュリティ: {levelInfo.label}
      </span>
      
      {showDetails && (
        <div className="ml-2 text-xs text-gray-500">
          {levelInfo.description}
        </div>
      )}
    </div>
  );
};