import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useClickOutside } from '@/hooks/useClickOutside';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, ChevronDown, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import SpineCard from '@/components/SpineCard/SpineCard';
import EntryListRow from '@/components/EntryListRow/EntryListRow';
import ViewModeToggle from '@/components/ViewModeToggle/ViewModeToggle';
import FilterPanel from '@/components/FilterPanel/FilterPanel';
import ShelfSidebar from '@/components/ShelfSidebar/ShelfSidebar';
import { fetchPage, filterEntries } from '@/services/api';
import type { Entry, FilterParams, SortField, SortOrder } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';
import { useViewMode } from '@/hooks/useViewMode';

export function mapItem(item: Record<string, unknown>): Entry {
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
    view_count: 0,
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
  const [filterLetter, setFilterLetter]     = useState(searchParams.get('letter') ?? '');
  const [filterHasPdf, setFilterHasPdf]     = useState(searchParams.get('has_pdf') === 'true');
  const [yearFrom, setYearFrom]             = useState(searchParams.get('year_from') ?? '');
  const [yearTo, setYearTo]                 = useState(searchParams.get('year_to') ?? '');
  const [filterMonth, setFilterMonth]       = useState(searchParams.get('month') ?? '');
  const [sortField, setSortField]           = useState<SortField>((searchParams.get('sort') as SortField) ?? 'entry_id');
  const [sortOrder, setSortOrder]           = useState<SortOrder>((searchParams.get('order') as SortOrder) ?? 'asc');
  const [filterPanelOpen, setFilterPanelOpen] = useState(false);
  const [shelfOpen, setShelfOpen]           = useState(false);
  const [viewMode, setViewMode]             = useViewMode();

  // ── Data state ───────────────────────────────────────────────────────────
  const [entries, setEntries]     = useState<Entry[]>([]);
  const [total, setTotal]         = useState(0);
  const [allLoaded, setAllLoaded] = useState(false);
  const [loading, setLoading]     = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const pageRef = useRef(0);
  const shelfContainerRef = useRef<HTMLDivElement>(null);
  useClickOutside(shelfContainerRef, () => setShelfOpen(false), shelfOpen);

  const debouncedSearch = useDebounce(searchText, 400);

  const hasFilters = debouncedSearch.length >= 2
    || !!filterKavi || !!filterPublisher || !!filterPrasanga || !!filterLetter
    || filterHasPdf || !!yearFrom || !!yearTo || !!filterMonth;

  // ── Sync state → URL (uses debouncedSearch so typing doesn't spam history) ──
  useEffect(() => {
    const next: Record<string, string> = {};
    if (debouncedSearch)          next.q = debouncedSearch;
    if (filterKavi)               next.kavi = filterKavi;
    if (filterPublisher)          next.publisher = filterPublisher;
    if (filterPrasanga)           next.prasanga = filterPrasanga;
    if (filterLetter)             next.letter = filterLetter;
    if (filterHasPdf)             next.has_pdf = 'true';
    if (yearFrom)                 next.year_from = yearFrom;
    if (yearTo)                   next.year_to = yearTo;
    if (filterMonth)              next.month = filterMonth;
    if (sortField !== 'entry_id') next.sort = sortField;
    if (sortOrder !== 'asc')      next.order = sortOrder;
    setSearchParams(next, { replace: true });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterKavi, filterPublisher, filterPrasanga, filterLetter, filterHasPdf, yearFrom, yearTo, filterMonth, sortField, sortOrder]);

  // ── Unified load function ────────────────────────────────────────────────
  const loadPage = useCallback(async (startRow: number) => {
    if (hasFilters) {
      // Content filters active — use filter endpoint (supports all params incl. pageno)
      const params: FilterParams = { pageno: startRow, sort: sortField, order: sortOrder };
      if (debouncedSearch.length >= 2) params.fstring = debouncedSearch;
      if (filterKavi)      params.kavi = filterKavi;
      if (filterPublisher) params.publisher = filterPublisher;
      if (filterPrasanga)  params.prasanga = filterPrasanga;
      if (filterLetter)    params.prasanga_startswith = filterLetter;
      if (filterHasPdf)    params.has_pdf = 'true';
      if (yearFrom)        params.date_after = `${yearFrom}-01-01`;
      if (yearTo)          params.date_before = `${yearTo}-12-31`;
      if (filterMonth)     params.month = Number(filterMonth);
      const res = await filterEntries(params);
      return { items: (res.data.dataset as Record<string, unknown>[]).map(mapItem), done: res.data.allLoaded, total: res.data.total };
    }
    // Plain browse (sort only or no filters) — use page endpoint which accepts sort params
    const res = await fetchPage(startRow, sortField !== 'entry_id' ? sortField : undefined, sortOrder);
    return { items: (res.data.dataset as Record<string, unknown>[]).map(mapItem), done: res.data.allLoaded, total: res.data.total };
  }, [hasFilters, debouncedSearch, filterKavi, filterPublisher, filterPrasanga, filterLetter, filterHasPdf, yearFrom, yearTo, filterMonth, sortField, sortOrder]);

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
    setFilterLetter('');
    setFilterHasPdf(false);
    setYearFrom('');
    setYearTo('');
    setFilterMonth('');
    setSortField('entry_id');
    setSortOrder('asc');
  };

  const anyActiveFilters = !!filterKavi || !!filterPublisher || !!filterPrasanga || !!filterLetter
    || filterHasPdf || !!yearFrom || !!yearTo || !!filterMonth;

  const anyShelfFilter = !!filterKavi || !!filterPublisher || !!filterLetter || !!yearFrom || !!filterMonth;

  const filterPanelProps = {
    kavi: filterKavi, publisher: filterPublisher, prasanga: filterPrasanga,
    hasPdf: filterHasPdf, yearFrom, yearTo, sortField, sortOrder,
    onKaviChange: setFilterKavi, onPublisherChange: setFilterPublisher,
    onPrasangaChange: setFilterPrasanga, onHasPdfChange: setFilterHasPdf,
    onYearFromChange: setYearFrom, onYearToChange: setYearTo,
    onSortFieldChange: setSortField, onSortOrderChange: setSortOrder,
    onClear: clearAllFilters,
  };

  // Every shelf-browse selection is a final pick — close the dropdown right
  // after it so the user's attention lands back on the (now updated) list.
  const handleShelfAll = () => {
    setFilterKavi('');
    setFilterPublisher('');
    setFilterLetter('');
    setYearFrom('');
    setYearTo('');
    setFilterMonth('');
    setShelfOpen(false);
  };

  const handleShelfKavi = (kavi: string) => {
    setFilterKavi(kavi);
    setShelfOpen(false);
  };

  const handleShelfPublisher = (publisher: string) => {
    setFilterPublisher(publisher);
    setShelfOpen(false);
  };

  const handlePrasangaLetter = (letter: string) => {
    setFilterLetter((prev) => (prev === letter ? '' : letter));
    setShelfOpen(false);
  };

  // A single shelf-browse "year" click selects an exact year (from === to);
  // clicking the same year again clears it.
  const activeShelfYear = yearFrom && yearFrom === yearTo ? yearFrom : '';
  const handleShelfYear = (year: string) => {
    if (yearFrom === year && yearTo === year) {
      setYearFrom('');
      setYearTo('');
    } else {
      setYearFrom(year);
      setYearTo(year);
    }
    setShelfOpen(false);
  };

  const handleShelfMonth = (month: string) => {
    setFilterMonth((prev) => (prev === month ? '' : month));
    setShelfOpen(false);
  };

  return (
    <div style={{ maxWidth: 1400, margin: '0 auto', padding: '28px 22px 60px' }}>

      {/* ── Page heading ─────────────────────────────────────────────────── */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="ps-serif" style={{ fontWeight: 600, fontSize: 28, margin: 0, letterSpacing: '-.01em', color: 'var(--ps-text)' }}>
          ಪ್ರಸಂಗ ಪುಸ್ತಕಗಳು
        </h1>
      </div>

      {/* ── Search bar (full-width above the three-column layout) ────────── */}
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

      {/* ── Single-column layout: toggles float dropdowns over the results ── */}
      <div style={{ width: '100%' }}>

        {/* Collapsed-by-default toggles, above the results — each opens as a
            floating dropdown rather than pushing the results down */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
          <div ref={shelfContainerRef} style={{ position: 'relative' }}>
            <button
              onClick={() => setShelfOpen((o) => !o)}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 8,
                background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                borderRadius: 11, padding: '10px 15px',
                fontFamily: 'system-ui', fontSize: 13.5, fontWeight: 600, color: 'var(--ps-text)',
                cursor: 'pointer', boxShadow: 'var(--ps-shadow-sm)',
              }}>
              <BookOpen style={{ width: 14, height: 14 }} />
              <span className="kn-sans">ಅಕಾರಾದಿ - ಕವಿ - ಪ್ರಕಾಶಕ</span>
              {anyShelfFilter && (
                <span style={{
                  background: 'var(--ps-accent)', color: '#fff',
                  borderRadius: 999, padding: '1px 7px',
                  fontSize: 11, fontWeight: 700,
                }}>●</span>
              )}
              <ChevronDown style={{ width: 14, height: 14, transform: shelfOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
            </button>

            {shelfOpen && (
              <div style={{
                position: 'absolute', top: 'calc(100% + 8px)', left: 0, zIndex: 40,
                width: 280, maxWidth: '92vw', maxHeight: '70vh', overflowY: 'auto',
                background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                borderRadius: 18, boxShadow: 'var(--ps-shadow-md)',
              }}>
                <ShelfSidebar
                  activeKavi={filterKavi}
                  activePublisher={filterPublisher}
                  activePrasangaLetter={filterLetter}
                  activeYear={activeShelfYear}
                  activeMonth={filterMonth}
                  totalCount={total}
                  onAll={handleShelfAll}
                  onKavi={handleShelfKavi}
                  onPublisher={handleShelfPublisher}
                  onPrasangaLetter={handlePrasangaLetter}
                  onYear={handleShelfYear}
                  onMonth={handleShelfMonth}
                />
              </div>
            )}
          </div>

          <FilterPanel {...filterPanelProps} open={filterPanelOpen} onOpenChange={setFilterPanelOpen} />
          <div style={{ marginLeft: 'auto' }}>
            <ViewModeToggle mode={viewMode} onChange={setViewMode} />
          </div>
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
              {filterLetter && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#FCE7F3', color: '#9D174D', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
                  className="kn-sans">
                  ಅಕ್ಷರ: {filterLetter}
                  <button onClick={() => setFilterLetter('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
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
              {filterMonth && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 12, background: '#E0E7FF', color: '#3730A3', padding: '4px 10px', borderRadius: 999, fontWeight: 600 }}
                  className="kn-sans">
                  ತಿಂಗಳು: {filterMonth}
                  <button onClick={() => setFilterMonth('')} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, color: 'inherit', display: 'flex' }}>
                    <X style={{ width: 11, height: 11 }} />
                  </button>
                </span>
              )}
            </div>
          )}

          {/* Result count — placed right above the list so it draws attention
              to what just changed, rather than sitting up in the page header */}
          {!loading && (
            <div className="kn-sans" style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--ps-text)', marginBottom: 12 }}>
              {total} ಲಭ್ಯವಿವೆ
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
              <div className="kn-sans" style={{ fontSize: 13.5, marginBottom: 16 }}>ಈ ಫಿಲ್ಟರ್‌ಗಳಿಗೆ ಯಾವುದೇ ಪ್ರತಿಗಳು ಹೊಂದಿಕೆಯಾಗುವುದಿಲ್ಲ.</div>
              <button onClick={clearAllFilters} className="kn-sans" style={{
                display: 'inline-block', fontSize: 13, fontWeight: 600,
                color: '#fff', background: 'var(--ps-grad)', borderRadius: 999, padding: '10px 20px',
                cursor: 'pointer', border: 'none',
              }}>ಫಿಲ್ಟರ್‌ಗಳನ್ನು ತೆರವುಗೊಳಿಸಿ</button>
            </div>
          ) : (
            <>
              {viewMode === 'thumbnail' ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(128px, 1fr))', gap: 12 }}>
                  {entries.map((e) => (
                    <SpineCard key={`${e.id}-${e.entry_id}`} entry={e} />
                  ))}
                </div>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {entries.map((e) => (
                    <EntryListRow key={`${e.id}-${e.entry_id}`} entry={e} />
                  ))}
                </div>
              )}

              {!allLoaded && (
                <div style={{ padding: '28px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <div ref={sentinelRef} style={{ height: 1 }} />
                  <Button variant="outline" onClick={handleLoadMore} disabled={loadingMore}
                    style={{ borderColor: 'var(--ps-border)', color: 'var(--ps-muted)', minWidth: 128 }}>
                    {loadingMore
                      ? <Loader2 style={{ width: 16, height: 16 }} className="animate-spin" />
                      : <span className="kn-sans" style={{ display: 'inline-flex', alignItems: 'center' }}><ChevronDown style={{ width: 16, height: 16, marginRight: 6 }} />ಇನ್ನಷ್ಟು ತೋರಿಸಿ</span>}
                  </Button>
                </div>
              )}

              {allLoaded && entries.length > 0 && (
                <p className="kn-sans" style={{ textAlign: 'center', color: 'var(--ps-faint)', fontSize: 13, padding: '24px 0' }}>
                  {hasFilters ? `${entries.length} ಫಲಿತಾಂಶಗಳು` : `ಒಟ್ಟು ${total} ಲಭ್ಯವಿವೆ`}
                </p>
              )}
            </>
          )}
      </div>
    </div>
  );
};

export default Library;
