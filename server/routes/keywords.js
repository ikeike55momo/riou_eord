/**
 * キーワードルーティング
 * キーワード生成と管理のためのAPIエンドポイント
 */

import express from 'express';
import keywordService from '../services/keyword.js';
import logger from '../utils/logger.js';
import security from '../middleware/security.js';

import keywordGenerator from '../services/ai/keyword-generator.js';

const router = express.Router();

/**
 * 施設IDに基づくキーワードの取得
 * GET /api/keywords/:facilityId
 * @param security.authMiddleware - 認証ミドルウェア
 */
router.get('/:facilityId', security.authMiddleware, async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    const keywords = await keywordService.getByFacilityId(facilityId);
    
    res.json({
      success: true,
      data: keywords
    });
  } catch (err) {
    logger.error(`キーワード取得エラー: ${err.message}`);
    
    if (err.message === 'キーワードが見つかりません') {
      return res.status(404).json({
        success: false,
        error: 'キーワードが見つかりません',
        message: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: 'キーワードの取得に失敗しました',
      message: err.message
    });
  }
});

/**
 * キーワードの更新
 * PUT /api/keywords/:facilityId
 * @param security.authMiddleware - 認証ミドルウェア
 */
router.put('/:facilityId', security.authMiddleware, async (req, res) => {
  try {
    const { facilityId } = req.params;
    const keywordsData = req.body;
    const userId = req.auth.id;
    
    const keywords = await Keyword.update(facilityId, keywordsData, userId);
    
    res.json({
      success: true,
      data: keywords
    });
  } catch (err) {
    logger.error(`キーワード更新エラー: ${err.message}`);
    res.status(400).json({
      success: false,
      error: 'キーワードの更新に失敗しました',
      message: err.message
    });
  }
});

/**
 * キーワードの生成
 * POST /api/keywords/generate/:facilityId
 * @param security.authMiddleware - 認証ミドルウェア
 */
router.post('/generate/:facilityId', security.authMiddleware, async (req, res) => {
  try {
    const { facilityId } = req.params;
    const userId = req.auth.id;
    
    const keywords = await Keyword.generate(facilityId, keywordGenerator, userId);
    
    res.json({
      success: true,
      data: keywords
    });
  } catch (err) {
    logger.error(`キーワード生成エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'キーワードの生成に失敗しました',
      message: err.message
    });
  }
});

/**
 * キーワードの削除
 * DELETE /api/keywords/:facilityId
 * @param security.authMiddleware - 認証ミドルウェア
 */
router.delete('/:facilityId', security.authMiddleware, async (req, res) => {
  try {
    const { facilityId } = req.params;
    await keywordService.delete(facilityId);
    
    res.json({
      success: true,
      message: 'キーワードが削除されました'
    });
  } catch (err) {
    logger.error(`キーワード削除エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'キーワードの削除に失敗しました',
      message: err.message
    });
  }
});

/**
 * キーワードの統計情報取得
 * GET /api/keywords/stats/summary
 * @param security.authMiddleware - 認証ミドルウェア
 */
router.get('/stats/summary', security.authMiddleware, async (req, res) => {
  try {
    const stats = await Keyword.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    logger.error(`キーワード統計情報取得エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'キーワード統計情報の取得に失敗しました',
      message: err.message
    });
  }
});

export default router;
