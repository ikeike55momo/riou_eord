/**
 * 認証サービス
 * ユーザー認証と権限管理のためのサービス
 */

import jwt from 'jsonwebtoken';
import { createClient } from '@supabase/supabase-js';
import logger from '../utils/logger.js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = '24h';

/**
 * 認証サービスクラス
 */
class AuthService {
  /**
   * ユーザー登録
   * @param {Object} userData - ユーザーデータ
   * @returns {Promise<Object>} 登録結果
   */
  async register(userData) {
    try {
      const { email, password, name, role = 'user' } = userData;
      
      if (!email || !password) {
        throw new Error('メールアドレスとパスワードは必須です');
      }
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });
      
      if (error) {
        logger.error(`ユーザー登録エラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`ユーザーが登録されました: ${email}`);
      
      const token = this.generateToken(data.user);
      
      return {
        user: data.user,
        token
      };
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
        password
      });
      
      if (error) {
        logger.error(`ログインエラー: ${error.message}`);
        throw error;
      }
      
      logger.info(`ユーザーがログインしました: ${email}`);
      
      const token = this.generateToken(data.user);
      
      return {
        user: data.user,
        token
      };
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
   * トークンの検証
   * @param {string} token - 検証するトークン
   * @returns {Object} 検証結果
   */
  verifyToken(token) {
    try {
      if (!token) {
        throw new Error('トークンが提供されていません');
      }
      
      const decoded = jwt.verify(token, JWT_SECRET);
      
      return {
        valid: true,
        decoded
      };
    } catch (err) {
      logger.error(`トークン検証エラー: ${err.message}`);
      return {
        valid: false,
        error: err.message
      };
    }
  }
  
  /**
   * JWTトークンの生成
   * @param {Object} user - ユーザー情報
   * @returns {string} 生成されたトークン
   */
  generateToken(user) {
    const payload = {
      id: user.id,
      email: user.email,
      role: user.user_metadata?.role || 'user'
    };
    
    return jwt.sign(payload, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN });
  }
  
  /**
   * 認証ミドルウェア
   * @returns {Function} Express認証ミドルウェア
   */
  authenticate() {
    return (req, res, next) => {
      try {
        const authHeader = req.headers.authorization;
        
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({
            success: false,
            error: '認証が必要です',
            message: '有効な認証トークンが提供されていません'
          });
        }
        
        const token = authHeader.split(' ')[1];
        
        const { valid, decoded, error } = this.verifyToken(token);
        
        if (!valid) {
          return res.status(401).json({
            success: false,
            error: '認証が無効です',
            message: error
          });
        }
        
        req.user = decoded;
        
        next();
      } catch (err) {
        logger.error(`認証ミドルウェアエラー: ${err.message}`);
        res.status(500).json({
          success: false,
          error: '認証処理中にエラーが発生しました',
          message: err.message
        });
      }
    };
  }
  
  /**
   * 権限チェックミドルウェア
   * @param {Array} roles - 許可するロール
   * @returns {Function} Express権限チェックミドルウェア
   */
  authorize(roles = []) {
    return (req, res, next) => {
      try {
        if (!req.user) {
          return res.status(401).json({
            success: false,
            error: '認証が必要です',
            message: 'ユーザー情報が見つかりません'
          });
        }
        
        const userRole = req.user.role;
        
        if (roles.length === 0) {
          return next();
        }
        
        if (!roles.includes(userRole)) {
          return res.status(403).json({
            success: false,
            error: 'アクセス権限がありません',
            message: 'このリソースにアクセスする権限がありません'
          });
        }
        
        next();
      } catch (err) {
        logger.error(`権限チェックミドルウェアエラー: ${err.message}`);
        res.status(500).json({
          success: false,
          error: '権限チェック中にエラーが発生しました',
          message: err.message
        });
      }
    };
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
   * @param {string} token - リセットトークン
   * @param {string} password - 新しいパスワード
   * @returns {Promise<Object>} 更新結果
   */
  async resetPassword(token, password) {
    try {
      if (!token || !password) {
        throw new Error('トークンとパスワードは必須です');
      }
      
      const { error } = await supabase.auth.updateUser({
        password
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

export default new AuthService();
