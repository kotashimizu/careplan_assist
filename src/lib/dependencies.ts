/**
 * 依存関係の一元管理
 * 
 * このファイルで、プロジェクト全体で使用するライブラリを
 * カテゴリ別に管理します。
 * 
 * ルール:
 * 1. 各カテゴリにつき1つのライブラリのみ
 * 2. 新しいライブラリ追加時は必ずここに記録
 * 3. 直接importせず、抽象化レイヤー経由で使用
 */

export const DEPENDENCIES = {
  // 日付処理
  dateLibrary: {
    name: 'native',
    reason: 'Next.js標準のDate APIで十分',
    alternatives: ['date-fns', 'dayjs', 'moment']
  },
  
  // HTTPクライアント
  httpClient: {
    name: 'native-fetch',
    reason: 'ブラウザ標準のfetch APIで十分',
    alternatives: ['axios', 'ky', 'got']
  },
  
  // 状態管理
  stateManagement: {
    name: 'react-hooks',
    reason: 'シンプルなアプリにはReact標準で十分',
    alternatives: ['zustand', 'redux', 'mobx', 'recoil']
  },
  
  // UIフレームワーク
  uiFramework: {
    name: 'tailwindcss',
    reason: 'すでに設定済み、軽量で柔軟',
    alternatives: ['mui', 'chakra-ui', 'ant-design']
  },
  
  // 認証
  authentication: {
    name: '@supabase/supabase-js',
    reason: 'Supabaseを使用しているため',
    alternatives: ['next-auth', 'auth0', 'firebase-auth']
  },
  
  // フォームバリデーション
  formValidation: {
    name: 'none',
    reason: '現時点では不要',
    alternatives: ['react-hook-form', 'formik', 'react-final-form']
  },
  
  // アニメーション
  animation: {
    name: 'css',
    reason: 'CSSアニメーションで十分',
    alternatives: ['framer-motion', 'react-spring', 'lottie']
  },
  
  // テスト
  testing: {
    name: 'none',
    reason: '現時点では未設定',
    alternatives: ['jest', 'vitest', 'testing-library']
  }
} as const

/**
 * ライブラリ追加時の承認状態
 */
export const LIBRARY_APPROVAL_STATUS = {
  approved: [
    'next',
    'react',
    'react-dom',
    '@supabase/supabase-js',
    '@supabase/auth-helpers-nextjs',
    '@supabase/auth-helpers-react',
    'tailwindcss',
    'typescript'
  ],
  
  pending: [] as string[],
  
  rejected: [
    'moment', // -> use native Date or date-fns
    'axios',  // -> use native fetch
    'lodash', // -> use native JS methods
  ]
} as const

/**
 * 健全性チェック関数
 */
export function checkDependencyHealth(packageJson: any) {
  const metrics = {
    totalDependencies: Object.keys(packageJson.dependencies || {}).length,
    totalDevDependencies: Object.keys(packageJson.devDependencies || {}).length,
    duplicateCategories: [] as string[],
    health: 'healthy' as 'healthy' | 'warning' | 'danger'
  }
  
  // 健全性の判定
  if (metrics.totalDependencies > 50) {
    metrics.health = 'danger'
  } else if (metrics.totalDependencies > 30) {
    metrics.health = 'warning'
  }
  
  return metrics
}