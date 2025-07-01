import { createClient } from "@supabase/supabase-js"
import type { Database } from "@/types/supabase"

// シングルトンパターンでクライアントを作成
let supabaseInstance: ReturnType<typeof createClient<Database>> | null = null

// サーバーサイド用のクライアント
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  return createClient<Database>(supabaseUrl, supabaseKey)
}

// クライアントサイド用のクライアント
export const createBrowserSupabaseClient = () => {
  if (supabaseInstance) return supabaseInstance

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase environment variables")
  }

  supabaseInstance = createClient<Database>(supabaseUrl, supabaseKey)
  return supabaseInstance
}

// クライアントサイドでのみ使用するためのヘルパー
export const getSupabase = () => {
  if (typeof window === "undefined") {
    return createServerSupabaseClient()
  }
  return createBrowserSupabaseClient()
}
