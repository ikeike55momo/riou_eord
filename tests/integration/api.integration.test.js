/**
 * APIの統合テスト
 */

import { describe, it, expect, beforeEach, afterEach, beforeAll, afterAll, vi } from 'vitest';
import request from 'supertest';
import { createServer } from '../../server/server.js';
import { createClient } from '@supabase/supabase-js';

vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    auth: {
      signUp: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { role: 'user', name: 'Test User' }
          }
        },
        error: null
      }),
      signInWithPassword: vi.fn().mockResolvedValue({
        data: {
          user: {
            id: 'test-user-id',
            email: 'test@example.com',
            user_metadata: { role: 'user', name: 'Test User' }
          }
        },
        error: null
      }),
      signOut: vi.fn().mockResolvedValue({ error: null })
    },
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn().mockResolvedValue({
            data: {
              id: 'test-facility-id',
              facility_name: 'テスト施設',
              business_type: 'レストラン',
              created_by: 'test-user-id',
              created_at: new Date().toISOString()
            },
            error: null
          }),
          order: vi.fn(() => ({
            limit: vi.fn(() => ({
              data: [
                {
                  id: 'test-facility-id-1',
                  facility_name: '施設1',
                  business_type: 'レストラン',
                  created_by: 'test-user-id',
                  created_at: new Date().toISOString()
                },
                {
                  id: 'test-facility-id-2',
                  facility_name: '施設2',
                  business_type: 'カフェ',
                  created_by: 'test-user-id',
                  created_at: new Date().toISOString()
                }
              ],
              error: null
            }))
          }))
        })),
        insert: vi.fn(() => ({
          select: vi.fn().mockResolvedValue({
            data: {
              id: 'new-test-facility-id',
              facility_name: '新しい施設',
              business_type: 'カフェ',
              created_by: 'test-user-id',
              created_at: new Date().toISOString()
            },
            error: null
          })
        })),
        update: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn().mockResolvedValue({
              data: {
                id: 'test-facility-id',
                facility_name: '更新された施設',
                business_type: 'レストラン',
                updated_by: 'test-user-id',
                updated_at: new Date().toISOString()
              },
              error: null
            })
          }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn().mockResolvedValue({
            data: {},
            error: null
          })
        }))
      }))
    }))
  }))
}));

vi.mock('../../server/services/ai/gpt.js', () => ({
  default: {
    initialize: vi.fn().mockReturnValue(true),
    generateText: vi.fn().mockResolvedValue(`
      {
        "menu_service": ["ランチセット", "ディナーコース", "テイクアウト"],
        "environment_facility": ["テラス席あり", "個室完備", "Wi-Fi利用可"],
        "recommended_scene": ["デート", "接待", "家族での食事"]
      }
    `),
    createKeywordPrompt: vi.fn().mockReturnValue('モックプロンプト')
  }
}));

vi.mock('../../server/services/ai/crawler.js', () => ({
  default: {
    initialize: vi.fn().mockReturnValue(true),
    crawlGBP: vi.fn().mockResolvedValue({
      title: 'テスト施設 - Google Business Profile',
      description: 'テスト施設の説明',
      content: 'テスト施設のコンテンツ'
    }),
    crawlWebsite: vi.fn().mockResolvedValue({
      title: 'テスト施設 - 公式サイト',
      description: 'テスト施設の公式サイト説明',
      content: 'テスト施設の公式サイトコンテンツ'
    }),
    extractTextFromCrawl: vi.fn().mockReturnValue('クロールから抽出されたテキスト')
  }
}));

describe('API統合テスト', () => {
  let app;
  let server;
  let token;
  
  beforeAll(async () => {
    process.env.JWT_SECRET = 'test-jwt-secret';
    process.env.SUPABASE_URL = 'https://test.supabase.co';
    process.env.SUPABASE_SERVICE_KEY = 'test-supabase-key';
    process.env.OPENROUTER_API_KEY = 'test-openrouter-key';
    process.env.FIRECRAWL_API_KEY = 'test-firecrawl-key';
    
    const { app: expressApp, server: httpServer } = await createServer();
    app = expressApp;
    server = httpServer;
  });
  
  afterAll(() => {
    server.close();
  });
  
  describe('認証API', () => {
    it('ユーザー登録が成功すること', async () => {
      const response = await request(app)
        .post('/api/auth/register')
        .send({
          email: 'test@example.com',
          password: 'password123',
          name: 'Test User'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      
      token = response.body.data.token;
    });
    
    it('ログインが成功すること', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'test@example.com',
          password: 'password123'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      
      token = response.body.data.token;
    });
    
    it('ログアウトが成功すること', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('施設API', () => {
    beforeEach(async () => {
      if (!token) {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });
        
        token = loginResponse.body.data.token;
      }
    });
    
    it('施設一覧を取得できること', async () => {
      const response = await request(app)
        .get('/api/facilities')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data.length).toBeGreaterThan(0);
    });
    
    it('施設を作成できること', async () => {
      const response = await request(app)
        .post('/api/facilities')
        .set('Authorization', `Bearer ${token}`)
        .send({
          facility_name: '新しい施設',
          business_type: 'カフェ',
          address: '東京都渋谷区',
          phone: '03-1234-5678',
          business_hours: '10:00-22:00',
          closed_days: '月曜日',
          official_site_url: 'https://example.com',
          gbp_url: 'https://maps.google.com/example',
          additional_info: '駐車場あり'
        });
      
      expect(response.status).toBe(201);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBeDefined();
      expect(response.body.data.facility_name).toBe('新しい施設');
    });
    
    it('施設IDで施設を取得できること', async () => {
      const response = await request(app)
        .get('/api/facilities/test-facility-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.id).toBe('test-facility-id');
      expect(response.body.data.facility_name).toBe('テスト施設');
    });
    
    it('施設を更新できること', async () => {
      const response = await request(app)
        .put('/api/facilities/test-facility-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          facility_name: '更新された施設',
          business_hours: '9:00-21:00'
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.facility_name).toBe('更新された施設');
    });
    
    it('施設を削除できること', async () => {
      const response = await request(app)
        .delete('/api/facilities/test-facility-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('キーワードAPI', () => {
    beforeEach(async () => {
      if (!token) {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });
        
        token = loginResponse.body.data.token;
      }
    });
    
    it('施設IDでキーワードを取得できること', async () => {
      const response = await request(app)
        .get('/api/keywords/test-facility-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.facility_id).toBeDefined();
      expect(response.body.data.menu_service).toBeDefined();
      expect(response.body.data.environment_facility).toBeDefined();
      expect(response.body.data.recommended_scene).toBeDefined();
    });
    
    it('キーワードを生成できること', async () => {
      const response = await request(app)
        .post('/api/keywords/test-facility-id/generate')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menu_service).toBeDefined();
      expect(response.body.data.environment_facility).toBeDefined();
      expect(response.body.data.recommended_scene).toBeDefined();
    });
    
    it('キーワードを更新できること', async () => {
      const response = await request(app)
        .put('/api/keywords/test-facility-id')
        .set('Authorization', `Bearer ${token}`)
        .send({
          menu_service: ['更新されたキーワード1', '更新されたキーワード2'],
          environment_facility: ['テラス席あり', '個室完備'],
          recommended_scene: ['デート', '接待']
        });
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
      expect(response.body.data.menu_service).toContain('更新されたキーワード1');
    });
    
    it('キーワードを削除できること', async () => {
      const response = await request(app)
        .delete('/api/keywords/test-facility-id')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.success).toBe(true);
    });
  });
  
  describe('エクスポートAPI', () => {
    beforeEach(async () => {
      if (!token) {
        const loginResponse = await request(app)
          .post('/api/auth/login')
          .send({
            email: 'test@example.com',
            password: 'password123'
          });
        
        token = loginResponse.body.data.token;
      }
    });
    
    it('JSONフォーマットでエクスポートできること', async () => {
      const response = await request(app)
        .get('/api/export/test-facility-id/json')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.body.facility).toBeDefined();
      expect(response.body.keywords).toBeDefined();
    });
    
    it('CSVフォーマットでエクスポートできること', async () => {
      const response = await request(app)
        .get('/api/export/test-facility-id/csv')
        .set('Authorization', `Bearer ${token}`);
      
      expect(response.status).toBe(200);
      expect(response.header['content-type']).toContain('text/csv');
    });
  });
});
