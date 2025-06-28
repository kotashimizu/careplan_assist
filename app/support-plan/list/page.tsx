'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { SupportPlanService } from '@/support-plan-module/src/core/SupportPlanService'
import { SupportPlanData, ModuleConfig } from '@/support-plan-module/src/types'

export default function SupportPlanListPage() {
  const [service, setService] = useState<SupportPlanService | null>(null)
  const [plans, setPlans] = useState<SupportPlanData[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // モジュールの初期化
  useEffect(() => {
    const initializeModule = async () => {
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

        // 保存済みの計画書を取得
        const savedPlans = await supportPlanService.list()
        setPlans(savedPlans)
      } catch (error) {
        console.error('モジュール初期化エラー:', error)
        setError('データの読み込みに失敗しました')
      } finally {
        setLoading(false)
      }
    }

    initializeModule()
  }, [])

  // 計画書の削除
  const handleDelete = async (id: string) => {
    if (!service) return

    const confirmed = window.confirm('この支援計画書を削除しますか？')
    if (!confirmed) return

    try {
      await service.delete(id)
      setPlans(plans.filter(plan => plan.id !== id))
    } catch (error) {
      console.error('削除エラー:', error)
      setError('削除に失敗しました')
    }
  }

  // 計画書の複製
  const handleDuplicate = async (plan: SupportPlanData) => {
    if (!service) return

    try {
      const newPlan = await service.create({
        templateId: plan.templateId,
        values: plan.values,
        metadata: {
          createdBy: 'user',
          originalId: plan.id
        }
      })
      
      setPlans([newPlan, ...plans])
    } catch (error) {
      console.error('複製エラー:', error)
      setError('複製に失敗しました')
    }
  }

  // ステータス表示用のスタイル
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800'
      case 'approved':
        return 'bg-blue-100 text-blue-800'
      case 'draft':
      default:
        return 'bg-yellow-100 text-yellow-800'
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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        {/* ヘッダー */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">
                支援計画書管理
              </h1>
              <p className="text-gray-600">
                作成された個別支援計画書の一覧・管理
              </p>
            </div>
            <Link
              href="/support-plan"
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              ➕ 新規作成
            </Link>
          </div>
        </div>

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">総計画書数</h3>
            <p className="text-3xl font-bold text-gray-900">{plans.length}</p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">完成済み</h3>
            <p className="text-3xl font-bold text-green-600">
              {plans.filter(p => p.metadata.status === 'completed').length}
            </p>
          </div>
          <div className="bg-white rounded-lg shadow-md p-6">
            <h3 className="text-sm font-medium text-gray-500">下書き</h3>
            <p className="text-3xl font-bold text-yellow-600">
              {plans.filter(p => p.metadata.status === 'draft').length}
            </p>
          </div>
        </div>

        {/* 計画書一覧 */}
        {plans.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-12 text-center">
            <div className="text-gray-400 text-6xl mb-4">📋</div>
            <h3 className="text-xl font-medium text-gray-900 mb-2">
              まだ支援計画書が作成されていません
            </h3>
            <p className="text-gray-600 mb-6">
              「新規作成」ボタンから最初の支援計画書を作成しましょう
            </p>
            <Link
              href="/support-plan"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              ➕ 新規作成を開始
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-md overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID / 作成日時
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      テンプレート
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ステータス
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      最終更新
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      操作
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {plans.map((plan) => (
                    <tr key={plan.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {plan.id}
                          </div>
                          <div className="text-sm text-gray-500">
                            {new Date(plan.metadata.createdAt).toLocaleString('ja-JP')}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {plan.templateId === 'mhlw-standard' && '厚労省標準様式'}
                          {plan.templateId === 'simple' && 'シンプル版'}
                          {plan.templateId === 'detailed' && '詳細版'}
                        </div>
                        <div className="text-sm text-gray-500">
                          v{plan.templateVersion}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusStyle(plan.metadata.status)}`}>
                          {getStatusText(plan.metadata.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(plan.metadata.updatedAt).toLocaleString('ja-JP')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                        <Link
                          href={`/support-plan/edit/${plan.id}`}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          編集
                        </Link>
                        <button
                          onClick={() => handleDuplicate(plan)}
                          className="text-green-600 hover:text-green-900"
                        >
                          複製
                        </button>
                        <button
                          onClick={() => handleDelete(plan.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          削除
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-8 text-center">
          <Link
            href="/"
            className="text-blue-600 hover:text-blue-800"
          >
            ← ホームに戻る
          </Link>
        </div>
      </div>
    </div>
  )
}