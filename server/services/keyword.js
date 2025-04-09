/**
 * キーワードサービス
 * キーワード生成と管理に関するビジネスロジックを提供します
 */

import Keyword from '../models/keyword.js';
import Facility from '../models/facility.js';
import logger from '../utils/logger.js';

/**
 * キーワードサービスクラス
 */
class KeywordService {
  /**
   * 施設IDに関連するキーワードを取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} カテゴリ別のキーワード
   */
  static async getKeywordsByFacilityId(facilityId) {
    try {
      const facility = await Facility.getById(facilityId);
      if (!facility) {
        throw new Error('施設が見つかりません');
      }
      
      return await Keyword.getByFacilityId(facilityId);
    } catch (err) {
      logger.error(`キーワード取得エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * キーワードを生成
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 生成されたキーワード
   */
  static async generateKeywords(facilityId) {
    try {
      const facility = await Facility.getById(facilityId);
      if (!facility) {
        throw new Error('施設が見つかりません');
      }
      
      logger.info(`施設ID ${facilityId} のキーワード生成を開始`);
      
      const dummyKeywords = {
        menu_service: [],
        environment_facility: [],
        recommended_scene: []
      };
      
      if (facility.business_type) {
        const businessType = facility.business_type.toLowerCase();
        
        if (businessType.includes('レストラン') || businessType.includes('飲食') || businessType.includes('カフェ')) {
          dummyKeywords.menu_service = ['ランチセット', 'ディナーコース', '季節の料理', 'テイクアウト', 'デザート'];
          dummyKeywords.environment_facility = ['テラス席あり', '個室完備', 'Wi-Fi利用可', '禁煙席あり', '駐車場完備'];
          dummyKeywords.recommended_scene = ['デート', '接待', '家族での食事', '記念日', '女子会'];
        }
        else if (businessType.includes('ホテル') || businessType.includes('旅館')) {
          dummyKeywords.menu_service = ['朝食バイキング', '夕食コース', 'ルームサービス', '送迎サービス', 'エステ'];
          dummyKeywords.environment_facility = ['大浴場', '露天風呂', 'Wi-Fi完備', '駐車場無料', 'バリアフリー'];
          dummyKeywords.recommended_scene = ['家族旅行', 'カップル旅行', 'ビジネス出張', '長期滞在', '一人旅'];
        }
        else if (businessType.includes('美容') || businessType.includes('サロン')) {
          dummyKeywords.menu_service = ['カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ'];
          dummyKeywords.environment_facility = ['完全個室', '駐車場あり', 'キッズスペース', 'バリアフリー', '予約制'];
          dummyKeywords.recommended_scene = ['結婚式前', 'デート前', '就活', '記念日', '気分転換'];
        }
        else {
          dummyKeywords.menu_service = ['基本サービス', 'プレミアムプラン', '定期コース', '初回限定', '会員特典'];
          dummyKeywords.environment_facility = ['駐車場あり', 'バリアフリー対応', 'Wi-Fi完備', '予約可能', '送迎あり'];
          dummyKeywords.recommended_scene = ['日常利用', 'ビジネス', '家族で', '友人と', '特別な日に'];
        }
      }
      
      if (facility.facility_name) {
        dummyKeywords.menu_service.push(`${facility.facility_name}のおすすめメニュー`);
        dummyKeywords.environment_facility.push(`${facility.facility_name}の雰囲気`);
        dummyKeywords.recommended_scene.push(`${facility.facility_name}でのひととき`);
      }
      
      await Keyword.save(facilityId, dummyKeywords);
      
      logger.info(`施設ID ${facilityId} のキーワード生成が完了`);
      return dummyKeywords;
    } catch (err) {
      logger.error(`キーワード生成エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * キーワードを更新
   * @param {string} facilityId - 施設ID
   * @param {Object} keywordsData - 更新するキーワードデータ
   * @returns {Promise<Object>} 更新されたキーワード
   */
  static async updateKeywords(facilityId, keywordsData) {
    try {
      const facility = await Facility.getById(facilityId);
      if (!facility) {
        throw new Error('施設が見つかりません');
      }
      
      const cleanedKeywords = {
        menu_service: Array.isArray(keywordsData.menu_service) 
          ? keywordsData.menu_service.filter(k => k && k.trim() !== '') 
          : [],
        environment_facility: Array.isArray(keywordsData.environment_facility) 
          ? keywordsData.environment_facility.filter(k => k && k.trim() !== '') 
          : [],
        recommended_scene: Array.isArray(keywordsData.recommended_scene) 
          ? keywordsData.recommended_scene.filter(k => k && k.trim() !== '') 
          : []
      };
      
      await Keyword.save(facilityId, cleanedKeywords);
      
      logger.info(`施設ID ${facilityId} のキーワードが更新されました`);
      return cleanedKeywords;
    } catch (err) {
      logger.error(`キーワード更新エラー: ${err.message}`);
      throw err;
    }
  }
}

export default KeywordService;
