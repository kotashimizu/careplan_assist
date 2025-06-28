/**
 * 個別支援計画書モジュールの基本的な使用例
 */

import { 
  createSupportPlanService,
  SupportPlanService,
  getDefaultTemplates,
  MHLW_TEMPLATE
} from '../src/index';

// ====================
// 1. 基本的な使用例
// ====================
async function basicUsage() {
  console.log('=== 基本的な使用例 ===');
  
  // サービスの初期化（ローカルモード）
  const service = createSupportPlanService({
    mode: 'local',
    ai: {
      provider: 'gemini',
      apiKey: 'YOUR_GEMINI_API_KEY' // 実際のAPIキーに置き換えてください
    }
  });

  // デフォルトテンプレートを登録
  const templates = getDefaultTemplates();
  for (const template of templates) {
    await service.registerTemplate(template);
  }

  // サンプルテキスト
  const sampleText = `
利用者の田中太郎さん（45歳）は、就労継続支援B型事業所に通所しています。

本人の希望：「仲間と一緒に作業をしながら、自分のペースで働きたい。将来的には一般就労も考えたい。」
家族の希望：「無理をせず、体調を崩さないように長く通所を続けてほしい。」

現在の状況：
- 週3日（月・水・金）の通所が安定している
- 簡単な軽作業（袋詰め、シール貼り等）に従事
- 集中力は1時間程度持続可能
- 他の利用者との会話も増えてきた

支援の方針：
本人の意欲を大切にしながら、無理のない範囲で作業能力の向上を図る。
職業準備性を高めるための支援を段階的に実施する。
`;

  // AI分析を実行
  console.log('AI分析を実行中...');
  const analysisResult = await service.analyze(sampleText, 'mhlw-standard');
  
  if (analysisResult.success) {
    console.log('分析成功！抽出されたデータ:');
    console.log(analysisResult.data);
    console.log('信頼度:', analysisResult.confidence);
    console.log('提案:', analysisResult.suggestions);

    // 支援計画書を作成
    const plan = await service.create({
      templateId: 'mhlw-standard',
      values: analysisResult.data,
      metadata: {
        createdBy: '山田花子（サービス管理責任者）'
      }
    });

    console.log('支援計画書を作成しました:', plan.id);

    // 保存
    await service.save(plan);
    console.log('保存完了');

    // 読み込みテスト
    const loaded = await service.load(plan.id);
    console.log('読み込み成功:', loaded?.id === plan.id);
  }
}

// ====================
// 2. モード切り替えの例
// ====================
async function modeSwitchingExample() {
  console.log('\n=== モード切り替えの例 ===');

  // ユーザーの選択を想定
  const userChoice = 'local'; // 'local' | 'online' | 'hybrid'

  let service: SupportPlanService;

  switch (userChoice) {
    case 'local':
      console.log('ローカルモードで起動');
      service = createSupportPlanService({
        mode: 'local',
        storage: {
          encryption: true,
          retentionDays: 30
        }
      });
      break;

    case 'online':
      console.log('オンラインモードで起動');
      // 実際の使用時はSupabaseAdapterなどを設定
      service = createSupportPlanService({
        mode: 'online',
        storage: {
          // adapter: new SupabaseAdapter(config)
        }
      });
      break;

    case 'hybrid':
      console.log('ハイブリッドモードで起動');
      service = createSupportPlanService({
        mode: 'hybrid'
      });
      break;

    default:
      service = createSupportPlanService();
  }

  // 使用例
  const templates = await service.getTemplates();
  console.log('利用可能なテンプレート数:', templates.length);
}

// ====================
// 3. 履歴管理の例
// ====================
async function historyManagementExample() {
  console.log('\n=== 履歴管理の例 ===');

  const service = createSupportPlanService();
  
  // 初回作成
  const plan = await service.create({
    templateId: 'simple',
    values: {
      userName: '鈴木一郎',
      supportGoals: '日常生活の自立度向上',
      supportContent: '生活スキルトレーニング',
      evaluationDate: '2024-06-01'
    }
  });

  await service.save(plan);
  console.log('初回保存完了');

  // 更新
  plan.values.supportGoals = '日常生活の自立度向上と社会参加の促進';
  await service.save(plan);
  console.log('更新保存完了');

  // さらに更新
  plan.values.supportContent = '生活スキルトレーニングと就労準備支援';
  await service.save(plan);
  console.log('再度更新保存完了');

  // 履歴を含めて読み込み
  const record = await service.load(plan.id);
  if (record && record.history) {
    console.log('履歴数:', record.history.length);
    
    // バージョン比較
    if (record.history.length >= 2) {
      const comparison = await service.compareVersions(plan.id, 0, 1);
      console.log('バージョン比較結果:');
      console.log(comparison);
    }
  }
}

// ====================
// 4. イベントリスナーの例
// ====================
async function eventListenerExample() {
  console.log('\n=== イベントリスナーの例 ===');

  const service = createSupportPlanService();

  // イベントリスナーを登録
  service.addEventListener((event) => {
    switch (event.type) {
      case 'save':
        console.log('保存イベント:', event.data.id);
        break;
      case 'load':
        console.log('読み込みイベント:', event.data.id);
        break;
      case 'delete':
        console.log('削除イベント:', event.id);
        break;
      case 'export':
        console.log('エクスポートイベント:', event.format);
        break;
      case 'error':
        console.error('エラーイベント:', event.error);
        break;
    }
  });

  // 各種操作を実行
  const plan = await service.create({
    templateId: 'simple',
    values: { userName: '監査テスト' }
  });
  
  await service.save(plan);
  await service.load(plan.id);
  await service.delete(plan.id);
}

// ====================
// 5. テンプレートカスタマイズの例
// ====================
async function customTemplateExample() {
  console.log('\n=== カスタムテンプレートの例 ===');

  const service = createSupportPlanService();

  // カスタムテンプレートを作成
  const customTemplate = {
    id: 'rehab-focused',
    name: 'リハビリ特化型',
    description: 'リハビリテーションに特化した支援計画書',
    version: '1.0.0',
    fields: [
      {
        id: 'userName',
        name: 'userName',
        label: '利用者氏名',
        type: 'text' as const,
        required: true,
        description: '利用者の氏名'
      },
      {
        id: 'functionalAssessment',
        name: 'functionalAssessment',
        label: '機能評価',
        type: 'longtext' as const,
        required: true,
        description: 'ADL、IADL等の機能評価'
      },
      {
        id: 'rehabGoals',
        name: 'rehabGoals',
        label: 'リハビリ目標',
        type: 'longtext' as const,
        required: true,
        description: '具体的なリハビリテーション目標'
      },
      {
        id: 'rehabProgram',
        name: 'rehabProgram',
        label: 'リハビリプログラム',
        type: 'longtext' as const,
        required: true,
        description: '実施するリハビリプログラムの内容'
      },
      {
        id: 'evaluationMethod',
        name: 'evaluationMethod',
        label: '評価方法',
        type: 'text' as const,
        required: true,
        description: '目標達成度の評価方法'
      }
    ],
    metadata: {
      author: 'リハビリチーム',
      createdAt: new Date().toISOString(),
      tags: ['リハビリ', '機能訓練']
    }
  };

  // テンプレートを登録
  await service.registerTemplate(customTemplate);
  console.log('カスタムテンプレートを登録しました');

  // カスタムテンプレートで計画書を作成
  const plan = await service.create({
    templateId: 'rehab-focused',
    values: {
      userName: '佐藤健二',
      functionalAssessment: '歩行：見守りレベル、ADL：一部介助',
      rehabGoals: '屋内独歩の獲得、ADL自立度の向上',
      rehabProgram: '歩行訓練30分/日、ADL訓練20分/日',
      evaluationMethod: 'FIM、10m歩行テスト'
    }
  });

  console.log('リハビリ特化型計画書を作成:', plan.id);
}

// ====================
// 6. エラーハンドリングの例
// ====================
async function errorHandlingExample() {
  console.log('\n=== エラーハンドリングの例 ===');

  const service = createSupportPlanService({
    ai: {
      provider: 'gemini',
      apiKey: 'INVALID_KEY', // 無効なAPIキー
      fallbackEnabled: true
    }
  });

  try {
    // 存在しないテンプレートで分析
    await service.analyze('テストテキスト', 'non-existent-template');
  } catch (error) {
    console.error('予想されたエラー:', error instanceof Error ? error.message : error);
  }

  // フォールバックモードでの分析
  await service.registerTemplate(MHLW_TEMPLATE);
  const result = await service.analyze(
    '利用者の山田さんは65歳で、週2回のデイサービスを利用しています。',
    'mhlw-standard'
  );
  
  console.log('フォールバック分析の結果:', result.success);
  console.log('信頼度:', result.confidence); // フォールバックなので低い値
}

// ====================
// メイン実行
// ====================
async function main() {
  try {
    // 各例を順番に実行
    await basicUsage();
    await modeSwitchingExample();
    await historyManagementExample();
    await eventListenerExample();
    await customTemplateExample();
    await errorHandlingExample();
    
    console.log('\n全ての例が正常に完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 実行
if (require.main === module) {
  main();
}