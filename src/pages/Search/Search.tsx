import React, { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search as SearchIcon, Loader2, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import EntryCard from '@/components/EntryCard/EntryCard';
import { searchEntries } from '@/services/api';
import type { Entry } from '@/services/api';
import { useDebounce } from '@/hooks/useDebounce';

function mapItem(item: Record<string, unknown>): Entry {
  return {
    id: (item.id as number) ?? (item.slno_pg as number) ?? 0,
    entry_id: String(item.serialno ?? item.entry_id ?? ''),
    prasanga: (item.prasanga as string) ?? '',
    kavi: (item.kavi as string) ?? '',
    publisher: (item.publisher as string) ?? '',
    contributors: Array.isArray(item.contributors)
      ? (item.contributors as string[])
      : item.contributor
      ? [(item.contributor as string)]
      : [],
    kosha_link: ((item.koshalink ?? item.kosha_link) as string) ?? '',
    prati_link: ((item.prathilink ?? item.prati_link) as string) ?? '',
    publish_date_kannada: ((item.dateadded ?? item.publish_date_kannada) as string) ?? '',
    publish_date_english: ((item.englishDateAdded ?? item.publish_date_english) as string) ?? '',
    notes: ((item.remarks ?? item.notes) as string) ?? '',
    status: (item.status as string) ?? 'approved',
    review_notes: '',
    view_count: (item.view_count as number) ?? 0,
    submitted_by: '',
    reviewed_at: '',
  };
}

const Search: React.FC = () => {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 350);
  const [results, setResults] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      setSearched(false);
      return;
    }
    setLoading(true);
    searchEntries(debouncedQuery)
      .then((res) => {
        setResults((res.data.dataset as Record<string, unknown>[]).map(mapItem));
        setSearched(true);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [debouncedQuery]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('nav.search')}</h1>

      {/* Search input */}
      <div className="relative mb-8">
        <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        <Input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          className="pl-10 pr-10 h-12 text-base rounded-xl border-slate-200 shadow-sm focus-visible:ring-indigo-500"
        />
        {query && (
          <button
            onClick={() => { setQuery(''); setResults([]); setSearched(false); }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
      )}

      {!loading && searched && results.length === 0 && (
        <p className="text-center text-slate-500 py-16">{t('library.no_results')}</p>
      )}

      {!loading && results.length > 0 && (
        <>
          <p className="text-sm text-slate-500 mb-4">
            {results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{debouncedQuery}&rdquo;
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {results.map((e) => (
              <EntryCard key={`${e.id}-${e.entry_id}`} entry={e} />
            ))}
          </div>
        </>
      )}

      {!loading && !searched && (
        <p className="text-center text-slate-400 py-16 text-sm">
          Type at least 2 characters to search
        </p>
      )}
    </div>
  );
};

export default Search;
