import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer } from 'http';
import dotenv from 'dotenv';
import facilitiesRoutes from './routes/facilities.js';
import keywordsRoutes from './routes/keywords.js';
import exportRoutes from './routes/export.js';

// セキュリティミドルウェアとロガーのインポート
import setupSecurity from './middleware/security.js';
import logger from './utils/logger.js';

// 環境変数の読み込み
dotenv.config();

// Expressアプリケーションの作成
const app = express();
const PORT = process.env.PORT || 3000;

// ミドルウェアの設定
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// CORSの設定
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? 'https://keyword-suggestion-app.netlify.app' 
    : 'http://localhost:5173',
  credentials: true
}));

// セキュリティミドルウェアの設定
const { csrfProtection, validateInput, errorHandler } = setupSecurity(app);

// ルーティングの設定
app.use('/api/facilities', facilitiesRoutes);
app.use('/api/keywords', keywordsRoutes);
app.use('/api/export', exportRoutes);

// ヘルスチェックエンドポイント
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// HTTPサーバーの作成
const server = createServer(app);

// エラーハンドリングミドルウェア
app.use(errorHandler);

// サーバーの起動
server.listen(PORT, () => {
  logger.info(`サーバーが起動しました: http://localhost:${PORT}`);
});

export default app; 