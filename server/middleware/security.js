// backend/middleware/security.js
import helmet from 'helmet';
import csrf from 'csurf';
import { createClient } from '@supabase/supabase-js';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_KEY);

// CSRFミドルウェア
const csrfProtection = csrf({ cookie: true });

// レート制限ミドルウェア
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分
  max: 100, // 15分あたり100リクエストまで
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'リクエスト数が多すぎます。しばらく経ってから再試行してください。' }
});

/**
 * ユーザー認証ミドルウェア
 * リクエストヘッダーからトークンを検証し、ユーザー情報をreq.userに設定する。
 */
const authMiddleware = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) {
      logger.warn('認証トークンがありません', { path: req.path, ip: req.ip });
      return res.status(401).json({ error: '認証が必要です' });
    }

    const { data, error } = await supabase.auth.getUser(token);
    
    if (error || !data.user) {
      logger.error(`トークン検証エラー: ${error?.message}`, { path: req.path, ip: req.ip });
      return res.status(401).json({ error: '認証に失敗しました' });
    }
    
    req.auth = data.user;

    const { data: profile, error: profileError } = await supabase.from('profiles').select('role').eq('auth_id', data.user.id).single();

    if (profileError) {
      logger.error(`ユーザープロファイル取得エラー: ${profileError.message}`, { path: req.path, ip: req.ip });
      return res.status(401).json({ error: '認証に失敗しました' });
    }
    
    if (profile.role !== 'admin') {
      logger.warn('管理者権限が必要です', { path: req.path, ip: req.ip, user: data.user.id });
      return res.status(403).json({ error: '管理者権限が必要です' });
    }
    next();
  } catch (err) {
    logger.error(`認証ミドルウェアエラー: ${err.message}`, { path: req.path, ip: req.ip });
    res.status(500).json({ error: 'サーバーエラーが発生しました' });
  }
};

// 入力バリデーションチェックミドルウェア
const validateInput = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    logger.warn('入力バリデーションエラー', { errors: errors.array(), path: req.path });
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

// エラーハンドリングミドルウェア
const errorHandler = (err, req, res, next) => {
  // CSRFエラーの処理
  if (err.code === 'EBADCSRFTOKEN') {
    logger.error('CSRFトークンが無効です', { path: req.path, ip: req.ip });
    return res.status(403).json({ error: 'フォームの有効期限が切れました。ページを更新してください。' });
  }

  // その他のエラー処理
  const statusCode = err.statusCode || 500;
  const message = err.message || 'サーバーエラーが発生しました';
  
  // 本番環境ではスタックトレースを表示しない
  const error = {
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  };
  
  // エラーをログに記録
  logger.error(message, { 
    statusCode, 
    path: req.path, 
    method: req.method,
    ip: req.ip,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
  
  res.status(statusCode).json({ error: message });
};

// セキュリティミドルウェアの設定
const setupSecurity = (app) => {
  // Helmetによる基本的なセキュリティヘッダー設定
  app.use(helmet());
  
  // Content-Security-Policyの設定
  app.use(
    helmet.contentSecurityPolicy({
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'", "'unsafe-inline'"],
        styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
        fontSrc: ["'self'", "https://fonts.gstatic.com"],
        imgSrc: ["'self'", "data:", "https:"],
        connectSrc: ["'self'", "https://dstigzldesimivihsryn.supabase.co"],
      },
    })
  );
  
  // レート制限の適用
  app.use('/api/', apiLimiter);
  
  return {
    csrfProtection,
    authMiddleware,
    validateInput,
    errorHandler
  };
};

export default setupSecurity; 