import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

const FacilitiesListPage = () => {
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchFacilities = async () => {
      try {
        setLoading(true);
        const response = await api.facilities.getAll();
        setFacilities(response.data);
        setError(null);
      } catch (err) {
        console.error('施設情報の取得に失敗しました:', err);
        setError('施設情報の取得に失敗しました。再度お試しください。');
      } finally {
        setLoading(false);
      }
    };

    fetchFacilities();
  }, []);

  const handleDelete = async (facilityId) => {
    if (!window.confirm('この施設を削除してもよろしいですか？')) {
      return;
    }

    try {
      await api.facilities.delete(facilityId);
      setFacilities(facilities.filter(facility => facility.facility_id !== facilityId));
    } catch (err) {
      console.error('施設の削除に失敗しました:', err);
      alert('施設の削除に失敗しました。再度お試しください。');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">エラー: </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">施設一覧</h1>
        <Link
          to="/facilities/new"
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded"
        >
          新規施設登録
        </Link>
      </div>

      {facilities.length === 0 ? (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                登録されている施設がありません。「新規施設登録」ボタンから施設を登録してください。
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <ul className="divide-y divide-gray-200">
            {facilities.map((facility) => (
              <li key={facility.facility_id}>
                <div className="px-4 py-4 sm:px-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="ml-3">
                        <p className="text-lg font-medium text-blue-600 truncate">
                          {facility.facility_name}
                        </p>
                        <p className="text-sm text-gray-500">
                          {facility.business_type || '業種未設定'} | {facility.agency || '代理店未設定'}
                        </p>
                      </div>
                    </div>
                    <div className="flex space-x-2">
                      <Link
                        to={`/facilities/${facility.facility_id}/keywords`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500"
                      >
                        キーワード生成
                      </Link>
                      <Link
                        to={`/facilities/${facility.facility_id}`}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-500"
                      >
                        編集
                      </Link>
                      <button
                        onClick={() => handleDelete(facility.facility_id)}
                        className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500"
                      >
                        削除
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default FacilitiesListPage;
