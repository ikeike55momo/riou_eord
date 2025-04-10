/**
 * 施設サービス
 * 施設情報の操作に関するビジネスロジックを提供します
 */

import Facility from '../models/facility.js';
import logger from '../utils/logger.js';

/**
 * 施設サービスクラス
 */
class FacilityService {
  /**
   * すべての施設を取得
   * @returns {Promise<Array>} 施設の配列
   */
  static async getAllFacilities() {
    try {
      return await Facility.getAll();
    } catch (err) {
      logger.error(`施設一覧取得エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設IDで施設を取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 施設情報
   */
  static async getFacilityById(facilityId) {
    try {
      const facility = await Facility.getById(facilityId);
      
      if (!facility) {
        throw new Error('施設が見つかりません');
      }
      
      return facility;
    } catch (err) {
      logger.error(`施設取得エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * 新規施設を作成
   * @param {Object} facilityData - 施設データ
   * @returns {Promise<Object>} 作成された施設
   */
  static async createFacility(facilityData) {
    try {
      if (!facilityData.facility_name) {
        throw new Error('施設名は必須です');
      }
      
      if (!facilityData.business_type) {
        throw new Error('業種は必須です');
      }
      
      return await Facility.create(facilityData);
    } catch (err) {
      logger.error(`施設作成エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設情報を更新
   * @param {string} facilityId - 施設ID
   * @param {Object} facilityData - 更新する施設データ
   * @returns {Promise<Object>} 更新された施設
   */
  static async updateFacility(facilityId, facilityData) {
    try {
      const existingFacility = await Facility.getById(facilityId);
      if (!existingFacility) {
        throw new Error('施設が見つかりません');
      }
      
      if (!facilityData.facility_name) {
        throw new Error('施設名は必須です');
      }
      
      if (!facilityData.business_type) {
        throw new Error('業種は必須です');
      }
      
      return await Facility.update(facilityId, facilityData);
    } catch (err) {
      logger.error(`施設更新エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設を削除
   * @param {string} facilityId - 施設ID
   * @returns {Promise<void>}
   */
  static async deleteFacility(facilityId) {
    try {
      const existingFacility = await Facility.getById(facilityId);
      if (!existingFacility) {
        throw new Error('施設が見つかりません');
      }
      
      await Facility.delete(facilityId);
    } catch (err) {
      logger.error(`施設削除エラー: ${err.message}`);
      throw err;
    }
  }
}

export default FacilityService;
