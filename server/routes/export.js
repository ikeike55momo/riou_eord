/**
 * エクスポート関連のルーティング
 */

import express from 'express';
import Facility from '../models/facility.js';
import Keyword from '../models/keyword.js';
import logger from '../utils/logger.js';
import { Parser } from 'json2csv';

const router = express.Router();

/**
 * 施設IDに関連するキーワードをCSVでエクスポート
 * GET /api/export/csv/:facilityId
 */
router.get('/csv/:facilityId', async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    const facility = await Facility.getById(facilityId);
    if (!facility) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    const keywords = await Keyword.getByFacilityId(facilityId);
    
    const csvData = [];
    
    keywords.menu_service.forEach(keyword => {
      csvData.push({
        facility_name: facility.facility_name,
        facility_id: facilityId,
        category: 'メニュー・サービス',
        keyword: keyword
      });
    });
    
    keywords.environment_facility.forEach(keyword => {
      csvData.push({
        facility_name: facility.facility_name,
        facility_id: facilityId,
        category: '環境・設備',
        keyword: keyword
      });
    });
    
    keywords.recommended_scene.forEach(keyword => {
      csvData.push({
        facility_name: facility.facility_name,
        facility_id: facilityId,
        category: 'おすすめの利用シーン',
        keyword: keyword
      });
    });
    
    if (csvData.length === 0) {
      return res.status(404).json({ error: 'エクスポートするキーワードがありません' });
    }
    
    const fields = [
      { label: '施設名', value: 'facility_name' },
      { label: '施設ID', value: 'facility_id' },
      { label: 'カテゴリ', value: 'category' },
      { label: 'キーワード', value: 'keyword' }
    ];
    
    const json2csvParser = new Parser({ fields });
    const csv = json2csvParser.parse(csvData);
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=keywords_${facilityId}.csv`);
    res.status(200).send(csv);
    
    logger.info(`施設ID ${facilityId} のキーワードがCSVでエクスポートされました`);
  } catch (err) {
    logger.error(`CSVエクスポートエラー: ${err.message}`);
    res.status(500).json({ error: 'CSVのエクスポートに失敗しました' });
  }
});

export default router;
