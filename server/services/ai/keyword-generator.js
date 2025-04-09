/**
 * キーワード生成サービス
 * GPTサービスとCrawlerサービスを組み合わせて、施設情報に基づいたキーワードを生成します
 */

import gptService from './gpt.js';
import crawlerService from './crawler.js';
import errorHandler from './error-handler.js';
import logger from '../../utils/logger.js';

class KeywordGeneratorService {
  constructor() {
    this.gptService = gptService;
    this.crawlerService = crawlerService;
    this.errorHandler = errorHandler;
  }

  /**
   * サービスの初期化
   */
  initialize() {
    const gptInitialized = this.gptService.initialize();
    const crawlerInitialized = this.crawlerService.initialize();

    if (!gptInitialized || !crawlerInitialized) {
      logger.error('キーワード生成サービスの初期化に失敗しました');
      return false;
    }

    logger.info('キーワード生成サービスが初期化されました');
    return true;
  }

  /**
   * 施設情報に基づいてキーワードを生成
   * @param {Object} facility - 施設情報
   * @returns {Promise<Object>} - 生成されたキーワード
   */
  async generateKeywords(facility) {
    try {
      if (!facility) {
        throw new Error('施設情報が提供されていません');
      }

      logger.info(`施設「${facility.facility_name}」のキーワード生成を開始します`);

      const crawlData = await this.collectCrawlData(facility);

      const prompt = this.gptService.createKeywordPrompt(facility, crawlData);

      const generatedText = await this.gptService.generateText(prompt);

      let keywords;
      try {
        keywords = JSON.parse(generatedText);
      } catch (error) {
        logger.error(`生成されたテキストのJSON解析エラー: ${error.message}`);
        logger.error(`生成されたテキスト: ${generatedText}`);
        throw new Error('生成されたテキストの形式が不正です');
      }

      const validatedKeywords = this.validateAndFormatKeywords(keywords);

      logger.info(`施設「${facility.facility_name}」のキーワード生成が完了しました`);
      return validatedKeywords;
    } catch (error) {
      return this.errorHandler.handleKeywordGenerationError(error, facility);
    }
  }

  /**
   * 施設情報からクロールデータを収集
   * @param {Object} facility - 施設情報
   * @returns {Promise<Object>} - 収集されたクロールデータ
   */
  async collectCrawlData(facility) {
    const crawlData = {
      website: null,
      gbp: null
    };

    if (facility.official_site_url) {
      try {
        crawlData.website = await this.crawlerService.crawlWebsite(facility.official_site_url);
        logger.info(`公式サイトのクロールが完了しました: ${facility.official_site_url}`);
      } catch (error) {
        logger.warn(`公式サイトのクロールに失敗しました: ${error.message}`);
      }
    }

    if (facility.gbp_url) {
      try {
        crawlData.gbp = await this.crawlerService.crawlGBP(facility.gbp_url);
        logger.info(`GBPのクロールが完了しました: ${facility.gbp_url}`);
      } catch (error) {
        logger.warn(`GBPのクロールに失敗しました: ${error.message}`);
      }
    }

    return crawlData;
  }

  /**
   * キーワードの検証と整形
   * @param {Object} keywords - 生成されたキーワード
   * @returns {Object} - 検証・整形されたキーワード
   */
  validateAndFormatKeywords(keywords) {
    const validatedKeywords = {
      menu_service: [],
      environment_facility: [],
      recommended_scene: []
    };

    if (Array.isArray(keywords.menu_service)) {
      validatedKeywords.menu_service = keywords.menu_service
        .filter(keyword => keyword && typeof keyword === 'string')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
    }

    if (Array.isArray(keywords.environment_facility)) {
      validatedKeywords.environment_facility = keywords.environment_facility
        .filter(keyword => keyword && typeof keyword === 'string')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
    }

    if (Array.isArray(keywords.recommended_scene)) {
      validatedKeywords.recommended_scene = keywords.recommended_scene
        .filter(keyword => keyword && typeof keyword === 'string')
        .map(keyword => keyword.trim())
        .filter(keyword => keyword.length > 0);
    }

    return validatedKeywords;
  }
}

export default new KeywordGeneratorService();
