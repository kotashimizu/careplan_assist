'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SupportPlanService } from '@/support-plan-module/src/core/SupportPlanService'
import { SupportPlanTemplate, SupportPlanData, ModuleConfig } from '@/support-plan-module/src/types'
import { getDefaultTemplates } from '@/support-plan-module/src/templates/defaultTemplates'

export default function SupportPlanPage() {
  const [service, setService] = useState<SupportPlanService | null>(null)
  const [templates, setTemplates] = useState<SupportPlanTemplate[]>([])
  const [selectedTemplate, setSelectedTemplate] = useState<SupportPlanTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [currentPlan, setCurrentPlan] = useState<SupportPlanData | null>(null)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<string>('')
  
  // AI分析用の状態
  const [analysisText, setAnalysisText] = useState<string>('')
  const [analyzing, setAnalyzing] = useState(false)
  const [analysisResult, setAnalysisResult] = useState<any>(null)

  // モジュールの初期化
  useEffect(() => {
    const initializeModule = async () => {
      try {
        const config: ModuleConfig = {
          mode: 'local',
          storage: {
            encryption: false, // 開発時は簡単にするため無効
            compressionEnabled: false
          },
          ai: {
            provider: 'gemini',
            // APIキーは後で設定
          },
          ui: {
            theme: 'light',
            language: 'ja',
            autoSave: true
          }
        }

        const supportPlanService = new SupportPlanService(config)
        setService(supportPlanService)

        // デフォルトテンプレートを登録
        const defaultTemplates = getDefaultTemplates()
        for (const template of defaultTemplates) {
          await supportPlanService.registerTemplate(template)
        }

        setTemplates(defaultTemplates)
        setMessage('モジュールが正常に初期化されました')
      } catch (error) {
        console.error('モジュール初期化エラー:', error)
        setMessage('モジュールの初期化に失敗しました')
      }
    }

    initializeModule()
  }, [])

  // テンプレート選択
  const handleTemplateSelect = (templateId: string) => {
    const template = templates.find(t => t.id === templateId)
    if (template) {
      setSelectedTemplate(template)
      // フォームデータを初期化
      const initialData: Record<string, any> = {}
      template.fields.forEach(field => {
        initialData[field.id] = field.defaultValue || ''
      })
      setFormData(initialData)
      setMessage(`テンプレート「${template.name}」が選択されました`)
    }
  }

  // フォーム入力の処理
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // AI分析の実行
  const handleAnalyze = async () => {
    if (!service || !selectedTemplate || !analysisText.trim()) {
      setMessage('テンプレート選択とテキスト入力が必要です')
      return
    }

    setAnalyzing(true)
    setMessage('AI分析を実行中...')
    
    try {
      const result = await service.analyze(analysisText, selectedTemplate.id)
      setAnalysisResult(result)
      
      if (result.success && result.data) {
        // フォームデータを更新
        setFormData(prev => ({
          ...prev,
          ...result.data
        }))
        
        let successMessage = 'AI分析が完了しました'
        if (result.confidence) {
          successMessage += ` (信頼度: ${Math.round(result.confidence * 100)}%)`
        }
        if (result.suggestions && result.suggestions.length > 0) {
          successMessage += `\n\n提案: ${result.suggestions.join(', ')}`
        }
        setMessage(successMessage)
      } else {
        setMessage(`AI分析エラー: ${result.error || '不明なエラー'}`)
      }
    } catch (error) {
      console.error('AI分析エラー:', error)
      setMessage('AI分析中にエラーが発生しました')
    } finally {
      setAnalyzing(false)
    }
  }

  // 支援計画書の保存
  const handleSave = async () => {
    if (!service || !selectedTemplate) {
      setMessage('サービスまたはテンプレートが選択されていません')
      return
    }

    setLoading(true)
    try {
      const planData = await service.create({
        templateId: selectedTemplate.id,
        values: formData,
        metadata: {
          createdBy: 'user'
        }
      })
      
      setCurrentPlan(planData)
      setMessage(`支援計画書が保存されました（ID: ${planData.id}）`)
    } catch (error) {
      console.error('保存エラー:', error)
      setMessage('保存に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  // フィールドの描画
  const renderField = (field: any) => {
    const value = formData[field.id] || ''

    switch (field.type) {
      case 'text':
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            required={field.required}
          />
        )

      case 'longtext':
        return (
          <textarea
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white resize-none"
            required={field.required}
          />
        )

      case 'number':
        return (
          <input
            type="number"
            value={value}
            onChange={(e) => handleInputChange(field.id, parseInt(e.target.value) || 0)}
            placeholder={field.placeholder}
            min={field.validation?.min}
            max={field.validation?.max}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            required={field.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center space-x-3 p-3 bg-gray-50 rounded-xl border-2 border-gray-200 hover:border-blue-300 transition-colors cursor-pointer">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="font-medium text-gray-700">同意する</span>
          </label>
        )

      case 'multiselect':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
            required={field.required}
          >
            <option value="">選択してください</option>
            {field.options?.map((option: string) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        )

      default:
        return (
          <input
            type="text"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className="w-full p-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📋</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">個別支援計画書作成</h1>
                <p className="text-sm text-gray-600">テンプレート選択から開始</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/support-plan/list"
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                📊 管理画面
              </Link>
              <Link
                href="/"
                className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                🏠 ホーム
              </Link>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">

        {/* プログレスバー */}
        <div className="mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-xl p-4 border border-gray-100">
            <div className="flex items-center justify-between text-sm text-gray-600 mb-2">
              <span>作成進捗</span>
              <span>{selectedTemplate ? (currentPlan ? '100%' : '33%') : '0%'}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2 rounded-full transition-all duration-500"
                style={{ 
                  width: selectedTemplate ? (currentPlan ? '100%' : '33%') : '0%' 
                }}
              ></div>
            </div>
          </div>
        </div>

        {message && (
          <div className={`mb-6 p-4 rounded-xl border ${
            message.includes('失敗') || message.includes('エラー')
              ? 'bg-red-50 border-red-200 text-red-800'
              : 'bg-green-50 border-green-200 text-green-800'
          }`}>
            <div className="flex items-center gap-2">
              <span>{message.includes('失敗') || message.includes('エラー') ? '⚠️' : '✅'}</span>
              <p>{message}</p>
            </div>
          </div>
        )}

        {/* テンプレート選択 */}
        <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center text-white font-bold">
              1
            </div>
            <h2 className="text-2xl font-bold text-gray-900">テンプレート選択</h2>
          </div>
          
          <p className="text-gray-600 mb-6">
            用途に応じて最適なテンプレートを選択してください
          </p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`group p-6 border-2 rounded-2xl text-left transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50 shadow-md'
                    : 'border-gray-200 hover:border-blue-300 bg-white'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                    template.id === 'mhlw-standard' ? 'bg-gradient-to-br from-red-100 to-red-200 text-red-600' :
                    template.id === 'simple' ? 'bg-gradient-to-br from-green-100 to-green-200 text-green-600' :
                    'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-600'
                  }`}>
                    {template.id === 'mhlw-standard' ? '🏛️' :
                     template.id === 'simple' ? '⚡' : '📋'}
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-gray-900">{template.name}</h3>
                    {selectedTemplate?.id === template.id && (
                      <span className="text-sm text-blue-600 font-medium">✓ 選択中</span>
                    )}
                  </div>
                </div>
                
                <p className="text-gray-600 mb-4 line-clamp-2">{template.description}</p>
                
                <div className="flex flex-wrap gap-2">
                  {template.metadata?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-3 py-1 text-xs bg-gray-100 text-gray-600 rounded-full"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* AI分析セクション */}
        {selectedTemplate && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg flex items-center justify-center text-white font-bold">
                2
              </div>
              <h2 className="text-2xl font-bold text-gray-900">AI分析</h2>
              <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-medium">
                オプション
              </span>
            </div>
            <p className="text-gray-600 mb-6">
              利用者の情報や状況を自由に入力してください。AIが内容を分析して、支援計画書の項目を自動で抽出します。
            </p>
            
            <div className="space-y-6">
              <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6 border border-blue-100">
                <label className="block text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                  🤖 利用者情報・状況の入力
                </label>
                <textarea
                  value={analysisText}
                  onChange={(e) => setAnalysisText(e.target.value)}
                  placeholder="例: 田中太郎さん（25歳、男性）は知的障害があり、日常生活の支援が必要です。一人暮らしを目指しており、調理や買い物の練習をしたいと希望されています。コミュニケーションは問題なく、人とのかかわりを好まれます。..."
                  rows={6}
                  className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 bg-white"
                />
                <div className="mt-3 text-sm text-gray-600 flex items-center gap-2">
                  💡 <span className="font-medium">コツ:</span> 年齢、性別、障害の種類、希望、困りごとなどを具体的に記述すると正確な分析結果が得られます
                </div>
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleAnalyze}
                  disabled={analyzing || !analysisText.trim()}
                  className="flex items-center gap-3 px-8 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  {analyzing ? (
                    <>
                      <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                      AI分析中...
                    </>
                  ) : (
                    <>
                      🤖 AI分析実行
                    </>
                  )}
                </button>
                
                {analysisText && (
                  <button
                    onClick={() => {
                      setAnalysisText('')
                      setAnalysisResult(null)
                    }}
                    className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                  >
                    🗑️ クリア
                  </button>
                )}
              </div>

              {analysisResult && analysisResult.success && (
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-xl p-6">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">✓</span>
                    </div>
                    <h3 className="font-bold text-green-800 text-lg">AI分析完了</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {analysisResult.confidence && (
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-gray-600 mb-1">信頼度</p>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round(analysisResult.confidence * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-green-700 font-bold">
                            {Math.round(analysisResult.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    )}
                    
                    {analysisResult.suggestions && analysisResult.suggestions.length > 0 && (
                      <div className="bg-white rounded-lg p-4 border border-green-100">
                        <p className="text-sm text-gray-600 mb-2 font-medium">💡 AI提案</p>
                        <ul className="text-green-700 text-sm space-y-1">
                          {analysisResult.suggestions.slice(0, 2).map((suggestion: string, index: number) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="text-green-500 mt-1">•</span>
                              <span>{suggestion}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* フォーム */}
        {selectedTemplate && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg mb-8">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center text-white font-bold">
                3
              </div>
              <h2 className="text-2xl font-bold text-gray-900">支援計画書入力</h2>
            </div>
            
            {selectedTemplate.sections ? (
              // セクション別に表示
              selectedTemplate.sections.map((section) => (
                <div key={section.id} className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                    {section.name}
                  </h3>
                  <div className="space-y-4">
                    {section.fields.map((fieldId) => {
                      const field = selectedTemplate.fields.find(f => f.id === fieldId)
                      if (!field) return null
                      
                      return (
                        <div key={field.id}>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                          </label>
                          {field.description && (
                            <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                          )}
                          {renderField(field)}
                          {field.tooltip && (
                            <p className="text-xs text-gray-400 mt-1">{field.tooltip}</p>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))
            ) : (
              // 全フィールドを順番に表示
              <div className="space-y-4">
                {selectedTemplate.fields.map((field) => (
                  <div key={field.id}>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      {field.label}
                      {field.required && <span className="text-red-500 ml-1">*</span>}
                    </label>
                    {field.description && (
                      <p className="text-sm text-gray-500 mb-2">{field.description}</p>
                    )}
                    {renderField(field)}
                    {field.tooltip && (
                      <p className="text-xs text-gray-400 mt-1">{field.tooltip}</p>
                    )}
                  </div>
                ))}
              </div>
            )}

            <div className="mt-8 flex gap-4">
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 hover:scale-105 shadow-lg"
              >
                {loading ? (
                  <>
                    <div className="animate-spin w-5 h-5 border-2 border-white border-t-transparent rounded-full"></div>
                    保存中...
                  </>
                ) : (
                  <>
                    💾 支援計画書を保存
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* 保存結果 */}
        {currentPlan && (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 shadow-lg">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-green-600 rounded-lg flex items-center justify-center text-white font-bold">
                ✓
              </div>
              <h2 className="text-2xl font-bold text-gray-900">保存完了</h2>
            </div>
            
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 border-2 border-green-200 rounded-2xl p-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center">
                  <span className="text-white text-xl">🎉</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-green-800">
                    支援計画書が正常に保存されました！
                  </h3>
                  <p className="text-green-600 text-sm">
                    ID: {currentPlan.id}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">作成日時</p>
                  <p className="font-medium text-gray-900">
                    {new Date(currentPlan.metadata.createdAt).toLocaleString('ja-JP')}
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-green-100">
                  <p className="text-sm text-gray-600 mb-1">ステータス</p>
                  <span className="inline-flex px-3 py-1 bg-yellow-100 text-yellow-800 rounded-full text-sm font-medium">
                    下書き
                  </span>
                </div>
              </div>
              
              <div className="mt-6 flex gap-3">
                <Link
                  href="/support-plan/list"
                  className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors font-medium"
                >
                  📊 管理画面で確認
                </Link>
                <Link
                  href="/support-plan"
                  className="flex items-center gap-2 px-6 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition-colors font-medium"
                >
                  ➕ 新規作成
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}