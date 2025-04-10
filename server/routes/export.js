/**
 * エクスポートルーティング
 * キーワードデータのエクスポート機能を提供するAPIエンドポイント
 */

import express from 'express';
import Facility from '../models/facility.js';
import Keyword from '../models/keyword.js';
import logger from '../utils/logger.js';
import { createObjectCsvStringifier } from 'csv-writer';

const router = express.Router();

/**
 * CSVエクスポート
 * GET /api/export/csv/:facilityId
 */
router.get('/csv/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    let facility;
    try {
      facility = await Facility.getById(facilityId);
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: '施設が見つかりません',
        message: '指定された施設が存在しません'
      });
    }
    
    let keywords;
    try {
      keywords = await Keyword.getByFacilityId(facilityId);
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: 'キーワードが見つかりません',
        message: '指定された施設のキーワードが存在しません'
      });
    }
    
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'facility_name', title: '施設名' },
        { id: 'business_type', title: '業種' },
        { id: 'address', title: '住所' },
        { id: 'category', title: 'カテゴリ' },
        { id: 'keyword', title: 'キーワード' }
      ]
    });
    
    const records = [];
    
    keywords.menu_service.forEach(keyword => {
      records.push({
        facility_name: facility.facility_name,
        business_type: facility.business_type || '',
        address: facility.address || '',
        category: 'メニュー・サービス',
        keyword: keyword
      });
    });
    
    keywords.environment_facility.forEach(keyword => {
      records.push({
        facility_name: facility.facility_name,
        business_type: facility.business_type || '',
        address: facility.address || '',
        category: '環境・設備',
        keyword: keyword
      });
    });
    
    keywords.recommended_scene.forEach(keyword => {
      records.push({
        facility_name: facility.facility_name,
        business_type: facility.business_type || '',
        address: facility.address || '',
        category: 'おすすめの利用シーン',
        keyword: keyword
      });
    });
    
    const csvHeader = csvStringifier.getHeaderString();
    const csvBody = csvStringifier.stringifyRecords(records);
    const csvContent = csvHeader + csvBody;
    
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=keywords_${facilityId}.csv`);
    res.send(csvContent);
    
    logger.info(`CSVエクスポートが完了しました: 施設ID ${facilityId}`);
  } catch (err) {
    logger.error(`CSVエクスポートエラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'CSVエクスポートに失敗しました',
      message: err.message
    });
  }
});

/**
 * JSONエクスポート
 * GET /api/export/json/:facilityId
 */
router.get('/json/:facilityId', async (req, res) => {
  try {
    const { facilityId } = req.params;
    
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    let facility;
    try {
      facility = await Facility.getById(facilityId);
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: '施設が見つかりません',
        message: '指定された施設が存在しません'
      });
    }
    
    let keywords;
    try {
      keywords = await Keyword.getByFacilityId(facilityId);
    } catch (err) {
      return res.status(404).json({
        success: false,
        error: 'キーワードが見つかりません',
        message: '指定された施設のキーワードが存在しません'
      });
    }
    
    const exportData = {
      facility: {
        id: facility.id,
        facility_name: facility.facility_name,
        business_type: facility.business_type,
        address: facility.address,
        phone: facility.phone,
        business_hours: facility.business_hours,
        closed_days: facility.closed_days,
        official_site_url: facility.official_site_url,
        gbp_url: facility.gbp_url,
        additional_info: facility.additional_info
      },
      keywords: keywords
    };
    
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', `attachment; filename=keywords_${facilityId}.json`);
    res.json(exportData);
    
    logger.info(`JSONエクスポートが完了しました: 施設ID ${facilityId}`);
  } catch (err) {
    logger.error(`JSONエクスポートエラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'JSONエクスポートに失敗しました',
      message: err.message
    });
  }
});

/**
 * エクスポート統計情報
 * GET /api/export/stats
 */
router.get('/stats', async (req, res) => {
  try {
    const userId = req.user?.id;
    
    if (!userId) {
      return res.status(401).json({
        success: false,
        error: '認証が必要です',
        message: 'ユーザーIDが見つかりません'
      });
    }
    
    const facilityStats = await Facility.getStats();
    
    const keywordStats = await Keyword.getStats();
    
    res.json({
      success: true,
      data: {
        facilities: facilityStats,
        keywords: keywordStats
      }
    });
    
    logger.info('エクスポート統計情報が取得されました');
  } catch (err) {
    logger.error(`エクスポート統計情報取得エラー: ${err.message}`);
    res.status(500).json({
      success: false,
      error: 'エクスポート統計情報の取得に失敗しました',
      message: err.message
    });
  }
});

export default router;
