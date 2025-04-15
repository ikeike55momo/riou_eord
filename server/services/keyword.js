/**
 * キーワードサービス
 * キーワード生成と管理のためのサービス
 */

import Keyword from '../models/keyword.js';
import Facility from '../models/facility.js';
import logger from '../utils/logger.js';

import keywordGenerator from './ai/keyword-generator.js';

/**
 * キーワードサービスクラス
 */
class KeywordService {
  /**
   * 施設IDに基づくキーワードの取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} キーワード情報
   */
  async getByFacilityId(facilityId) {
    try {
      logger.info(`キーワード取得開始: 施設ID ${facilityId}`);
      
      try {
        await Facility.getById(facilityId);
      } catch (err) {
        logger.error(`施設存在確認エラー: ${err.message}`);
        throw new Error('施設が見つかりません');
      }
      
      const keywords = await Keyword.getByFacilityId(facilityId);
      
      logger.info(`キーワード取得完了: 施設ID ${facilityId}`);
      return keywords;
    } catch (err) {
      logger.error(`キーワード取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの更新
   * @param {string} facilityId - 施設ID
   * @param {Object} keywordsData - キーワードデータ
   * @param {string} userId - 更新者のユーザーID
   * @returns {Promise<Object>} 更新されたキーワード
   */
  async update(facilityId, keywordsData, userId) {
    try {
      logger.info(`キーワード更新開始: 施設ID ${facilityId}`);
      
      try {
        await Facility.getById(facilityId);
      } catch (err) {
        logger.error(`施設存在確認エラー: ${err.message}`);
        throw new Error('施設が見つかりません');
      }
      
      this.validateKeywordsData(keywordsData);
      
      const keywords = await Keyword.update(facilityId, keywordsData, userId);
      
      logger.info(`キーワード更新完了: 施設ID ${facilityId}`);
      return keywords;
    } catch (err) {
      logger.error(`キーワード更新サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの生成
   * @param {string} facilityId - 施設ID
   * @param {string} userId - 生成者のユーザーID
   * @returns {Promise<Object>} 生成されたキーワード
   */
  async generate(facilityId, userId) {
    try {
      logger.info(`キーワード生成開始: 施設ID ${facilityId}`);
      
      let facility;
      try {
        facility = await Facility.getById(facilityId);
      } catch (err) {
        logger.error(`施設存在確認エラー: ${err.message}`);
        throw new Error('施設が見つかりません');
      }
      
      if (!keywordGenerator) {
        logger.error('キーワード生成サービスが初期化されていません');
        throw new Error('キーワード生成サービスが利用できません');
      }
      
      const keywords = await Keyword.generate(facilityId, keywordGenerator, userId);
      
      logger.info(`キーワード生成完了: 施設ID ${facilityId}`);
      return keywords;
    } catch (err) {
      logger.error(`キーワード生成サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの削除
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 削除結果
   */
  async delete(facilityId) {
    try {
      logger.info(`キーワード削除開始: 施設ID ${facilityId}`);
      
      try {
        await Facility.getById(facilityId);
      } catch (err) {
        logger.error(`施設存在確認エラー: ${err.message}`);
        throw new Error('施設が見つかりません');
      }
      
      const result = await Keyword.delete(facilityId);
      
      logger.info(`キーワード削除完了: 施設ID ${facilityId}`);
      return result;
    } catch (err) {
      logger.error(`キーワード削除サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの統計情報取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    try {
      logger.info('キーワード統計情報取得開始');
      
      const stats = await Keyword.getStats();
      
      logger.info('キーワード統計情報取得完了');
      return stats;
    } catch (err) {
      logger.error(`キーワード統計情報取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードデータの検証
   * @param {Object} keywordsData - 検証するキーワードデータ
   * @throws {Error} 検証エラー
   */
  validateKeywordsData(keywordsData) {
    const { menu_service, environment_facility, recommended_scene } = keywordsData;
    
    if (menu_service) {
      if (!Array.isArray(menu_service)) {
        throw new Error('メニュー・サービスカテゴリはリスト形式で指定してください');
      }
      
      menu_service.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          throw new Error(`メニュー・サービスカテゴリの項目 ${index + 1} は文字列である必要があります`);
        }
        
        if (keyword.length > 100) {
          throw new Error(`メニュー・サービスカテゴリの項目 ${index + 1} は100文字以内で入力してください`);
        }
      });
    }
    
    if (environment_facility) {
      if (!Array.isArray(environment_facility)) {
        throw new Error('環境・設備カテゴリはリスト形式で指定してください');
      }
      
      environment_facility.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          throw new Error(`環境・設備カテゴリの項目 ${index + 1} は文字列である必要があります`);
        }
        
        if (keyword.length > 100) {
          throw new Error(`環境・設備カテゴリの項目 ${index + 1} は100文字以内で入力してください`);
        }
      });
    }
    
    if (recommended_scene) {
      if (!Array.isArray(recommended_scene)) {
        throw new Error('おすすめの利用シーンカテゴリはリスト形式で指定してください');
      }
      
      recommended_scene.forEach((keyword, index) => {
        if (typeof keyword !== 'string') {
          throw new Error(`おすすめの利用シーンカテゴリの項目 ${index + 1} は文字列である必要があります`);
        }
        
        if (keyword.length > 100) {
          throw new Error(`おすすめの利用シーンカテゴリの項目 ${index + 1} は100文字以内で入力してください`);
        }
      });
    }
  }
  
  /**
   * キーワードのエクスポート
   * @param {string} facilityId - 施設ID
   * @param {string} format - エクスポート形式 ('csv' または 'json')
   * @returns {Promise<Object>} エクスポートデータ
   */
  async export(facilityId, format = 'json') {
    try {
      logger.info(`キーワードエクスポート開始: 施設ID ${facilityId} , 形式 ${format}`);
      
      let facility;
      try {
        facility = await Facility.getById(facilityId);
      } catch (err) {
        logger.error(`施設存在確認エラー: ${err.message}`);
        throw new Error('施設が見つかりません');
      }
      
      let keywords;
      try {
        keywords = await Keyword.getByFacilityId(facilityId);
      } catch (err) {
        logger.error(`キーワード取得エラー: ${err.message}`);
        throw new Error('キーワードが見つかりません');
      }
      
      let exportData;
      
      if (format === 'json') {
        exportData = {
          facility: {
            id: facility.id,
            facility_name: facility.facility_name,
            business_type: facility.business_type,
            address: facility.address,
            phone: facility.phone,
            business_hours: facility.business_hours,
            closed_days: facility.closed_days,
            official_site_url: facility.official_site_url,
            gbp_url: facility.gbp_url,
            additional_info: facility.additional_info
          },
          keywords: keywords
        };
      } else if (format === 'csv') {
        const records = [];
        
        keywords.menu_service.forEach(keyword => {
          records.push({
            facility_name: facility.facility_name,
            business_type: facility.business_type || '',
            address: facility.address || '',
            category: 'メニュー・サービス',
            keyword: keyword
          });
        });
        
        keywords.environment_facility.forEach(keyword => {
          records.push({
            facility_name: facility.facility_name,
            business_type: facility.business_type || '',
            address: facility.address || '',
            category: '環境・設備',
            keyword: keyword
          });
        });
        
        keywords.recommended_scene.forEach(keyword => {
          records.push({
            facility_name: facility.facility_name,
            business_type: facility.business_type || '',
            address: facility.address || '',
            category: 'おすすめの利用シーン',
            keyword: keyword
          });
        });
        
        exportData = records;
      } else {
        throw new Error('サポートされていないエクスポート形式です');
      }
      
      logger.info(`キーワードエクスポート完了: 施設ID ${facilityId} , 形式 ${format}`);
      return exportData;
    } catch (err) {
      logger.error(`キーワードエクスポートサービスエラー: ${err.message}`);
      throw err;
    }
  }
}

export default new KeywordService();
