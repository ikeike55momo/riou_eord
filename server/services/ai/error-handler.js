/**
 * AI機能のエラーハンドリングサービス
 * AI関連の処理で発生するエラーを適切に処理します
 */

import logger from '../../utils/logger.js';

/**
 * エラーの種類
 */
const ErrorTypes = {
  API_KEY_MISSING: 'api_key_missing',
  API_CONNECTION: 'api_connection',
  API_RATE_LIMIT: 'api_rate_limit',
  INVALID_RESPONSE: 'invalid_response',
  PARSING_ERROR: 'parsing_error',
  TIMEOUT: 'timeout',
  UNKNOWN: 'unknown'
};

/**
 * AI機能のエラーハンドリングサービスクラス
 */
class ErrorHandlerService {
  /**
   * エラーの種類を判定
   * @param {Error} error - 発生したエラー
   * @returns {string} エラーの種類
   */
  determineErrorType(error) {
    const message = error.message.toLowerCase();
    
    if (message.includes('api key') || message.includes('apikey') || message.includes('authentication')) {
      return ErrorTypes.API_KEY_MISSING;
    }
    
    if (message.includes('connect') || message.includes('network') || message.includes('econnrefused')) {
      return ErrorTypes.API_CONNECTION;
    }
    
    if (message.includes('rate limit') || message.includes('too many requests') || message.includes('429')) {
      return ErrorTypes.API_RATE_LIMIT;
    }
    
    if (message.includes('invalid') || message.includes('unexpected') || message.includes('format')) {
      return ErrorTypes.INVALID_RESPONSE;
    }
    
    if (message.includes('parse') || message.includes('json') || message.includes('syntax')) {
      return ErrorTypes.PARSING_ERROR;
    }
    
    if (message.includes('timeout') || message.includes('timed out')) {
      return ErrorTypes.TIMEOUT;
    }
    
    return ErrorTypes.UNKNOWN;
  }

  /**
   * エラーを処理してユーザーフレンドリーなメッセージを返す
   * @param {Error} error - 発生したエラー
   * @param {string} context - エラーが発生したコンテキスト
   * @returns {Object} 処理結果
   */
  handleError(error, context = '') {
    const errorType = this.determineErrorType(error);
    let userMessage = '';
    let shouldRetry = false;
    
    switch (errorType) {
      case ErrorTypes.API_KEY_MISSING:
        userMessage = 'API認証に失敗しました。APIキーの設定を確認してください。';
        shouldRetry = false;
        break;
        
      case ErrorTypes.API_CONNECTION:
        userMessage = 'APIサーバーに接続できませんでした。インターネット接続を確認してください。';
        shouldRetry = true;
        break;
        
      case ErrorTypes.API_RATE_LIMIT:
        userMessage = 'APIの利用制限に達しました。しばらく時間をおいてから再試行してください。';
        shouldRetry = true;
        break;
        
      case ErrorTypes.INVALID_RESPONSE:
        userMessage = 'APIから無効な応答を受信しました。';
        shouldRetry = true;
        break;
        
      case ErrorTypes.PARSING_ERROR:
        userMessage = 'データの解析中にエラーが発生しました。';
        shouldRetry = false;
        break;
        
      case ErrorTypes.TIMEOUT:
        userMessage = 'リクエストがタイムアウトしました。しばらく時間をおいてから再試行してください。';
        shouldRetry = true;
        break;
        
      case ErrorTypes.UNKNOWN:
      default:
        userMessage = 'エラーが発生しました。';
        shouldRetry = false;
        break;
    }
    
    const contextInfo = context ? ` (コンテキスト: ${context})` : '';
    logger.error(`AI機能エラー${contextInfo}: ${error.message}`, {
      errorType,
      originalError: error.message,
      stack: error.stack,
      context
    });
    
    return {
      success: false,
      errorType,
      message: userMessage,
      shouldRetry,
      originalError: error.message
    };
  }

  /**
   * リトライ可能なエラーの場合にリトライを実行
   * @param {Function} operation - リトライする操作
   * @param {Object} options - リトライオプション
   * @returns {Promise<any>} 操作の結果
   */
  async retryOperation(operation, options = {}) {
    const defaultOptions = {
      maxRetries: 3,
      initialDelay: 1000,
      maxDelay: 10000,
      factor: 2,
      context: ''
    };
    
    const config = { ...defaultOptions, ...options };
    let lastError = null;
    
    for (let attempt = 1; attempt <= config.maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error;
        
        const result = this.handleError(error, config.context);
        
        if (!result.shouldRetry || attempt >= config.maxRetries) {
          break;
        }
        
        const delay = Math.min(
          config.initialDelay * Math.pow(config.factor, attempt - 1),
          config.maxDelay
        );
        
        logger.info(`リトライ ${attempt}/${config.maxRetries} (${delay}ms後)`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
    
    throw lastError;
  }
}

export default new ErrorHandlerService();
