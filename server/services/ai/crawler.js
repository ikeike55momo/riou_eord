/**
 * Firecrawlサービス
 * Firecrawl APIを使用してウェブサイトやGoogle Business Profileをクロールし、
 * キーワード生成のための情報を収集します
 */

import axios from 'axios';
import logger from '../../utils/logger.js';

class CrawlerService {
  constructor() {
    this.apiKey = process.env.FIRECRAWL_API_KEY;
    this.apiUrl = 'https://api.firecrawl.dev';
    this.initialized = false;
  }

  /**
   * サービスの初期化
   * APIキーの存在確認を行います
   */
  initialize() {
    if (!this.apiKey) {
      logger.error('Firecrawl APIキーが設定されていません');
      this.initialized = false;
      return false;
    }

    this.initialized = true;
    logger.info('Crawlerサービスが初期化されました');
    return true;
  }

  /**
   * Google Business Profileのクロール
   * @param {string} url - Google Business ProfileのURL
   * @returns {Promise<Object>} - クロール結果
   */
  async crawlGBP(url) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('Crawlerサービスが初期化されていません');
      }
    }

    if (!url) {
      logger.warn('Google Business ProfileのURLが指定されていません');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/crawl`,
        {
          url: url,
          selector: 'body',
          wait_for: '.gm2-subtitle-alt-1',
          extract_metadata: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      logger.info(`Google Business Profileのクロールが完了しました: ${url}`);
      
      return {
        title: response.data.metadata?.title || '',
        description: response.data.metadata?.description || '',
        content: response.data.content || ''
      };
    } catch (error) {
      logger.error(`Google Business Profileのクロールエラー: ${error.message}`);
      if (error.response) {
        logger.error(`ステータスコード: ${error.response.status}`);
        logger.error(`レスポンスデータ: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * ウェブサイトのクロール
   * @param {string} url - ウェブサイトのURL
   * @returns {Promise<Object>} - クロール結果
   */
  async crawlWebsite(url) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('Crawlerサービスが初期化されていません');
      }
    }

    if (!url) {
      logger.warn('ウェブサイトのURLが指定されていません');
      return null;
    }

    try {
      const response = await axios.post(
        `${this.apiUrl}/crawl`,
        {
          url: url,
          selector: 'body',
          extract_metadata: true,
          follow_links: true,
          max_pages: 5,
          same_domain: true
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.apiKey}`
          }
        }
      );

      logger.info(`ウェブサイトのクロールが完了しました: ${url}`);
      
      return {
        title: response.data.metadata?.title || '',
        description: response.data.metadata?.description || '',
        content: response.data.content || ''
      };
    } catch (error) {
      logger.error(`ウェブサイトのクロールエラー: ${error.message}`);
      if (error.response) {
        logger.error(`ステータスコード: ${error.response.status}`);
        logger.error(`レスポンスデータ: ${JSON.stringify(error.response.data)}`);
      }
      return null;
    }
  }

  /**
   * クロールデータからテキスト抽出
   * @param {Object} crawlData - クロールデータ
   * @returns {string} - 抽出されたテキスト
   */
  extractTextFromCrawl(crawlData) {
    if (!crawlData) {
      return '';
    }

    let extractedText = '';

    if (crawlData.title) {
      extractedText += `タイトル: ${crawlData.title}\n`;
    }

    if (crawlData.description) {
      extractedText += `説明: ${crawlData.description}\n`;
    }

    if (crawlData.content) {
      const contentText = crawlData.content
        .replace(/<[^>]*>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      
      extractedText += `コンテンツ: ${contentText}\n`;
    }

    return extractedText;
  }
}

export default new CrawlerService();
