/**
 * GPT-4統合サービス
 * Open Router API経由でGPT-4oとの連携機能を提供します
 */

import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * GPT-4サービスクラス
 */
class GPTService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://openrouter.ai/api/v1';
    this.initialized = false;
  }

  /**
   * サービスの初期化
   * @returns {boolean} 初期化成功の可否
   */
  initialize() {
    try {
      const apiKey = process.env.OPENROUTER_API_KEY || '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';
      
      if (!apiKey) {
        logger.error('Open Router API Keyが設定されていません');
        return false;
      }
      
      this.apiKey = apiKey;
      this.initialized = true;
      
      logger.info('GPTサービスが初期化されました');
      return true;
    } catch (err) {
      logger.error(`GPTサービス初期化エラー: ${err.message}`);
      return false;
    }
  }

  /**
   * GPT-4oを使用してテキスト生成
   * @param {string} prompt - 入力プロンプト
   * @param {Object} options - 生成オプション
   * @returns {Promise<string>} 生成されたテキスト
   */
  async generateText(prompt, options = {}) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('GPTサービスが初期化されていません');
      }
    }
    
    try {
      const defaultOptions = {
        model: 'openai/gpt-4o',
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        frequency_penalty: 0,
        presence_penalty: 0
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      const response = await axios.post(
        `${this.baseUrl}/chat/completions`,
        {
          model: mergedOptions.model,
          messages: [{ role: 'user', content: prompt }],
          temperature: mergedOptions.temperature,
          max_tokens: mergedOptions.max_tokens,
          top_p: mergedOptions.top_p,
          frequency_penalty: mergedOptions.frequency_penalty,
          presence_penalty: mergedOptions.presence_penalty
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.data.choices && response.data.choices.length > 0) {
        return response.data.choices[0].message.content.trim();
      } else {
        throw new Error('GPT-4oからの応答が空です');
      }
    } catch (err) {
      logger.error(`GPTテキスト生成エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設情報からキーワード生成用のプロンプトを作成
   * @param {Object} facility - 施設情報
   * @returns {string} 生成されたプロンプト
   */
  createKeywordPrompt(facility) {
    return `
以下の施設情報に基づいて、SEO/MEO向けのキーワードを3つのカテゴリに分けて生成してください。
各カテゴリごとに5-10個のキーワードを提案してください。

施設情報:
- 施設名: ${facility.facility_name || '未設定'}
- 業種: ${facility.business_type || '未設定'}
- 住所: ${facility.address || '未設定'}
- 電話番号: ${facility.phone || '未設定'}
- 営業時間: ${facility.business_hours || '未設定'}
- 定休日: ${facility.closed_days || '未設定'}
- 公式サイト: ${facility.official_site_url || '未設定'}
- 追加情報: ${facility.additional_info || '未設定'}

カテゴリ:
1. メニュー・サービス: この施設が提供するメニューやサービスに関連するキーワード
2. 環境・設備: 施設の環境や設備に関連するキーワード
3. おすすめの利用シーン: この施設の利用に適したシーンに関連するキーワード

回答は以下のJSON形式で返してください:
{
  "menu_service": ["キーワード1", "キーワード2", ...],
  "environment_facility": ["キーワード1", "キーワード2", ...],
  "recommended_scene": ["キーワード1", "キーワード2", ...]
}
`;
  }
}

export default new GPTService();
