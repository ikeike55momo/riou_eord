/**
 * 施設モデル
 * Supabaseと連携して施設情報を管理します
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 施設モデルクラス
 */
class Facility {
  /**
   * すべての施設を取得
   * @returns {Promise<Array>} 施設の配列
   */
  static async getAll() {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        logger.error(`施設一覧取得エラー: ${error.message}`);
        throw error;
      }

      return data;
    } catch (err) {
      logger.error(`施設一覧取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設IDで施設を取得
   * @param {string} facilityId - 施設ID
   * @returns {Promise<Object>} 施設情報
   */
  static async getById(facilityId) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('facility_id', facilityId)
        .single();

      if (error) {
        logger.error(`施設取得エラー: ${error.message}`);
        throw error;
      }

      return data;
    } catch (err) {
      logger.error(`施設取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 新規施設を作成
   * @param {Object} facilityData - 施設データ
   * @returns {Promise<Object>} 作成された施設
   */
  static async create(facilityData) {
    try {
      const now = new Date().toISOString();
      const dataWithTimestamps = {
        ...facilityData,
        created_at: now,
        updated_at: now
      };

      const { data, error } = await supabase
        .from('facilities')
        .insert([dataWithTimestamps])
        .select();

      if (error) {
        logger.error(`施設作成エラー: ${error.message}`);
        throw error;
      }

      logger.info(`新規施設が作成されました: ${facilityData.facility_name}`);
      return data[0];
    } catch (err) {
      logger.error(`施設作成中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設情報を更新
   * @param {string} facilityId - 施設ID
   * @param {Object} facilityData - 更新する施設データ
   * @returns {Promise<Object>} 更新された施設
   */
  static async update(facilityId, facilityData) {
    try {
      const dataWithTimestamp = {
        ...facilityData,
        updated_at: new Date().toISOString()
      };

      const { data, error } = await supabase
        .from('facilities')
        .update(dataWithTimestamp)
        .eq('facility_id', facilityId)
        .select();

      if (error) {
        logger.error(`施設更新エラー: ${error.message}`);
        throw error;
      }

      logger.info(`施設情報が更新されました: ${facilityId}`);
      return data[0];
    } catch (err) {
      logger.error(`施設更新中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 施設を削除
   * @param {string} facilityId - 施設ID
   * @returns {Promise<void>}
   */
  static async delete(facilityId) {
    try {
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
        .eq('facility_id', facilityId);

      if (error) {
        logger.error(`施設削除エラー: ${error.message}`);
        throw error;
      }

      logger.info(`施設が削除されました: ${facilityId}`);
    } catch (err) {
      logger.error(`施設削除中に例外が発生: ${err.message}`);
      throw err;
    }
  }
}

export default Facility;
