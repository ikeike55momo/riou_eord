import express from 'express';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth.js';
import { supabase } from '../supabase.js';
import { createObjectCsvStringifier } from 'csv-writer';

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

// 施設のキーワードをCSV形式でエクスポート
router.get('/csv/:facilityId', requireAuth, async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    // 施設情報の取得
    const { data: facilityData, error: facilityError } = await supabase
      .from('facilities')
      .select('facility_id, facility_name')
      .eq('facility_id', facilityId)
      .single();
    
    if (facilityError) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    // キーワードの取得
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('keywords')
      .select('*')
      .eq('facility_id', facilityId);
    
    if (keywordsError) {
      return res.status(500).json({ error: 'キーワードの取得に失敗しました', details: keywordsError });
    }
    
    // カテゴリごとにキーワードを整理
    const keywords = {
      menu_services: '',
      environment_facilities: '',
      recommended_scenes: ''
    };
    
    let generationTimestamp = null;
    
    keywordsData.forEach(item => {
      if (keywords.hasOwnProperty(item.category)) {
        keywords[item.category] = item.keywords;
      }
      
      // タイムスタンプを記録（すべてのカテゴリで同じはず）
      if (!generationTimestamp && item.generation_timestamp) {
        generationTimestamp = new Date(item.generation_timestamp);
      }
    });
    
    // CSVヘッダーとレコードの定義
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'facility_id', title: '施設ID' },
        { id: 'facility_name', title: '施設名' },
        { id: 'generation_timestamp', title: '生成日時' },
        { id: 'menu_services', title: 'メニュー・サービス' },
        { id: 'environment_facilities', title: '環境・設備' },
        { id: 'recommended_scenes', title: 'おすすめの利用シーン' }
      ]
    });
    
    // CSVレコードの作成
    const records = [{
      facility_id: facilityData.facility_id,
      facility_name: facilityData.facility_name,
      generation_timestamp: generationTimestamp ? generationTimestamp.toISOString() : '',
      menu_services: keywords.menu_services,
      environment_facilities: keywords.environment_facilities,
      recommended_scenes: keywords.recommended_scenes
    }];
    
    // CSVデータの生成
    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    
    // CSVファイルとしてダウンロード
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=facility_${facilityId}_keywords.csv`);
    res.send(csvData);
  } catch (error) {
    console.error('CSV出力エンドポイントエラー:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました', details: error.message });
  }
});

// 全施設のキーワードをCSV形式でエクスポート
router.get('/csv', requireAuth, async (req, res) => {
  try {
    // 施設情報の取得
    const { data: facilitiesData, error: facilitiesError } = await supabase
      .from('facilities')
      .select('facility_id, facility_name');
    
    if (facilitiesError) {
      return res.status(500).json({ error: '施設情報の取得に失敗しました', details: facilitiesError });
    }
    
    // キーワードの取得
    const { data: keywordsData, error: keywordsError } = await supabase
      .from('keywords')
      .select('*');
    
    if (keywordsError) {
      return res.status(500).json({ error: 'キーワードの取得に失敗しました', details: keywordsError });
    }
    
    // 施設ごとにキーワードを整理
    const facilityKeywords = {};
    
    keywordsData.forEach(item => {
      if (!facilityKeywords[item.facility_id]) {
        facilityKeywords[item.facility_id] = {
          menu_services: '',
          environment_facilities: '',
          recommended_scenes: '',
          generation_timestamp: null
        };
      }
      
      if (facilityKeywords[item.facility_id].hasOwnProperty(item.category)) {
        facilityKeywords[item.facility_id][item.category] = item.keywords;
      }
      
      // タイムスタンプを記録（すべてのカテゴリで同じはず）
      if (!facilityKeywords[item.facility_id].generation_timestamp && item.generation_timestamp) {
        facilityKeywords[item.facility_id].generation_timestamp = new Date(item.generation_timestamp);
      }
    });
    
    // CSVヘッダーとレコードの定義
    const csvStringifier = createObjectCsvStringifier({
      header: [
        { id: 'facility_id', title: '施設ID' },
        { id: 'facility_name', title: '施設名' },
        { id: 'generation_timestamp', title: '生成日時' },
        { id: 'menu_services', title: 'メニュー・サービス' },
        { id: 'environment_facilities', title: '環境・設備' },
        { id: 'recommended_scenes', title: 'おすすめの利用シーン' }
      ]
    });
    
    // CSVレコードの作成
    const records = facilitiesData.map(facility => {
      const keywords = facilityKeywords[facility.facility_id] || {
        menu_services: '',
        environment_facilities: '',
        recommended_scenes: '',
        generation_timestamp: null
      };
      
      return {
        facility_id: facility.facility_id,
        facility_name: facility.facility_name,
        generation_timestamp: keywords.generation_timestamp ? keywords.generation_timestamp.toISOString() : '',
        menu_services: keywords.menu_services,
        environment_facilities: keywords.environment_facilities,
        recommended_scenes: keywords.recommended_scenes
      };
    });
    
    // CSVデータの生成
    const csvData = csvStringifier.getHeaderString() + csvStringifier.stringifyRecords(records);
    
    // CSVファイルとしてダウンロード
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=all_facilities_keywords.csv');
    res.send(csvData);
  } catch (error) {
    console.error('CSV出力エンドポイントエラー:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました', details: error.message });
  }
});

export default router;
