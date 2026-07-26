import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Search, Loader2, X } from 'lucide-react';
import { fetchKoshaGroups } from '@/services/api';
import type { KoshaGroup } from '@/services/api';

const PrasangaKosha: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<KoshaGroup[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchKoshaGroups()
      .then((r) => setGroups(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return groups;
    const q = query.trim().toLowerCase();
    return groups.filter((g) => g.prasanga.toLowerCase().includes(q) || g.kavi.toLowerCase().includes(q));
  }, [groups, query]);

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '28px 22px 60px' }}>

      <div style={{ marginBottom: 22 }}>
        <h1 className="ps-serif" style={{ fontWeight: 600, fontSize: 28, margin: '0 0 4px', letterSpacing: '-.01em', color: 'var(--ps-text)' }}>
          {t('browse.kosha_title')}
        </h1>
        <div className="kn-sans" style={{ fontSize: 13, color: 'var(--ps-muted)' }}>
          {!loading && groups.length > 0 && `${groups.length} ${t('home.entries')}`}
        </div>
      </div>

      <div style={{
        display: 'flex', alignItems: 'center', gap: 12,
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 14, padding: '11px 16px', marginBottom: 20,
        boxShadow: 'var(--ps-shadow-sm)',
      }}>
        <Search style={{ width: 16, height: 16, color: 'var(--ps-faint)', flexShrink: 0 }} />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('search.placeholder')}
          style={{
            flex: 1, border: 'none', background: 'transparent', outline: 'none',
            fontFamily: 'system-ui', fontSize: 14.5, color: 'var(--ps-text)',
          }}
        />
        {query && (
          <button onClick={() => setQuery('')}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--ps-faint)', padding: 0 }}>
            <X style={{ width: 14, height: 14 }} />
          </button>
        )}
      </div>

      {loading ? (
        <div style={{ display: 'flex', justifyContent: 'center', padding: '80px 0' }}>
          <Loader2 style={{ width: 32, height: 32, color: 'var(--ps-accent)' }} className="animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '70px 20px', color: 'var(--ps-muted)' }}>
          <div className="kn-serif" style={{ fontSize: 18, color: 'var(--ps-text)', marginBottom: 8 }}>ಯಾವುದೇ ಫಲಿತಾಂಶ ಇಲ್ಲ</div>
          <div style={{ fontFamily: 'system-ui', fontSize: 13.5 }}>{t('library.no_results')}</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
          {filtered.map((g) => (
            <button
              key={g.kosha_link}
              onClick={() => navigate(`/kosha/copies?link=${encodeURIComponent(g.kosha_link)}`)}
              style={{
                background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
                borderRadius: 14, padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                transition: 'border-color .15s, box-shadow .15s, transform .15s',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = 'var(--ps-accent)';
                e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = 'var(--ps-border)';
                e.currentTarget.style.boxShadow = '';
                e.currentTarget.style.transform = '';
              }}
            >
              <div className="kn-serif" style={{ fontSize: 14.5, fontWeight: 600, color: 'var(--ps-text)', lineHeight: 1.35 }}>
                {g.prasanga || '—'}
              </div>
              {g.kavi && (
                <div className="kn-sans" style={{ fontSize: 12, color: 'var(--ps-muted)', marginTop: 3 }}>
                  {g.kavi}
                </div>
              )}
              <div style={{ fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)', marginTop: 4 }}>
                {g.count} {t('browse.copies')}
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default PrasangaKosha;
