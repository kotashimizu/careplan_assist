export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="z-10 max-w-5xl w-full items-center justify-between font-mono text-sm">
        <h1 className="text-4xl font-bold text-center mb-8">
          個別支援計画書作成支援システム
        </h1>
        <p className="text-center text-gray-600 mb-8">
          AIを活用して個別支援計画書の作成を効率化します
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <a
            href="/support-plan"
            className="group rounded-lg border border-transparent px-6 py-6 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:shadow-md"
          >
            <div className="text-4xl mb-4">📝</div>
            <h2 className="mb-3 text-xl font-semibold">
              新規作成
            </h2>
            <p className="text-sm text-gray-600">
              AIを活用して個別支援計画書を新規作成
            </p>
          </a>
          
          <a
            href="/support-plan/list"
            className="group rounded-lg border border-transparent px-6 py-6 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:shadow-md"
          >
            <div className="text-4xl mb-4">📋</div>
            <h2 className="mb-3 text-xl font-semibold">
              管理・編集
            </h2>
            <p className="text-sm text-gray-600">
              作成済みの計画書を確認・編集・管理
            </p>
          </a>

          <a
            href="/support-plan"
            className="group rounded-lg border border-transparent px-6 py-6 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:shadow-md"
          >
            <div className="text-4xl mb-4">🤖</div>
            <h2 className="mb-3 text-xl font-semibold">
              AI分析
            </h2>
            <p className="text-sm text-gray-600">
              テキストから項目を自動抽出
            </p>
          </a>
        </div>

        <div className="mt-12 max-w-3xl mx-auto">
          <h2 className="text-xl font-semibold text-center mb-6 text-gray-800">
            🌟 主な機能
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">📄 3つのテンプレート</h3>
              <p className="text-gray-600">厚労省標準様式・シンプル版・詳細版から選択</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">🔒 プライバシー保護</h3>
              <p className="text-gray-600">データはブラウザ内で安全に保存</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">⚡ AI自動入力</h3>
              <p className="text-gray-600">Gemini AIによる自動項目抽出</p>
            </div>
            <div className="bg-white rounded-lg p-4 shadow-sm">
              <h3 className="font-medium text-gray-900 mb-2">📱 レスポンシブ</h3>
              <p className="text-gray-600">PC・タブレット・スマホ対応</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}