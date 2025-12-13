// src/config/api.ts

// ✅ Gets backend URL from environment variable
const API_BASE_URL = (import.meta.env.VITE_API_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000')).replace(/\/$/, '');

// ✅ Export the base URL
export { API_BASE_URL };

// ✅ Create a reusable fetch function
export const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const url = `${API_BASE_URL}${endpoint}`;

  const config: RequestInit = {
    credentials: 'include', // Important for cookies/sessions
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || `HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('API request failed:', error);
    throw error;
  }
};

// ✅ Export all API endpoints based on your backend routes
export const API_ENDPOINTS = {
  // ==========================================
  // AUTH ENDPOINTS (/api/auth)
  // ==========================================
  AUTH: {
    LOGIN: '/api/auth/login',
    REGISTER: '/api/auth/register',
    VERIFY: '/api/auth/verify',
    LOGOUT: '/api/auth/logout',
    FORGOT_PASSWORD: '/api/auth/forgot-password',
    RESET_PASSWORD: '/api/auth/reset-password',
    GITHUB: '/api/auth/github',
    GITHUB_CALLBACK: '/api/auth/github/callback',
  },

  // ==========================================
  // USER ENDPOINTS (/api/users)
  // ==========================================
  USERS: {
    PROFILE: '/api/users/profile',
    UPDATE_PROFILE: '/api/users/profile',
    DELETE_ACCOUNT: '/api/users/account',
    EXPORT_DATA: '/api/users/export',
    SETTINGS: '/api/users/settings',
  },

  // ==========================================
  // RESUME ENDPOINTS (/api/resume)
  // ==========================================
  RESUME: {
    GET: '/api/resume',
    CREATE: '/api/resume',
    UPDATE: '/api/resume',
    DELETE: '/api/resume',
  },

  // ==========================================
  // PROJECT ENDPOINTS (/api/projects)
  // ==========================================
  PROJECTS: {
    GET_ALL: '/api/projects',
    GET_ONE: (id: string) => `/api/projects/${id}`,
    CREATE: '/api/projects',
    UPDATE: (id: string) => `/api/projects/${id}`,
    DELETE: (id: string) => `/api/projects/${id}`,
  },

  // ==========================================
  // APPLICATION ENDPOINTS (/api/applications)
  // ==========================================
  APPLICATIONS: {
    GET_ALL: '/api/applications',
    GET_ONE: (id: string) => `/api/applications/${id}`,
    CREATE: '/api/applications',
    UPDATE: (id: string) => `/api/applications/${id}`,
    DELETE: (id: string) => `/api/applications/${id}`,
  },

  // ==========================================
  // JOBS ENDPOINT (RAPID API) (/api/jobs)
  // ==========================================
  JOBS: {
    SEARCH: '/api/jobs',
  },

  // ==========================================
  // HEALTH CHECK
  // ==========================================
  HEALTH: '/api/health',
};

// ✅ Helper function for dynamic routes
export const buildEndpoint = (template: string, params: Record<string, string | number>) => {
  let endpoint = template;
  Object.entries(params).forEach(([key, value]) => {
    endpoint = endpoint.replace(`:${key}`, String(value));
  });
  return endpoint;
};
