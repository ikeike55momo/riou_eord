/**
 * 施設モデル
 * 施設情報の管理と操作を行うモデル
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 施設モデルクラス
 */
class Facility {
  /**
   * 施設の作成
   * @param {Object} facilityData - 施設データ
   * @param {string} userId - 作成者のユーザーID
   * @returns {Promise<Object>} 作成された施設
   */
  async create(facilityData, userId) {
    try {
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }
      
      const {
        facility_name,
        business_type,
        address,
        phone,
        business_hours,
        closed_days,
        official_site_url,
        gbp_url,
        additional_info
      } = facilityData;
      
      if (!facility_name) {
        throw new Error('施設名は必須です');
      }
      
      const newFacility = {
        facility_name,
        business_type: business_type || null,
        address: address || null,
        phone: phone || null,
        business_hours: business_hours || null,
        closed_days: closed_days || null,
        official_site_url: official_site_url || null,
        gbp_url: gbp_url || null,
        additional_info: additional_info || null,
        created_by: userId,
        updated_by: userId,
        created_at: new Date(),
        updated_at: new Date()
      };
      
      const { data, error } = await supabase
        .from('facilities')
        .insert(newFacility)
        .select()
        .single();
      
      if (error) {
        logger.error(`施設作成エラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`施設が作成されました: ${facility_name} (ID: ${data.id})`);
      return data;
    } catch (err) {
      logger.error(`施設作成処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 施設情報
   */
  async getById(facilityId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
      
      if (error) {
        logger.error(`施設取得エラー: ${error.message}`);
        throw error;
      }
      
      if (!data) {
        logger.warn(`施設が見つかりません: ${facilityId}`);
        throw new Error('施設が見つかりません');
      }
      
      return data;
    } catch (err) {
      logger.error(`施設取得処理エラー: ${err.message}`);
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
  async update(facilityId, facilityData, userId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }
      
      const {
        facility_name,
        business_type,
        address,
        phone,
        business_hours,
        closed_days,
        official_site_url,
        gbp_url,
        additional_info
      } = facilityData;
      
      const updateData = {
        updated_by: userId,
        updated_at: new Date()
      };
      
      if (facility_name !== undefined) updateData.facility_name = facility_name;
      if (business_type !== undefined) updateData.business_type = business_type;
      if (address !== undefined) updateData.address = address;
      if (phone !== undefined) updateData.phone = phone;
      if (business_hours !== undefined) updateData.business_hours = business_hours;
      if (closed_days !== undefined) updateData.closed_days = closed_days;
      if (official_site_url !== undefined) updateData.official_site_url = official_site_url;
      if (gbp_url !== undefined) updateData.gbp_url = gbp_url;
      if (additional_info !== undefined) updateData.additional_info = additional_info;
      
      const { data, error } = await supabase
        .from('facilities')
        .update(updateData)
        .eq('id', facilityId)
        .select()
        .single();
      
      if (error) {
        logger.error(`施設更新エラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`施設が更新されました: ${data.facility_name} (ID: ${facilityId})`);
      return data;
    } catch (err) {
      logger.error(`施設更新処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の削除
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 削除結果
   */
  async delete(facilityId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      const { error: keywordError } = await supabase
        .from('keywords')
        .delete()
        .eq('facility_id', facilityId);
      
      if (keywordError) {
        logger.error(`関連キーワード削除エラー: ${keywordError.message}`);
        throw keywordError;
      }
      
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('id', facilityId);
      
      if (error) {
        logger.error(`施設削除エラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`施設が削除されました: ${facilityId}`);
      return { success: true };
    } catch (err) {
      logger.error(`施設削除処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設一覧の取得
   * @param {Object} options - 取得オプション
   * @returns {Promise<Array>} 施設一覧
   */
  async list(options = {}) {
    try {
      const { limit = 100, offset = 0, userId, businessType, searchTerm } = options;
      
      let query = supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (userId) {
        query = query.eq('created_by', userId);
      }
      
      if (businessType) {
        query = query.eq('business_type', businessType);
      }
      
      if (searchTerm) {
        query = query.or(`facility_name.ilike.%${searchTerm}%,address.ilike.%${searchTerm}%`);
      }
      
      query = query.range(offset, offset + limit - 1);
      
      const { data, error } = await query;
      
      if (error) {
        logger.error(`施設一覧取得エラー: ${error.message}`);
        throw error;
      }
      
      return data || [];
    } catch (err) {
      logger.error(`施設一覧取得処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 業種一覧の取得
   * @returns {Promise<Array>} 業種一覧
   */
  async getBusinessTypes() {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('business_type')
        .not('business_type', 'is', null);
      
      if (error) {
        logger.error(`業種一覧取得エラー: ${error.message}`);
        throw error;
      }
      
      const businessTypes = [...new Set(data.map(item => item.business_type))];
      return businessTypes;
    } catch (err) {
      logger.error(`業種一覧取得処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * 施設の統計情報取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    try {
      const { count: totalCount, error: countError } = await supabase
        .from('facilities')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error(`施設数取得エラー: ${countError.message}`);
        throw countError;
      }
      
      const { data: businessTypeData, error: businessTypeError } = await supabase
        .from('facilities')
        .select('business_type')
        .not('business_type', 'is', null);
      
      if (businessTypeError) {
        logger.error(`業種別施設数取得エラー: ${businessTypeError.message}`);
        throw businessTypeError;
      }
      
      const businessTypeCounts = {};
      businessTypeData.forEach(item => {
        const type = item.business_type;
        businessTypeCounts[type] = (businessTypeCounts[type] || 0) + 1;
      });
      
      return {
        totalCount,
        businessTypeCounts
      };
    } catch (err) {
      logger.error(`施設統計情報取得処理エラー: ${err.message}`);
      throw err;
    }
  }
}

export default new Facility();
