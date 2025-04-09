/**
 * AIサービスのエラーハンドリング
 * AIサービスで発生するエラーを適切に処理し、ユーザーフレンドリーなエラーメッセージを提供します
 */

import logger from '../../utils/logger.js';

class AIErrorHandler {
  /**
   * キーワード生成エラーの処理
   * @param {Error} error - 発生したエラー
   * @param {Object} facility - 施設情報
   * @returns {Object} - エラー情報を含むオブジェクト
   */
  handleKeywordGenerationError(error, facility) {
    logger.error(`キーワード生成エラー: ${error.message}`);
    
    let errorMessage = 'キーワード生成中にエラーが発生しました';
    let errorCode = 'KEYWORD_GENERATION_ERROR';
    let errorDetails = error.message;
    
    if (error.message.includes('APIキー')) {
      errorMessage = 'AI APIの認証に失敗しました';
      errorCode = 'API_AUTH_ERROR';
    } else if (error.message.includes('タイムアウト') || error.message.includes('timeout')) {
      errorMessage = 'AIサービスからの応答がタイムアウトしました';
      errorCode = 'API_TIMEOUT_ERROR';
    } else if (error.message.includes('レート制限') || error.message.includes('rate limit')) {
      errorMessage = 'AIサービスのレート制限に達しました。しばらく待ってから再試行してください';
      errorCode = 'RATE_LIMIT_ERROR';
    } else if (error.message.includes('JSON') || error.message.includes('形式が不正')) {
      errorMessage = 'AIからの応答の形式が不正です';
      errorCode = 'RESPONSE_FORMAT_ERROR';
    }
    
    const fallbackKeywords = this.generateFallbackKeywords(facility);
    
    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
        details: errorDetails
      },
      fallback: true,
      data: fallbackKeywords
    };
  }
  
  /**
   * クロールエラーの処理
   * @param {Error} error - 発生したエラー
   * @param {string} url - クロール対象のURL
   * @returns {Object} - エラー情報を含むオブジェクト
   */
  handleCrawlError(error, url) {
    logger.error(`クロールエラー: ${error.message}`);
    
    let errorMessage = 'ウェブサイトのクロール中にエラーが発生しました';
    let errorCode = 'CRAWL_ERROR';
    
    if (error.message.includes('APIキー')) {
      errorMessage = 'クロールAPIの認証に失敗しました';
      errorCode = 'CRAWL_AUTH_ERROR';
    } else if (error.message.includes('タイムアウト') || error.message.includes('timeout')) {
      errorMessage = 'クロールがタイムアウトしました';
      errorCode = 'CRAWL_TIMEOUT_ERROR';
    } else if (error.message.includes('見つかりません') || error.message.includes('not found')) {
      errorMessage = 'URLが見つかりませんでした';
      errorCode = 'URL_NOT_FOUND_ERROR';
    } else if (error.message.includes('アクセスできません') || error.message.includes('access denied')) {
      errorMessage = 'URLへのアクセスが拒否されました';
      errorCode = 'ACCESS_DENIED_ERROR';
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
        details: error.message,
        url: url
      }
    };
  }
  
  /**
   * GPTエラーの処理
   * @param {Error} error - 発生したエラー
   * @param {string} prompt - 使用されたプロンプト
   * @returns {Object} - エラー情報を含むオブジェクト
   */
  handleGPTError(error, prompt) {
    logger.error(`GPTエラー: ${error.message}`);
    
    let errorMessage = 'AIモデルの呼び出し中にエラーが発生しました';
    let errorCode = 'GPT_ERROR';
    
    if (error.message.includes('APIキー')) {
      errorMessage = 'AI APIの認証に失敗しました';
      errorCode = 'GPT_AUTH_ERROR';
    } else if (error.message.includes('タイムアウト') || error.message.includes('timeout')) {
      errorMessage = 'AIからの応答がタイムアウトしました';
      errorCode = 'GPT_TIMEOUT_ERROR';
    } else if (error.message.includes('レート制限') || error.message.includes('rate limit')) {
      errorMessage = 'AIサービスのレート制限に達しました';
      errorCode = 'GPT_RATE_LIMIT_ERROR';
    } else if (error.message.includes('コンテンツポリシー') || error.message.includes('content policy')) {
      errorMessage = 'AIのコンテンツポリシーに違反するリクエストです';
      errorCode = 'CONTENT_POLICY_ERROR';
    }
    
    return {
      success: false,
      error: {
        message: errorMessage,
        code: errorCode,
        details: error.message
      }
    };
  }
  
  /**
   * フォールバックキーワードの生成
   * AIサービスが失敗した場合に、基本的なキーワードを生成します
   * @param {Object} facility - 施設情報
   * @returns {Object} - 基本的なキーワード
   */
  generateFallbackKeywords(facility) {
    const keywords = {
      menu_service: [],
      environment_facility: [],
      recommended_scene: []
    };
    
    if (facility.business_type) {
      const businessType = facility.business_type.toLowerCase();
      
      if (businessType.includes('レストラン') || businessType.includes('飲食') || 
          businessType.includes('カフェ') || businessType.includes('居酒屋')) {
        keywords.menu_service = [
          'ランチメニュー', 'ディナーコース', 'テイクアウト', '宴会プラン', 
          '飲み放題', '食べ放題', '季節限定メニュー'
        ];
        keywords.environment_facility = [
          '個室あり', '座敷あり', 'テラス席', '禁煙', '駐車場完備', 
          'Wi-Fi完備', 'バリアフリー'
        ];
        keywords.recommended_scene = [
          '家族での食事', 'デート', '接待', '女子会', '宴会', 
          '記念日', '誕生日'
        ];
      } 
      else if (businessType.includes('美容') || businessType.includes('サロン') || 
               businessType.includes('ヘア')) {
        keywords.menu_service = [
          'カット', 'カラー', 'パーマ', 'トリートメント', 'ヘッドスパ', 
          'マツエク', 'ネイル'
        ];
        keywords.environment_facility = [
          '完全個室', '駐車場あり', '予約制', 'キッズスペース', 
          'バリアフリー', 'Wi-Fi完備'
        ];
        keywords.recommended_scene = [
          '結婚式前', 'デート前', '就職活動', '記念日', 
          'イメージチェンジ', 'リフレッシュ'
        ];
      }
      else if (businessType.includes('ホテル') || businessType.includes('旅館') || 
               businessType.includes('宿')) {
        keywords.menu_service = [
          '朝食付き', '夕食付き', '温泉', 'マッサージ', 'ルームサービス', 
          '送迎サービス', '観光案内'
        ];
        keywords.environment_facility = [
          '大浴場', '露天風呂', 'Wi-Fi完備', '駐車場無料', 
          'バリアフリー', '禁煙ルーム'
        ];
        keywords.recommended_scene = [
          '家族旅行', 'カップル旅行', '一人旅', 'ビジネス出張', 
          '記念日', '女子旅', 'グループ旅行'
        ];
      }
      else {
        keywords.menu_service = [
          'サービスメニュー', '料金プラン', '初回割引', '定期コース', 
          '会員特典', '期間限定'
        ];
        keywords.environment_facility = [
          '駐車場あり', 'アクセス便利', 'バリアフリー', 'Wi-Fi完備', 
          '予約可能', '完全個室'
        ];
        keywords.recommended_scene = [
          '家族で利用', '友人と一緒に', 'デート', '記念日', 
          'リラックスタイム', '日常使い'
        ];
      }
    }
    
    if (facility.address) {
      const addressParts = facility.address.split(/[都道府県市区町村]/);
      if (addressParts.length > 1) {
        const locationKeywords = [
          `${addressParts[0]}の${facility.business_type || '店舗'}`,
          `${addressParts[0]}エリア`,
          `${addressParts[0]}周辺`
        ];
        
        keywords.menu_service = [...keywords.menu_service, ...locationKeywords];
      }
    }
    
    if (facility.facility_name) {
      keywords.menu_service.push(`${facility.facility_name}のメニュー`);
      keywords.environment_facility.push(`${facility.facility_name}の設備`);
      keywords.recommended_scene.push(`${facility.facility_name}でのひととき`);
    }
    
    return keywords;
  }
}

export default new AIErrorHandler();
