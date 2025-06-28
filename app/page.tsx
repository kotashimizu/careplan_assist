export default function Home() {
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
              <h1 className="text-xl font-bold text-gray-900">CareCheck Assist</h1>
            </div>
            <div className="text-sm text-gray-500">v1.0</div>
          </div>
        </div>
      </header>

      {/* メインコンテンツ */}
      <main className="relative">
        {/* ヒーローセクション */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto text-center">
            <div className="mb-8">
              <h2 className="text-5xl font-bold text-gray-900 mb-6 leading-tight">
                個別支援計画書作成
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600">
                  支援システム
                </span>
              </h2>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
                AIを活用して効率的に個別支援計画書を作成。
                厚労省標準様式に対応し、専門的な計画書を簡単に作成できます。
              </p>
            </div>

            {/* 主要機能カード */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
              <a
                href="/support-plan"
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto group-hover:scale-110 transition-transform">
                  ✏️
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">新規作成</h3>
                <p className="text-gray-600 leading-relaxed">
                  AIを活用して個別支援計画書を効率的に新規作成
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium">
                  始める <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
              
              <a
                href="/support-plan/list"
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto group-hover:scale-110 transition-transform">
                  📊
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">管理・編集</h3>
                <p className="text-gray-600 leading-relaxed">
                  作成済みの計画書を確認・編集・管理
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium">
                  管理する <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>

              <a
                href="/support-plan"
                className="group bg-white/70 backdrop-blur-sm rounded-2xl p-8 border border-gray-100 hover:border-blue-200 hover:shadow-xl transition-all duration-300 hover:-translate-y-1"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center text-white text-2xl font-bold mb-6 mx-auto group-hover:scale-110 transition-transform">
                  🤖
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">AI分析</h3>
                <p className="text-gray-600 leading-relaxed">
                  テキストから項目を自動抽出
                </p>
                <div className="mt-4 flex items-center justify-center text-blue-600 group-hover:text-blue-700 font-medium">
                  分析する <span className="ml-1 group-hover:translate-x-1 transition-transform">→</span>
                </div>
              </a>
            </div>
          </div>
        </section>

        {/* 機能紹介セクション */}
        <section className="py-16 bg-white/50 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ✨ 主な機能・特徴
              </h2>
              <p className="text-lg text-gray-600">
                プロフェッショナルな支援計画書作成をサポートする豊富な機能
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-lg flex items-center justify-center text-blue-600 text-xl mb-4">
                  📄
                </div>
                <h3 className="font-bold text-gray-900 mb-2">3つのテンプレート</h3>
                <p className="text-sm text-gray-600">厚労省標準様式・シンプル版・詳細版から選択可能</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-lg flex items-center justify-center text-green-600 text-xl mb-4">
                  🔒
                </div>
                <h3 className="font-bold text-gray-900 mb-2">プライバシー保護</h3>
                <p className="text-sm text-gray-600">データはブラウザ内で安全に保存・管理</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-lg flex items-center justify-center text-purple-600 text-xl mb-4">
                  ⚡
                </div>
                <h3 className="font-bold text-gray-900 mb-2">AI自動入力</h3>
                <p className="text-sm text-gray-600">Gemini AIによる自動項目抽出・提案機能</p>
              </div>

              <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-lg flex items-center justify-center text-orange-600 text-xl mb-4">
                  📱
                </div>
                <h3 className="font-bold text-gray-900 mb-2">レスポンシブ</h3>
                <p className="text-sm text-gray-600">PC・タブレット・スマホ完全対応</p>
              </div>
            </div>
          </div>
        </section>

        {/* 使用方法セクション */}
        <section className="py-16 px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🚀 簡単3ステップ
              </h2>
              <p className="text-lg text-gray-600">
                初めての方でも簡単に支援計画書を作成できます
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  1
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">テンプレート選択</h3>
                  <p className="text-gray-600">厚労省標準様式・シンプル版・詳細版から用途に応じて選択</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  2
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">AI分析（オプション）</h3>
                  <p className="text-gray-600">利用者情報を入力するとAIが自動的に項目を抽出・入力</p>
                </div>
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex-shrink-0 w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  3
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">内容確認・保存</h3>
                  <p className="text-gray-600">必要に応じて内容を調整し、安全に保存・管理</p>
                </div>
              </div>
            </div>

            <div className="text-center mt-12">
              <a
                href="/support-plan"
                className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold rounded-xl hover:from-blue-700 hover:to-indigo-700 transition-all duration-300 hover:scale-105 shadow-lg"
              >
                今すぐ始める
                <span className="ml-2">→</span>
              </a>
            </div>
          </div>
        </section>
      </main>

      {/* フッター */}
      <footer className="bg-gray-900 text-gray-300 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm">
            © 2025 CareCheck Assist - 個別支援計画書作成支援システム
          </p>
          <p className="text-xs text-gray-500 mt-2">
            AI駆動・プライバシー保護・オープンソース
          </p>
        </div>
      </footer>
    </div>
  )
}