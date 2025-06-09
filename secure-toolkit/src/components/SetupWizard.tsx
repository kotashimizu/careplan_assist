import React, { useState } from 'react';
import { TenantConfig, IndustryType } from '../types/tenant';
import { presets } from '../config/presets';

interface SetupWizardProps {
  onComplete: (config: TenantConfig) => void;
  appType?: string;
  industryPreset?: IndustryType;
  theme?: 'light' | 'dark';
}

/**
 * SetupWizard - アプリケーションの初期設定を行うウィザード
 * 
 * @example
 * ```tsx
 * <SetupWizard
 *   onComplete={(config) => {
 *     localStorage.setItem('app-config', JSON.stringify(config));
 *   }}
 * />
 * ```
 */
export const SetupWizard: React.FC<SetupWizardProps> = ({ 
  onComplete,
  appType: _appType = 'general' as any,
  industryPreset,
  theme = 'light'
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<Partial<TenantConfig>>({
    tenantId: `tenant-${Date.now()}`,
    app: {
      name: '',
      logo: ''
    },
    industry: industryPreset || 'general',
    features: {},
    security: {
      level: 'standard'
    }
  });

  const steps = [
    { title: '基本情報', description: 'アプリケーションの基本情報を設定' },
    { title: '業界選択', description: '業界に応じた推奨設定を適用' },
    { title: 'セキュリティ', description: 'セキュリティレベルを選択' },
    { title: '機能選択', description: '使用する機能を選択' },
    { title: '確認', description: '設定内容を確認' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      // 完了
      onComplete(config as TenantConfig);
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const applyPreset = (industry: IndustryType) => {
    const preset = presets.find(p => p.industry === industry);
    if (preset) {
      setConfig(prev => ({
        ...prev,
        industry,
        features: { ...prev.features, ...preset.features },
        security: { ...prev.security, ...preset.security }
      }));
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 0: // 基本情報
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                アプリケーション名
              </label>
              <input
                type="text"
                value={config.app?.name || ''}
                onChange={(e) => setConfig(prev => ({
                  ...prev,
                  app: { ...prev.app, name: e.target.value }
                }))}
                className="w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500"
                placeholder="例: マイセキュアアプリ"
              />
            </div>
          </div>
        );

      case 1: // 業界選択
        return (
          <div className="space-y-3">
            {presets.map(preset => (
              <button
                key={preset.id}
                onClick={() => applyPreset(preset.industry)}
                className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  config.industry === preset.industry ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">{preset.name}</div>
                <div className="text-sm text-gray-600">{preset.description}</div>
              </button>
            ))}
          </div>
        );

      case 2: // セキュリティ
        return (
          <div className="space-y-3">
            {['standard', 'high', 'maximum'].map(level => (
              <button
                key={level}
                onClick={() => setConfig(prev => ({
                  ...prev,
                  security: { ...prev.security, level: level as any }
                }))}
                className={`w-full p-4 border rounded-lg text-left hover:bg-gray-50 ${
                  config.security?.level === level ? 'border-blue-500 bg-blue-50' : ''
                }`}
              >
                <div className="font-medium">
                  {level === 'standard' && '標準セキュリティ'}
                  {level === 'high' && '高セキュリティ'}
                  {level === 'maximum' && '最高セキュリティ'}
                </div>
                <div className="text-sm text-gray-600">
                  {level === 'standard' && '一般的なアプリケーション向け'}
                  {level === 'high' && '機密データを扱うアプリケーション向け'}
                  {level === 'maximum' && '医療・金融など最高レベルが必要な場合'}
                </div>
              </button>
            ))}
          </div>
        );

      case 3: // 機能選択
        const features = [
          { key: 'auth', label: '認証機能', description: 'ログイン・ログアウト' },
          { key: 'encryption', label: '暗号化', description: 'データの暗号化保存' },
          { key: 'audit', label: '監査ログ', description: '操作履歴の記録' },
          { key: 'mfa', label: '二要素認証', description: '追加のセキュリティ' }
        ];
        
        return (
          <div className="space-y-3">
            {features.map(feature => (
              <label
                key={feature.key}
                className="flex items-start p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={config.features?.[feature.key] || false}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    features: {
                      ...prev.features,
                      [feature.key]: e.target.checked
                    }
                  }))}
                  className="mt-1 mr-3"
                />
                <div>
                  <div className="font-medium">{feature.label}</div>
                  <div className="text-sm text-gray-600">{feature.description}</div>
                </div>
              </label>
            ))}
          </div>
        );

      case 4: // 確認
        return (
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium mb-2">設定内容</h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="inline font-medium">アプリ名:</dt>
                  <dd className="inline ml-2">{config.app?.name}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">業界:</dt>
                  <dd className="inline ml-2">{config.industry}</dd>
                </div>
                <div>
                  <dt className="inline font-medium">セキュリティ:</dt>
                  <dd className="inline ml-2">{config.security?.level}</dd>
                </div>
              </dl>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className={`max-w-2xl mx-auto p-6 ${theme === 'dark' ? 'bg-gray-800 text-white' : 'bg-white'} rounded-lg shadow-lg`}>
      {/* プログレスバー */}
      <div className="mb-8">
        <div className="flex justify-between mb-2">
          {steps.map((step, index) => (
            <div
              key={index}
              className={`text-xs ${
                index === currentStep ? 'text-blue-600 font-medium' : 'text-gray-400'
              }`}
            >
              {step.title}
            </div>
          ))}
        </div>
        <div className="h-2 bg-gray-200 rounded-full">
          <div
            className="h-2 bg-blue-600 rounded-full transition-all duration-300"
            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
          />
        </div>
      </div>

      {/* ステップコンテンツ */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold mb-2">{steps[currentStep].title}</h2>
        <p className="text-gray-600 mb-6">{steps[currentStep].description}</p>
        {renderStep()}
      </div>

      {/* ナビゲーションボタン */}
      <div className="flex justify-between">
        <button
          onClick={handleBack}
          disabled={currentStep === 0}
          className="px-6 py-2 border rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          戻る
        </button>
        <button
          onClick={handleNext}
          className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          {currentStep === steps.length - 1 ? '完了' : '次へ'}
        </button>
      </div>
    </div>
  );
};