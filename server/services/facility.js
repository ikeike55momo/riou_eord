/**
 * 施設サービス
 * 施設情報の処理と操作を行うサービス
 */

import Facility from '../models/facility.js';
import Keyword from '../models/keyword.js';
import logger from '../utils/logger.js';

/**
 * 施設サービスクラス
 */
class FacilityService {
  /**
   * 施設の作成
   * @param {Object} facilityData - 施設データ
   * @param {string} userId - 作成者のユーザーID
   * @returns {Promise<Object>} 作成された施設
   */
  async createFacility(facilityData, userId) {
    try {
      logger.info(`施設作成開始: ${facilityData.facility_name}`);
      
      this.validateFacilityData(facilityData);
      
      const facility = await Facility.create(facilityData, userId);
      
      logger.info(`施設作成完了: ${facility.facility_name} (ID: ${facility.id})`);
      return facility;
    } catch (err) {
      logger.error(`施設作成サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 施設情報
   */
  async getFacility(facilityId) {
    try {
      logger.info(`施設取得開始: ID ${facilityId}`);
      
      const facility = await Facility.getById(facilityId);
      
      logger.info(`施設取得完了: ${facility.facility_name} (ID: ${facilityId})`);
      return facility;
    } catch (err) {
      logger.error(`施設取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の更新
   * @param {string} facilityId - 施設ID
   * @param {Object} facilityData - 更新する施設データ
   * @param {string} userId - 更新者のユーザーID
   * @returns {Promise<Object>} 更新された施設
   */
  async updateFacility(facilityId, facilityData, userId) {
    try {
      logger.info(`施設更新開始: ID ${facilityId}`);
      
      if (facilityData.facility_name) {
        this.validateFacilityData(facilityData);
      }
      
      const facility = await Facility.update(facilityId, facilityData, userId);
      
      logger.info(`施設更新完了: ${facility.facility_name} (ID: ${facilityId})`);
      return facility;
    } catch (err) {
      logger.error(`施設更新サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の削除
   * @param {string} facilityId - 施設ID
   * @param {string} userId - 削除者のユーザーID
   * @returns {Promise<Object>} 削除結果
   */
  async deleteFacility(facilityId, userId) {
    try {
      logger.info(`施設削除開始: ID ${facilityId}`);
      
      await this.getFacility(facilityId);
      
      try {
        await Keyword.delete(facilityId);
        logger.info(`関連キーワード削除完了: 施設ID ${facilityId}`);
      } catch (err) {
        logger.warn(`関連キーワード削除中の警告: ${err.message}`);
      }
      
      const result = await Facility.delete(facilityId);
      
      logger.info(`施設削除完了: ID ${facilityId}`);
      return result;
    } catch (err) {
      logger.error(`施設削除サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設一覧の取得
   * @param {Object} options - 取得オプション
   * @returns {Promise<Array>} 施設一覧
   */
  async listFacilities(options = {}) {
    try {
      logger.info('施設一覧取得開始');
      
      const facilities = await Facility.list(options);
      
      logger.info(`施設一覧取得完了: ${facilities.length}件`);
      return facilities;
    } catch (err) {
      logger.error(`施設一覧取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 業種一覧の取得
   * @returns {Promise<Array>} 業種一覧
   */
  async getBusinessTypes() {
    try {
      logger.info('業種一覧取得開始');
      
      const businessTypes = await Facility.getBusinessTypes();
      
      logger.info(`業種一覧取得完了: ${businessTypes.length}件`);
      return businessTypes;
    } catch (err) {
      logger.error(`業種一覧取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の統計情報取得
   * @returns {Promise<Object>} 統計情報
   */
  async getFacilityStats() {
    try {
      logger.info('施設統計情報取得開始');
      
      const stats = await Facility.getStats();
      
      logger.info('施設統計情報取得完了');
      return stats;
    } catch (err) {
      logger.error(`施設統計情報取得サービスエラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設データの検証
   * @param {Object} facilityData - 検証する施設データ
   * @throws {Error} 検証エラー
   */
  validateFacilityData(facilityData) {
    if (!facilityData.facility_name) {
      throw new Error('施設名は必須です');
    }
    
    if (facilityData.facility_name.length > 100) {
      throw new Error('施設名は100文字以内で入力してください');
    }
    
    if (facilityData.business_type && facilityData.business_type.length > 50) {
      throw new Error('業種は50文字以内で入力してください');
    }
    
    if (facilityData.address && facilityData.address.length > 200) {
      throw new Error('住所は200文字以内で入力してください');
    }
    
    if (facilityData.phone) {
      const phoneRegex = /^[0-9\-+\s()]*$/;
      if (!phoneRegex.test(facilityData.phone)) {
        throw new Error('電話番号の形式が正しくありません');
      }
      
      if (facilityData.phone.length > 20) {
        throw new Error('電話番号は20文字以内で入力してください');
      }
    }
    
    if (facilityData.business_hours && facilityData.business_hours.length > 200) {
      throw new Error('営業時間は200文字以内で入力してください');
    }
    
    if (facilityData.closed_days && facilityData.closed_days.length > 100) {
      throw new Error('定休日は100文字以内で入力してください');
    }
    
    if (facilityData.official_site_url) {
      try {
        new URL(facilityData.official_site_url);
      } catch (err) {
        throw new Error('公式サイトURLの形式が正しくありません');
      }
      
      if (facilityData.official_site_url.length > 255) {
        throw new Error('公式サイトURLは255文字以内で入力してください');
      }
    }
    
    if (facilityData.gbp_url) {
      try {
        new URL(facilityData.gbp_url);
      } catch (err) {
        throw new Error('Google Business ProfileのURLの形式が正しくありません');
      }
      
      if (facilityData.gbp_url.length > 255) {
        throw new Error('Google Business ProfileのURLは255文字以内で入力してください');
      }
    }
    
    if (facilityData.additional_info && facilityData.additional_info.length > 1000) {
      throw new Error('追加情報は1000文字以内で入力してください');
    }
  }
  
  /**
   * 施設の検索
   * @param {string} searchTerm - 検索キーワード
   * @param {Object} options - 検索オプション
   * @returns {Promise<Array>} 検索結果
   */
  async searchFacilities(searchTerm, options = {}) {
    try {
      logger.info(`施設検索開始: "${searchTerm}"`);
      
      if (!searchTerm) {
        throw new Error('検索キーワードは必須です');
      }
      
      const searchOptions = {
        ...options,
        searchTerm
      };
      
      const facilities = await Facility.list(searchOptions);
      
      logger.info(`施設検索完了: "${searchTerm}" - ${facilities.length}件`);
      return facilities;
    } catch (err) {
      logger.error(`施設検索サービスエラー: ${err.message}`);
      throw err;
    }
  }
}

export default new FacilityService();
