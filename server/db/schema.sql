-- キーワード自動提案Webアプリ データベーススキーマ

-- ユーザーテーブル（内部スタッフ用）
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  hashed_password VARCHAR(255),
  role VARCHAR(50) NOT NULL CHECK (role IN ('USER', 'admin')),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 施設情報テーブル（25項目+追加情報フィールド）
CREATE TABLE facilities (
  facility_id SERIAL PRIMARY KEY,
  facility_name VARCHAR(255) NOT NULL,
  agency VARCHAR(255),
  start_month VARCHAR(100),
  has_mybusiness_owner_permission BOOLEAN,
  initial_review_rating DECIMAL(3, 1),
  initial_review_count INTEGER,
  business_type VARCHAR(255),
  concept TEXT,
  atmosphere TEXT,
  unique_strength TEXT,
  menu_services TEXT,
  recommended_items TEXT,
  has_course_or_buffet BOOLEAN,
  has_takeout_delivery BOOLEAN,
  average_price VARCHAR(100),
  seat_types TEXT,
  smoking_policy VARCHAR(100),
  has_parking BOOLEAN,
  special_facilities TEXT,
  main_target TEXT,
  usage_scenes TEXT,
  faq TEXT,
  preferred_expressions TEXT,
  renewal_or_additional_menu TEXT,
  seasonal_menu TEXT,
  additional_notes TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id)
);

-- キーワードテーブル（3カテゴリのキーワード管理用）
CREATE TABLE keywords (
  keyword_id SERIAL PRIMARY KEY,
  facility_id INTEGER REFERENCES facilities(facility_id) ON DELETE CASCADE,
  category VARCHAR(100) NOT NULL CHECK (category IN ('menu_services', 'environment_facilities', 'recommended_scenes')),
  keywords TEXT NOT NULL,
  generation_timestamp TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- インデックス作成
CREATE INDEX idx_facilities_name ON facilities(facility_name);
CREATE INDEX idx_keywords_facility_id ON keywords(facility_id);
CREATE INDEX idx_keywords_category ON keywords(category);

-- トリガー関数: 更新時にupdated_atを現在時刻に設定
CREATE OR REPLACE FUNCTION update_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガー設定
CREATE TRIGGER update_users_timestamp
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_facilities_timestamp
BEFORE UPDATE ON facilities
FOR EACH ROW EXECUTE FUNCTION update_timestamp();

CREATE TRIGGER update_keywords_timestamp
BEFORE UPDATE ON keywords
FOR EACH ROW EXECUTE FUNCTION update_timestamp(); 