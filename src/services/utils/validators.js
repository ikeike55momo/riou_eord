// backend/routes/validators.js
import { body, param } from 'express-validator';

// 施設情報バリデーションルール
export const facilityValidators = [
  body('facility_name').notEmpty().withMessage('施設名は必須です'),
  body('facility_type').notEmpty().withMessage('施設タイプは必須です'),
  body('address').notEmpty().withMessage('住所は必須です'),
  body('phone_number').optional().matches(/^[0-9-+()]*$/).withMessage('電話番号の形式が正しくありません'),
  body('website_url').optional().isURL().withMessage('ウェブサイトURLの形式が正しくありません'),
  body('google_map_url').optional().isURL().withMessage('GoogleマップURLの形式が正しくありません'),
  body('business_hours').optional().isArray().withMessage('営業時間は配列形式で入力してください'),
  body('price_range').optional().isString().withMessage('価格帯は文字列で入力してください'),
  body('capacity').optional().isInt({ min: 0 }).withMessage('収容人数は0以上の整数で入力してください'),
  body('parking').optional().isBoolean().withMessage('駐車場の有無はブール値で入力してください'),
  body('reservation_required').optional().isBoolean().withMessage('予約必須かどうかはブール値で入力してください'),
  body('average_rating').optional().isFloat({ min: 0, max: 5 }).withMessage('平均評価は0〜5の数値で入力してください'),
  body('review_count').optional().isInt({ min: 0 }).withMessage('レビュー数は0以上の整数で入力してください'),
  body('description').optional().isString().withMessage('説明は文字列で入力してください'),
  body('features').optional().isArray().withMessage('特徴は配列形式で入力してください'),
  body('images').optional().isArray().withMessage('画像は配列形式で入力してください'),
  body('menu_items').optional().isArray().withMessage('メニュー項目は配列形式で入力してください'),
  body('services').optional().isArray().withMessage('サービスは配列形式で入力してください'),
  body('accessibility').optional().isObject().withMessage('アクセシビリティは配列形式で入力してください'),
  body('payment_methods').optional().isArray().withMessage('支払い方法は配列形式で入力してください'),
  body('social_media').optional().isObject().withMessage('ソーシャルメディアはオブジェクト形式で入力してください'),
  body('certifications').optional().isArray().withMessage('認証は配列形式で入力してください'),
  body('languages_supported').optional().isArray().withMessage('対応言語は配列形式で入力してください'),
  body('nearby_attractions').optional().isArray().withMessage('近隣の観光スポットは配列形式で入力してください'),
  body('additional_info').optional().isObject().withMessage('追加情報はオブジェクト形式で入力してください'),
];

// 施設IDバリデーションルール
export const facilityIdValidator = [
  param('id').isInt({ min: 1 }).withMessage('施設IDは1以上の整数である必要があります')
];

// キーワードバリデーションルール
export const keywordValidators = [
  body('menu_service').isArray().withMessage('メニュー・サービスキーワードは配列形式で入力してください'),
  body('menu_service.*').isString().withMessage('メニュー・サービスキーワードは文字列で入力してください'),
  body('environment_facility').isArray().withMessage('環境・設備キーワードは配列形式で入力してください'),
  body('environment_facility.*').isString().withMessage('環境・設備キーワードは文字列で入力してください'),
  body('recommended_scene').isArray().withMessage('おすすめの利用シーンキーワードは配列形式で入力してください'),
  body('recommended_scene.*').isString().withMessage('おすすめの利用シーンキーワードは文字列で入力してください'),
];

// ユーザー認証バリデーションルール
export const authValidators = {
  login: [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります')
  ],
  register: [
    body('email').isEmail().withMessage('有効なメールアドレスを入力してください'),
    body('password').isLength({ min: 6 }).withMessage('パスワードは6文字以上である必要があります'),
    body('name').notEmpty().withMessage('名前は必須です'),
    body('role').isIn(['user', 'admin']).withMessage('ロールはuserまたはadminである必要があります')
  ]
};
