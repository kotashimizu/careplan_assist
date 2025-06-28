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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* ヘッダー */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-100 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center">
                <span className="text-white font-bold text-lg">📊</span>
              </div>
              <div>
                <h1 className="text-xl font-bold text-gray-900">支援計画書管理</h1>
                <p className="text-sm text-gray-600">作成された個別支援計画書の一覧・管理</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Link
                href="/support-plan"
                className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold rounded-xl hover:from-green-600 hover:to-emerald-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                ➕ 新規作成
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

      <div className="max-w-7xl mx-auto px-4 py-8">

        {/* エラー表示 */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border-2 border-red-200 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-red-600">⚠️</span>
              <p className="text-red-800 font-medium">{error}</p>
            </div>
          </div>
        )}

        {/* 統計情報 */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">総計画書数</h3>
                <p className="text-3xl font-bold text-gray-900">{plans.length}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-xl flex items-center justify-center">
                <span className="text-blue-600 text-xl">📋</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">完成済み</h3>
                <p className="text-3xl font-bold text-green-600">
                  {plans.filter(p => p.metadata.status === 'completed').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-xl flex items-center justify-center">
                <span className="text-green-600 text-xl">✅</span>
              </div>
            </div>
          </div>
          
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-6 border border-gray-100 shadow-lg hover:shadow-xl transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">下書き</h3>
                <p className="text-3xl font-bold text-yellow-600">
                  {plans.filter(p => p.metadata.status === 'draft').length}
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-100 to-yellow-200 rounded-xl flex items-center justify-center">
                <span className="text-yellow-600 text-xl">📝</span>
              </div>
            </div>
          </div>
        </div>

        {/* 計画書一覧 */}
        {plans.length === 0 ? (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl p-12 text-center border border-gray-100 shadow-lg">
            <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center mx-auto mb-6">
              <span className="text-gray-400 text-4xl">📋</span>
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-3">
              まだ支援計画書が作成されていません
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              「新規作成」ボタンから最初の支援計画書を作成しましょう。AIを活用して簡単に作成できます。
            </p>
            <Link
              href="/support-plan"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg"
            >
              ➕ 新規作成を開始
            </Link>
          </div>
        ) : (
          <div className="bg-white/70 backdrop-blur-sm rounded-2xl border border-gray-100 shadow-lg overflow-hidden">
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <div className="flex items-center gap-2">
                          <Link
                            href={`/support-plan/edit/${plan.id}`}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors text-xs font-medium"
                          >
                            ✏️ 編集
                          </Link>
                          <button
                            onClick={() => handleDuplicate(plan)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 transition-colors text-xs font-medium"
                          >
                            📋 複製
                          </button>
                          <button
                            onClick={() => handleDelete(plan.id)}
                            className="inline-flex items-center gap-1 px-3 py-1.5 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors text-xs font-medium"
                          >
                            🗑️ 削除
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* フッター */}
        <div className="mt-12 text-center">
          <div className="bg-white/50 backdrop-blur-sm rounded-xl p-6 border border-gray-100">
            <p className="text-gray-600 mb-4">
              💡 支援計画書の作成・管理はすべてブラウザ内で安全に処理されます
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
            >
              🏠 ホームに戻る
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}