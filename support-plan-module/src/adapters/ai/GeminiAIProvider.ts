import { GoogleGenerativeAI } from '@google/generative-ai';
import { BaseAIAnalyzer } from '../../core/AIAnalyzer';
import { 
  AnalysisResult, 
  SupportPlanTemplate, 
  SupportPlanData,
  AIConfig 
} from '../../types';

/**
 * Google Gemini AI プロバイダー
 */
export class GeminiAIProvider extends BaseAIAnalyzer {
  private client: GoogleGenerativeAI | null = null;
  private cache: Map<string, AnalysisResult> = new Map();

  constructor(config: AIConfig) {
    super(config);
    
    if (config.apiKey) {
      this.client = new GoogleGenerativeAI(config.apiKey);
    }
  }

  async analyze(text: string, template: SupportPlanTemplate): Promise<AnalysisResult> {
    // キャッシュチェック
    if (this.config.cacheEnabled) {
      const cacheKey = this.getCacheKey(text, template.id);
      const cached = this.cache.get(cacheKey);
      if (cached) {
        return cached;
      }
    }

    // APIキーがない場合はフォールバック
    if (!this.client) {
      console.warn('Gemini APIキーが設定されていません。フォールバック分析を使用します。');
      return {
        success: true,
        data: this.fallbackAnalysis(text, template),
        confidence: 0.5,
        suggestions: ['AI分析を有効にするにはAPIキーを設定してください']
      };
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-1.5-flash',
        generationConfig: {
          temperature: this.config.temperature || 0.1,
          topP: 0.8,
          topK: 40,
          maxOutputTokens: this.config.maxTokens || 2048,
        }
      });

      const prompt = this.buildPrompt(text, template);
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const responseText = response.text();

      // JSON抽出
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('AI応答からJSONを抽出できませんでした');
      }

      const extractedData = JSON.parse(jsonMatch[0]);
      const processedData = this.processExtractedData(extractedData, template);

      const analysisResult: AnalysisResult = {
        success: true,
        data: processedData,
        confidence: 0.9,
        suggestions: await this.generateInsights(processedData, template)
      };

      // キャッシュに保存
      if (this.config.cacheEnabled) {
        const cacheKey = this.getCacheKey(text, template.id);
        this.cache.set(cacheKey, analysisResult);
        
        // TTLでキャッシュをクリア
        if (this.config.cacheTTL) {
          setTimeout(() => {
            this.cache.delete(cacheKey);
          }, this.config.cacheTTL * 1000);
        }
      }

      return analysisResult;

    } catch (error) {
      console.error('Gemini AI分析エラー:', error);
      
      // フォールバックを使用
      if (this.config.fallbackEnabled) {
        return {
          success: true,
          data: this.fallbackAnalysis(text, template),
          confidence: 0.5,
          suggestions: ['AI分析でエラーが発生したため、キーワード分析を使用しました'],
          error: error instanceof Error ? error.message : '不明なエラー'
        };
      }

      return {
        success: false,
        error: error instanceof Error ? error.message : '不明なエラー'
      };
    }
  }

  async generateSuggestions(data: SupportPlanData): Promise<string[]> {
    if (!this.client) {
      return ['AI分析を有効にするにはAPIキーを設定してください'];
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-1.5-flash'
      });

      const prompt = `
以下の個別支援計画書の内容を分析し、改善提案を3つ提供してください。

【計画書内容】
${JSON.stringify(data.values, null, 2)}

【改善提案の観点】
1. 目標の具体性と測定可能性
2. 本人の強みや意向の反映
3. 支援内容の実現可能性

JSON形式で回答してください：
{
  "suggestions": ["提案1", "提案2", "提案3"]
}
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const data = JSON.parse(jsonMatch[0]);
        return data.suggestions || [];
      }

      return ['改善提案の生成に失敗しました'];

    } catch (error) {
      console.error('提案生成エラー:', error);
      return ['提案の生成中にエラーが発生しました'];
    }
  }

  async compareVersions(v1: SupportPlanData, v2: SupportPlanData): Promise<string> {
    if (!this.client) {
      return '比較機能を使用するにはAPIキーを設定してください';
    }

    try {
      const model = this.client.getGenerativeModel({
        model: this.config.model || 'gemini-1.5-flash'
      });

      const prompt = `
以下の2つの個別支援計画書を比較し、主な変更点を箇条書きで説明してください。

【前回の計画】
${JSON.stringify(v1.values, null, 2)}

【今回の計画】
${JSON.stringify(v2.values, null, 2)}

【比較の観点】
- 目標の変更
- 支援内容の変更
- 新たに追加された項目
- 削除された項目
`;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text();

    } catch (error) {
      console.error('比較エラー:', error);
      return '比較の実行中にエラーが発生しました';
    }
  }

  /**
   * プロンプトの構築
   */
  private buildPrompt(text: string, template: SupportPlanTemplate): string {
    const fieldsDescription = template.fields.map(field => ({
      id: field.id,
      label: field.label,
      type: field.type,
      required: field.required,
      options: field.options,
      hint: field.tooltip || field.description || field.label
    }));

    return `
あなたは障害福祉サービス事業所の経験豊富なサービス管理責任者です。
利用者の情報から、個別支援計画書の各項目を抽出してください。

【入力情報】
${text}

【抽出する項目】
${JSON.stringify(fieldsDescription, null, 2)}

【重要な指針】
1. 利用者本位の視点で内容を理解する
2. 具体的で実現可能な内容を抽出する
3. 専門用語は適切に使用する
4. 不明な項目は空文字列とする

以下のJSON形式で各フィールドの内容を抽出してください：
{
${template.fields.map(field => `  "${field.id}": "抽出された内容"`).join(',\n')}
}
`;
  }

  /**
   * 抽出データの処理
   */
  private processExtractedData(
    extractedData: Record<string, any>, 
    template: SupportPlanTemplate
  ): Record<string, any> {
    const result: Record<string, any> = {};

    template.fields.forEach(field => {
      const value = extractedData[field.id];
      
      if (value !== undefined && value !== null) {
        // データ型に応じた処理
        switch (field.type) {
          case 'number':
            result[field.id] = typeof value === 'number' ? value : parseInt(value);
            break;
          case 'boolean':
            result[field.id] = typeof value === 'boolean' ? value : value === 'true';
            break;
          case 'date':
            result[field.id] = this.normalizeDate(value);
            break;
          case 'multiselect':
            result[field.id] = Array.isArray(value) ? value : [value];
            break;
          default:
            result[field.id] = String(value).trim();
        }
      } else {
        result[field.id] = field.defaultValue || '';
      }
    });

    return result;
  }

  /**
   * 日付の正規化
   */
  private normalizeDate(value: any): string {
    if (typeof value === 'string' && value.match(/\d{4}-\d{2}-\d{2}/)) {
      return value;
    }
    
    try {
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toISOString().split('T')[0];
      }
    } catch {
      // パースエラーは無視
    }
    
    return new Date().toISOString().split('T')[0];
  }

  /**
   * インサイトの生成
   */
  private async generateInsights(
    data: Record<string, any>, 
    template: SupportPlanTemplate
  ): Promise<string[]> {
    const insights: string[] = [];
    
    // 必須フィールドのチェック
    const missingRequired = template.fields
      .filter(f => f.required && !data[f.id])
      .map(f => f.label);
    
    if (missingRequired.length > 0) {
      insights.push(`必須項目が未入力です: ${missingRequired.join(', ')}`);
    }
    
    // データの充実度
    const filledFields = Object.values(data).filter(v => v && String(v).trim()).length;
    const totalFields = template.fields.length;
    const completeness = Math.round((filledFields / totalFields) * 100);
    insights.push(`入力完了度: ${completeness}%`);
    
    return insights;
  }
}