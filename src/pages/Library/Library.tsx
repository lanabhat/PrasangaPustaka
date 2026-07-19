import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, ChevronDown, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import EntryCard from '@/components/EntryCard/EntryCard';
import FilterPanel from '@/components/FilterPanel/FilterPanel';
import { fetchPage, filterEntries } from '@/services/api';
import type { Entry, FilterParams, SortField, SortOrder } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

function mapItem(item: Record<string, unknown>): Entry {
  return {
    id: (item.id as number) ?? (item.slno_pg as number) ?? 0,
    entry_id: String(item.serialno ?? ''),
    prasanga: (item.prasanga as string) ?? '',
    kavi: (item.kavi as string) ?? '',
    publisher: (item.publisher as string) ?? '',
    contributors: item.contributor ? String(item.contributor).split(';').map(s => s.trim()).filter(Boolean) : [],
    kosha_link: (item.koshalink as string) ?? '',
    prati_link: (item.prathilink as string) ?? '',
    publish_date_kannada: (item.dateadded as string) ?? '',
    publish_date_english: (item.englishDateAdded as string) ?? '',
    notes: (item.remarks as string) ?? '',
    status: 'approved',
    review_notes: '',
    view_count: 0,
    submitted_by: '',
    reviewed_at: '',
  };
}

const Library: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams, setSearchParams] = useSearchParams();

  // ── Filter & sort state (initialised from URL) ──────────────────────────
  const [searchText, setSearchText]         = useState(searchParams.get('q') ?? '');
  const [filterKavi, setFilterKavi]         = useState(searchParams.get('kavi') ?? '');
  const [filterPublisher, setFilterPublisher] = useState(searchParams.get('publisher') ?? '');
  const [filterPrasanga, setFilterPrasanga] = useState(searchParams.get('prasanga') ?? '');
  const [filterHasPdf, setFilterHasPdf]     = useState(searchParams.get('has_pdf') === 'true');
  const [yearFrom, setYearFrom]             = useState(searchParams.get('year_from') ?? '');
  const [yearTo, setYearTo]                 = useState(searchParams.get('year_to') ?? '');
  const [sortField, setSortField]           = useState<SortField>((searchParams.get('sort') as SortField) ?? 'entry_id');
  const [sortOrder, setSortOrder]           = useState<SortOrder>((searchParams.get('order') as SortOrder) ?? 'asc');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);

  // ── Data state ───────────────────────────────────────────────────────────
  const [entries, setEntries]     = useState<Entry[]>([]);
  const [total, setTotal]         = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);

  const debouncedSearch = useDebounce(searchText, 400);

  const hasFilters = debouncedSearch.length >= 2
    || !!filterKavi || !!filterPublisher || !!filterPrasanga
    || filterHasPdf || !!yearFrom || !!yearTo;

  // ── Sync state → URL (uses debouncedSearch so typing doesn't spam history) ──
  useEffect(() => {
    const next: Record<string, string> = {};
    if (debouncedSearch)          next.q = debouncedSearch;
    if (filterKavi)               next.kavi = filterKavi;
    if (filterPublisher)          next.publisher = filterPublisher;
    if (filterPrasanga)           next.prasanga = filterPrasanga;
    if (filterHasPdf)             next.has_pdf = 'true';
    if (yearFrom)                 next.year_from = yearFrom;
    if (yearTo)                   next.year_to = yearTo;
    if (sortField !== 'entry_id') next.sort = sortField;
    if (sortOrder !== 'asc')      next.order = sortOrder;
    setSearchParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterKavi, filterPublisher, filterPrasanga, filterHasPdf, yearFrom, yearTo, sortField, sortOrder]);

  // ── Unified load function ────────────────────────────────────────────────
  const loadPage = useCallback(async (startRow: number) => {
    if (hasFilters) {
      // Content filters active — use filter endpoint (supports all params incl. pageno)
      const params: FilterParams = { pageno: startRow, sort: sortField, order: sortOrder };
      if (debouncedSearch.length >= 2) params.fstring = debouncedSearch;
      if (filterKavi)      params.kavi = filterKavi;
      if (filterPublisher) params.publisher = filterPublisher;
      if (filterPrasanga)  params.prasanga = filterPrasanga;
      if (filterHasPdf)    params.has_pdf = 'true';
      if (yearFrom)        params.date_after = `${yearFrom}-01-01`;
      if (yearTo)          params.date_before = `${yearTo}-12-31`;
      const res = await filterEntries(params);
      return { items: (res.data.dataset as Record<string, unknown>[]).map(mapItem), done: res.data.allLoaded, total: res.data.total };
    }
    // Plain browse (sort only or no filters) — use page endpoint which accepts sort params
    const res = await fetchPage(startRow, sortField !== 'entry_id' ? sortField : undefined, sortOrder);
    return { items: (res.data.dataset as Record<string, unknown>[]).map(mapItem), done: res.data.allLoaded, total: res.data.total };
  }, [hasFilters, debouncedSearch, filterKavi, filterPublisher, filterPrasanga, filterHasPdf, yearFrom, yearTo, sortField, sortOrder]);

  // ── Reset + initial load whenever any filter/sort changes ────────────────
  useEffect(() => {
    setLoading(true);
    setEntries([]);
    setAllLoaded(false);
    pageRef.current = 0;
    loadPage(0).then(({ items, done, total: t2 }) => {
      setEntries(items);
      setTotal(t2);
      pageRef.current = items.length;
      setAllLoaded(done);
    }).catch(console.error).finally(() => setLoading(false));
  }, [loadPage]);

  // ── Load more ────────────────────────────────────────────────────────────
  const handleLoadMore = async () => {
    if (loadingMore || allLoaded) return;
    setLoadingMore(true);
    try {
      const { items, done, total: t2 } = await loadPage(pageRef.current);
      setEntries((prev) => [...prev, ...items]);
      setTotal(t2);
      pageRef.current += items.length;
      setAllLoaded(done);
    } catch (e) { console.error(e); }
    finally { setLoadingMore(false); }
  };

  // IntersectionObserver sentinel auto-triggers Load More
  useEffect(() => {
    if (allLoaded) return;
    const observer = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) handleLoadMore();
    }, { threshold: 0.1 });
    const el = sentinelRef.current;
    if (el) observer.observe(el);
    return () => observer.disconnect();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [allLoaded, loadingMore]);

  const clearAllFilters = () => {
    setFilterKavi('');
    setFilterPublisher('');
    setFilterPrasanga('');
    setFilterHasPdf(false);
    setYearFrom('');
    setYearTo('');
    setSortField('entry_id');
    setSortOrder('asc');
  };

  const anyActiveFilters = !!filterKavi || !!filterPublisher || !!filterPrasanga
    || filterHasPdf || !!yearFrom || !!yearTo;

  const filterPanelProps = {
    kavi: filterKavi, publisher: filterPublisher, prasanga: filterPrasanga,
    hasPdf: filterHasPdf, yearFrom, yearTo, sortField, sortOrder,
    onKaviChange: setFilterKavi, onPublisherChange: setFilterPublisher,
    onPrasangaChange: setFilterPrasanga, onHasPdfChange: setFilterHasPdf,
    onYearFromChange: setYearFrom, onYearToChange: setYearTo,
    onSortFieldChange: setSortField, onSortOrderChange: setSortOrder,
    onClear: clearAllFilters,
  };

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 22px 60px' }}>

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="ps-serif" style={{ fontWeight: 600, fontSize: 28, margin: '0 0 4px', letterSpacing: '-.01em', color: 'var(--ps-text)' }}>
          ಪ್ರಸಂಗ ಪುಸ್ತಕಗಳು
        </h1>
        <div className="kn-sans" style={{ fontSize: 13, color: 'var(--ps-muted)' }}>
          {!loading && total > 0 && ` - ${total} ಲಭ್ಯವಿವೆ`}
        </div>
      </div>

      {/* ── Search bar (full-width above the two-column layout) ─────────── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 14, padding: '11px 16px', marginBottom: 20,
        boxShadow: 'var(--ps-shadow-sm)',
      }}>
        <Search style={{ width: 16, height: 16, color: 'var(--ps-faint)', flexShrink: 0 }} />
        <input
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
          placeholder={t('search.placeholder')}
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'system-ui', fontSize: 14.5, color: 'var(--ps-text)',
          }}
        />
        {searchText && (
          <button onClick={() => setSearchText('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ps-faint)', padding: 0 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {/* ── Two-column layout ────────────────────────────────────────────── */}
      <div style={{ display: 'flex', gap: 22, alignItems: 'flex-start' }}>

        {/* Desktop sidebar — hidden on mobile via className */}
        <div className="hidden lg:block" style={{ width: 240, flexShrink: 0, position: 'sticky', top: 72 }}>
          <FilterPanel {...filterPanelProps} open={true} onOpenChange={() => {}} alwaysOpen />
        </div>

        {/* Main content */}
        <div style={{ flex: 1, minWidth: 0 }}>

          {/* Mobile filter toggle */}
          <div className="lg:hidden" style={{ marginBottom: 12 }}>
            <FilterPanel {...filterPanelProps} open={filterPanelOpen} onOpenChange={setFilterPanelOpen} />
          </div>

          {/* Active filter chips */}
          {anyActiveFilters && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
              {filterKavi && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
                  className="kn-sans">
                  ಕವಿ: {filterKavi}
                  <button onClick={() => setFilterKavi('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
              {filterPublisher && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#EDE9FE', color: '#6D28D9', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
                  className="kn-sans">
                  ಪ್ರಕಾಶಕ: {filterPublisher}
                  <button onClick={() => setFilterPublisher('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
              {filterPrasanga && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#CCFBF1', color: '#0F766E', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
                  className="kn-sans">
                  ಪ್ರಸಂಗ: {filterPrasanga}
                  <button onClick={() => setFilterPrasanga('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
              {filterHasPdf && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#D1FAE5', color: '#065F46', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>
                  Has PDF
                  <button onClick={() => setFilterHasPdf(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
              {(yearFrom || yearTo) && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#FEF3C7', color: '#92400E', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}>
                  {yearFrom || '…'}–{yearTo || '…'}
                  <button onClick={() => { setYearFrom(''); setYearTo(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Results */}
          {loading ? (
            <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
              <Loader2 style={{ width: 32, height: 32, color: 'var(--ps-accent)' }} className="animate-spin" />
            </div>
          ) : entries.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ps-muted)' }}>
              <div className="kn-serif" style={{ fontSize: 18, color: 'var(--ps-text)', marginBottom: 8 }}>ಯಾವುದೇ ಫಲಿತಾಂಶ ಇಲ್ಲ</div>
              <div style={{ fontFamily: 'system-ui', fontSize: 13.5, marginBottom: 16 }}>No entries match these filters.</div>
              <button onClick={clearAllFilters} style={{
                display: 'inline-block', fontFamily: 'system-ui', fontSize: 13, fontWeight: 600,
                color: '#fff', background: 'var(--ps-grad)', borderRadius: 999, padding: '10px 20px',
                cursor: 'pointer', border: 'none',
              }}>Clear filters</button>
            </div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                {entries.map((e) => (
                  <EntryCard key={`${e.id}-${e.entry_id}`} entry={e} />
                ))}
              </div>

              {!allLoaded && (
                <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div ref={sentinelRef} style={{ height: 1 }} />
                  <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}
                    style={{ borderColor: 'var(--ps-border)', color: 'var(--ps-muted)', minWidth: 128 }}>
                    {loadingMore
                      ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                      : <><ChevronDown style={{ width: 16, height: 16, marginRight: 6 }} />Load More</>}
                  </Button>
                </div>
              )}

              {allLoaded && entries.length > 0 && (
                <p style={{ textAlign: 'center', color: 'var(--ps-faint)', fontSize: 13, padding: '24px 0', fontFamily: 'system-ui' }}>
                  {hasFilters ? `${entries.length} results` : `All ${total} entries loaded`}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Library;
