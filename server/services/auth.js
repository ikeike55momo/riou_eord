/**
 * 認証サービス
 * NextAuthと連携してユーザー認証を管理します
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * 認証サービスクラス
 */
class AuthService {
  /**
   * メールアドレスとパスワードでログイン
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   * @returns {Promise<Object>} ログイン結果
   */
  static async login(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        logger.error(`ログインエラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザーがログインしました: ${email}`);
      return data;
    } catch (err) {
      logger.error(`ログイン中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * ログアウト
   * @returns {Promise<void>}
   */
  static async logout() {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error(`ログアウトエラー: ${error.message}`);
        throw error;
      }

      logger.info('ユーザーがログアウトしました');
    } catch (err) {
      logger.error(`ログアウト中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 現在のセッションを取得
   * @returns {Promise<Object>} セッション情報
   */
  static async getSession() {
    try {
      const { data, error } = await supabase.auth.getSession();

      if (error) {
        logger.error(`セッション取得エラー: ${error.message}`);
        throw error;
      }

      return data;
    } catch (err) {
      logger.error(`セッション取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 現在のユーザーを取得
   * @returns {Promise<Object>} ユーザー情報
   */
  static async getCurrentUser() {
    try {
      const { data, error } = await supabase.auth.getUser();

      if (error) {
        logger.error(`ユーザー取得エラー: ${error.message}`);
        throw error;
      }

      return data.user;
    } catch (err) {
      logger.error(`ユーザー取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザーのロールを確認
   * @param {string} userId - ユーザーID
   * @returns {Promise<string>} ユーザーロール
   */
  static async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from('users')
        .select('role')
        .eq('id', userId)
        .single();

      if (error) {
        logger.error(`ユーザーロール取得エラー: ${error.message}`);
        throw error;
      }

      return data.role;
    } catch (err) {
      logger.error(`ユーザーロール取得中に例外が発生: ${err.message}`);
      throw err;
    }
  }

  /**
   * 管理者権限を確認
   * @param {string} userId - ユーザーID
   * @returns {Promise<boolean>} 管理者かどうか
   */
  static async isAdmin(userId) {
    try {
      const role = await this.getUserRole(userId);
      return role === 'ADMIN';
    } catch (err) {
      logger.error(`管理者権限確認中に例外が発生: ${err.message}`);
      return false;
    }
  }
}

export default AuthService;
