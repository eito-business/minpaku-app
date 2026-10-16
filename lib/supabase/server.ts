import { createClient } from "@supabase/supabase-js";
import { auth } from "@clerk/nextjs/server";
import { type Database } from "./types/database.types";
 
/**
 * サーバーコンポーネント用のSupabaseクライアントを作成する
 *
 * Clerk認証を通じて取得したユーザーのアクセストークンを使用して、
 * サーバーサイドでSupabaseクライアントを初期化します。
 * これにより、RLS（行レベルセキュリティ）が適切に機能し、
 * ユーザーは自分のデータにのみアクセスできます。
 */
export const createServerClient = async () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
 
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Missing Supabase credentials");
  }
 
  return createClient<Database>(supabaseUrl, supabaseKey, {
    async accessToken() {
      return (await auth()).getToken();
    },
  });
};