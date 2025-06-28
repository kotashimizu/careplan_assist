import { 
  AIProvider, 
  AnalysisResult, 
  SupportPlanTemplate, 
  SupportPlanData,
  AIConfig 
} from '../types';

/**
 * AI分析エンジンの抽象基底クラス
 */
export abstract class BaseAIAnalyzer implements AIProvider {
  protected config: AIConfig;

  constructor(config: AIConfig) {
    this.config = config;
  }

  abstract analyze(text: string, template: SupportPlanTemplate): Promise<AnalysisResult>;
  abstract generateSuggestions(data: SupportPlanData): Promise<string[]>;
  abstract compareVersions(v1: SupportPlanData, v2: SupportPlanData): Promise<string>;

  /**
   * キーワードベースのフォールバック分析
   */
  protected fallbackAnalysis(text: string, template: SupportPlanTemplate): Record<string, any> {
    const result: Record<string, any> = {};
    const textLower = text.toLowerCase();

    template.fields.forEach(field => {
      const hints = field.tooltip ? field.tooltip.split('、') : [field.label];
      const allKeywords = this.generateKeywords(field, hints);

      for (const keyword of allKeywords) {
        if (textLower.includes(keyword.toLowerCase())) {
          result[field.id] = this.extractValueByType(text, field, keyword);
          break;
        }
      }

      // デフォルト値の設定
      if (!(field.id in result)) {
        result[field.id] = field.defaultValue || '';
      }
    });

    return result;
  }

  /**
   * フィールドに関連するキーワードを生成
   */
  private generateKeywords(field: any, hints: string[]): string[] {
    const keywords = [...hints, field.label];

    // フィールドIDに基づく追加キーワード
    const idBasedKeywords: Record<string, string[]> = {
      name: ['氏名', '名前', '利用者', 'さん', '様'],
      age: ['年齢', '歳', '才'],
      gender: ['性別', '男性', '女性', '男', '女'],
      support: ['支援', 'サポート', '援助', '介護', 'ケア'],
      goal: ['目標', '目的', 'ゴール', '達成'],
      need: ['課題', 'ニーズ', '問題', '困りごと', '必要'],
      life: ['生活', '暮らし', '日常', '活動'],
      desire: ['希望', '要望', '願い', 'したい', '望み'],
      consent: ['同意', '承諾', '了承', '署名', '確認']
    };

    Object.entries(idBasedKeywords).forEach(([key, values]) => {
      if (field.id.toLowerCase().includes(key)) {
        keywords.push(...values);
      }
    });

    return [...new Set(keywords)]; // 重複を除去
  }

  /**
   * データ型に応じた値の抽出
   */
  private extractValueByType(text: string, field: any, keyword: string): any {
    switch (field.type) {
      case 'number':
        const numberMatch = text.match(/(\d+)/);
        return numberMatch ? parseInt(numberMatch[1]) : null;

      case 'date':
        const dateMatch = text.match(/(\d{4})[-\/年](\d{1,2})[-\/月](\d{1,2})/);
        if (dateMatch) {
          const [_, year, month, day] = dateMatch;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
        return new Date().toISOString().split('T')[0];

      case 'boolean':
        return text.includes('はい') || text.includes('yes') || 
               text.includes('同意') || text.includes('承諾');

      case 'multiselect':
        if (field.options) {
          return field.options.filter(option => 
            text.toLowerCase().includes(option.toLowerCase())
          );
        }
        return [];

      case 'text':
      case 'longtext':
      default:
        const index = text.toLowerCase().indexOf(keyword.toLowerCase());
        if (index !== -1) {
          const start = Math.max(0, index - 50);
          const end = Math.min(text.length, index + 150);
          return text.substring(start, end).trim();
        }
        return `${keyword}に関する内容`;
    }
  }

  /**
   * キャッシュキーの生成
   */
  protected getCacheKey(text: string, templateId: string): string {
    const hash = this.simpleHash(text);
    return `ai_cache_${templateId}_${hash}`;
  }

  /**
   * 簡易ハッシュ関数
   */
  private simpleHash(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(36);
  }
}