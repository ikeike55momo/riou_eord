import { supabase, supabaseAdmin } from '../supabase.js';

// 施設情報のCRUD操作を行うサービス
const facilitiesService = {
  // 全施設の取得
  async getAllFacilities() {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('施設情報取得エラー:', error);
      return { success: false, error };
    }
  },

  // 特定の施設の取得
  async getFacilityById(facilityId) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .select('*')
        .eq('facility_id', facilityId)
        .single();
      
      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error(`施設ID ${facilityId} の取得エラー:`, error);
      return { success: false, error };
    }
  },

  // 施設の新規作成
  async createFacility(facilityData, userId) {
    try {
      // ユーザーIDを追加
      const dataWithUser = {
        ...facilityData,
        created_by: userId
      };

      const { data, error } = await supabase
        .from('facilities')
        .insert([dataWithUser])
        .select();
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error('施設作成エラー:', error);
      return { success: false, error };
    }
  },

  // 施設情報の更新
  async updateFacility(facilityId, facilityData) {
    try {
      const { data, error } = await supabase
        .from('facilities')
        .update(facilityData)
        .eq('facility_id', facilityId)
        .select();
      
      if (error) throw error;
      return { success: true, data: data[0] };
    } catch (error) {
      console.error(`施設ID ${facilityId} の更新エラー:`, error);
      return { success: false, error };
    }
  },

  // 施設の削除
  async deleteFacility(facilityId) {
    try {
      const { error } = await supabase
        .from('facilities')
        .delete()
        .eq('facility_id', facilityId);
      
      if (error) throw error;
      return { success: true };
    } catch (error) {
      console.error(`施設ID ${facilityId} の削除エラー:`, error);
      return { success: false, error };
    }
  }
};

export default facilitiesService;
