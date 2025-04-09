import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';

const KeywordGenerationPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [facility, setFacility] = useState(null);
  const [keywords, setKeywords] = useState({
    menu_service: [],
    environment_facility: [],
    recommended_scene: []
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [generationStatus, setGenerationStatus] = useState('');

  // 施設情報とキーワードの取得
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // 施設情報の取得
        const facilityResponse = await api.facilities.getById(id);
        setFacility(facilityResponse.data);
        
        // キーワード情報の取得
        try {
          const keywordsResponse = await api.keywords.getByFacilityId(id);
          if (keywordsResponse.data && Object.keys(keywordsResponse.data).length > 0) {
            setKeywords(keywordsResponse.data);
          }
        } catch (err) {
          // キーワードがまだ生成されていない場合は無視
          if (err.response && err.response.status !== 404) {
            console.error('キーワード取得エラー:', err);
          }
        }
        
        setError(null);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('施設情報の取得に失敗しました。再度お試しください。');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // キーワード生成
  const generateKeywords = async () => {
    try {
      setIsGenerating(true);
      setGenerationStatus('クローリングを開始しています...');
      setError(null);
      
      // キーワード生成APIの呼び出し
      const response = await api.keywords.generate(id);
      
      setKeywords(response.data);
      setSuccessMessage('キーワードが生成されました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('キーワード生成エラー:', err);
      setError('キーワードの生成に失敗しました。再度お試しください。');
    } finally {
      setIsGenerating(false);
      setGenerationStatus('');
    }
  };

  // キーワードの更新
  const handleKeywordChange = (category, index, value) => {
    setKeywords(prev => {
      const newKeywords = { ...prev };
      newKeywords[category][index] = value;
      return newKeywords;
    });
  };

  // キーワードの追加
  const addKeyword = (category) => {
    setKeywords(prev => {
      const newKeywords = { ...prev };
      newKeywords[category] = [...newKeywords[category], ''];
      return newKeywords;
    });
  };

  // キーワードの削除
  const removeKeyword = (category, index) => {
    setKeywords(prev => {
      const newKeywords = { ...prev };
      newKeywords[category] = newKeywords[category].filter((_, i) => i !== index);
      return newKeywords;
    });
  };

  // キーワードの保存
  const saveKeywords = async () => {
    try {
      setIsSaving(true);
      setError(null);
      
      // 空のキーワードを除外
      const cleanedKeywords = {
        menu_service: keywords.menu_service.filter(k => k.trim() !== ''),
        environment_facility: keywords.environment_facility.filter(k => k.trim() !== ''),
        recommended_scene: keywords.recommended_scene.filter(k => k.trim() !== '')
      };
      
      await api.keywords.update(id, cleanedKeywords);
      
      setKeywords(cleanedKeywords);
      setSuccessMessage('キーワードが保存されました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('キーワード保存エラー:', err);
      setError('キーワードの保存に失敗しました。再度お試しください。');
    } finally {
      setIsSaving(false);
    }
  };

  // CSVエクスポート
  const exportCSV = async () => {
    try {
      setIsExporting(true);
      setError(null);
      
      const response = await api.export.csv(id);
      
      // BlobからURLを作成
      const url = window.URL.createObjectURL(new Blob([response.data]));
      
      // ダウンロードリンクを作成して自動クリック
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `keywords_${id}.csv`);
      document.body.appendChild(link);
      link.click();
      
      // クリーンアップ
      window.URL.revokeObjectURL(url);
      document.body.removeChild(link);
      
      setSuccessMessage('CSVファイルがダウンロードされました');
      setTimeout(() => setSuccessMessage(''), 3000);
    } catch (err) {
      console.error('CSVエクスポートエラー:', err);
      setError('CSVのエクスポートに失敗しました。再度お試しください。');
    } finally {
      setIsExporting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!facility) {
    return (
      <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
        <strong className="font-bold">エラー: </strong>
        <span className="block sm:inline">施設情報が見つかりませんでした。</span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">キーワード生成・編集</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => navigate(`/facilities/${id}`)}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            施設情報に戻る
          </button>
          <button
            onClick={() => navigate('/')}
            className="bg-gray-500 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded"
          >
            施設一覧に戻る
          </button>
        </div>
      </div>
      
      <div className="bg-white shadow-md rounded px-8 pt-6 pb-8 mb-4">
        <div className="mb-6">
          <h2 className="text-xl font-semibold mb-2">{facility.facility_name}</h2>
          <p className="text-gray-600">{facility.business_type || '業種未設定'}</p>
        </div>
        
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
        
        <div className="mb-6">
          <div className="flex justify-between items-center">
            <button
              onClick={generateKeywords}
              disabled={isGenerating}
              className={`bg-green-500 hover:bg-green-600 text-white font-medium py-2 px-4 rounded ${
                isGenerating ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {isGenerating ? 'キーワード生成中...' : 'キーワードを自動生成'}
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={saveKeywords}
                disabled={isSaving}
                className={`bg-blue-500 hover:bg-blue-600 text-white font-medium py-2 px-4 rounded ${
                  isSaving ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSaving ? '保存中...' : 'キーワードを保存'}
              </button>
              
              <button
                onClick={exportCSV}
                disabled={isExporting || Object.values(keywords).every(arr => arr.length === 0)}
                className={`bg-purple-500 hover:bg-purple-600 text-white font-medium py-2 px-4 rounded ${
                  isExporting || Object.values(keywords).every(arr => arr.length === 0) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isExporting ? 'エクスポート中...' : 'CSVエクスポート'}
              </button>
            </div>
          </div>
          
          {isGenerating && generationStatus && (
            <div className="mt-2 text-sm text-gray-600">
              {generationStatus}
            </div>
          )}
        </div>
        
        {/* キーワード編集セクション */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* メニュー・サービス */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">メニュー・サービス</h3>
              <button
                onClick={() => addKeyword('menu_service')}
                className="text-blue-500 hover:text-blue-700"
              >
                + 追加
              </button>
            </div>
            
            {keywords.menu_service.length === 0 ? (
              <p className="text-gray-500 text-sm italic">キーワードがありません</p>
            ) : (
              <ul className="space-y-2">
                {keywords.menu_service.map((keyword, index) => (
                  <li key={index} className="flex items-center">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange('menu_service', index, e.target.value)}
                      className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      onClick={() => removeKeyword('menu_service', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* 環境・設備 */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">環境・設備</h3>
              <button
                onClick={() => addKeyword('environment_facility')}
                className="text-blue-500 hover:text-blue-700"
              >
                + 追加
              </button>
            </div>
            
            {keywords.environment_facility.length === 0 ? (
              <p className="text-gray-500 text-sm italic">キーワードがありません</p>
            ) : (
              <ul className="space-y-2">
                {keywords.environment_facility.map((keyword, index) => (
                  <li key={index} className="flex items-center">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange('environment_facility', index, e.target.value)}
                      className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      onClick={() => removeKeyword('environment_facility', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
          
          {/* おすすめの利用シーン */}
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">おすすめの利用シーン</h3>
              <button
                onClick={() => addKeyword('recommended_scene')}
                className="text-blue-500 hover:text-blue-700"
              >
                + 追加
              </button>
            </div>
            
            {keywords.recommended_scene.length === 0 ? (
              <p className="text-gray-500 text-sm italic">キーワードがありません</p>
            ) : (
              <ul className="space-y-2">
                {keywords.recommended_scene.map((keyword, index) => (
                  <li key={index} className="flex items-center">
                    <input
                      type="text"
                      value={keyword}
                      onChange={(e) => handleKeywordChange('recommended_scene', index, e.target.value)}
                      className="flex-grow shadow appearance-none border rounded py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                    />
                    <button
                      onClick={() => removeKeyword('recommended_scene', index)}
                      className="ml-2 text-red-500 hover:text-red-700"
                    >
                      ×
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default KeywordGenerationPage;
