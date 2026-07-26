import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const api = axios.create({ baseURL: BASE_URL });

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
  view_count: number;
}

export interface StatsData {
  total: number;
  unique_kosha_count: number;
  by_kavi: { name: string; count: number }[];
  by_publisher: { name: string; count: number }[];
  date_trend: { month: string; count: number }[];
  recently_added: Entry[];
  most_viewed: Entry[];
}

// ── Filter / sort types ──────────────────────────────────────────────────────

export type SortField = 'entry_id' | 'prasanga' | 'kavi' | 'publisher' | 'date';
export type SortOrder = 'asc' | 'desc';

export interface FilterParams {
  fstring?: string;
  kavi?: string;
  publisher?: string;
  prasanga?: string;
  prasanga_startswith?: string;
  has_pdf?: 'true';
  date_after?: string;   // YYYY-MM-DD
  date_before?: string;  // YYYY-MM-DD
  month?: number;        // 1-12, any year
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

export type BrowseModel = 'kavi' | 'publisher' | 'prasanga' | 'month';

export interface BrowseItem {
  id: number;
  name: string;
  count: number;
}

export const fetchBrowseList = (model: BrowseModel) =>
  api.get<BrowseItem[]>('/api/v1/resources/browse', { params: { model } });

export interface KoshaGroup {
  kosha_link: string;
  prasanga: string;
  kavi: string;
  count: number;
}

export const fetchKoshaGroups = () =>
  api.get<KoshaGroup[]>('/api/v1/resources/kosha-groups');

export const fetchKoshaGroupCopies = (link: string) =>
  api.get<Record<string, unknown>[]>('/api/v1/resources/kosha-groups/copies', { params: { link } });

export const fetchEntry = (id: number) => api.get<Entry>(`/api/v1/books/${id}/`);

export const autocomplete = (model: string, q: string) =>
  api.get<{ id: number; name: string }[]>(
    `/api/v1/autocomplete/?model=${model}&q=${encodeURIComponent(q)}`
  );
