import axios from 'axios';

// APIのベースURLを環境変数から取得
const API_URL = import.meta.env.VITE_API_URL;

// Axiosインスタンスの作成
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    // ローカルストレージからトークンを取得
    const token = localStorage.getItem('authToken');
    
    // トークンがある場合はヘッダーに追加
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // 認証エラー（401）の場合はログアウト処理
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('authToken');
      window.location.href = '/login';
    }
    
    return Promise.reject(error);
  }
);

// API関数のエクスポート
export default {
  // 認証関連
  auth: {
    login: (credentials) => api.post('/auth/login', credentials),
    logout: () => api.post('/auth/logout'),
    getProfile: () => api.get('/auth/me'),
  },
  
  // 施設関連
  facilities: {
    getAll: () => api.get('/facilities'),
    getById: (id) => api.get(`/facilities/${id}`),
    create: (data) => api.post('/facilities', data),
    update: (id, data) => api.put(`/facilities/${id}`, data),
    delete: (id) => api.delete(`/facilities/${id}`),
  },
  
  // キーワード関連
  keywords: {
    getByFacilityId: (facilityId) => api.get(`/keywords/${facilityId}`),
    generate: (facilityId) => api.post(`/keywords/generate/${facilityId}`),
    update: (facilityId, data) => api.put(`/keywords/${facilityId}`, data),
  },
  
  // エクスポート関連
  export: {
    csv: (facilityId) => api.get(`/export/csv/${facilityId}`, { responseType: 'blob' }),
  },
}; 