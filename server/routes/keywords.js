/**
 * キーワード関連のルーティング
 */

import express from 'express';
import Keyword from '../models/keyword.js';
import Facility from '../models/facility.js';
import logger from '../utils/logger.js';
import { validateInput } from '../middleware/security.js';

const router = express.Router();

const keywordsValidationRules = {
  menu_service: { type: 'array' },
  environment_facility: { type: 'array' },
  recommended_scene: { type: 'array' }
};

/**
 * 施設IDに関連するキーワードを取得
 * GET /api/keywords/:facilityId
 */
router.get('/:facilityId', async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    const facility = await Facility.getById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    const keywords = await Keyword.getByFacilityId(facilityId);
    res.json(keywords);
  } catch (err) {
    logger.error(`キーワード取得エラー: ${err.message}`);
    res.status(500).json({ error: 'キーワードの取得に失敗しました' });
  }
});

/**
 * キーワードを生成
 * POST /api/keywords/generate/:facilityId
 */
router.post('/generate/:facilityId', async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    const facility = await Facility.getById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    const dummyKeywords = {
      menu_service: ['ランチセット', 'ディナーコース', '季節の料理'],
      environment_facility: ['テラス席あり', '個室完備', 'Wi-Fi利用可'],
      recommended_scene: ['デート', '接待', '家族での食事']
    };
    
    await Keyword.save(facilityId, dummyKeywords);
    
    res.json(dummyKeywords);
  } catch (err) {
    logger.error(`キーワード生成エラー: ${err.message}`);
    res.status(500).json({ error: 'キーワードの生成に失敗しました' });
  }
});

/**
 * キーワードを更新
 * PUT /api/keywords/:facilityId
 */
router.put('/:facilityId', validateInput(keywordsValidationRules), async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    const keywordsData = req.body;
    
    const facility = await Facility.getById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    const savedKeywords = await Keyword.save(facilityId, keywordsData);
    res.json(savedKeywords);
  } catch (err) {
    logger.error(`キーワード更新エラー: ${err.message}`);
    res.status(500).json({ error: 'キーワードの更新に失敗しました' });
  }
});

export default router;
