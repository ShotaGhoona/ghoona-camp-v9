// ログインリクエスト
export interface LoginRequest {
  email: string;
  password: string;
}

// ログインレスポンス (バックエンド: POST /auth/login)
export interface LoginResponse {
  message: string;
  user_id: string; // UUID
}

// ログアウトレスポンス (バックエンド: POST /auth/logout)
export interface LogoutResponse {
  message: string;
}

// 現在のユーザー情報レスポンス (バックエンド: GET /auth/me)
export interface MeResponse {
  id: string; // UUID
  email: string;
  username: string | null;
  avatar_url: string | null;
  discord_id: string | null;
  is_active: boolean;
}

// ユーザー型 (Ghoona Camp用)
export interface User {
  id: string; // UUID
  email: string;
  username?: string;
  avatar_url?: string;
  discord_id?: string;
  is_active: boolean;
}
