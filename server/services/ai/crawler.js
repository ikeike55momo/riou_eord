/**
 * Firecrawl統合サービス
 * Google Business ProfileとWebサイトのクローリング機能を提供します
 */

import axios from 'axios';
import logger from '../../utils/logger.js';

/**
 * Firecrawlサービスクラス
 */
class CrawlerService {
  constructor() {
    this.apiKey = null;
    this.baseUrl = 'https://api.firecrawl.dev/v1';
    this.initialized = false;
  }

  /**
   * サービスの初期化
   * @returns {boolean} 初期化成功の可否
   */
  initialize() {
    try {
      const apiKey = process.env.FIRECRAWL_API_KEY;
      
      if (!apiKey) {
        logger.error('Firecrawl API Keyが設定されていません');
        return false;
      }
      
      this.apiKey = apiKey;
      this.initialized = true;
      
      logger.info('Crawlerサービスが初期化されました');
      return true;
    } catch (err) {
      logger.error(`Crawlerサービス初期化エラー: ${err.message}`);
      return false;
    }
  }

  /**
   * Google Business Profileをクロール
   * @param {string} gbpUrl - Google Business ProfileのURL
   * @returns {Promise<Object>} クロール結果
   */
  async crawlGBP(gbpUrl) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('Crawlerサービスが初期化されていません');
      }
    }
    
    if (!gbpUrl) {
      throw new Error('Google Business ProfileのURLが指定されていません');
    }
    
    try {
      logger.info(`Google Business Profileのクロールを開始: ${gbpUrl}`);
      
      const response = await axios.post(
        `${this.baseUrl}/crawl/gbp`,
        { url: gbpUrl },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
      
      logger.info(`Google Business Profileのクロールが完了: ${gbpUrl}`);
      return response.data;
    } catch (err) {
      logger.error(`GBPクロールエラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * Webサイトをクロール
   * @param {string} websiteUrl - WebサイトのURL
   * @param {Object} options - クロールオプション
   * @returns {Promise<Object>} クロール結果
   */
  async crawlWebsite(websiteUrl, options = {}) {
    if (!this.initialized) {
      if (!this.initialize()) {
        throw new Error('Crawlerサービスが初期化されていません');
      }
    }
    
    if (!websiteUrl) {
      throw new Error('WebサイトのURLが指定されていません');
    }
    
    try {
      logger.info(`Webサイトのクロールを開始: ${websiteUrl}`);
      
      const defaultOptions = {
        maxPages: 10,
        maxDepth: 2,
        includeImages: true
      };
      
      const mergedOptions = { ...defaultOptions, ...options };
      
      const response = await axios.post(
        `${this.baseUrl}/crawl/website`,
        {
          url: websiteUrl,
          maxPages: mergedOptions.maxPages,
          maxDepth: mergedOptions.maxDepth,
          includeImages: mergedOptions.includeImages
        },
        {
          headers: {
            'Authorization': `Bearer ${this.apiKey}`,
            'Content-Type': 'application/json'
          }
        }
      );
      
      if (response.status !== 200) {
        throw new Error(`APIエラー: ${response.status} ${response.statusText}`);
      }
      
      logger.info(`Webサイトのクロールが完了: ${websiteUrl}`);
      return response.data;
    } catch (err) {
      logger.error(`Webサイトクロールエラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * クロール結果からテキストデータを抽出
   * @param {Object} crawlResult - クロール結果
   * @returns {string} 抽出されたテキスト
   */
  extractTextFromCrawl(crawlResult) {
    try {
      let extractedText = '';
      
      if (crawlResult.title) {
        extractedText += `タイトル: ${crawlResult.title}\n\n`;
      }
      
      if (crawlResult.description) {
        extractedText += `説明: ${crawlResult.description}\n\n`;
      }
      
      if (crawlResult.content) {
        extractedText += `コンテンツ:\n${crawlResult.content}\n\n`;
      }
      
      if (crawlResult.pages && Array.isArray(crawlResult.pages)) {
        crawlResult.pages.forEach((page, index) => {
          extractedText += `ページ ${index + 1}:\n`;
          extractedText += `URL: ${page.url}\n`;
          extractedText += `タイトル: ${page.title || '不明'}\n`;
          extractedText += `コンテンツ: ${page.content || '不明'}\n\n`;
        });
      }
      
      return extractedText.trim();
    } catch (err) {
      logger.error(`テキスト抽出エラー: ${err.message}`);
      return '';
    }
  }
}

export default new CrawlerService();
