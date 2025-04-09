/**
 * 施設ルーティング
 * 施設情報のCRUD操作を提供するAPIエンドポイント
 */

import express from 'express';
import Facility from '../models/facility.js';
import logger from '../utils/logger.js';

const router = express.Router();

/**
 * 施設一覧の取得
 * GET /api/facilities
 */
router.get('/', async (req, res) => {
  try {
    const { limit, offset, business_type, search } = req.query;
    
    const userId = req.user?.id;
    
    const options = {
      limit: limit ? parseInt(limit, 10) : 100,
      offset: offset ? parseInt(offset, 10) : 0
    };
    
    if (business_type) {
      options.businessType = business_type;
    }
    
    if (search) {
      options.searchTerm = search;
    }
    
    const facilities = await Facility.list(options);
    
    res.json({
      success: true,
      data: facilities,
      meta: {
        total: facilities.length,
        limit: options.limit,
        offset: options.offset
      }
    });
  } catch (err) {
    logger.error(`施設一覧取得エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: '施設一覧の取得に失敗しました',
      message: err.message
    });
  }
});

/**
 * 施設の取得
 * GET /api/facilities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const facility = await Facility.getById(id);
    
    res.json({
      success: true,
      data: facility
    });
  } catch (err) {
    logger.error(`施設取得エラー: ${err.message}`);
    
    if (err.message === '施設が見つかりません') {
      return res.status(404).json({
        success: false,
        error: '施設が見つかりません',
        message: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: '施設の取得に失敗しました',
      message: err.message
    });
  }
});

/**
 * 施設の作成
 * POST /api/facilities
 */
router.post('/', async (req, res) => {
  try {
    const facilityData = req.body;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    const facility = await Facility.create(facilityData, userId);
    
    res.status(201).json({
      success: true,
      data: facility
    });
  } catch (err) {
    logger.error(`施設作成エラー: ${err.message}`);
    res.status(400).json({
      success: false,
      error: '施設の作成に失敗しました',
      message: err.message
    });
  }
});

/**
 * 施設の更新
 * PUT /api/facilities/:id
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const facilityData = req.body;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    const facility = await Facility.update(id, facilityData, userId);
    
    res.json({
      success: true,
      data: facility
    });
  } catch (err) {
    logger.error(`施設更新エラー: ${err.message}`);
    
    if (err.message === '施設が見つかりません') {
      return res.status(404).json({
        success: false,
        error: '施設が見つかりません',
        message: err.message
      });
    }
    
    res.status(400).json({
      success: false,
      error: '施設の更新に失敗しました',
      message: err.message
    });
  }
});

/**
 * 施設の削除
 * DELETE /api/facilities/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    await Facility.delete(id);
    
    res.json({
      success: true,
      message: '施設が削除されました'
    });
  } catch (err) {
    logger.error(`施設削除エラー: ${err.message}`);
    
    if (err.message === '施設が見つかりません') {
      return res.status(404).json({
        success: false,
        error: '施設が見つかりません',
        message: err.message
      });
    }
    
    res.status(500).json({
      success: false,
      error: '施設の削除に失敗しました',
      message: err.message
    });
  }
});

/**
 * 業種一覧の取得
 * GET /api/facilities/business-types
 */
router.get('/business-types/list', async (req, res) => {
  try {
    const businessTypes = await Facility.getBusinessTypes();
    
    res.json({
      success: true,
      data: businessTypes
    });
  } catch (err) {
    logger.error(`業種一覧取得エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: '業種一覧の取得に失敗しました',
      message: err.message
    });
  }
});

/**
 * 施設の統計情報取得
 * GET /api/facilities/stats
 */
router.get('/stats/summary', async (req, res) => {
  try {
    const stats = await Facility.getStats();
    
    res.json({
      success: true,
      data: stats
    });
  } catch (err) {
    logger.error(`施設統計情報取得エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: '施設統計情報の取得に失敗しました',
      message: err.message
    });
  }
});

export default router;
