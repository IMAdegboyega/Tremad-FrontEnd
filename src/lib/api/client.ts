/**
 * API Client — Hardened
 *
 * Handles all HTTP requests to the backend API.
 * - Automatic token handling
 * - Request timeout (configurable, default 15s)
 * - Retry with exponential backoff (configurable, default 2 retries)
 * - Structured error handling
 */

import { API_BASE_URL } from './endpoints';

// ============================================================================
// CONFIG
// ============================================================================

const REQUEST_TIMEOUT_MS = 15_000; // 15 seconds
const MAX_RETRIES = 2;
const RETRY_BASE_DELAY_MS = 1_000; // 1s, then 2s (exponential)

// Retry only on network errors and 5xx. Never retry auth failures or 4xx.
const RETRYABLE_STATUS_CODES = new Set([408, 429, 500, 502, 503, 504]);

// ============================================================================
// TOKEN / USER STORAGE
// ============================================================================

const TOKEN_KEY = 'tremad_auth_token';
const USER_KEY = 'tremad_user';

export const getToken = (): string | null => {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
};

export const setToken = (token: string): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(TOKEN_KEY, token);
  // Sync cookie for Next.js middleware (middleware can't read localStorage)
  document.cookie = 'tremad_auth_active=1; path=/; SameSite=Lax';
};

export const removeToken = (): void => {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  // Clear auth cookies for Next.js middleware
  document.cookie = 'tremad_auth_active=; path=/; max-age=0';
  document.cookie = 'tremad_user_role=; path=/; max-age=0';
};

export const getUser = (): any | null => {
  if (typeof window === 'undefined') return null;
  try {
    const user = localStorage.getItem(USER_KEY);
    return user ? JSON.parse(user) : null;
  } catch {
    return null;
  }
};

export const setUser = (user: any): void => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  // Sync role cookie for Next.js middleware route protection
  if (user?.role) {
    document.cookie = `tremad_user_role=${user.role}; path=/; SameSite=Lax`;
  }
};

// ============================================================================
// TYPES
// ============================================================================

export interface ApiResponse<T = any> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: any[];
}

export interface ApiError {
  status: number;
  message: string;
  errors?: any[];
  isTimeout?: boolean;
  isNetworkError?: boolean;
}

// ============================================================================
// INTERNAL HELPERS
// ============================================================================

const buildUrl = (endpoint: string): string => {
  return `${API_BASE_URL}${endpoint}`;
};

const buildHeaders = (includeAuth: boolean = true): HeadersInit => {
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (includeAuth) {
    const token = getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  return headers;
};

/**
 * Fetch with timeout using AbortController
 */
const fetchWithTimeout = (
  url: string,
  options: RequestInit,
  timeoutMs: number = REQUEST_TIMEOUT_MS
): Promise<Response> => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  return fetch(url, { ...options, signal: controller.signal }).finally(() => {
    clearTimeout(timeoutId);
  });
};

/**
 * Sleep for exponential backoff
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Core request function with retry logic
 */
const request = async <T>(
  url: string,
  options: RequestInit,
  retries: number = MAX_RETRIES
): Promise<ApiResponse<T>> => {
  let lastError: ApiError | null = null;

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      // Don't retry client errors (except specific retryable ones)
      if (!response.ok && !RETRYABLE_STATUS_CODES.has(response.status)) {
        return handleErrorResponse(response);
      }

      // Retry on retryable status codes
      if (!response.ok && RETRYABLE_STATUS_CODES.has(response.status)) {
        if (attempt < retries) {
          const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
          console.warn(`[API] Retrying (${attempt + 1}/${retries}) after ${delay}ms — status ${response.status}`);
          await sleep(delay);
          continue;
        }
        // Final attempt failed
        return handleErrorResponse(response);
      }

      // Success
      const data = await response.json();
      return data;
    } catch (error: any) {
      // AbortController timeout
      if (error.name === 'AbortError') {
        lastError = {
          status: 0,
          message: 'Request timed out. Please check your connection and try again.',
          isTimeout: true,
        };
      }
      // Network error (offline, DNS failure, etc.)
      else if (error instanceof TypeError && error.message.includes('fetch')) {
        lastError = {
          status: 0,
          message: 'Network error. Please check your internet connection.',
          isNetworkError: true,
        };
      } else {
        lastError = {
          status: 0,
          message: error.message || 'An unexpected error occurred',
        };
      }

      // Retry on network errors
      if (attempt < retries) {
        const delay = RETRY_BASE_DELAY_MS * Math.pow(2, attempt);
        console.warn(`[API] Retrying (${attempt + 1}/${retries}) after ${delay}ms — ${lastError.message}`);
        await sleep(delay);
        continue;
      }
    }
  }

  // All retries exhausted
  throw lastError || { status: 0, message: 'Request failed after retries' };
};

/**
 * Handle non-OK HTTP responses
 */
const handleErrorResponse = async <T>(response: Response): Promise<never> => {
  let data: any = {};
  try {
    data = await response.json();
  } catch {
    // Response body isn't JSON
  }

  // 401 — clear auth and redirect to appropriate login
  if (response.status === 401) {
    removeToken();
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('SuperAdmin')) {
        window.location.href = '/SuperAdmin/sign-in';
      } else if (path.includes('Admin')) {
        window.location.href = '/Admin/sign-in';
      } else {
        window.location.href = '/sign-in';
      }
    }
  }

  throw {
    status: response.status,
    message: data.message || `Request failed with status ${response.status}`,
    errors: data.errors,
  } as ApiError;
};

// ============================================================================
// PUBLIC API METHODS
// ============================================================================

export const get = async <T = any>(
  endpoint: string,
  params?: Record<string, any>,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  let url = buildUrl(endpoint);

  if (params) {
    const searchParams = new URLSearchParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        searchParams.append(key, String(value));
      }
    });
    const queryString = searchParams.toString();
    if (queryString) url += `?${queryString}`;
  }

  return request<T>(url, {
    method: 'GET',
    headers: buildHeaders(includeAuth),
  });
};

export const post = async <T = any>(
  endpoint: string,
  body?: any,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  return request<T>(buildUrl(endpoint), {
    method: 'POST',
    headers: buildHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const put = async <T = any>(
  endpoint: string,
  body?: any,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  return request<T>(buildUrl(endpoint), {
    method: 'PUT',
    headers: buildHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const patch = async <T = any>(
  endpoint: string,
  body?: any,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  return request<T>(buildUrl(endpoint), {
    method: 'PATCH',
    headers: buildHeaders(includeAuth),
    body: body ? JSON.stringify(body) : undefined,
  });
};

export const del = async <T = any>(
  endpoint: string,
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  return request<T>(buildUrl(endpoint), {
    method: 'DELETE',
    headers: buildHeaders(includeAuth),
  });
};

/**
 * Upload a multipart/form-data body (typically for file uploads).
 *
 * We intentionally DO NOT set Content-Type here — letting the browser set it
 * is the only way it can include the multipart boundary string. `fetch` + a
 * raw `FormData` body does the right thing on its own.
 */
export const upload = async <T = any>(
  endpoint: string,
  formData: FormData,
  method: 'POST' | 'PUT' | 'PATCH' = 'POST',
  includeAuth: boolean = true
): Promise<ApiResponse<T>> => {
  const headers: Record<string, string> = {};
  if (includeAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  return request<T>(buildUrl(endpoint), {
    method,
    headers,
    body: formData,
  });
};

export const isAuthenticated = (): boolean => {
  return !!getToken();
};

// ============================================================================
// DEFAULT EXPORT
// ============================================================================

const apiClient = {
  get,
  post,
  put,
  patch,
  delete: del,
  upload,
  getToken,
  setToken,
  removeToken,
  getUser,
  setUser,
  isAuthenticated,
};

export default apiClient;
