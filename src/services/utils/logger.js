// backend/utils/logger.js
import winston from 'winston';
import path from 'path';
import { fileURLToPath } from 'url';

// __dirnameの取得（ES Modules用）
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ログレベルの定義
const levels = {
  error: 0,
  warn: 1,
  info: 2,
  http: 3,
  debug: 4,
};

// ログレベルの選択（本番環境ではinfo以上、開発環境ではdebug以上）
const level = () => {
  const env = process.env.NODE_ENV || 'development';
  return env === 'production' ? 'info' : 'debug';
};

// ログのフォーマット設定
const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  winston.format.printf(
    (info) => `${info.timestamp} ${info.level}: ${info.message}${info.meta ? ' ' + JSON.stringify(info.meta) : ''}`
  )
);

// トランスポーターの設定
const transports = [
  // コンソール出力
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(
        (info) => `${info.timestamp} ${info.level}: ${info.message}${info.meta ? ' ' + JSON.stringify(info.meta) : ''}`
      )
    ),
  }),
  // エラーログファイル
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/error.log'),
    level: 'error',
  }),
  // 全ログファイル
  new winston.transports.File({
    filename: path.join(__dirname, '../logs/combined.log'),
  }),
];

// ロガーの作成
const logger = winston.createLogger({
  level: level(),
  levels,
  format,
  transports,
});

// メタデータを追加するためのラッパー関数
const logWithMeta = (level, message, meta = {}) => {
  logger[level](message, { meta });
};

// エクスポートするロガーインターフェース
const loggerInterface = {
  error: (message, meta) => logWithMeta('error', message, meta),
  warn: (message, meta) => logWithMeta('warn', message, meta),
  info: (message, meta) => logWithMeta('info', message, meta),
  http: (message, meta) => logWithMeta('http', message, meta),
  debug: (message, meta) => logWithMeta('debug', message, meta),
};

export default loggerInterface;
