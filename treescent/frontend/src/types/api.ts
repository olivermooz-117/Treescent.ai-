export interface User {
  id: number;
  email: string;
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
  created_at: string;
}

export interface PublicUser {
  username: string;
  display_name: string;
  bio: string | null;
  avatar_url: string | null;
  theme: string;
}

export interface AuthResponse {
  user: User;
  access_token: string;
  refresh_token: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  username: string;
  password: string;
}

export interface UpdateProfileRequest {
  display_name?: string;
  bio?: string;
  avatar_url?: string;
  theme?: string;
}

export interface Link {
  id: number;
  title: string;
  url: string;
  position: number;
  is_active: boolean;
  click_count?: number;
}

export interface CreateLinkRequest {
  title: string;
  url: string;
  position?: number;
  is_active?: boolean;
}

export interface UpdateLinkRequest {
  title?: string;
  url?: string;
  position?: number;
  is_active?: boolean;
}

export interface Click {
  id: number;
  link_id: number;
  clicked_at: string;
  referrer: string | null;
  user_agent: string | null;
}

export interface HealthResponse {
  status: string;
  app: string;
}

export interface ApiError {
  error: string;
}