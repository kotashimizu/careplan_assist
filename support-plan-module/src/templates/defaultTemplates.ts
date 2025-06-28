import { SupportPlanTemplate, TemplateField } from '../types';

/**
 * 厚生労働省標準様式テンプレート
 */
export const MHLW_TEMPLATE: SupportPlanTemplate = {
  id: 'mhlw-standard',
  name: '厚生労働省標準様式',
  description: '厚生労働省が定める個別支援計画書の標準様式です',
  version: '1.0.0',
  fields: [
    {
      id: 'userFamilyIntentions',
      name: 'userFamilyIntentions',
      label: '利用者及び家族の生活に対する意向',
      type: 'longtext',
      required: true,
      description: '利用者と家族の生活に対する意向、希望、要望を記載',
      placeholder: '利用者：「〜したい」\n家族：「〜を希望する」',
      tooltip: '利用者本人と家族それぞれの意向を具体的に記載してください'
    },
    {
      id: 'comprehensiveSupportPolicy',
      name: 'comprehensiveSupportPolicy',
      label: '総合的な支援の方針',
      type: 'longtext',
      required: true,
      description: '総合的な支援方針、基本的な支援の方向性',
      placeholder: '本人の自主性を尊重し、個別のペースに合わせた支援を行う...',
      tooltip: '利用者の状況を踏まえた包括的な支援方針を記載'
    },
    {
      id: 'longTermGoal',
      name: 'longTermGoal',
      label: '長期目標',
      type: 'longtext',
      required: true,
      description: '長期目標（内容・期間等）、通常1年程度の目標',
      placeholder: '安定した生活リズムを維持し、作業能力を向上させる（1年間）',
      tooltip: '1年程度の期間で達成を目指す目標'
    },
    {
      id: 'shortTermGoal',
      name: 'shortTermGoal',
      label: '短期目標',
      type: 'longtext',
      required: true,
      description: '短期目標（内容・期間等）、通常3～6ヶ月の目標',
      placeholder: '週3日以上の安定した通所を継続する（6ヶ月）',
      tooltip: '3～6ヶ月程度の期間で達成を目指す目標'
    },
    {
      id: 'supportTimeSchedule',
      name: 'supportTimeSchedule',
      label: '支援の標準的な提供時間等',
      type: 'text',
      required: true,
      description: '曜日・頻度、時間を具体的に記載',
      placeholder: '月～金曜日 9:00～15:00',
      tooltip: 'サービス提供の曜日と時間帯'
    }
  ],
  sections: [
    {
      id: 'basic',
      name: '基本方針',
      fields: ['userFamilyIntentions', 'comprehensiveSupportPolicy']
    },
    {
      id: 'goals',
      name: '目標設定',
      fields: ['longTermGoal', 'shortTermGoal']
    },
    {
      id: 'schedule',
      name: 'スケジュール',
      fields: ['supportTimeSchedule']
    }
  ],
  metadata: {
    author: '厚生労働省',
    createdAt: '2024-01-01',
    tags: ['公式', '標準様式', '福祉']
  }
};

/**
 * シンプル版テンプレート
 */
export const SIMPLE_TEMPLATE: SupportPlanTemplate = {
  id: 'simple',
  name: 'シンプル版',
  description: '必要最小限の項目に絞ったシンプルな支援計画書です',
  version: '1.0.0',
  fields: [
    {
      id: 'userName',
      name: 'userName',
      label: '利用者氏名',
      type: 'text',
      required: true,
      description: '利用者の氏名',
      placeholder: '山田 太郎',
      tooltip: '利用者の氏名を入力してください'
    },
    {
      id: 'supportGoals',
      name: 'supportGoals',
      label: '支援目標',
      type: 'longtext',
      required: true,
      description: '支援の目標',
      placeholder: '日常生活の自立度を高め、社会参加の機会を増やす',
      tooltip: '支援を通じて達成したい目標'
    },
    {
      id: 'supportContent',
      name: 'supportContent',
      label: '支援内容',
      type: 'longtext',
      required: true,
      description: '具体的な支援内容',
      placeholder: '・日常生活動作の練習\n・コミュニケーション支援\n・就労準備支援',
      tooltip: '実施する支援の具体的な内容'
    },
    {
      id: 'evaluationDate',
      name: 'evaluationDate',
      label: '評価予定日',
      type: 'date',
      required: true,
      description: '次回評価の予定日',
      tooltip: '計画の見直し・評価を行う予定日'
    }
  ],
  metadata: {
    author: 'CareCheck',
    createdAt: '2024-01-01',
    tags: ['シンプル', '基本']
  }
};

/**
 * 詳細版テンプレート
 */
export const DETAILED_TEMPLATE: SupportPlanTemplate = {
  id: 'detailed',
  name: '詳細版',
  description: '詳細な情報を記録できる拡張版の支援計画書です',
  version: '1.0.0',
  fields: [
    // 基本情報
    {
      id: 'userName',
      name: 'userName',
      label: '利用者氏名',
      type: 'text',
      required: true,
      description: '利用者の氏名'
    },
    {
      id: 'userAge',
      name: 'userAge',
      label: '年齢',
      type: 'number',
      required: true,
      description: '利用者の年齢',
      validation: {
        min: 0,
        max: 150,
        message: '正しい年齢を入力してください'
      }
    },
    {
      id: 'userGender',
      name: 'userGender',
      label: '性別',
      type: 'multiselect',
      required: false,
      options: ['男性', '女性', 'その他', '回答しない'],
      description: '利用者の性別'
    },
    // 現状評価
    {
      id: 'currentStatus',
      name: 'currentStatus',
      label: '現在の状況',
      type: 'longtext',
      required: true,
      description: '利用者の現在の生活状況、健康状態、課題など'
    },
    {
      id: 'strengths',
      name: 'strengths',
      label: '強み・長所',
      type: 'longtext',
      required: true,
      description: '利用者の強み、できること、興味関心'
    },
    {
      id: 'challenges',
      name: 'challenges',
      label: '課題・ニーズ',
      type: 'longtext',
      required: true,
      description: '支援が必要な課題、改善したい点'
    },
    // 支援計画
    {
      id: 'userDesires',
      name: 'userDesires',
      label: '本人の希望',
      type: 'longtext',
      required: true,
      description: '利用者本人の希望、やりたいこと'
    },
    {
      id: 'familyDesires',
      name: 'familyDesires',
      label: '家族の希望',
      type: 'longtext',
      required: false,
      description: '家族の希望、要望'
    },
    {
      id: 'longTermGoal',
      name: 'longTermGoal',
      label: '長期目標（1年）',
      type: 'longtext',
      required: true,
      description: '1年後に達成したい目標'
    },
    {
      id: 'midTermGoal',
      name: 'midTermGoal',
      label: '中期目標（6ヶ月）',
      type: 'longtext',
      required: true,
      description: '6ヶ月後に達成したい目標'
    },
    {
      id: 'shortTermGoal',
      name: 'shortTermGoal',
      label: '短期目標（3ヶ月）',
      type: 'longtext',
      required: true,
      description: '3ヶ月後に達成したい目標'
    },
    // 具体的支援
    {
      id: 'dailyLifeSupport',
      name: 'dailyLifeSupport',
      label: '日常生活支援',
      type: 'longtext',
      required: false,
      description: '食事、入浴、排泄等の支援内容'
    },
    {
      id: 'socialSupport',
      name: 'socialSupport',
      label: '社会生活支援',
      type: 'longtext',
      required: false,
      description: 'コミュニケーション、外出、余暇活動等の支援'
    },
    {
      id: 'workSupport',
      name: 'workSupport',
      label: '就労支援',
      type: 'longtext',
      required: false,
      description: '就労準備、職場定着等の支援'
    },
    {
      id: 'healthSupport',
      name: 'healthSupport',
      label: '健康管理支援',
      type: 'longtext',
      required: false,
      description: '服薬管理、通院同行、健康維持等の支援'
    },
    // 評価・見直し
    {
      id: 'evaluationCriteria',
      name: 'evaluationCriteria',
      label: '評価基準',
      type: 'longtext',
      required: true,
      description: '目標達成の評価基準、指標'
    },
    {
      id: 'reviewSchedule',
      name: 'reviewSchedule',
      label: '見直し予定',
      type: 'text',
      required: true,
      description: '計画の見直しスケジュール'
    },
    // 同意
    {
      id: 'userConsent',
      name: 'userConsent',
      label: '本人同意',
      type: 'boolean',
      required: true,
      description: '利用者本人の同意',
      defaultValue: false
    },
    {
      id: 'familyConsent',
      name: 'familyConsent',
      label: '家族同意',
      type: 'boolean',
      required: false,
      description: '家族の同意',
      defaultValue: false
    },
    {
      id: 'consentDate',
      name: 'consentDate',
      label: '同意日',
      type: 'date',
      required: true,
      description: '同意を得た日付'
    }
  ],
  sections: [
    {
      id: 'basicInfo',
      name: '基本情報',
      fields: ['userName', 'userAge', 'userGender']
    },
    {
      id: 'assessment',
      name: '現状評価',
      fields: ['currentStatus', 'strengths', 'challenges']
    },
    {
      id: 'planning',
      name: '支援計画',
      fields: ['userDesires', 'familyDesires', 'longTermGoal', 'midTermGoal', 'shortTermGoal']
    },
    {
      id: 'support',
      name: '具体的支援',
      fields: ['dailyLifeSupport', 'socialSupport', 'workSupport', 'healthSupport']
    },
    {
      id: 'evaluation',
      name: '評価・見直し',
      fields: ['evaluationCriteria', 'reviewSchedule']
    },
    {
      id: 'consent',
      name: '同意確認',
      fields: ['userConsent', 'familyConsent', 'consentDate']
    }
  ],
  metadata: {
    author: 'CareCheck',
    createdAt: '2024-01-01',
    tags: ['詳細', '包括的', '多機能']
  }
};

/**
 * デフォルトテンプレートの取得
 */
export const getDefaultTemplates = (): SupportPlanTemplate[] => {
  return [
    MHLW_TEMPLATE,
    SIMPLE_TEMPLATE,
    DETAILED_TEMPLATE
  ];
};

/**
 * テンプレートIDによる取得
 */
export const getTemplateById = (id: string): SupportPlanTemplate | undefined => {
  return getDefaultTemplates().find(template => template.id === id);
};