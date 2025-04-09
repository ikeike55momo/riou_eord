/**
 * バックエンドサービスのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import authService from '../../../server/services/auth.js';
import facilityService from '../../../server/services/facility.js';
import keywordService from '../../../server/services/keyword.js';

vi.mock('../../../server/models/user.js', () => ({
  default: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn()
  }
}));

vi.mock('../../../server/models/facility.js', () => ({
  default: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    list: vi.fn(),
    getBusinessTypes: vi.fn(),
    getStats: vi.fn()
  }
}));

vi.mock('../../../server/models/keyword.js', () => ({
  default: {
    getByFacilityId: vi.fn(),
    update: vi.fn(),
    generate: vi.fn(),
    delete: vi.fn(),
    getStats: vi.fn()
  }
}));

vi.mock('../../../server/utils/logger.js', () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn()
  }
}));

vi.mock('../../../server/services/ai/keyword-generator.js', () => ({
  default: {
    generateKeywords: vi.fn()
  }
}));

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn(),
      signInWithPassword: vi.fn(),
      signOut: vi.fn(),
      resetPasswordForEmail: vi.fn(),
      updateUser: vi.fn()
    }
  }))
}));

vi.mock('jsonwebtoken', () => ({
  sign: vi.fn(() => 'mock-token'),
  verify: vi.fn()
}));

describe('認証サービス', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('register', () => {
    it('有効なユーザーデータで登録できること', async () => {
      const mockUser = { id: '123', email: 'test@example.com', user_metadata: { role: 'user' } };
      const mockAuthResponse = { data: { user: mockUser }, error: null };
      
      const supabase = require('@supabase/supabase-js').createClient();
      supabase.auth.signUp.mockResolvedValue(mockAuthResponse);
      
      const result = await authService.register({
        email: 'test@example.com',
        password: 'password123',
        name: 'Test User'
      });
      
      expect(supabase.auth.signUp).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
    });
    
    it('必須フィールドがない場合はエラーになること', async () => {
      await expect(authService.register({
        name: 'Test User'
      })).rejects.toThrow('メールアドレスとパスワードは必須です');
    });
  });
  
  describe('login', () => {
    it('有効な認証情報でログインできること', async () => {
      const mockUser = { id: '123', email: 'test@example.com', user_metadata: { role: 'user' } };
      const mockAuthResponse = { data: { user: mockUser }, error: null };
      
      const supabase = require('@supabase/supabase-js').createClient();
      supabase.auth.signInWithPassword.mockResolvedValue(mockAuthResponse);
      
      const result = await authService.login('test@example.com', 'password123');
      
      expect(supabase.auth.signInWithPassword).toHaveBeenCalled();
      expect(result.user).toEqual(mockUser);
      expect(result.token).toBeDefined();
    });
    
    it('認証情報が不足している場合はエラーになること', async () => {
      await expect(authService.login()).rejects.toThrow('メールアドレスとパスワードは必須です');
    });
  });
  
  describe('verifyToken', () => {
    it('有効なトークンを検証できること', () => {
      const jwt = require('jsonwebtoken');
      jwt.verify.mockReturnValue({ id: '123', email: 'test@example.com', role: 'user' });
      
      const result = authService.verifyToken('valid-token');
      
      expect(jwt.verify).toHaveBeenCalled();
      expect(result.valid).toBe(true);
      expect(result.decoded).toBeDefined();
    });
    
    it('トークンがない場合は検証に失敗すること', () => {
      const result = authService.verifyToken();
      
      expect(result.valid).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});

describe('施設サービス', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  const mockFacility = {
    id: '123',
    facility_name: 'テスト施設',
    business_type: 'レストラン',
    address: '東京都渋谷区',
    phone: '03-1234-5678',
    business_hours: '10:00-22:00',
    closed_days: '月曜日',
    official_site_url: 'https://example.com',
    gbp_url: 'https://maps.google.com/example',
    additional_info: '駐車場あり'
  };
  
  describe('createFacility', () => {
    it('有効な施設データで作成できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.create.mockResolvedValue(mockFacility);
      
      const result = await facilityService.createFacility(mockFacility, 'user123');
      
      expect(Facility.create).toHaveBeenCalledWith(mockFacility, 'user123');
      expect(result).toEqual(mockFacility);
    });
    
    it('施設名がない場合はエラーになること', async () => {
      const invalidFacility = { ...mockFacility, facility_name: '' };
      
      await expect(facilityService.createFacility(invalidFacility, 'user123'))
        .rejects.toThrow('施設名は必須です');
    });
  });
  
  describe('getFacility', () => {
    it('施設IDで施設を取得できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue(mockFacility);
      
      const result = await facilityService.getFacility('123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockFacility);
    });
  });
  
  describe('updateFacility', () => {
    it('施設を更新できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.update.mockResolvedValue(mockFacility);
      
      const result = await facilityService.updateFacility('123', mockFacility, 'user123');
      
      expect(Facility.update).toHaveBeenCalledWith('123', mockFacility, 'user123');
      expect(result).toEqual(mockFacility);
    });
  });
  
  describe('deleteFacility', () => {
    it('施設を削除できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue(mockFacility);
      Facility.delete.mockResolvedValue({ success: true });
      
      const Keyword = require('../../../server/models/keyword.js').default;
      Keyword.delete.mockResolvedValue({ success: true });
      
      const result = await facilityService.deleteFacility('123', 'user123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(Keyword.delete).toHaveBeenCalledWith('123');
      expect(Facility.delete).toHaveBeenCalledWith('123');
      expect(result).toEqual({ success: true });
    });
  });
});

describe('キーワードサービス', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });
  
  const mockKeywords = {
    facility_id: '123',
    menu_service: ['ランチセット', 'ディナーコース'],
    environment_facility: ['テラス席あり', '個室完備'],
    recommended_scene: ['デート', '接待']
  };
  
  describe('getKeywordsByFacilityId', () => {
    it('施設IDでキーワードを取得できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue({ id: '123', facility_name: 'テスト施設' });
      
      const Keyword = require('../../../server/models/keyword.js').default;
      Keyword.getByFacilityId.mockResolvedValue(mockKeywords);
      
      const result = await keywordService.getKeywordsByFacilityId('123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(Keyword.getByFacilityId).toHaveBeenCalledWith('123');
      expect(result).toEqual(mockKeywords);
    });
    
    it('存在しない施設IDの場合はエラーになること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockRejectedValue(new Error('施設が見つかりません'));
      
      await expect(keywordService.getKeywordsByFacilityId('999'))
        .rejects.toThrow('施設が見つかりません');
    });
  });
  
  describe('updateKeywords', () => {
    it('キーワードを更新できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue({ id: '123', facility_name: 'テスト施設' });
      
      const Keyword = require('../../../server/models/keyword.js').default;
      Keyword.update.mockResolvedValue(mockKeywords);
      
      const result = await keywordService.updateKeywords('123', mockKeywords, 'user123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(Keyword.update).toHaveBeenCalledWith('123', mockKeywords, 'user123');
      expect(result).toEqual(mockKeywords);
    });
    
    it('キーワードの形式が不正な場合はエラーになること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue({ id: '123', facility_name: 'テスト施設' });
      
      const invalidKeywords = {
        menu_service: 'これは配列ではない',
        environment_facility: ['テラス席あり'],
        recommended_scene: ['デート']
      };
      
      await expect(keywordService.updateKeywords('123', invalidKeywords, 'user123'))
        .rejects.toThrow('メニュー・サービスカテゴリはリスト形式で指定してください');
    });
  });
  
  describe('generateKeywords', () => {
    it('キーワードを生成できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue({ id: '123', facility_name: 'テスト施設' });
      
      const Keyword = require('../../../server/models/keyword.js').default;
      Keyword.generate.mockResolvedValue(mockKeywords);
      
      const result = await keywordService.generateKeywords('123', 'user123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(Keyword.generate).toHaveBeenCalled();
      expect(result).toEqual(mockKeywords);
    });
  });
  
  describe('deleteKeywords', () => {
    it('キーワードを削除できること', async () => {
      const Facility = require('../../../server/models/facility.js').default;
      Facility.getById.mockResolvedValue({ id: '123', facility_name: 'テスト施設' });
      
      const Keyword = require('../../../server/models/keyword.js').default;
      Keyword.delete.mockResolvedValue({ success: true });
      
      const result = await keywordService.deleteKeywords('123');
      
      expect(Facility.getById).toHaveBeenCalledWith('123');
      expect(Keyword.delete).toHaveBeenCalledWith('123');
      expect(result).toEqual({ success: true });
    });
  });
});
