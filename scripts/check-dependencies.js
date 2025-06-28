#!/usr/bin/env node

/**
 * 依存関係の健全性チェックスクリプト
 * 
 * 実行方法: npm run check:dependencies
 */

const fs = require('fs');
const path = require('path');

// カラー出力用のヘルパー
const colors = {
  red: (text) => `\x1b[31m${text}\x1b[0m`,
  yellow: (text) => `\x1b[33m${text}\x1b[0m`,
  green: (text) => `\x1b[32m${text}\x1b[0m`,
  blue: (text) => `\x1b[34m${text}\x1b[0m`,
};

// package.jsonを読み込む
const packageJsonPath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));

// メトリクスの計算
const dependencies = Object.keys(packageJson.dependencies || {});
const devDependencies = Object.keys(packageJson.devDependencies || {});
const totalDeps = dependencies.length;
const totalDevDeps = devDependencies.length;

// カテゴリ別の重複チェック
const categoryPatterns = {
  dateLibraries: /^(moment|date-fns|dayjs|luxon)$/,
  httpClients: /^(axios|ky|got|node-fetch|isomorphic-fetch)$/,
  stateManagement: /^(redux|mobx|recoil|zustand|valtio|jotai)$/,
  cssFrameworks: /^(@mui\/|chakra-ui|antd|semantic-ui|bootstrap)/,
  testFrameworks: /^(jest|mocha|vitest|ava|tape)$/,
  bundlers: /^(webpack|rollup|parcel|esbuild|vite)$/,
};

const duplicates = {};
for (const [category, pattern] of Object.entries(categoryPatterns)) {
  const matches = dependencies.filter(dep => pattern.test(dep));
  if (matches.length > 1) {
    duplicates[category] = matches;
  }
}

// node_modulesのサイズチェック（概算）
let nodeModulesSize = 'N/A';
try {
  const nodeModulesPath = path.join(process.cwd(), 'node_modules');
  if (fs.existsSync(nodeModulesPath)) {
    // 簡易的なサイズ計算（実際のディスク使用量とは異なる場合があります）
    nodeModulesSize = 'チェックをスキップ（手動で確認してください）';
  }
} catch (e) {
  // エラーは無視
}

// 健全性の判定
let health = 'healthy';
const warnings = [];
const errors = [];

if (totalDeps > 50) {
  health = 'danger';
  errors.push('依存関係が50個を超えています');
} else if (totalDeps > 30) {
  health = 'warning';
  warnings.push('依存関係が30個を超えています');
}

if (totalDevDeps > 20) {
  warnings.push('開発依存関係が20個を超えています');
}

if (Object.keys(duplicates).length > 0) {
  health = health === 'healthy' ? 'warning' : health;
  warnings.push('同一カテゴリ内に複数のライブラリが存在します');
}

// 結果の出力
console.log('\n' + colors.blue('📊 依存関係健全性チェック結果'));
console.log('================================\n');

console.log('📦 依存関係の統計:');
console.log(`  - 本番依存: ${totalDeps}個`);
console.log(`  - 開発依存: ${totalDevDeps}個`);
console.log(`  - 合計: ${totalDeps + totalDevDeps}個`);
console.log(`  - node_modules: ${nodeModulesSize}\n`);

// 重複の表示
if (Object.keys(duplicates).length > 0) {
  console.log(colors.yellow('⚠️  カテゴリ内の重複:'));
  for (const [category, deps] of Object.entries(duplicates)) {
    console.log(`  - ${category}: ${deps.join(', ')}`);
  }
  console.log('');
}

// 推奨ライブラリ
console.log('✅ 承認済みライブラリ:');
const approved = [
  'next', 'react', 'react-dom',
  '@supabase/supabase-js', '@supabase/auth-helpers-nextjs',
  'tailwindcss', 'typescript'
];
approved.forEach(lib => {
  if (dependencies.includes(lib)) {
    console.log(`  - ${colors.green('✓')} ${lib}`);
  }
});
console.log('');

// 警告とエラー
if (warnings.length > 0) {
  console.log(colors.yellow('⚠️  警告:'));
  warnings.forEach(w => console.log(`  - ${w}`));
  console.log('');
}

if (errors.length > 0) {
  console.log(colors.red('❌ エラー:'));
  errors.forEach(e => console.log(`  - ${e}`));
  console.log('');
}

// 健全性の総合評価
const healthEmoji = {
  healthy: '🟢',
  warning: '🟡',
  danger: '🔴'
};

const healthText = {
  healthy: colors.green('健全'),
  warning: colors.yellow('要注意'),
  danger: colors.red('危険')
};

console.log(`総合評価: ${healthEmoji[health]} ${healthText[health]}\n`);

// 推奨アクション
if (health !== 'healthy') {
  console.log('💡 推奨アクション:');
  if (totalDeps > 30) {
    console.log('  - 不要な依存関係を削除してください');
    console.log('  - `npx depcheck` で未使用の依存関係を確認');
  }
  if (Object.keys(duplicates).length > 0) {
    console.log('  - 同一カテゴリのライブラリを1つに統一してください');
  }
  console.log('');
}

// 終了コード
process.exit(health === 'danger' ? 1 : 0);