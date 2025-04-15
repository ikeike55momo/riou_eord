ba/**
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
        concept,
        atmosphere,
        unique_strength,
        menu_services,
        average_price,
        address,
        phone_number,
        website_url,
        google_map_url,
        business_hours,
        regular_holiday,
        parking,
        number_of_seats,
        private_room,
        smoking,
        pet_friendly,
        wifi,
        payment_options,
        official_site_url
      } = facilityData;
      const { phone, barrier_free, additional_info, gbp_url } = facilityData;
      const newFacility = {
        address,
        phone_number: phone || null,
        business_hours:business_hours || null,
        official_site_url,
        additional_info
       ,
        business_type: business_type || null,
        concept: concept || null,
        atmosphere: atmosphere || null,
        unique_strength: unique_strength || null,
        average_price: average_price || null,
        address: address || null,
        phone_number: phone_number || null,
            google_map_url: google_map_url || null,
            regular_holiday: regular_holiday || null,
            parking: parking || null,
            number_of_seats: number_of_seats || null,
            private_room: private_room || null,
            smoking: smoking || null,
            pet_friendly: pet_friendly || null,
            wifi: wifi || null,
            payment_options: payment_options || null,
            barrier_free: barrier_free || null,
        gbp_url: gbp_url || null,
        menu_services: menu_services || null,
        official_site_url: official_site_url || null,
        created_by: userId,
        updated_by: userId,

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
        facility_id,
        facility_name,
        business_type,
        concept,
        atmosphere,
        unique_strength,
        menu_services,
        average_price,
        address,
        phone_number,
        website_url,
        google_map_url,
        business_hours,
        regular_holiday,
        parking,
        number_of_seats,
        private_room,
        smoking,
        pet_friendly,
        wifi,
        payment_options,
        barrier_free,
        additional_info,
        gbp_url,
        official_site_url
      } = facilityData;
      const updateData = {
            updated_by: userId,
            updated_at: new Date().toISOString()
      };
      
      
      if (facility_name !== undefined) updateData.facility_name = facility_name;
      if (business_type !== undefined) updateData.business_type = business_type;
        if (concept !== undefined) updateData.concept = concept;
        if (atmosphere !== undefined) updateData.atmosphere = atmosphere;
        if (unique_strength !== undefined) updateData.unique_strength = unique_strength;
        if (menu_services !== undefined) updateData.menu_services = menu_services;
        if (average_price !== undefined) updateData.average_price = average_price;
      if (address !== undefined) updateData.address = address;
        if (phone_number !== undefined) updateData.phone_number = phone_number;
        if (website_url !== undefined) updateData.website_url = website_url;
        if (google_map_url !== undefined) updateData.google_map_url = google_map_url;
        if (business_hours !== undefined) updateData.business_hours = business_hours;
        if (regular_holiday !== undefined) updateData.regular_holiday = regular_holiday;
        if (parking !== undefined) updateData.parking = parking;
        if (number_of_seats !== undefined) updateData.number_of_seats = number_of_seats;
        if (private_room !== undefined) updateData.private_room = private_room;
        if (smoking !== undefined) updateData.smoking = smoking;
        if (pet_friendly !== undefined) updateData.pet_friendly = pet_friendly;
        if (wifi !== undefined) updateData.wifi = wifi;
            if (payment_options !== undefined) updateData.payment_options = payment_options;
        if (barrier_free !== undefined) updateData.barrier_free = barrier_free;

      if (additional_info !== undefined) updateData.additional_info = additional_info;      
      if (official_site_url !== undefined) updateData.official_site_url = official_site_url;
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
