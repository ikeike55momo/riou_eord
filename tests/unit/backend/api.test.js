/**
 * バックエンドAPIのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import express from 'express';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../../server/services/auth.js', () => ({
  default: {
    register: vi.fn(),
    login: vi.fn(),
    logout: vi.fn(),
    verifyToken: vi.fn(),
    authenticate: vi.fn(() => (req, res, next) => {
      req.user = { id: 'user123', email: 'test@example.com', role: 'user' };
      next();
    }),
    authorize: vi.fn(() => (req, res, next) => next())
  }
}));

vi.mock('../../../server/services/facility.js', () => ({
  default: {
    createFacility: vi.fn(),
    getFacility: vi.fn(),
    updateFacility: vi.fn(),
    deleteFacility: vi.fn(),
    listFacilities: vi.fn(),
    getBusinessTypes: vi.fn(),
    getFacilityStats: vi.fn(),
    searchFacilities: vi.fn()
  }
}));

vi.mock('../../../server/services/keyword.js', () => ({
  default: {
    getKeywordsByFacilityId: vi.fn(),
    updateKeywords: vi.fn(),
    generateKeywords: vi.fn(),
    deleteKeywords: vi.fn(),
    getKeywordStats: vi.fn(),
    exportKeywords: vi.fn()
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

const createTestApp = (router) => {
  const app = express();
  app.use(express.json());
  app.use(router);
  return app;
};

describe('認証API', () => {
  let app;
  let authRouter;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { default: router } = await import('../../../server/routes/auth.js');
    authRouter = router;
    app = createTestApp(authRouter);
  });
  
  describe('POST /register', () => {
    it('ユーザー登録が成功すること', async () => {
      const authService = require('../../../server/services/auth.js').default;
      authService.register.mockResolvedValue({
        user: { id: 'user123', email: 'test@example.com' },
        token: 'jwt-token'
      });
      
      const response = await request(app)
        .post('/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(authService.register).toHaveBeenCalled();
    });
    
    it('無効なデータでエラーになること', async () => {
      const authService = require('../../../server/services/auth.js').default;
      authService.register.mockRejectedValue(new Error('メールアドレスとパスワードは必須です'));
      
      const response = await request(app)
        .post('/register')
        .send({
          name: 'Test User'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(authService.register).toHaveBeenCalled();
    });
  });
  
  describe('POST /login', () => {
    it('ログインが成功すること', async () => {
      const authService = require('../../../server/services/auth.js').default;
      authService.login.mockResolvedValue({
        user: { id: 'user123', email: 'test@example.com' },
        token: 'jwt-token'
      });
      
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(authService.login).toHaveBeenCalled();
    });
    
    it('無効な認証情報でエラーになること', async () => {
      const authService = require('../../../server/services/auth.js').default;
      authService.login.mockRejectedValue(new Error('認証に失敗しました'));
      
      const response = await request(app)
        .post('/login')
        .send({
          email: 'test@example.com',
          password: 'wrong-password'
        });
      
      expect(response.status).toBe(401);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(authService.login).toHaveBeenCalled();
    });
  });
  
  describe('POST /logout', () => {
    it('ログアウトが成功すること', async () => {
      const authService = require('../../../server/services/auth.js').default;
      authService.logout.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .post('/logout')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(authService.logout).toHaveBeenCalled();
    });
  });
});

describe('施設API', () => {
  let app;
  let facilitiesRouter;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { default: router } = await import('../../../server/routes/facilities.js');
    facilitiesRouter = router;
    app = createTestApp(facilitiesRouter);
  });
  
  describe('GET /', () => {
    it('施設一覧を取得できること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.listFacilities.mockResolvedValue([
        { id: 'facility1', facility_name: '施設1' },
        { id: 'facility2', facility_name: '施設2' }
      ]);
      
      const response = await request(app)
        .get('/')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(facilityService.listFacilities).toHaveBeenCalled();
    });
  });
  
  describe('GET /:id', () => {
    it('施設IDで施設を取得できること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.getFacility.mockResolvedValue({
        id: 'facility1',
        facility_name: '施設1',
        business_type: 'レストラン'
      });
      
      const response = await request(app)
        .get('/facility1')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('facility1');
      expect(facilityService.getFacility).toHaveBeenCalledWith('facility1');
    });
    
    it('存在しない施設IDでエラーになること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.getFacility.mockRejectedValue(new Error('施設が見つかりません'));
      
      const response = await request(app)
        .get('/nonexistent')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(facilityService.getFacility).toHaveBeenCalledWith('nonexistent');
    });
  });
  
  describe('POST /', () => {
    it('施設を作成できること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.createFacility.mockResolvedValue({
        id: 'new-facility',
        facility_name: '新しい施設',
        business_type: 'カフェ'
      });
      
      const response = await request(app)
        .post('/')
        .set('Authorization', 'Bearer jwt-token')
        .send({
          facility_name: '新しい施設',
          business_type: 'カフェ',
          address: '東京都渋谷区'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('new-facility');
      expect(facilityService.createFacility).toHaveBeenCalled();
    });
    
    it('無効なデータでエラーになること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.createFacility.mockRejectedValue(new Error('施設名は必須です'));
      
      const response = await request(app)
        .post('/')
        .set('Authorization', 'Bearer jwt-token')
        .send({
          business_type: 'カフェ'
        });
      
      expect(response.status).toBe(400);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(facilityService.createFacility).toHaveBeenCalled();
    });
  });
  
  describe('PUT /:id', () => {
    it('施設を更新できること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.updateFacility.mockResolvedValue({
        id: 'facility1',
        facility_name: '更新された施設',
        business_type: 'レストラン'
      });
      
      const response = await request(app)
        .put('/facility1')
        .set('Authorization', 'Bearer jwt-token')
        .send({
          facility_name: '更新された施設'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.facility_name).toBe('更新された施設');
      expect(facilityService.updateFacility).toHaveBeenCalled();
    });
  });
  
  describe('DELETE /:id', () => {
    it('施設を削除できること', async () => {
      const facilityService = require('../../../server/services/facility.js').default;
      facilityService.deleteFacility.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .delete('/facility1')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(facilityService.deleteFacility).toHaveBeenCalledWith('facility1', expect.anything());
    });
  });
});

describe('キーワードAPI', () => {
  let app;
  let keywordsRouter;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { default: router } = await import('../../../server/routes/keywords.js');
    keywordsRouter = router;
    app = createTestApp(keywordsRouter);
  });
  
  describe('GET /:facilityId', () => {
    it('施設IDでキーワードを取得できること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.getKeywordsByFacilityId.mockResolvedValue({
        facility_id: 'facility1',
        menu_service: ['ランチセット', 'ディナーコース'],
        environment_facility: ['テラス席あり', '個室完備'],
        recommended_scene: ['デート', '接待']
      });
      
      const response = await request(app)
        .get('/facility1')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.facility_id).toBe('facility1');
      expect(response.body.data.menu_service).toHaveLength(2);
      expect(keywordService.getKeywordsByFacilityId).toHaveBeenCalledWith('facility1');
    });
    
    it('存在しない施設IDでエラーになること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.getKeywordsByFacilityId.mockRejectedValue(new Error('施設が見つかりません'));
      
      const response = await request(app)
        .get('/nonexistent')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(404);
      expect(response.body.success).toBe(false);
      expect(response.body.error).toBeDefined();
      expect(keywordService.getKeywordsByFacilityId).toHaveBeenCalledWith('nonexistent');
    });
  });
  
  describe('PUT /:facilityId', () => {
    it('キーワードを更新できること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.updateKeywords.mockResolvedValue({
        facility_id: 'facility1',
        menu_service: ['更新されたキーワード1', '更新されたキーワード2'],
        environment_facility: ['テラス席あり', '個室完備'],
        recommended_scene: ['デート', '接待']
      });
      
      const response = await request(app)
        .put('/facility1')
        .set('Authorization', 'Bearer jwt-token')
        .send({
          menu_service: ['更新されたキーワード1', '更新されたキーワード2'],
          environment_facility: ['テラス席あり', '個室完備'],
          recommended_scene: ['デート', '接待']
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menu_service[0]).toBe('更新されたキーワード1');
      expect(keywordService.updateKeywords).toHaveBeenCalled();
    });
  });
  
  describe('POST /:facilityId/generate', () => {
    it('キーワードを生成できること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.generateKeywords.mockResolvedValue({
        facility_id: 'facility1',
        menu_service: ['生成されたキーワード1', '生成されたキーワード2'],
        environment_facility: ['テラス席あり', '個室完備'],
        recommended_scene: ['デート', '接待']
      });
      
      const response = await request(app)
        .post('/facility1/generate')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menu_service).toHaveLength(2);
      expect(keywordService.generateKeywords).toHaveBeenCalledWith('facility1', expect.anything());
    });
  });
  
  describe('DELETE /:facilityId', () => {
    it('キーワードを削除できること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.deleteKeywords.mockResolvedValue({ success: true });
      
      const response = await request(app)
        .delete('/facility1')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(keywordService.deleteKeywords).toHaveBeenCalledWith('facility1');
    });
  });
});

describe('エクスポートAPI', () => {
  let app;
  let exportRouter;
  
  beforeEach(async () => {
    vi.clearAllMocks();
    
    const { default: router } = await import('../../../server/routes/export.js');
    exportRouter = router;
    app = createTestApp(exportRouter);
  });
  
  describe('GET /:facilityId/json', () => {
    it('JSONフォーマットでエクスポートできること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.exportKeywords.mockResolvedValue({
        facility: {
          id: 'facility1',
          facility_name: 'テスト施設'
        },
        keywords: {
          menu_service: ['キーワード1', 'キーワード2'],
          environment_facility: ['キーワード3', 'キーワード4'],
          recommended_scene: ['キーワード5', 'キーワード6']
        }
      });
      
      const response = await request(app)
        .get('/facility1/json')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.body.facility).toBeDefined();
      expect(response.body.keywords).toBeDefined();
      expect(keywordService.exportKeywords).toHaveBeenCalledWith('facility1', 'json');
    });
  });
  
  describe('GET /:facilityId/csv', () => {
    it('CSVフォーマットでエクスポートできること', async () => {
      const keywordService = require('../../../server/services/keyword.js').default;
      keywordService.exportKeywords.mockResolvedValue([
        {
          facility_name: 'テスト施設',
          business_type: 'レストラン',
          address: '東京都渋谷区',
          category: 'メニュー・サービス',
          keyword: 'キーワード1'
        },
        {
          facility_name: 'テスト施設',
          business_type: 'レストラン',
          address: '東京都渋谷区',
          category: 'メニュー・サービス',
          keyword: 'キーワード2'
        }
      ]);
      
      const response = await request(app)
        .get('/facility1/csv')
        .set('Authorization', 'Bearer jwt-token');
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/csv');
      expect(keywordService.exportKeywords).toHaveBeenCalledWith('facility1', 'csv');
    });
  });
});
