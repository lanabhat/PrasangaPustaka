import React, { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ArrowRight, ExternalLink, Share2, Eye,
  BookOpen, BookMarked, Maximize2, Loader2,
} from 'lucide-react';
import { Share } from '@capacitor/share';
import { Skeleton } from '@/components/ui/skeleton';
import { fetchEntry } from '@/services/api';
import type { Entry } from '@/services/api';
import { toast } from 'sonner';

function MetaItem({ label, value }: { label: string; value?: string | string[] | null }) {
  if (!value || (Array.isArray(value) && value.length === 0)) return null;
  const display = Array.isArray(value) ? value.join(', ') : value;
  return (
    <div>
      <div style={{ fontFamily: 'system-ui', fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ps-faint)', marginBottom: 4 }}>
        {label}
      </div>
      <div className="kn-serif" style={{ fontSize: 14.5, color: 'var(--ps-text)', lineHeight: 1.4 }}>{display}</div>
    </div>
  );
}

function formatEnglishDate(iso: string): string {
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}-${mm}-${yyyy}`;
}

function buildShareText(entry: Entry, pageUrl: string): string {
  const hasKosha = !!entry.kosha_link && entry.kosha_link.length > 15;
  const hasPrati = !!entry.prati_link && entry.prati_link.length > 15;

  const lines: string[] = [
    'ಯಕ್ಷವಾಹಿನಿ(ರಿ)ಯ ಯಕ್ಷಪ್ರಸಂಗಕೋಶ/ಪ್ರಸಂಗ ಪ್ರತಿ ಸಂಗ್ರಹದಿಂದ ನಿಮ್ಮೊಡನೆ ಈ ಯಕ್ಷಗಾನ ಪ್ರಸಂಗ ಪುಸ್ತಕವನ್ನು ಹಂಚಲಾಗಿದೆ',
    '',
    `ಪ್ರತಿಸಂಗ್ರಹದ ಕೊಂಡಿ: ${pageUrl}`,
    '',
    `ಪ್ರಸಂಗ: ${entry.prasanga || '—'}`,
  ];
  if (entry.kavi) lines.push(`ಕವಿ: ${entry.kavi}`);
  if (entry.publisher) lines.push(`ಪ್ರಕಾಶನದ ವಿವರ: ${entry.publisher}`);
  if (entry.publish_date_kannada) lines.push(`ಸಂಗ್ರಹಕ್ಕೆ ಸೇರಿದ ದಿನಾಂಕ: ${entry.publish_date_kannada}`);

  if (hasKosha || hasPrati) {
    lines.push('');
    if (hasKosha) lines.push(`ಪ್ರಸಂಗಕೋಶದ ಪ್ರತಿ: ${entry.kosha_link}`);
    if (hasPrati) lines.push(`ಪ್ರತಿ ಸಂಗ್ರಹದ ಪ್ರತಿ: ${entry.prati_link}`);
  }

  if (entry.contributors && entry.contributors.length > 0) {
    lines.push('', `ಸಂಗ್ರಹಕ್ಕೆ ಸಹಕರಿಸಿದವರು: ${entry.contributors.join('; ')}`);
  }

  if (entry.notes) {
    lines.push('', `ಟಿಪ್ಪಣಿ: ${entry.notes}`);
  }

  lines.push(
    '',
    '',
    'Android App: https://play.google.com/store/apps/details?id=prasanga.prati.sangraha',
    '',
    'Visit: www.yakshavahini.com',
  );

  return lines.join('\n');
}

function getPdfEmbedUrl(url: string): string | null {
  if (!url || url.length < 15) return null;
  const driveFile = url.match(/\/file\/d\/([^/?#]+)/);
  if (driveFile) return `https://drive.google.com/file/d/${driveFile[1]}/preview`;
  const driveOpen = url.match(/[?&]id=([^&#]+)/);
  if (driveOpen) return `https://drive.google.com/file/d/${driveOpen[1]}/preview`;
  if (url.endsWith('.pdf') || url.includes('.pdf?')) return url;
  return null;
}

type ViewSource = 'kosha' | 'prati';

interface NavState {
  entryIds?: number[];
  currentIndex?: number;
}

const SWIPE_THRESHOLD = 50;

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const location = useLocation();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [iframeLoading, setIframeLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<ViewSource>('prati');
  const touchStartX = useRef<number | null>(null);

  const navState = (location.state || {}) as NavState;
  const entryIds = navState.entryIds;
  const currentIndex = navState.currentIndex;
  const hasPrev = entryIds && currentIndex !== undefined && currentIndex > 0;
  const hasNext = entryIds && currentIndex !== undefined && currentIndex < entryIds.length - 1;

  const goToOffset = (offset: number) => {
    if (!entryIds || currentIndex === undefined) return;
    const nextIndex = currentIndex + offset;
    const nextId = entryIds[nextIndex];
    if (nextId === undefined) return;
    navigate(`/entry/${nextId}`, { state: { entryIds, currentIndex: nextIndex }, replace: true });
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null || !entryIds) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    touchStartX.current = null;
    if (Math.abs(delta) < SWIPE_THRESHOLD) return;
    // Swipe left (finger moves right→left, negative delta) → next; swipe right → prev.
    if (delta < 0 && hasNext) goToOffset(1);
    else if (delta > 0 && hasPrev) goToOffset(-1);
  };

  useEffect(() => {
    fetchEntry(parseInt(id!))
      .then((r) => {
        setEntry(r.data);
        // Default to kosha preview when available
        const hasK = !!r.data.kosha_link && r.data.kosha_link.length > 15;
        setActiveSource(hasK ? 'kosha' : 'prati');
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const handleShare = async () => {
    if (!entry) return;
    // window.location.origin resolves to Capacitor's local WebView origin
    // (https://localhost) on Android — swap in the real public site instead.
    const pageUrl = `https://prasangapustaka.web.app${window.location.pathname}${window.location.search}`;
    try {
      await Share.share({
        title: entry.prasanga,
        text: buildShareText(entry, pageUrl),
        url: pageUrl,
      });
    } catch {
      navigator.clipboard?.writeText(pageUrl);
      toast.success('Link copied');
    }
  };

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16 text-center" style={{ color: 'var(--ps-muted)' }}>
        {t('error.not_found')}
      </div>
    );
  }

  const hasPdf = !!entry.prati_link && entry.prati_link.length > 15;
  const hasKosha = !!entry.kosha_link && entry.kosha_link.length > 15;
  const hasAnyPreview = hasPdf || hasKosha;

  const activeLink = activeSource === 'kosha' ? entry.kosha_link : entry.prati_link;
  const embedUrl = hasAnyPreview ? getPdfEmbedUrl(activeLink) : null;

  const switchSource = (src: ViewSource) => {
    if (src === activeSource) return;
    setActiveSource(src);
    setIframeLoading(true);
  };

  return (
    <div
      style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 22px 60px' }}
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
    >
      {/* Back + Prev/Next (Prev/Next only appear when arriving from a grouped browse list, e.g. Prasanga Kosha copies) */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginBottom: 18, flexWrap: 'wrap' }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: 7,
            fontFamily: "'Noto Sans Kannada', sans-serif", fontSize: 13.5, fontWeight: 500,
            color: 'var(--ps-muted)', cursor: 'pointer',
            background: 'none', border: 'none', padding: 0,
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ps-text)')}
          onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ps-muted)')}
        >
          <ArrowLeft style={{ width: 15, height: 15 }} />
          ಹಿಂದಿರುಗಿ...
        </button>

        {entryIds && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <button
              onClick={() => goToOffset(-1)}
              disabled={!hasPrev}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 10,
                border: '1px solid var(--ps-border)', background: 'var(--ps-surface)',
                color: hasPrev ? 'var(--ps-text)' : 'var(--ps-faint)',
                cursor: hasPrev ? 'pointer' : 'not-allowed', opacity: hasPrev ? 1 : 0.5,
              }}
            >
              <ArrowLeft style={{ width: 15, height: 15 }} />
            </button>
            {currentIndex !== undefined && (
              <span style={{ fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
                {currentIndex + 1} / {entryIds.length}
              </span>
            )}
            <button
              onClick={() => goToOffset(1)}
              disabled={!hasNext}
              style={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                width: 34, height: 34, borderRadius: 10,
                border: '1px solid var(--ps-border)', background: 'var(--ps-surface)',
                color: hasNext ? 'var(--ps-text)' : 'var(--ps-faint)',
                cursor: hasNext ? 'pointer' : 'not-allowed', opacity: hasNext ? 1 : 0.5,
              }}
            >
              <ArrowRight style={{ width: 15, height: 15 }} />
            </button>
          </div>
        )}
      </div>

      {/* Title + chips */}
      <div style={{ marginBottom: 22 }}>
        <h1 className="kn-serif" style={{
          fontWeight: 700, fontSize: 'clamp(22px, 3vw, 32px)',
          lineHeight: 1.3, margin: '0 0 12px', color: 'var(--ps-text)',
        }}>
          {entry.prasanga || '—'}
        </h1>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
          {entry.kavi && (
            <span className="kn-sans" style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)',
              borderRadius: 8, padding: '5px 11px', fontSize: 12.5, fontWeight: 600,
            }}>{entry.kavi}</span>
          )}
          {entry.publish_date_english && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: 'var(--ps-surface-2)', color: 'var(--ps-muted)',
              borderRadius: 8, padding: '5px 11px', fontFamily: 'system-ui', fontSize: 12.5, fontWeight: 500,
            }}>{new Date(entry.publish_date_english).getFullYear()}</span>
          )}
          {entry.view_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
              <Eye style={{ width: 13, height: 13 }} />{entry.view_count}
            </span>
          )}
        </div>
      </div>

      {/* Metadata panels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        {/* Metadata grid card */}
        <div style={{
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 18, padding: 22, boxShadow: 'var(--ps-shadow-sm)', flex: 1, minWidth: 260,
        }}>
          <div className="ps-serif" style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--ps-text)' }}>
            {t('entry.details')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px 24px' }}>
            <MetaItem label={t('entry.publisher')} value={entry.publisher} />
            <MetaItem label={t('entry.contributors')} value={entry.contributors} />
            {(entry.publish_date_kannada || entry.publish_date_english) && (
              <div style={{ gridColumn: 'span 2', minWidth: 0 }}>
                <div style={{ fontFamily: 'system-ui', fontSize: 10.5, fontWeight: 600, letterSpacing: '.04em', textTransform: 'uppercase', color: 'var(--ps-faint)', marginBottom: 4 }}>
                  {t('entry.date')}
                </div>
                <div className="kn-serif" style={{ fontSize: 14.5, color: 'var(--ps-text)', lineHeight: 1.4, whiteSpace: 'nowrap' }}>
                  {entry.publish_date_kannada || formatEnglishDate(entry.publish_date_english)}
                  {entry.publish_date_kannada && entry.publish_date_english && (
                    <span style={{ fontSize: 12, color: 'var(--ps-muted)', marginLeft: 6 }}>
                      ({formatEnglishDate(entry.publish_date_english)})
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Notes card */}
        {entry.notes && (
          <div style={{
            background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
            borderRadius: 18, padding: 22, boxShadow: 'var(--ps-shadow-sm)', flex: 1, minWidth: 260,
          }}>
            <div className="ps-serif" style={{ fontWeight: 600, fontSize: 15, marginBottom: 14, color: 'var(--ps-text)' }}>
              Notes · ಟಿಪ್ಪಣಿ
            </div>
            <p className="kn-serif" style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--ps-text)', margin: 0 }}>
              {entry.notes}
            </p>
          </div>
        )}
      </div>

      {/* ── PDF / Kosha Viewer ─────────────────────────────── */}
      {hasAnyPreview && (
        <div style={{ borderRadius: 20, overflow: 'hidden', border: '1px solid var(--ps-border)', boxShadow: 'var(--ps-shadow-md)' }}>
          {/* Gradient header */}
          <div style={{ background: 'var(--ps-grad)', padding: '18px 22px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
              {activeSource === 'kosha'
                ? <BookMarked style={{ width: 19, height: 19, color: '#fff' }} />
                : <BookOpen style={{ width: 19, height: 19, color: '#fff' }} />}
              <div>
                <div className="kn-serif" style={{ fontWeight: 700, fontSize: 15.5, color: '#fff', lineHeight: 1.2 }}>{entry.prasanga}</div>
                <div style={{ fontFamily: 'system-ui', fontSize: 11.5, color: 'rgba(255,255,255,.78)', marginTop: 2 }}>
                  {activeSource === 'kosha' ? 'ಯಕ್ಷಪ್ರಸಂಗಕೋಶದ ಪ್ರತಿ' : 'ಪ್ರಸಂಗಪ್ರತಿ'}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              {/* Source tabs */}
              {hasKosha && hasPdf && (
                <div style={{ display: 'flex', gap: 5, background: 'rgba(0,0,0,.16)', borderRadius: 13, padding: 4 }}>
                  {(['kosha', 'prati'] as ViewSource[]).map((src) => (
                    <button key={src} onClick={() => switchSource(src)}
                      style={{
                        padding: '6px 12px', borderRadius: 10, border: 'none', cursor: 'pointer',
                        fontFamily: 'system-ui', fontSize: 12, fontWeight: 600,
                        background: activeSource === src ? '#fff' : 'transparent',
                        color: activeSource === src ? 'var(--ps-accent)' : 'rgba(255,255,255,.85)',
                        transition: 'background .15s, color .15s',
                        display: 'flex', alignItems: 'center', gap: 5,
                      }}>
                      {src === 'kosha' ? <BookMarked style={{ width: 13, height: 13 }} /> : <BookOpen style={{ width: 13, height: 13 }} />}
                      {src === 'kosha' ? 'Kosha Link' : 'Prasanga Prati'}
                    </button>
                  ))}
                </div>
              )}
              <button onClick={handleShare}
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 10, border: '1px solid rgba(255,255,255,.3)', background: 'transparent', color: '#fff', fontFamily: 'system-ui', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}>
                <Share2 style={{ width: 14, height: 14 }} />Share
              </button>
              <a href={activeLink} target="_blank" rel="noopener"
                style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '7px 13px', borderRadius: 10, background: '#fff', color: 'var(--ps-accent)', fontFamily: 'system-ui', fontSize: 13, fontWeight: 700, textDecoration: 'none', boxShadow: 'var(--ps-shadow-sm)' }}>
                <Maximize2 style={{ width: 13, height: 13 }} />Open Full Screen
              </a>
            </div>
          </div>

          {/* Link bar */}
          <div style={{ background: 'var(--ps-surface-2)', borderBottom: '1px solid var(--ps-border)', padding: '10px 18px', display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontFamily: 'system-ui', fontSize: 11, fontWeight: 600, color: 'var(--ps-accent-text)', background: 'var(--ps-accent-soft)', borderRadius: 6, padding: '3px 8px', flexShrink: 0 }}>
              {activeSource === 'kosha' ? 'Kosha Link' : 'Prasanga Prati'}
            </span>
            <span style={{ fontFamily: 'ui-monospace,SFMono-Regular,Menlo,monospace', fontSize: 12, color: 'var(--ps-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
              {activeLink}
            </span>
            <a href={activeLink} target="_blank" rel="noopener"
              style={{ fontFamily: 'system-ui', fontSize: 11.5, fontWeight: 600, color: 'var(--ps-accent-text)', cursor: 'pointer', textDecoration: 'none', flexShrink: 0 }}>
              Open ↗
            </a>
          </div>

          {/* Embed */}
          {embedUrl ? (
            <div style={{ position: 'relative', background: 'var(--ps-surface-2)', height: '70vh', minHeight: 480 }}>
              {iframeLoading && (
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--ps-surface-2)', zIndex: 10 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, color: 'var(--ps-muted)' }}>
                    <Loader2 style={{ width: 32, height: 32, color: 'var(--ps-accent)' }} className="animate-spin" />
                    <p style={{ fontFamily: 'system-ui', fontSize: 13 }}>Loading document…</p>
                  </div>
                </div>
              )}
              <iframe key={embedUrl} src={embedUrl} title={entry.prasanga}
                style={{ width: '100%', height: '100%', border: 0 }}
                allow="autoplay" onLoad={() => setIframeLoading(false)} />
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '64px 24px', background: 'var(--ps-surface-2)', textAlign: 'center' }}>
              <div style={{ background: 'var(--ps-accent-soft)', borderRadius: '50%', padding: 20, marginBottom: 16 }}>
                <BookOpen style={{ width: 40, height: 40, color: 'var(--ps-accent)' }} />
              </div>
              <h3 className="kn-serif" style={{ fontWeight: 700, fontSize: 16, color: 'var(--ps-text)', marginBottom: 6 }}>{entry.prasanga}</h3>
              <p style={{ fontFamily: 'system-ui', fontSize: 13.5, color: 'var(--ps-muted)', marginBottom: 24 }}>Preview not available for this link type.</p>
              <a href={activeLink} target="_blank" rel="noopener"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--ps-grad)', color: '#fff', borderRadius: 999, padding: '12px 24px', fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, textDecoration: 'none', boxShadow: 'var(--ps-shadow-md)' }}>
                <ExternalLink style={{ width: 16, height: 16 }} />Open the Book
              </a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryDetail;
