'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SupportPlanService } from '@/support-plan-module/src/core/SupportPlanService'
import { SupportPlanData, SupportPlanTemplate, ModuleConfig, SupportPlanRecord } from '@/support-plan-module/src/types'
import { getDefaultTemplates } from '@/support-plan-module/src/templates/defaultTemplates'

interface EditPageProps {
  params: {
    id: string
  }
}

export default function EditSupportPlanPage({ params }: EditPageProps) {
  const router = useRouter()
  const [service, setService] = useState<SupportPlanService | null>(null)
  const [plan, setPlan] = useState<SupportPlanRecord | null>(null)
  const [template, setTemplate] = useState<SupportPlanTemplate | null>(null)
  const [formData, setFormData] = useState<Record<string, any>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string>('')
  const [message, setMessage] = useState<string>('')

  // モジュールの初期化と計画書の読み込み
  useEffect(() => {
    const initializeAndLoad = async () => {
      try {
        const config: ModuleConfig = {
          mode: 'local',
          storage: {
            encryption: false,
            compressionEnabled: false
          },
          ai: {
            provider: 'gemini',
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

        // 計画書を読み込み
        const loadedPlan = await supportPlanService.load(params.id)
        if (!loadedPlan) {
          setError('指定された支援計画書が見つかりません')
          return
        }

        setPlan(loadedPlan)
        setFormData(loadedPlan.values)

        // テンプレートを取得
        const planTemplate = await supportPlanService.getTemplate(loadedPlan.templateId)
        if (planTemplate) {
          setTemplate(planTemplate)
        }

      } catch (error) {
        console.error('読み込みエラー:', error)
        setError('データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    initializeAndLoad()
  }, [params.id])

  // フォーム入力の処理
  const handleInputChange = (fieldId: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [fieldId]: value
    }))
  }

  // 保存処理
  const handleSave = async () => {
    if (!service || !plan) return

    setSaving(true)
    setMessage('')
    
    try {
      const updatedPlan: SupportPlanData = {
        ...plan,
        values: formData,
        metadata: {
          ...plan.metadata,
          updatedAt: new Date().toISOString()
        }
      }

      await service.save(updatedPlan)
      setMessage('支援計画書が正常に保存されました')
      
      // 計画書データを更新
      setPlan(prev => prev ? { ...prev, ...updatedPlan } : null)
      
    } catch (error) {
      console.error('保存エラー:', error)
      setMessage('保存に失敗しました')
    } finally {
      setSaving(false)
    }
  }

  // ステータス変更
  const handleStatusChange = async (newStatus: 'draft' | 'completed' | 'approved') => {
    if (!service || !plan) return

    try {
      const updatedPlan: SupportPlanData = {
        ...plan,
        metadata: {
          ...plan.metadata,
          status: newStatus,
          updatedAt: new Date().toISOString()
        }
      }

      await service.save(updatedPlan)
      setPlan(prev => prev ? { ...prev, ...updatedPlan } : null)
      setMessage(`ステータスを「${getStatusText(newStatus)}」に変更しました`)
      
    } catch (error) {
      console.error('ステータス更新エラー:', error)
      setMessage('ステータスの更新に失敗しました')
    }
  }

  // ステータス表示用のテキスト
  const getStatusText = (status: string) => {
    switch (status) {
      case 'completed':
        return '完成'
      case 'approved':
        return '承認済み'
      case 'draft':
      default:
        return '下書き'
    }
  }

  // フィールドの描画（新規作成ページと同じロジック）
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">データを読み込み中...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="text-red-600 text-6xl mb-4">⚠️</div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">エラー</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <Link
            href="/support-plan/list"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            一覧に戻る
          </Link>
        </div>
      </div>
    )
  }

  if (!plan || !template) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600">データが見つかりません</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">
                支援計画書編集
              </h1>
              <p className="text-gray-600">
                {template.name} - ID: {plan.id}
              </p>
            </div>
            <div className="flex gap-3">
              <select
                value={plan.metadata.status}
                onChange={(e) => handleStatusChange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500"
              >
                <option value="draft">下書き</option>
                <option value="completed">完成</option>
                <option value="approved">承認済み</option>
              </select>
              <Link
                href="/support-plan/list"
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
              >
                一覧に戻る
              </Link>
            </div>
          </div>

          {/* 基本情報 */}
          <div className="bg-white rounded-lg shadow-md p-4 mb-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-500">作成日時:</span>
                <div className="font-medium">
                  {new Date(plan.metadata.createdAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">最終更新:</span>
                <div className="font-medium">
                  {new Date(plan.metadata.updatedAt).toLocaleString('ja-JP')}
                </div>
              </div>
              <div>
                <span className="text-gray-500">テンプレート:</span>
                <div className="font-medium">{template.name}</div>
              </div>
              <div>
                <span className="text-gray-500">ステータス:</span>
                <div className="font-medium">{getStatusText(plan.metadata.status)}</div>
              </div>
            </div>
          </div>
        </div>

        {/* メッセージ表示 */}
        {message && (
          <div className={`mb-6 p-4 rounded-md ${
            message.includes('失敗') || message.includes('エラー') 
              ? 'bg-red-50 border border-red-200 text-red-800'
              : 'bg-green-50 border border-green-200 text-green-800'
          }`}>
            <p>{message}</p>
          </div>
        )}

        {/* フォーム */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-6">支援計画書内容</h2>
          
          {template.sections ? (
            // セクション別に表示
            template.sections.map((section) => (
              <div key={section.id} className="mb-8">
                <h3 className="text-lg font-medium text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  {section.name}
                </h3>
                <div className="space-y-4">
                  {section.fields.map((fieldId) => {
                    const field = template.fields.find(f => f.id === fieldId)
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
              {template.fields.map((field) => (
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
              disabled={saving}
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? '保存中...' : '変更を保存'}
            </button>
            <Link
              href="/support-plan/list"
              className="px-6 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
            >
              キャンセル
            </Link>
          </div>
        </div>

        {/* 履歴表示 */}
        {plan.history && plan.history.length > 0 && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">変更履歴</h2>
            <div className="space-y-2">
              {plan.history.slice(-5).reverse().map((historyItem: any, index) => (
                <div key={index} className="flex justify-between items-center p-2 bg-gray-50 rounded">
                  <span className="text-sm text-gray-600">
                    {new Date(historyItem.savedAt || historyItem.metadata.updatedAt).toLocaleString('ja-JP')}
                  </span>
                  <span className="text-sm text-gray-500">
                    ステータス: {getStatusText(historyItem.metadata.status)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}