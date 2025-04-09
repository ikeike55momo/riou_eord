// backend/middleware/security.js
import helmet from 'helmet';
import csrf from 'csurf';
import rateLimit from 'express-rate-limit';
import { validationResult } from 'express-validator';
import logger from '../utils/logger.js';

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
    validateInput,
    errorHandler
  };
};

export default setupSecurity; 