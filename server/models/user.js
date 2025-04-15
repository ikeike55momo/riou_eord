/**
 * ユーザーモデル
 * ユーザー認証と権限管理のためのモデル
 */

import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

/**
 * @class
 * ユーザーモデルクラス
 */
class User {
  /**
   * ユーザーの作成
   * @param {Object} userData - ユーザーデータ { name, email, password, role }
   * @returns {Promise<Object>} 作成されたユーザーデータ
   */
  async register(userData) {
    try {
      const { name, email, password, role = 'user'} = userData;

      if (!name || !email || !password) {
        throw new Error('名前、メールアドレス、パスワードは必須です');
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: {
            name: name,
            role: role,
          },
        },
      });

      if (authError) {
        logger.error(`ユーザー登録エラー: ${authError.message}`);
        throw authError;
      }

      const newUser = authData.user;

      const { data, error } = await supabase.from('profiles').insert({ auth_id: newUser.id, name: name, email:email, role:role }).select().single();

      if (error) {
        logger.error(`ユーザー登録エラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザーが登録されました: ${email} (ID: ${newUser.id})`);
      return data;
    } catch (err) {
      logger.error(`ユーザー登録処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザーログイン
   * @param {string} email - メールアドレス
   * @param {string} password - パスワード
   * @returns {Promise<Object>} ログイン結果
   */
  async login(email, password) {
    try {
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードは必須です');
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,

        password,
      });

      if (error) {
        logger.error(`ログインエラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`ユーザーがログインしました: ${email}`);
      return data;
    } catch (err) {
      logger.error(`ログイン処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザーログアウト
   * @param {string} token - 認証トークン
   * @returns {Promise<Object>} ログアウト結果
   */
  async logout(token) {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logger.error(`ログアウトエラー: ${error.message}`);
        throw error;
      }

      logger.info('ユーザーがログアウトしました');
      return { success: true };
    } catch (err) {
      logger.error(`ログアウト処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザー情報の取得
   * @param {string} userId - ユーザーID
   * @returns {Promise<Object>} ユーザー情報
   */
  async getById(userId) {
    try {
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }

      const { data, error } = await supabase.from('profiles').select('*').eq('auth_id', userId).single();

      if (error) {
        logger.error(`ユーザー情報取得エラー: ${error.message}`);
        throw error;
      }

      if (!data) {
        logger.warn(`ユーザーが見つかりません: ${userId}`);
      }
      
      return data;
    } catch (err) {
      logger.error(`ユーザー情報取得処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザー情報の更新
   * @param {string} userId - ユーザーID
   * @param {Object} userData - 更新するユーザーデータ { name, email, role }
   * @returns {Promise<Object>} 更新結果
   */
  async update(userId, userData) {
    try {
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }

      const { name, email, role } = userData;
      const updateData = { updated_at: new Date().toISOString() };

      if (name !== undefined) updateData.name = name;

      if (role !== undefined) updateData.role = role;

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('auth_id', userId)
        .select()
        .single();

      if (error) {
        logger.error(`ユーザー情報更新エラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザー情報が更新されました: ${userId}`);
      return data;
    } catch (err) {
      logger.error(`ユーザー情報更新処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * ユーザーの削除
   * @param {string} userId - ユーザーID
   * @returns {Promise<Object>} 削除結果
   */
  async delete(userId) {
    try {
      if (!userId) {
        throw new Error('ユーザーIDは必須です');
      }

      const { error } = await supabase.auth.admin.deleteUser(userId);

      if (error) {
        logger.error(`ユーザー削除エラー: ${error.message}`);
        throw error;
      }

      logger.info(`ユーザーが削除されました: ${userId}`);
      return { success: true };
    } catch (err) {
      logger.error(`ユーザー削除処理エラー: ${err.message}`);
      throw err;
    }
  }
  /**
   * ユーザー一覧の取得
   * @returns {Promise<Array>} ユーザー一覧
   */
  async list() {
    try {
      const { data, error } = await supabase.from('profiles').select('*');

      if (error) {
        logger.error(`ユーザー一覧取得エラー: ${error.message}`);
        throw error;
      }

      return data || [];
    } catch (err) {
      logger.error(`ユーザー一覧取得処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * パスワードリセットメールの送信
   * @param {string} email - メールアドレス
   * @returns {Promise<Object>} 送信結果
   */
  async sendPasswordResetEmail(email) { 
    try {
      if (!email) {
        throw new Error('メールアドレスは必須です');
      }

      const { error } = await supabase.auth.resetPasswordForEmail(email);

      if (error) {
        logger.error(`パスワードリセットメール送信エラー: ${error.message}`);
        throw error;
      }

      logger.info(`パスワードリセットメールが送信されました: ${email}`);
      return { success: true };
    } catch (err) {
      logger.error(`パスワードリセットメール送信処理エラー: ${err.message}`);
      throw err;
    }
  }

  /**
   * パスワードの更新
   * @param {string} password - 新しいパスワード
   * @returns {Promise<Object>} 更新結果
   */
  async updatePassword(password) {
     try {
      if (!password) {
        throw new Error('パスワードは必須です');
      }

      const { error } = await supabase.auth.updateUser({
        password,
      });

      if (error) {
        logger.error(`パスワード更新エラー: ${error.message}`);
        throw error;
      }
      
      logger.info('パスワードが更新されました');
      return { success: true };
    } catch (err) {
      logger.error(`パスワード更新処理エラー: ${err.message}`);
      throw err;
    }
  }
}

export default new User();
