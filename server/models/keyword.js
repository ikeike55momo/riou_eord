/**
 * キーワードモデル
 * Supabaseと連携してキーワード情報を管理します
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * キーワードモデルクラス
 */
class Keyword {
  /**
   * 施設IDに関連するすべてのキーワードを取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} カテゴリ別のキーワード
   */
  static async getByFacilityId(facilityId) {
    try {
      const { data, error } = await supabase
        .from('keywords')
        .select('*')
        .eq('facility_id', facilityId);

      if (error) {
        logger.error(`キーワード取得エラー: ${error.message}`);
        throw error;
      }

      const categorizedKeywords = {
        menu_service: [],
        environment_facility: [],
        recommended_scene: []
      };

      if (data && data.length > 0) {
        data.forEach(item => {
          if (item.category === 'menu_service') {
            categorizedKeywords.menu_service.push(item.keyword);
          } else if (item.category === 'environment_facility') {
            categorizedKeywords.environment_facility.push(item.keyword);
          } else if (item.category === 'recommended_scene') {
            categorizedKeywords.recommended_scene.push(item.keyword);
          }
        });
      }

      return categorizedKeywords;
    } catch (err) {
      logger.error(`キーワード取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * キーワードを保存（既存のキーワードを削除して新しいキーワードを追加）
   * @param {string} facilityId - 施設ID
   * @param {Object} keywordsData - カテゴリ別のキーワード
   * @returns {Promise<Object>} 保存されたキーワード
   */
  static async save(facilityId, keywordsData) {
    try {
      
      const { error: deleteError } = await supabase
        .from('keywords')
        .delete()
        .eq('facility_id', facilityId);

      if (deleteError) {
        logger.error(`既存キーワード削除エラー: ${deleteError.message}`);
        throw deleteError;
      }

      const now = new Date().toISOString();
      const keywordsToInsert = [];

      if (keywordsData.menu_service && keywordsData.menu_service.length > 0) {
        keywordsData.menu_service.forEach(keyword => {
          if (keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'menu_service',
              keyword: keyword.trim(),
              generation_timestamp: now
            });
          }
        });
      }

      if (keywordsData.environment_facility && keywordsData.environment_facility.length > 0) {
        keywordsData.environment_facility.forEach(keyword => {
          if (keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'environment_facility',
              keyword: keyword.trim(),
              generation_timestamp: now
            });
          }
        });
      }

      if (keywordsData.recommended_scene && keywordsData.recommended_scene.length > 0) {
        keywordsData.recommended_scene.forEach(keyword => {
          if (keyword.trim()) {
            keywordsToInsert.push({
              facility_id: facilityId,
              category: 'recommended_scene',
              keyword: keyword.trim(),
              generation_timestamp: now
            });
          }
        });
      }

      if (keywordsToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('keywords')
          .insert(keywordsToInsert);

        if (insertError) {
          logger.error(`キーワード保存エラー: ${insertError.message}`);
          throw insertError;
        }
      }

      logger.info(`施設ID ${facilityId} のキーワードが保存されました`);
      return keywordsData;
    } catch (err) {
      logger.error(`キーワード保存中に例外が発生: ${err.message}`);
      throw err;
    }
  }
}

export default Keyword;
