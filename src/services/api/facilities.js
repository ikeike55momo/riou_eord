import express from 'express';
import facilitiesService from '../services/facilitiesService.js';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth.js';

const router = express.Router();

// 認証チェックミドルウェア
const requireAuth = async (req, res, next) => {
  const session = await getServerSession(req, res, authOptions);
  if (!session) {
    return res.status(401).json({ error: '認証が必要です' });
  }
  req.user = session.user;
  next();
};

// 全施設の取得
router.get('/', requireAuth, async (req, res) => {
  const result = await facilitiesService.getAllFacilities();
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(500).json({ error: '施設情報の取得に失敗しました' });
  }
});

// 特定の施設の取得
router.get('/:id', requireAuth, async (req, res) => {
  const facilityId = req.params.id;
  const result = await facilitiesService.getFacilityById(facilityId);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(404).json({ error: '施設が見つかりません' });
  }
});

// 施設の新規作成
router.post('/', requireAuth, async (req, res) => {
  const facilityData = req.body;
  const userId = req.user.id;
  
  const result = await facilitiesService.createFacility(facilityData, userId);
  
  if (result.success) {
    res.status(201).json(result.data);
  } else {
    res.status(400).json({ error: '施設の作成に失敗しました' });
  }
});

// 施設情報の更新
router.put('/:id', requireAuth, async (req, res) => {
  const facilityId = req.params.id;
  const facilityData = req.body;
  
  const result = await facilitiesService.updateFacility(facilityId, facilityData);
  
  if (result.success) {
    res.json(result.data);
  } else {
    res.status(400).json({ error: '施設の更新に失敗しました' });
  }
});

// 施設の削除
router.delete('/:id', requireAuth, async (req, res) => {
  const facilityId = req.params.id;
  
  const result = await facilitiesService.deleteFacility(facilityId);
  
  if (result.success) {
    res.status(204).send();
  } else {
    res.status(400).json({ error: '施設の削除に失敗しました' });
  }
});

export default router;
