import express from 'express';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/auth.js';
import aiAgentService from '../services/aiAgentService.js';
import { supabase } from '../supabase.js';

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

// キーワード生成プロセスを開始
router.post('/generate/:facilityId', requireAuth, async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    // 施設情報の取得
    const { data: facilityData, error: facilityError } = await supabase
      .from('facilities')
      .select('*')
      .eq('facility_id', facilityId)
      .single();
    
    if (facilityError) {
      return res.status(404).json({ error: '施設が見つかりません' });
    }
    
    // キーワード生成プロセスを開始
    const result = await aiAgentService.processKeywordGeneration(facilityData);
    
    if (!result.success) {
      return res.status(500).json({ error: 'キーワード生成に失敗しました', details: result.error });
    }
    
    // 生成されたキーワードをデータベースに保存
    const timestamp = new Date();
    const keywordsToSave = [
      {
        facility_id: facilityId,
        category: 'menu_services',
        keywords: result.data.keywords.menu_services,
        generation_timestamp: timestamp
      },
      {
        facility_id: facilityId,
        category: 'environment_facilities',
        keywords: result.data.keywords.environment_facilities,
        generation_timestamp: timestamp
      },
      {
        facility_id: facilityId,
        category: 'recommended_scenes',
        keywords: result.data.keywords.recommended_scenes,
        generation_timestamp: timestamp
      }
    ];
    
    // 既存のキーワードを削除（上書き）
    const { error: deleteError } = await supabase
      .from('keywords')
      .delete()
      .eq('facility_id', facilityId);
    
    if (deleteError) {
      return res.status(500).json({ error: '既存キーワードの削除に失敗しました', details: deleteError });
    }
    
    // 新しいキーワードを保存
    const { error: insertError } = await supabase
      .from('keywords')
      .insert(keywordsToSave);
    
    if (insertError) {
      return res.status(500).json({ error: 'キーワードの保存に失敗しました', details: insertError });
    }
    
    res.json({
      success: true,
      data: {
        keywords: result.data.keywords,
        summary: result.data.summary,
        timestamp
      }
    });
  } catch (error) {
    console.error('キーワード生成エンドポイントエラー:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました', details: error.message });
  }
});

// 施設のキーワードを取得
router.get('/:facilityId', requireAuth, async (req, res) => {
  try {
    const facilityId = req.params.facilityId;
    
    // キーワードの取得
    const { data, error } = await supabase
      .from('keywords')
      .select('*')
      .eq('facility_id', facilityId);
    
    if (error) {
      return res.status(500).json({ error: 'キーワードの取得に失敗しました', details: error });
    }
    
    // カテゴリごとにキーワードを整理
    const keywords = {
      menu_services: '',
      environment_facilities: '',
      recommended_scenes: ''
    };
    
    data.forEach(item => {
      if (Object.prototype.hasOwnProperty.call(keywords, item.category)) {
        keywords[item.category] = item.keywords;
      }
    });
    
    // 生成タイムスタンプを取得（存在する場合）
    const timestamp = data.length > 0 ? data[0].generation_timestamp : null;
    
    res.json({
      success: true,
      data: {
        keywords,
        timestamp
      }
    });
  } catch (error) {
    console.error('キーワード取得エンドポイントエラー:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました', details: error.message });
  }
});

// キーワードを更新
router.put('/:facilityId/:category', requireAuth, async (req, res) => {
  try {
    const { facilityId, category } = req.params;
    const { keywords } = req.body;
    
    if (!keywords) {
      return res.status(400).json({ error: 'キーワードが指定されていません' });
    }
    
    // カテゴリの検証
    if (!['menu_services', 'environment_facilities', 'recommended_scenes'].includes(category)) {
      return res.status(400).json({ error: '無効なカテゴリです' });
    }
    
    // 既存のキーワードを取得
    const { data, error: selectError } = await supabase
      .from('keywords')
      .select('*')
      .eq('facility_id', facilityId)
      .eq('category', category)
      .single();
    
    if (selectError && selectError.code !== 'PGRST116') { // PGRST116: 結果が見つからない
      return res.status(500).json({ error: 'キーワードの取得に失敗しました', details: selectError });
    }
    
    let result;
    
    if (data) {
      // 既存のキーワードを更新
      const { data: updateData, error: updateError } = await supabase
        .from('keywords')
        .update({ keywords })
        .eq('facility_id', facilityId)
        .eq('category', category)
        .select();
      
      if (updateError) {
        return res.status(500).json({ error: 'キーワードの更新に失敗しました', details: updateError });
      }
      
      result = updateData[0];
    } else {
      // 新しいキーワードを作成
      const { data: insertData, error: insertError } = await supabase
        .from('keywords')
        .insert([{
          facility_id: facilityId,
          category,
          keywords,
          generation_timestamp: new Date()
        }])
        .select();
      
      if (insertError) {
        return res.status(500).json({ error: 'キーワードの作成に失敗しました', details: insertError });
      }
      
      result = insertData[0];
    }
    
    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('キーワード更新エンドポイントエラー:', error);
    res.status(500).json({ error: '予期せぬエラーが発生しました', details: error.message });
  }
});

export default router;
