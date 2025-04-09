/**
 * APIの統合テスト
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import supertest from 'supertest';
import { createServer } from '../../server/server.js';

let server;
let request;

beforeAll(async () => {
  server = await createServer();
  request = supertest(server);
});

afterAll(async () => {
  if (server) {
    await new Promise((resolve) => server.close(resolve));
  }
});

describe('API Integration Tests', () => {
  let facilityId;
  
  it('should create a new facility', async () => {
    const response = await request
      .post('/api/facilities')
      .send({
        facility_name: '統合テスト施設',
        business_type: 'レストラン',
        address: '東京都渋谷区',
        phone: '03-1234-5678',
        email: 'test@example.com'
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('facility_id');
    
    facilityId = response.body.facility_id;
  });
  
  it('should get a facility by ID', async () => {
    const response = await request.get(`/api/facilities/${facilityId}`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('facility_name', '統合テスト施設');
  });
  
  it('should generate keywords for a facility', async () => {
    const response = await request.post(`/api/keywords/${facilityId}/generate`);
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('menu_service');
    expect(response.body).toHaveProperty('environment_facility');
    expect(response.body).toHaveProperty('recommended_scene');
  });
  
  it('should update keywords for a facility', async () => {
    const response = await request
      .put(`/api/keywords/${facilityId}`)
      .send({
        menu_service: ['カスタムメニュー1', 'カスタムメニュー2'],
        environment_facility: ['カスタム環境1', 'カスタム環境2'],
        recommended_scene: ['カスタムシーン1', 'カスタムシーン2']
      });
    
    expect(response.status).toBe(200);
  });
  
  it('should export keywords as CSV', async () => {
    const response = await request.get(`/api/export/csv/${facilityId}`);
    
    expect(response.status).toBe(200);
    expect(response.headers['content-type']).toContain('text/csv');
  });
  
  it('should delete a facility', async () => {
    const response = await request.delete(`/api/facilities/${facilityId}`);
    
    expect(response.status).toBe(200);
  });
});
