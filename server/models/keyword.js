/**
 * キーワードモデル
 * キーワード情報の管理と操作を行うモデル
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * キーワードモデルクラス
 */
class Keyword {
  /**
   * 施設IDに基づくキーワードの取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} キーワード情報
   */
  async getByFacilityId(facilityId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('facility_id', facilityId)
        .order('category', { ascending: true });
      
      if (error) {
        logger.error(`キーワード取得エラー: ${error.message}`);
        throw error;
      }
      
      if (!data || data.length === 0) {
        logger.warn(`キーワードが見つかりません: 施設ID ${facilityId}`);
        throw new Error('キーワードが見つかりません');
      }
      
      const keywords = {
        menu_service: [],
        environment_facility: [],
        recommended_scene: []
      };
      
      data.forEach(item => {
        if (item.category === 'menu_service') {
          keywords.menu_service.push(item.keyword);
        } else if (item.category === 'environment_facility') {
          keywords.environment_facility.push(item.keyword);
        } else if (item.category === 'recommended_scene') {
          keywords.recommended_scene.push(item.keyword);
        }
      });
      
      return keywords;
    } catch (err) {
      logger.error(`キーワード取得処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの作成または更新
   * @param {string} facilityId - 施設ID
   * @param {Object} keywordsData - キーワードデータ
   * @param {string} userId - 作成/更新者のユーザーID
   * @returns {Promise<Object>} 作成/更新されたキーワード
   */
  async update(facilityId, keywordsData, userId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }
      
      const { menu_service, environment_facility, recommended_scene } = keywordsData;
      
      const { error: deleteError } = await supabase
        .from('keywords')
        .delete()
        .eq('facility_id', facilityId);
      
      if (deleteError) {
        logger.error(`既存キーワード削除エラー: ${deleteError.message}`);
        throw deleteError;
      }
      
      const keywordsToInsert = [];
      const timestamp = new Date();
      
      if (menu_service && Array.isArray(menu_service)) {
        menu_service.forEach(keyword => {
          if (keyword && keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'menu_service',
              keyword: keyword.trim(),
              created_by: userId,
              updated_by: userId,
              created_at: timestamp,
              updated_at: timestamp,
              generation_timestamp: timestamp
            });
          }
        });
      }
      
      if (environment_facility && Array.isArray(environment_facility)) {
        environment_facility.forEach(keyword => {
          if (keyword && keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'environment_facility',
              keyword: keyword.trim(),
              created_by: userId,
              updated_by: userId,
              created_at: timestamp,
              updated_at: timestamp,
              generation_timestamp: timestamp
            });
          }
        });
      }
      
      if (recommended_scene && Array.isArray(recommended_scene)) {
        recommended_scene.forEach(keyword => {
          if (keyword && keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'recommended_scene',
              keyword: keyword.trim(),
              created_by: userId,
              updated_by: userId,
              created_at: timestamp,
              updated_at: timestamp,
              generation_timestamp: timestamp
            });
          }
        });
      }
      
      if (keywordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('keywords')
          .insert(keywordsToInsert);
        
        if (insertError) {
          logger.error(`キーワード挿入エラー: ${insertError.message}`);
          throw insertError;
        }
      }
      
      logger.info(`キーワードが更新されました: 施設ID ${facilityId}, ${keywordsToInsert.length}件`);
      
      return {
        menu_service: menu_service || [],
        environment_facility: environment_facility || [],
        recommended_scene: recommended_scene || []
      };
    } catch (err) {
      logger.error(`キーワード更新処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの生成
   * @param {string} facilityId - 施設ID
   * @param {Object} aiService - AI生成サービス
   * @param {string} userId - 生成者のユーザーID
   * @returns {Promise<Object>} 生成されたキーワード
   */
  async generate(facilityId, aiService, userId) {
    try {
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      if (!aiService) {
        throw new Error('AIサービスは必須です');
      }
      
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }
      
      const { data: facility, error: facilityError } = await supabase
        .from('facilities')
        .select('*')
        .eq('id', facilityId)
        .single();
      
      if (facilityError) {
        logger.error(`施設情報取得エラー: ${facilityError.message}`);
        throw facilityError;
      }
      
      if (!facility) {
        logger.warn(`施設が見つかりません: ${facilityId}`);
        throw new Error('施設が見つかりません');
      }
      
      const generatedKeywords = await aiService.generateKeywords(facility);
      
      const savedKeywords = await this.update(facilityId, generatedKeywords, userId);
      
      logger.info(`キーワードが生成されました: 施設ID ${facilityId}`);
      return savedKeywords;
    } catch (err) {
      logger.error(`キーワード生成処理エラー: ${err.message}`);
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
      if (!facilityId) {
        throw new Error('施設IDは必須です');
      }
      
      const { error } = await supabase
        .from('keywords')
        .delete()
        .eq('facility_id', facilityId);
      
      if (error) {
        logger.error(`キーワード削除エラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`キーワードが削除されました: 施設ID ${facilityId}`);
      return { success: true };
    } catch (err) {
      logger.error(`キーワード削除処理エラー: ${err.message}`);
      throw err;
    }
  }
  
  /**
   * キーワードの統計情報取得
   * @returns {Promise<Object>} 統計情報
   */
  async getStats() {
    try {
      const { count: totalCount, error: countError } = await supabase
        .from('keywords')
        .select('*', { count: 'exact', head: true });
      
      if (countError) {
        logger.error(`キーワード数取得エラー: ${countError.message}`);
        throw countError;
      }
      
      const { data: categoryData, error: categoryError } = await supabase
        .from('keywords')
        .select('category');
      
      if (categoryError) {
        logger.error(`カテゴリ別キーワード数取得エラー: ${categoryError.message}`);
        throw categoryError;
      }
      
      const categoryCounts = {
        menu_service: 0,
        environment_facility: 0,
        recommended_scene: 0
      };
      
      categoryData.forEach(item => {
        if (categoryCounts[item.category] !== undefined) {
          categoryCounts[item.category]++;
        }
      });
      
      return {
        totalCount,
        categoryCounts
      };
    } catch (err) {
      logger.error(`キーワード統計情報取得処理エラー: ${err.message}`);
      throw err;
    }
  }
}

export default new Keyword();
