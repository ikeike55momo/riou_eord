/**
 * フロントエンドコンポーネントのユニットテスト
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from '../../../src/contexts/AuthContext';

vi.mock('../../../src/services/api', () => ({
  default: {
    getFacilities: vi.fn(),
    getFacility: vi.fn(),
    createFacility: vi.fn(),
    updateFacility: vi.fn(),
    deleteFacility: vi.fn(),
    getKeywords: vi.fn(),
    generateKeywords: vi.fn(),
    updateKeywords: vi.fn(),
    login: vi.fn(),
    register: vi.fn()
  }
}));

const renderWithRouter = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return {
    ...render(ui, { wrapper: BrowserRouter })
  };
};

const renderWithAuth = (ui, { route = '/' } = {}) => {
  window.history.pushState({}, 'Test page', route);
  
  return {
    ...render(
      <AuthProvider>
        {ui}
      </AuthProvider>,
      { wrapper: BrowserRouter }
    )
  };
};

describe('レイアウトコンポーネント', () => {
  describe('Navbar', () => {
    it('ナビゲーションリンクが正しく表示されること', async () => {
      const { default: Navbar } = await import('../../../src/components/layout/Navbar');
      
      renderWithAuth(<Navbar />);
      
      expect(screen.getByText(/施設一覧/i)).toBeInTheDocument();
      expect(screen.getByText(/キーワード生成/i)).toBeInTheDocument();
    });
    
    it('ログアウトボタンがクリックできること', async () => {
      const { default: Navbar } = await import('../../../src/components/layout/Navbar');
      
      const mockLogout = vi.fn();
      vi.mock('../../../src/contexts/AuthContext', () => ({
        useAuth: () => ({
          logout: mockLogout,
          currentUser: { name: 'テストユーザー' }
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
      }));
      
      renderWithRouter(<Navbar />);
      
      const logoutButton = screen.getByText(/ログアウト/i);
      fireEvent.click(logoutButton);
      
      expect(mockLogout).toHaveBeenCalled();
    });
  });
  
  describe('Layout', () => {
    it('子コンポーネントを正しくレンダリングすること', async () => {
      const { default: Layout } = await import('../../../src/components/layout/Layout');
      
      renderWithAuth(
        <Layout>
          <div data-testid="test-content">テストコンテンツ</div>
        </Layout>
      );
      
      expect(screen.getByTestId('test-content')).toBeInTheDocument();
      expect(screen.getByText(/テストコンテンツ/i)).toBeInTheDocument();
    });
  });
});

describe('認証ページ', () => {
  describe('LoginPage', () => {
    it('ログインフォームが表示されること', async () => {
      const { default: LoginPage } = await import('../../../src/pages/auth/LoginPage');
      
      renderWithAuth(<LoginPage />);
      
      expect(screen.getByLabelText(/メールアドレス/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/パスワード/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /ログイン/i })).toBeInTheDocument();
    });
    
    it('フォーム送信時にログイン処理が実行されること', async () => {
      const { default: LoginPage } = await import('../../../src/pages/auth/LoginPage');
      
      const mockLogin = vi.fn().mockResolvedValue({ success: true });
      vi.mock('../../../src/contexts/AuthContext', () => ({
        useAuth: () => ({
          login: mockLogin,
          currentUser: null
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
      }));
      
      renderWithRouter(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'password123' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
      
      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
      });
    });
    
    it('ログインエラー時にエラーメッセージが表示されること', async () => {
      const { default: LoginPage } = await import('../../../src/pages/auth/LoginPage');
      
      const mockLogin = vi.fn().mockRejectedValue(new Error('認証に失敗しました'));
      vi.mock('../../../src/contexts/AuthContext', () => ({
        useAuth: () => ({
          login: mockLogin,
          currentUser: null
        }),
        AuthProvider: ({ children }) => <div>{children}</div>
      }));
      
      renderWithRouter(<LoginPage />);
      
      fireEvent.change(screen.getByLabelText(/メールアドレス/i), {
        target: { value: 'test@example.com' }
      });
      
      fireEvent.change(screen.getByLabelText(/パスワード/i), {
        target: { value: 'wrong-password' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /ログイン/i }));
      
      await waitFor(() => {
        expect(screen.getByText(/認証に失敗しました/i)).toBeInTheDocument();
      });
    });
  });
});

describe('施設ページ', () => {
  describe('FacilitiesListPage', () => {
    it('施設一覧が表示されること', async () => {
      const { default: FacilitiesListPage } = await import('../../../src/pages/facilities/FacilitiesListPage');
      
      const mockFacilities = [
        { id: '1', facility_name: '施設1', business_type: 'レストラン', address: '東京都渋谷区' },
        { id: '2', facility_name: '施設2', business_type: 'カフェ', address: '東京都新宿区' }
      ];
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: mockFacilities });
      
      renderWithAuth(<FacilitiesListPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/施設1/i)).toBeInTheDocument();
        expect(screen.getByText(/施設2/i)).toBeInTheDocument();
      });
    });
    
    it('新規施設作成ボタンがクリックできること', async () => {
      const { default: FacilitiesListPage } = await import('../../../src/pages/facilities/FacilitiesListPage');
      
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useNavigate: () => mockNavigate
        };
      });
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: [] });
      
      renderWithAuth(<FacilitiesListPage />);
      
      await waitFor(() => {
        const createButton = screen.getByText(/新規施設登録/i);
        fireEvent.click(createButton);
        expect(mockNavigate).toHaveBeenCalledWith('/facilities/new');
      });
    });
  });
  
  describe('FacilityFormPage', () => {
    it('新規作成モードでフォームが表示されること', async () => {
      const { default: FacilityFormPage } = await import('../../../src/pages/facilities/FacilityFormPage');
      
      const mockParams = { id: 'new' };
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => mockParams
        };
      });
      
      renderWithAuth(<FacilityFormPage />);
      
      expect(screen.getByText(/新規施設登録/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/施設名/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/業種/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/住所/i)).toBeInTheDocument();
    });
    
    it('編集モードで施設データが読み込まれること', async () => {
      const { default: FacilityFormPage } = await import('../../../src/pages/facilities/FacilityFormPage');
      
      const mockParams = { id: '123' };
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => mockParams
        };
      });
      
      const mockFacility = {
        id: '123',
        facility_name: 'テスト施設',
        business_type: 'レストラン',
        address: '東京都渋谷区'
      };
      
      const api = require('../../../src/services/api').default;
      api.getFacility.mockResolvedValue({ data: mockFacility });
      
      renderWithAuth(<FacilityFormPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/施設編集/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/テスト施設/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/レストラン/i)).toBeInTheDocument();
        expect(screen.getByDisplayValue(/東京都渋谷区/i)).toBeInTheDocument();
      });
    });
    
    it('フォーム送信時に施設が作成されること', async () => {
      const { default: FacilityFormPage } = await import('../../../src/pages/facilities/FacilityFormPage');
      
      const mockParams = { id: 'new' };
      const mockNavigate = vi.fn();
      vi.mock('react-router-dom', async () => {
        const actual = await vi.importActual('react-router-dom');
        return {
          ...actual,
          useParams: () => mockParams,
          useNavigate: () => mockNavigate
        };
      });
      
      const api = require('../../../src/services/api').default;
      api.createFacility.mockResolvedValue({ data: { id: 'new-facility' } });
      
      renderWithAuth(<FacilityFormPage />);
      
      fireEvent.change(screen.getByLabelText(/施設名/i), {
        target: { value: '新しい施設' }
      });
      
      fireEvent.change(screen.getByLabelText(/業種/i), {
        target: { value: 'カフェ' }
      });
      
      fireEvent.change(screen.getByLabelText(/住所/i), {
        target: { value: '東京都新宿区' }
      });
      
      fireEvent.click(screen.getByRole('button', { name: /保存/i }));
      
      await waitFor(() => {
        expect(api.createFacility).toHaveBeenCalledWith({
          facility_name: '新しい施設',
          business_type: 'カフェ',
          address: '東京都新宿区'
        });
        expect(mockNavigate).toHaveBeenCalledWith('/facilities');
      });
    });
  });
});

describe('キーワードページ', () => {
  describe('KeywordGenerationPage', () => {
    it('施設選択フォームが表示されること', async () => {
      const { default: KeywordGenerationPage } = await import('../../../src/pages/keywords/KeywordGenerationPage');
      
      const mockFacilities = [
        { id: '1', facility_name: '施設1' },
        { id: '2', facility_name: '施設2' }
      ];
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: mockFacilities });
      
      renderWithAuth(<KeywordGenerationPage />);
      
      await waitFor(() => {
        expect(screen.getByText(/施設を選択/i)).toBeInTheDocument();
        expect(screen.getByText(/施設1/i)).toBeInTheDocument();
        expect(screen.getByText(/施設2/i)).toBeInTheDocument();
      });
    });
    
    it('施設選択後にキーワード生成ボタンが表示されること', async () => {
      const { default: KeywordGenerationPage } = await import('../../../src/pages/keywords/KeywordGenerationPage');
      
      const mockFacilities = [
        { id: '1', facility_name: '施設1' },
        { id: '2', facility_name: '施設2' }
      ];
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: mockFacilities });
      
      renderWithAuth(<KeywordGenerationPage />);
      
      await waitFor(() => {
        const facilitySelect = screen.getByLabelText(/施設を選択/i);
        fireEvent.change(facilitySelect, { target: { value: '1' } });
        
        expect(screen.getByRole('button', { name: /キーワード生成/i })).toBeInTheDocument();
      });
    });
    
    it('キーワード生成ボタンクリック時にキーワードが生成されること', async () => {
      const { default: KeywordGenerationPage } = await import('../../../src/pages/keywords/KeywordGenerationPage');
      
      const mockFacilities = [
        { id: '1', facility_name: '施設1' }
      ];
      
      const mockKeywords = {
        menu_service: ['ランチセット', 'ディナーコース'],
        environment_facility: ['テラス席あり', '個室完備'],
        recommended_scene: ['デート', '接待']
      };
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: mockFacilities });
      api.generateKeywords.mockResolvedValue({ data: mockKeywords });
      
      renderWithAuth(<KeywordGenerationPage />);
      
      await waitFor(() => {
        const facilitySelect = screen.getByLabelText(/施設を選択/i);
        fireEvent.change(facilitySelect, { target: { value: '1' } });
      });
      
      const generateButton = screen.getByRole('button', { name: /キーワード生成/i });
      fireEvent.click(generateButton);
      
      await waitFor(() => {
        expect(api.generateKeywords).toHaveBeenCalledWith('1');
        expect(screen.getByText(/ランチセット/i)).toBeInTheDocument();
        expect(screen.getByText(/テラス席あり/i)).toBeInTheDocument();
        expect(screen.getByText(/デート/i)).toBeInTheDocument();
      });
    });
    
    it('キーワード編集後に保存ボタンクリック時にキーワードが更新されること', async () => {
      const { default: KeywordGenerationPage } = await import('../../../src/pages/keywords/KeywordGenerationPage');
      
      const mockFacilities = [
        { id: '1', facility_name: '施設1' }
      ];
      
      const mockKeywords = {
        menu_service: ['ランチセット', 'ディナーコース'],
        environment_facility: ['テラス席あり', '個室完備'],
        recommended_scene: ['デート', '接待']
      };
      
      const api = require('../../../src/services/api').default;
      api.getFacilities.mockResolvedValue({ data: mockFacilities });
      api.getKeywords.mockResolvedValue({ data: mockKeywords });
      api.updateKeywords.mockResolvedValue({ success: true });
      
      renderWithAuth(<KeywordGenerationPage />);
      
      await waitFor(() => {
        const facilitySelect = screen.getByLabelText(/施設を選択/i);
        fireEvent.change(facilitySelect, { target: { value: '1' } });
      });
      
      await waitFor(() => {
        expect(screen.getByText(/ランチセット/i)).toBeInTheDocument();
      });
      
      const addButton = screen.getAllByText(/追加/i)[0];
      fireEvent.click(addButton);
      
      const newKeywordInput = screen.getByPlaceholderText(/新しいキーワード/i);
      fireEvent.change(newKeywordInput, { target: { value: '新メニュー' } });
      
      const confirmButton = screen.getByText(/確定/i);
      fireEvent.click(confirmButton);
      
      const saveButton = screen.getByRole('button', { name: /保存/i });
      fireEvent.click(saveButton);
      
      await waitFor(() => {
        expect(api.updateKeywords).toHaveBeenCalled();
        expect(api.updateKeywords.mock.calls[0][1].menu_service).toContain('新メニュー');
      });
    });
  });
});
