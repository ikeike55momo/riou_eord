/**
 * ユーザーモデル
 * Supabaseと連携してユーザー情報を管理します
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * ユーザーモデルクラス
 */
class User {
  /**
   * ユーザーIDでユーザーを取得
   * @param {string} userId - ユーザーID
   * @returns {Promise<Object>} ユーザー情報
   */
  static async getById(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error(`ユーザー取得エラー: ${error.message}`);
        throw error;
      }

      return data;
    } catch (err) {
      logger.error(`ユーザー取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * メールアドレスでユーザーを取得
   * @param {string} email - メールアドレス
   * @returns {Promise<Object>} ユーザー情報
   */
  static async getByEmail(email) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error) {
        logger.error(`ユーザー取得エラー: ${error.message}`);
        throw error;
      }

      return data;
    } catch (err) {
      logger.error(`ユーザー取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 新規ユーザーを作成
   * @param {Object} userData - ユーザーデータ
   * @returns {Promise<Object>} 作成されたユーザー
   */
  static async create(userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .insert([userData])
        .select();

      if (error) {
        logger.error(`ユーザー作成エラー: ${error.message}`);
        throw error;
      }

      logger.info(`新規ユーザーが作成されました: ${userData.email}`);
      return data[0];
    } catch (err) {
      logger.error(`ユーザー作成中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザー情報を更新
   * @param {string} userId - ユーザーID
   * @param {Object} userData - 更新するユーザーデータ
   * @returns {Promise<Object>} 更新されたユーザー
   */
  static async update(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('users')
        .update(userData)
        .eq('id', userId)
        .select();

      if (error) {
        logger.error(`ユーザー更新エラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザー情報が更新されました: ${userId}`);
      return data[0];
    } catch (err) {
      logger.error(`ユーザー更新中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザーを削除
   * @param {string} userId - ユーザーID
   * @returns {Promise<void>}
   */
  static async delete(userId) {
    try {
      const { error } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (error) {
        logger.error(`ユーザー削除エラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザーが削除されました: ${userId}`);
    } catch (err) {
      logger.error(`ユーザー削除中に例外が発生: ${err.message}`);
      throw err;
    }
  }
}

export default User;
