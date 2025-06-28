'use client'

import { useState, useEffect } from 'react'
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'date':
        return (
          <input
            type="date"
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            required={field.required}
          />
        )

      case 'boolean':
        return (
          <label className="flex items-center space-x-2">
            <input
              type="checkbox"
              checked={value}
              onChange={(e) => handleInputChange(field.id, e.target.checked)}
              className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
            />
            <span>同意する</span>
          </label>
        )

      case 'multiselect':
        return (
          <select
            value={value}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
            className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        )
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            個別支援計画書作成
          </h1>
          <p className="text-gray-600">
            テンプレートを選択して個別支援計画書を作成します
          </p>
        </div>

        {message && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-blue-800">{message}</p>
          </div>
        )}

        {/* テンプレート選択 */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">1. テンプレート選択</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {templates.map((template) => (
              <button
                key={template.id}
                onClick={() => handleTemplateSelect(template.id)}
                className={`p-4 border rounded-lg text-left transition-colors ${
                  selectedTemplate?.id === template.id
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-600 mt-1">{template.description}</p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {template.metadata?.tags?.map((tag) => (
                    <span
                      key={tag}
                      className="inline-block px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* フォーム */}
        {selectedTemplate && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-6">2. 支援計画書入力</h2>
            
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
                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? '保存中...' : '保存'}
              </button>
            </div>
          </div>
        )}

        {/* 保存結果 */}
        {currentPlan && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">3. 保存完了</h2>
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-green-800">
                支援計画書が正常に保存されました
              </p>
              <p className="text-green-600 text-sm mt-1">
                ID: {currentPlan.id}<br />
                作成日時: {new Date(currentPlan.metadata.createdAt).toLocaleString('ja-JP')}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}