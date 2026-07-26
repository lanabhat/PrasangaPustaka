import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Loader2 } from 'lucide-react';
import SpineCard from '@/components/SpineCard/SpineCard';
import EntryListRow from '@/components/EntryListRow/EntryListRow';
import ViewModeToggle from '@/components/ViewModeToggle/ViewModeToggle';
import { fetchKoshaGroupCopies } from '@/services/api';
import type { Entry } from '@/services/api';
import { mapItem } from '@/pages/Library/Library';
import { useViewMode } from '@/hooks/useViewMode';

const PrasangaKoshaCopies: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const link = searchParams.get('link') || '';

  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [viewMode, setViewMode] = useViewMode();

  useEffect(() => {
    if (!link) return;
    setLoading(true);
    setError(false);
    fetchKoshaGroupCopies(link)
      .then((r) => setEntries(r.data.map(mapItem)))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [link]);

  const entryIds = entries.map((e) => e.id);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 22px 60px' }}>
      <button onClick={() => navigate('/kosha')}
        className="flex items-center gap-1.5 text-sm mb-6 transition-colors"
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ps-muted)', padding: 0 }}>
        <ArrowLeft style={{ width: 16, height: 16 }} />
        {t('browse.kosha_title')}
      </button>

      <div style={{ marginBottom: 22, display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <h1 className="ps-serif" style={{ fontWeight: 600, fontSize: 24, margin: '0 0 4px', letterSpacing: '-.01em', color: 'var(--ps-text)' }}>
            {entries[0]?.prasanga || ''}
          </h1>
          <div className="kn-sans" style={{ fontSize: 13, color: 'var(--ps-muted)' }}>
            {!loading && entries.length > 0 && `${entries.length} ${t('browse.copies')}`}
          </div>
        </div>
        {!loading && entries.length > 0 && (
          <ViewModeToggle mode={viewMode} onChange={setViewMode} />
        )}
      </div>

      {loading && (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: 32, height: 32, color: 'var(--ps-accent)' }} className="animate-spin" />
        </div>
      )}

      {!loading && (error || entries.length === 0) && (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ps-muted)' }}>
          <div className="kn-serif" style={{ fontSize: 18, color: 'var(--ps-text)', marginBottom: 8 }}>ಯಾವುದೇ ಫಲಿತಾಂಶ ಇಲ್ಲ</div>
          <div style={{ fontFamily: 'system-ui', fontSize: 13.5 }}>{t('library.no_results')}</div>
        </div>
      )}

      {!loading && entries.length > 0 && (
        viewMode === 'thumbnail' ? (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {entries.map((entry, idx) => (
              <SpineCard
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/entry/${entry.id}`, { state: { entryIds, currentIndex: idx } })}
              />
            ))}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {entries.map((entry, idx) => (
              <EntryListRow
                key={entry.id}
                entry={entry}
                onClick={() => navigate(`/entry/${entry.id}`, { state: { entryIds, currentIndex: idx } })}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
};

export default PrasangaKoshaCopies;
