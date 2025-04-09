import { createClient } from '@supabase/supabase-js'

// Supabase接続情報
// 実際のプロジェクトでは環境変数から取得する
const supabaseUrl = 'https://dstigzldesimivihsryn.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdGlnemxkZXNpbWl2aWhzcnluIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQwODQ3MTQsImV4cCI6MjA1OTY2MDcxNH0.gvkEbn4WV2n_oLbli9BRF0B7lmjZyPIWkOWwhE8FxAE'

// サービスロールキー（管理者権限が必要な操作に使用）
// 注意: このキーは公開しないでください
const serviceRoleKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRzdGlnemxkZXNpbWl2aWhzcnluIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NDA4NDcxNCwiZXhwIjoyMDU5NjYwNzE0fQ.wUNhceWDNeIrmHxkJ4jYKXrJE6FZfkAz6SqsVLe8P3o'

// 通常の操作用クライアント（匿名ユーザー権限）
const supabase = createClient(supabaseUrl, supabaseKey)

// 管理者操作用クライアント（サービスロール権限）
const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey)

export { supabase, supabaseAdmin }
