import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../../services/api';

const FacilityFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditMode = !!id;
  
  const [formData, setFormData] = useState({
    facility_name: '',
    agency: '',
    business_type: '',
    concept: '',
    atmosphere: '',
    unique_strength: '',
    menu_services: '',
    average_price: '',
    address: '',
    phone_number: '',
    website_url: '',
    google_map_url: '',
    business_hours: '',
    regular_holiday: '',
    parking: '',
    number_of_seats: '',
    private_room: '',
    smoking: '',
    pet_friendly: '',
    wifi: '',
    payment_options: '',
    barrier_free: '',
    additional_info: '',
    gbp_url: '',
    official_site_url: ''
  });
  
  const [loading, setLoading] = useState(isEditMode);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    if (isEditMode) {
      const fetchFacility = async () => {
        try {
          setLoading(true);
          const response = await api.facilities.getById(id);
          setFormData(response.data);
          setError(null);
        } catch (err) {
          console.error('施設情報の取得に失敗しました:', err);
          setError('施設情報の取得に失敗しました。再度お試しください。');
        } finally {
          setLoading(false);
        }
      };

      fetchFacility();
    }
  }, [id, isEditMode]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setSubmitting(true);
      setError(null);
      
      if (isEditMode) {
        await api.facilities.update(id, formData);
        setSuccessMessage('施設情報が更新されました');
      } else {
        const response = await api.facilities.create(formData);
        setSuccessMessage('施設が登録されました');
        
        setTimeout(() => {
          navigate(`/facilities/${response.data.facility_id}`);
        }, 1500);
      }
    } catch (err) {
      console.error('施設情報の保存に失敗しました:', err);
      setError('施設情報の保存に失敗しました。再度お試しください。');
    } finally {
      setSubmitting(false);
      
      if (successMessage) {
        setTimeout(() => {
          setSuccessMessage('');
        }, 3000);
      }
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">
        {isEditMode ? '施設情報編集' : '新規施設登録'}
      </h1>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
          <strong className="font-bold">エラー: </strong>
          <span className="block sm:inline">{error}</span>
        </div>
      )}
      
      {successMessage && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4" role="alert">
          <span className="block sm:inline">{successMessage}</span>
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* 基本情報セクション */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2">基本情報</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="facility_name">
              施設名 <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="facility_name"
              name="facility_name"
              type="text"
              placeholder="施設名"
              value={formData.facility_name}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="agency">
              代理店
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="agency"
              name="agency"
              type="text"
              placeholder="代理店名"
              value={formData.agency}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="business_type">
              業種 <span className="text-red-500">*</span>
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="business_type"
              name="business_type"
              type="text"
              placeholder="例: レストラン、美容院、ホテルなど"
              value={formData.business_type}
              onChange={handleChange}
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="concept">
              コンセプト
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="concept"
              name="concept"
              placeholder="施設のコンセプト"
              value={formData.concept}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="atmosphere">
              雰囲気
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="atmosphere"
              name="atmosphere"
              placeholder="施設の雰囲気"
              value={formData.atmosphere}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="unique_strength">
              特徴
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="unique_strength"
              name="unique_strength"
              placeholder="施設の特徴"
              value={formData.unique_strength}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="menu_services">
              メニュー・サービス
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="menu_services"
              name="menu_services"
              placeholder="提供しているメニューやサービス（カンマ区切り）"
              value={formData.menu_services}
              onChange={handleChange}
              rows="3"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="average_price">
              平均価格
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="average_price"
              name="average_price"
              type="text"
              placeholder="例: 3000円〜5000円"
              value={formData.average_price}
              onChange={handleChange}
            />
          </div>
          
          {/* 連絡先・アクセスセクション */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-6">連絡先・アクセス</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="address">
              住所
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="address"
              name="address"
              type="text"
              placeholder="住所"
              value={formData.address}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="phone_number">
              電話番号
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="phone_number"
              name="phone_number"
              type="text"
              placeholder="電話番号"
              value={formData.phone_number}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="website_url">
              Webサイト
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="website_url"
              name="website_url"
              type="url"
              placeholder="https://example.com"
              value={formData.website_url}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="google_map_url">
              Google Map URL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="google_map_url"
              name="google_map_url"
              type="url"
              placeholder="https://maps.google.com/..."
              value={formData.google_map_url}
              onChange={handleChange}
            />
          </div>
          
          {/* 営業情報セクション */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-6">営業情報</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="business_hours">
              営業時間
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="business_hours"
              name="business_hours"
              type="text"
              placeholder="例: 10:00〜22:00"
              value={formData.business_hours}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="regular_holiday">
              定休日
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="regular_holiday"
              name="regular_holiday"
              type="text"
              placeholder="例: 月曜日、祝日"
              value={formData.regular_holiday}
              onChange={handleChange}
            />
          </div>
          
          {/* 設備・サービスセクション */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-6">設備・サービス</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="parking">
              駐車場
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="parking"
              name="parking"
              type="text"
              placeholder="例: あり（10台）、なし"
              value={formData.parking}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="number_of_seats">
              座席数
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="number_of_seats"
              name="number_of_seats"
              type="text"
              placeholder="例: 40席"
              value={formData.number_of_seats}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="private_room">
              個室
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="private_room"
              name="private_room"
              type="text"
              placeholder="例: あり（2室）、なし"
              value={formData.private_room}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="smoking">
              喫煙
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="smoking"
              name="smoking"
              type="text"
              placeholder="例: 全席禁煙、喫煙スペースあり"
              value={formData.smoking}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="pet_friendly">
              ペット
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="pet_friendly"
              name="pet_friendly"
              type="text"
              placeholder="例: 同伴可、不可"
              value={formData.pet_friendly}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="wifi">
              Wi-Fi
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="wifi"
              name="wifi"
              type="text"
              placeholder="例: 利用可、利用不可"
              value={formData.wifi}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="payment_options">
              支払い方法
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="payment_options"
              name="payment_options"
              type="text"
              placeholder="例: 現金、クレジットカード、電子マネー"
              value={formData.payment_options}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="barrier_free">
              バリアフリー
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="barrier_free"
              name="barrier_free"
              type="text"
              placeholder="例: 対応、一部対応"
              value={formData.barrier_free}
              onChange={handleChange}
            />
          </div>
          
          {/* その他情報セクション */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-6">その他情報</h2>
          </div>
          
          <div className="col-span-2 mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="additional_info">
              追加情報
            </label>
            <textarea
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="additional_info"
              name="additional_info"
              placeholder="その他、施設に関する追加情報"
              value={formData.additional_info}
              onChange={handleChange}
              rows="4"
            />
          </div>
          
          {/* クローリング用URL */}
          <div className="col-span-2">
            <h2 className="text-xl font-semibold mb-4 border-b pb-2 mt-6">クローリング用URL（キーワード生成に使用）</h2>
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="gbp_url">
              Google ビジネスプロフィールURL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="gbp_url"
              name="gbp_url"
              type="url"
              placeholder="https://www.google.com/maps/place/..."
              value={formData.gbp_url}
              onChange={handleChange}
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="official_site_url">
              公式サイトURL
            </label>
            <input
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              id="official_site_url"
              name="official_site_url"
              type="url"
              placeholder="https://www.example.com"
              value={formData.official_site_url}
              onChange={handleChange}
            />
          </div>
        </div>
        
        <div className="flex items-center justify-end mt-8">
          <button
            type="button"
            onClick={() => navigate('/facilities')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded mr-2"
          >
            キャンセル
          </button>
          <button
            type="submit"
            disabled={submitting}
            className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ${
              submitting ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            {submitting ? '保存中...' : isEditMode ? '更新する' : '登録する'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default FacilityFormPage;
