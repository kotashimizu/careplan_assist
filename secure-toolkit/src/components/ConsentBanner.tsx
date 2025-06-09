import React, { useState, useEffect } from 'react';
import { useTenantConfig } from '../hooks/useTenantConfig';

interface ConsentBannerProps {
  onAccept?: () => void;
  onDecline?: () => void;
  className?: string;
}

/**
 * ConsentBanner - GDPR/CCPA準拠の同意バナー
 * 
 * @example
 * ```tsx
 * <ConsentBanner 
 *   onAccept={() => console.log('Consent given')}
 *   onDecline={() => console.log('Consent declined')}
 * />
 * ```
 */
export const ConsentBanner: React.FC<ConsentBannerProps> = ({
  onAccept,
  onDecline,
  className = ''
}) => {
  const { getConfig } = useTenantConfig();
  const [isVisible, setIsVisible] = useState(false);
  const [_consentStatus, setConsentStatus] = useState<string | null>(null);

  const complianceStandards = getConfig('compliance.standards') || [];
  const requiresConsent = complianceStandards.includes('GDPR') || 
                          complianceStandards.includes('CCPA');

  useEffect(() => {
    // ローカルストレージから同意状況を確認
    const stored = localStorage.getItem('privacy-consent');
    setConsentStatus(stored);
    
    // 同意が必要で、まだ同意していない場合はバナーを表示
    if (requiresConsent && !stored) {
      setIsVisible(true);
    }
  }, [requiresConsent]);

  const handleAccept = () => {
    localStorage.setItem('privacy-consent', 'accepted');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setConsentStatus('accepted');
    setIsVisible(false);
    onAccept?.();
  };

  const handleDecline = () => {
    localStorage.setItem('privacy-consent', 'declined');
    localStorage.setItem('privacy-consent-date', new Date().toISOString());
    setConsentStatus('declined');
    setIsVisible(false);
    onDecline?.();
  };

  const getConsentText = () => {
    if (complianceStandards.includes('GDPR')) {
      return {
        title: 'プライバシーポリシーとクッキーについて',
        message: 'このサイトでは、サービス改善のためにクッキーを使用しています。GDPR規則に従い、データ処理に関する同意をお願いします。',
        learnMore: 'プライバシーポリシーの詳細'
      };
    } else if (complianceStandards.includes('CCPA')) {
      return {
        title: 'カリフォルニア州消費者プライバシー法について',
        message: 'CCPA規則に従い、個人情報の収集と使用について通知いたします。',
        learnMore: 'プライバシーの権利について'
      };
    } else {
      return {
        title: 'プライバシーポリシー',
        message: 'このサイトでは、サービス改善のためにクッキーを使用しています。',
        learnMore: '詳細を見る'
      };
    }
  };

  if (!isVisible || !requiresConsent) {
    return null;
  }

  const content = getConsentText();

  return (
    <div className={`fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 shadow-lg z-50 ${className}`}>
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-sm font-medium text-gray-900 mb-1">
              {content.title}
            </h3>
            <p className="text-sm text-gray-600">
              {content.message}
              <a 
                href="/privacy-policy" 
                className="ml-2 text-blue-600 hover:text-blue-700 underline"
              >
                {content.learnMore}
              </a>
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleDecline}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              拒否
            </button>
            <button
              onClick={handleAccept}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              同意する
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};