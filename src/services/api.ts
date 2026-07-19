import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({ baseURL: BASE_URL });

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('auth_token');
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export default api;

// ── Entry types ──────────────────────────────────────────────────────────────

export interface Entry {
  id: number;
  entry_id: string;
  prasanga: string;
  kavi: string;
  publisher: string;
  contributors: string[];
  kosha_link: string;
  prati_link: string;
  publish_date_kannada: string;
  publish_date_english: string;
  notes: string;
  status: string;
  review_notes: string;
  view_count: number;
  submitted_by: string;
  reviewed_at: string;
}

export interface StatsData {
  total: number;
  by_kavi: { name: string; count: number }[];
  by_publisher: { name: string; count: number }[];
  date_trend: { month: string; count: number }[];
  recently_added: Entry[];
  most_viewed: Entry[];
}

export interface User {
  id: number;
  email: string;
  name: string;
  picture: string;
  role: 'admin' | 'editor' | 'volunteer' | null;
}

// ── Filter / sort types ──────────────────────────────────────────────────────

export type SortField = 'entry_id' | 'prasanga' | 'kavi' | 'publisher' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface FilterParams {
  fstring?: string;
  kavi?: string;
  publisher?: string;
  prasanga?: string;
  has_pdf?: 'true';
  date_after?: string;   // YYYY-MM-DD
  date_before?: string;  // YYYY-MM-DD
  sort?: SortField;
  order?: SortOrder;
  pageno?: number;
}

// ── API helpers ──────────────────────────────────────────────────────────────

export const fetchStats = () => api.get<StatsData>('/api/v1/stats/');

export const fetchPage = (page: number, sort?: SortField, order?: SortOrder) =>
  api.get<{ total: number; dataset: any[]; allLoaded: boolean }>(
    '/api/v1/resources/books/page',
    { params: { pageno: page, ...(sort ? { sort } : {}), ...(order && order !== 'asc' ? { order } : {}) } }
  );

export const fetchAll = () => api.get<any[]>('/api/v1/resources/books/all');

export const searchEntries = (q: string) =>
  api.get<{ total: number; dataset: any[]; allLoaded: boolean }>(
    `/api/v1/resources/books?fstring=${encodeURIComponent(q)}`
  );

export const filterEntries = (params: FilterParams) =>
  api.get<{ total: number; dataset: any[]; allLoaded: boolean }>(
    '/api/v1/resources/books',
    { params }
  );

export const fetchPublishYears = () =>
  api.get<number[]>('/api/v1/resources/books/years');

export const fetchEntry = (id: number) => api.get<Entry>(`/api/v1/books/${id}/`);

export const createEntry = (data: Record<string, any>) =>
  api.post<Entry>('/api/v1/books/', data);

export const updateEntry = (id: number, data: Record<string, any>) =>
  api.patch<Entry>(`/api/v1/books/${id}/`, data);

export const deleteEntry = (id: number) => api.delete(`/api/v1/books/${id}/`);

export const uploadPdf = (id: number, file: File) => {
  const form = new FormData();
  form.append('file', file);
  return api.post<{ url: string }>(`/api/v1/books/${id}/upload/`, form, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
};

export const reviewEntry = (id: number, status: string, review_notes?: string) =>
  api.patch<Entry>(`/api/v1/books/${id}/review/`, { status, review_notes });

export const fetchMySubmissions = () =>
  api.get<Entry[]>('/api/v1/my-submissions/');

export const autocomplete = (model: string, q: string) =>
  api.get<{ id: number; name: string }[]>(
    `/api/v1/autocomplete/?model=${model}&q=${encodeURIComponent(q)}`
  );

export const fetchUsers = () => api.get<User[]>('/api/v1/admin/users/');

export const updateUser = (id: number, data: { role?: string; is_active?: boolean }) =>
  api.patch<User>(`/api/v1/admin/users/${id}/`, data);

export const triggerExport = () => api.post('/api/v1/admin/export/');
