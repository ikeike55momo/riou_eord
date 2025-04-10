/**
 * キーワード生成サービス
 * 施設情報とクローリングデータからキーワードを生成します
 */

import gptService from './gpt.js';
import crawlerService from './crawler.js';
import logger from '../../utils/logger.js';

/**
 * キーワード生成サービスクラス
 */
class KeywordGeneratorService {
  /**
   * 施設情報からキーワードを生成
   * @param {Object} facility - 施設情報
   * @returns {Promise<Object>} 生成されたキーワード
   */
  async generateKeywords(facility) {
    try {
      logger.info(`施設ID ${facility.facility_id} のキーワード生成を開始`);
      
      let crawlData = '';
      
      if (facility.gbp_url) {
        try {
          const gbpData = await crawlerService.crawlGBP(facility.gbp_url);
          const gbpText = crawlerService.extractTextFromCrawl(gbpData);
          crawlData += `Google Business Profileデータ:\n${gbpText}\n\n`;
        } catch (err) {
          logger.warn(`GBPクロールスキップ: ${err.message}`);
        }
      }
      
      if (facility.official_site_url) {
        try {
          const websiteData = await crawlerService.crawlWebsite(facility.official_site_url);
          const websiteText = crawlerService.extractTextFromCrawl(websiteData);
          crawlData += `公式サイトデータ:\n${websiteText}\n\n`;
        } catch (err) {
          logger.warn(`公式サイトクロールスキップ: ${err.message}`);
        }
      }
      
      let prompt = gptService.createKeywordPrompt(facility);
      
      if (crawlData) {
        prompt += `\n\n追加情報:\n${crawlData}`;
      }
      
      const gptResponse = await gptService.generateText(prompt, {
        temperature: 0.5,
        max_tokens: 1500
      });
      
      try {
        const jsonMatch = gptResponse.match(/\{[\s\S]*\}/);
        if (!jsonMatch) {
          throw new Error('JSON形式の応答が見つかりません');
        }
        
        const jsonResponse = JSON.parse(jsonMatch[0]);
        
        if (!jsonResponse.menu_service || !Array.isArray(jsonResponse.menu_service) ||
            !jsonResponse.environment_facility || !Array.isArray(jsonResponse.environment_facility) ||
            !jsonResponse.recommended_scene || !Array.isArray(jsonResponse.recommended_scene)) {
          throw new Error('応答の形式が不正です');
        }
        
        logger.info(`施設ID ${facility.facility_id} のキーワード生成が完了`);
        return {
          menu_service: jsonResponse.menu_service,
          environment_facility: jsonResponse.environment_facility,
          recommended_scene: jsonResponse.recommended_scene
        };
      } catch (parseErr) {
        logger.error(`JSON解析エラー: ${parseErr.message}`);
        
        return this.generateFallbackKeywords(facility);
      }
    } catch (err) {
      logger.error(`キーワード生成エラー: ${err.message}`);
      return this.generateFallbackKeywords(facility);
    }
  }

  /**
   * フォールバック用のキーワードを生成
   * @param {Object} facility - 施設情報
   * @returns {Object} 生成されたキーワード
   */
  generateFallbackKeywords(facility) {
    logger.info(`施設ID ${facility.facility_id} のフォールバックキーワードを生成`);
    
    const keywords = {
      menu_service: [],
      environment_facility: [],
      recommended_scene: []
    };
    
    if (facility.business_type) {
      const businessType = facility.business_type.toLowerCase();
      
      if (businessType.includes('レストラン') || businessType.includes('飲食') || businessType.includes('カフェ')) {
        keywords.menu_service = ['ランチセット', 'ディナーコース', '季節の料理', 'テイクアウト', 'デザート'];
        keywords.environment_facility = ['テラス席あり', '個室完備', 'Wi-Fi利用可', '禁煙席あり', '駐車場完備'];
        keywords.recommended_scene = ['デート', '接待', '家族での食事', '記念日', '女子会'];
      }
      else if (businessType.includes('ホテル') || businessType.includes('旅館')) {
        keywords.menu_service = ['朝食バイキング', '夕食コース', 'ルームサービス', '送迎サービス', 'エステ'];
        keywords.environment_facility = ['大浴場', '露天風呂', 'Wi-Fi完備', '駐車場無料', 'バリアフリー'];
        keywords.recommended_scene = ['家族旅行', 'カップル旅行', 'ビジネス出張', '長期滞在', '一人旅'];
      }
      else if (businessType.includes('美容') || businessType.includes('サロン')) {
        keywords.menu_service = ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ'];
        keywords.environment_facility = ['完全個室', '駐車場あり', 'キッズスペース', 'バリアフリー', '予約制'];
        keywords.recommended_scene = ['結婚式前', 'デート前', '就活', '記念日', '気分転換'];
      }
      else {
        keywords.menu_service = ['基本サービス', 'プレミアムプラン', '定期コース', '初回限定', '会員特典'];
        keywords.environment_facility = ['駐車場あり', 'バリアフリー対応', 'Wi-Fi完備', '予約可能', '送迎あり'];
        keywords.recommended_scene = ['日常利用', 'ビジネス', '家族で', '友人と', '特別な日に'];
      }
    }
    
    if (facility.facility_name) {
      keywords.menu_service.push(`${facility.facility_name}のおすすめメニュー`);
      keywords.environment_facility.push(`${facility.facility_name}の雰囲気`);
      keywords.recommended_scene.push(`${facility.facility_name}でのひととき`);
    }
    
    return keywords;
  }
}

export default new KeywordGeneratorService();
