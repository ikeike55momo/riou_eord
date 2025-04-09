/**
 * 施設関連のルーティング
 */

import express from 'express';
import Facility from '../models/facility.js';
import logger from '../utils/logger.js';
import { validateInput } from '../middleware/security.js';

const router = express.Router();

const facilityValidationRules = {
  facility_name: { type: 'string', required: true },
  business_type: { type: 'string', required: true },
};

/**
 * すべての施設を取得
 * GET /api/facilities
 */
router.get('/', async (req, res) => {
  try {
    const facilities = await Facility.getAll();
    res.json(facilities);
  } catch (err) {
    logger.error(`施設一覧取得エラー: ${err.message}`);
    res.status(500).json({ error: '施設情報の取得に失敗しました' });
  }
});

/**
 * 施設IDで施設を取得
 * GET /api/facilities/:id
 */
router.get('/:id', async (req, res) => {
  try {
    const facilityId = req.params.id;
    const facility = await Facility.getById(facilityId);
    
    if (!facility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    res.json(facility);
  } catch (err) {
    logger.error(`施設取得エラー: ${err.message}`);
    res.status(500).json({ error: '施設情報の取得に失敗しました' });
  }
});

/**
 * 新規施設を作成
 * POST /api/facilities
 */
router.post('/', validateInput(facilityValidationRules), async (req, res) => {
  try {
    const facilityData = req.body;
    const newFacility = await Facility.create(facilityData);
    
    res.status(201).json(newFacility);
  } catch (err) {
    logger.error(`施設作成エラー: ${err.message}`);
    res.status(500).json({ error: '施設の作成に失敗しました' });
  }
});

/**
 * 施設情報を更新
 * PUT /api/facilities/:id
 */
router.put('/:id', validateInput(facilityValidationRules), async (req, res) => {
  try {
    const facilityId = req.params.id;
    const facilityData = req.body;
    
    const existingFacility = await Facility.getById(facilityId);
    if (!existingFacility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    const updatedFacility = await Facility.update(facilityId, facilityData);
    res.json(updatedFacility);
  } catch (err) {
    logger.error(`施設更新エラー: ${err.message}`);
    res.status(500).json({ error: '施設情報の更新に失敗しました' });
  }
});

/**
 * 施設を削除
 * DELETE /api/facilities/:id
 */
router.delete('/:id', async (req, res) => {
  try {
    const facilityId = req.params.id;
    
    const existingFacility = await Facility.getById(facilityId);
    if (!existingFacility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    await Facility.delete(facilityId);
    res.status(204).send();
  } catch (err) {
    logger.error(`施設削除エラー: ${err.message}`);
    res.status(500).json({ error: '施設の削除に失敗しました' });
  }
});

export default router;
