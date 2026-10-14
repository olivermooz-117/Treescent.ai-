import axios, { type AxiosError, type AxiosInstance, type InternalAxiosRequestConfig } from 'axios';
import type {
  Analytics,
  AuthResponse,
  CreateLinkRequest,
  Link,
  LoginRequest,
  PublicProfileResponse,
  RegisterRequest,
  UpdateLinkRequest,
  UpdateProfileRequest,
  User,
} from '../types/api';

const API_BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace(/\/+$/, '');

class ApiClient {
  private client: AxiosInstance;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private isRefreshing = false;
  private failedQueue: Array<{
    resolve: (token: string) => void;
    reject: (error: Error) => void;
  }> = [];

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      withCredentials: false,
    });

    this.client.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        if (this.accessToken && config.headers) {
          config.headers.Authorization = `Bearer ${this.accessToken}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.client.interceptors.response.use(
      (response) => response,
      async (error: AxiosError<{ error?: unknown }>) => {
        const serverMessage = error.response?.data?.error;
        if (typeof serverMessage === 'string') error.message = serverMessage;
        const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

        if (error.response?.status === 401 && !originalRequest._retry && this.refreshToken) {
          originalRequest._retry = true;

          if (this.isRefreshing) {
            return new Promise((resolve, reject) => {
              this.failedQueue.push({ resolve, reject });
            })
              .then((token) => {
                if (originalRequest.headers) {
                  originalRequest.headers.Authorization = `Bearer ${token}`;
                }
                return this.client(originalRequest);
              })
              .catch((err) => Promise.reject(err));
          }

          this.isRefreshing = true;

          try {
            const response = await axios.post<{ access_token: string }>(
              `${API_BASE_URL}/auth/refresh`,
              {},
              { headers: { Authorization: `Bearer ${this.refreshToken}` } }
            );

            this.setAccessToken(response.data.access_token);
            this.processQueue(null, response.data.access_token);

            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${response.data.access_token}`;
            }

            return this.client(originalRequest);
          } catch (refreshError) {
            this.processQueue(refreshError as Error, '');
            this.clearTokens();
            window.location.href = '/login';
            return Promise.reject(refreshError);
          } finally {
            this.isRefreshing = false;
          }
        }

        return Promise.reject(error);
      }
    );
  }

  private processQueue(error: Error | null, token: string) {
    this.failedQueue.forEach(({ resolve, reject }) => {
      if (error) {
        reject(error);
      } else {
        resolve(token);
      }
    });
    this.failedQueue = [];
  }

  setTokens(auth: AuthResponse) {
    this.accessToken = auth.access_token;
    this.refreshToken = auth.refresh_token;
    localStorage.setItem('access_token', auth.access_token);
    localStorage.setItem('refresh_token', auth.refresh_token);
  }

  setAccessToken(token: string) {
    this.accessToken = token;
    localStorage.setItem('access_token', token);
  }

  loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('access_token');
    this.refreshToken = localStorage.getItem('refresh_token');
  }

  clearTokens() {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  }

  getAccessToken() {
    return this.accessToken;
  }

  isAuthenticated() {
    return !!this.accessToken;
  }

  async register(data: RegisterRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/register', data);
    this.setTokens(response.data);
    return response.data;
  }

  async login(data: LoginRequest): Promise<AuthResponse> {
    const response = await this.client.post<AuthResponse>('/auth/login', data);
    this.setTokens(response.data);
    return response.data;
  }

  async logout(): Promise<void> {
    this.clearTokens();
  }

  async getMe(): Promise<User> {
    const response = await this.client.get<{ user: User }>('/auth/me');
    return response.data.user;
  }

  async updateProfile(data: UpdateProfileRequest): Promise<User> {
    const response = await this.client.patch<{ user: User }>('/auth/me', data);
    return response.data.user;
  }

  async getLinks(): Promise<Link[]> {
    const response = await this.client.get<{ links: Link[] }>('/links');
    return response.data.links;
  }

  async createLink(data: CreateLinkRequest): Promise<Link> {
    const response = await this.client.post<{ link: Link }>('/links', data);
    return response.data.link;
  }

  async updateLink(id: number, data: UpdateLinkRequest): Promise<Link> {
    const response = await this.client.patch<{ link: Link }>(`/links/${id}`, data);
    return response.data.link;
  }

  async deleteLink(id: number): Promise<void> {
    await this.client.delete(`/links/${id}`);
  }

  async reorderLinks(order: number[]): Promise<Link[]> {
    const response = await this.client.put<{ links: Link[] }>('/links/reorder', { order });
    return response.data.links;
  }

  async getAnalytics(): Promise<Analytics> {
    const response = await this.client.get<Analytics>('/analytics');
    return response.data;
  }

  async getPublicProfile(username: string): Promise<PublicProfileResponse> {
    const response = await this.client.get<PublicProfileResponse>(
      `/public/${encodeURIComponent(username)}`
    );
    return response.data;
  }

  getTrackedLinkUrl(linkId: number): string {
    return `${API_BASE_URL}/public/r/${linkId}`;
  }

  async healthCheck(): Promise<{ status: string; app: string }> {
    const response = await this.client.get<{ status: string; app: string }>('/health');
    return response.data;
  }
}

export const api = new ApiClient();