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
        <div className="flex gap-4 justify-center">
          <a
            href="/support-plan"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              支援計画書作成 {'->'} 
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              個別支援計画書を簡単に作成できます
            </p>
          </a>
          
          <a
            href="/support-plan"
            className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          >
            <h2 className="mb-3 text-2xl font-semibold">
              テンプレート {'->'} 
            </h2>
            <p className="m-0 max-w-[30ch] text-sm opacity-50">
              厚労省標準様式など3種類のテンプレート
            </p>
          </a>
        </div>
      </div>
    </main>
  )
}