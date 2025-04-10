/**
 * GPT-4統合サービス
 * Open Router APIを使用してGPT-4oモデルと連携し、キーワード生成を行います
 */

import axios from 'axios';
import logger from '../../utils/logger.js';

class GPTService {
  constructor() {
    this.apiKey = process.env.OPENROUTER_API_KEY;
    this.apiUrl = 'https://openrouter.ai/api/v1/chat/completions';
    this.model = 'openai/gpt-4o';
    this.initialized = false;
  }

  /**
   * サービスの初期化
   * APIキーの存在確認を行います
   */
  initialize() {
    if (!this.apiKey) {
      logger.error('Open Router APIキーが設定されていません');
      this.initialized = false;
      return false;
    }

    this.initialized = true;
    logger.info('GPTサービスが初期化されました');
    return true;
  }

  /**
   * テキスト生成
   * @param {string} prompt - 生成のためのプロンプト
   * @returns {Promise<string>} - 生成されたテキスト
   */
  async generateText(prompt) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('GPTサービスが初期化されていません');
      }
    }

    try {
      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          messages: [
            { role: 'system', content: 'あなたはSEO/MEOキーワード生成の専門家です。施設情報に基づいて、最適なキーワードを提案してください。' },
            { role: 'user', content: prompt }
          ],
          temperature: 0.7,
          max_tokens: 1000,
          response_format: { type: 'json_object' }
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`,
            'HTTP-Referer': 'https://keyword-suggestion-app.example.com',
            'X-Title': 'キーワード自動提案Webアプリ'
          }
        }
      );

      logger.info('GPT-4oからのレスポンスを受信しました');
      return response.data.choices[0].message.content;
    } catch (error) {
      logger.error(`GPT-4oテキスト生成エラー: ${error.message}`);
      if (error.response) {
        logger.error(`ステータスコード: ${error.response.status}`);
        logger.error(`レスポンスデータ: ${JSON.stringify(error.response.data)}`);
      }
      throw new Error(`GPT-4oテキスト生成に失敗しました: ${error.message}`);
    }
  }

  /**
   * キーワード生成用のプロンプト作成
   * @param {Object} facility - 施設情報
   * @param {Object} crawlData - クロールデータ
   * @returns {string} - 生成されたプロンプト
   */
  createKeywordPrompt(facility, crawlData = null) {
    let prompt = `
以下の施設情報に基づいて、SEO/MEOに効果的なキーワードを生成してください。
結果はJSON形式で、以下の3つのカテゴリに分けて返してください:
1. menu_service: メニュー・サービス関連のキーワード（10-15個）
2. environment_facility: 環境・設備関連のキーワード（10-15個）
3. recommended_scene: おすすめの利用シーン関連のキーワード（10-15個）

【施設情報】
施設名: ${facility.facility_name || ''}
業種: ${facility.business_type || ''}
住所: ${facility.address || ''}
電話番号: ${facility.phone || ''}
営業時間: ${facility.business_hours || ''}
定休日: ${facility.closed_days || ''}
公式サイトURL: ${facility.official_site_url || ''}
Google Business ProfileのURL: ${facility.gbp_url || ''}
追加情報: ${facility.additional_info || ''}
`;

    if (crawlData) {
      prompt += `
【クロールデータ】
公式サイトタイトル: ${crawlData.website?.title || ''}
公式サイト説明: ${crawlData.website?.description || ''}
公式サイトコンテンツ: ${crawlData.website?.content || ''}

GBPタイトル: ${crawlData.gbp?.title || ''}
GBP説明: ${crawlData.gbp?.description || ''}
GBPコンテンツ: ${crawlData.gbp?.content || ''}
`;
    }

    prompt += `
【出力形式】
{
  "menu_service": ["キーワード1", "キーワード2", ...],
  "environment_facility": ["キーワード1", "キーワード2", ...],
  "recommended_scene": ["キーワード1", "キーワード2", ...]
}

【注意事項】
- 各キーワードは具体的で、検索ユーザーが使いそうな自然な表現にしてください
- 施設の特徴や強みを活かしたキーワードを含めてください
- 地域性を考慮したキーワードを含めてください
- 競合との差別化ポイントになるキーワードを含めてください
- 必ず上記のJSON形式で出力してください
`;

    return prompt;
  }
}

export default new GPTService();
