import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  ArrowLeft, ExternalLink, Share2, Edit, Eye,
  CheckCircle, XCircle, AlertCircle, BookOpen, BookMarked,
  Maximize2, Loader2, Link2, Copy, Flag,
} from 'lucide-react';
import { Share } from '@capacitor/share';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { fetchEntry, reviewEntry } from '@/services/api';
import type { Entry } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const statusColors: Record<string, { bg: string; text: string }> = {
  approved: { bg: '#D1FAE5', text: '#065F46' },
  pending: { bg: '#FEF3C7', text: '#92400E' },
  draft: { bg: 'var(--ps-surface-2)', text: 'var(--ps-muted)' },
  rejected: { bg: '#FEE2E2', text: '#991B1B' },
  needs_correction: { bg: '#FFEDD5', text: '#9A3412' },
};

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

const EntryDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { user, role, isAuthenticated } = useAuth();
  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [reviewNotes, setReviewNotes] = useState('');
  const [iframeLoading, setIframeLoading] = useState(true);
  const [activeSource, setActiveSource] = useState<ViewSource>('prati');
  const [linkReviewOpen, setLinkReviewOpen] = useState(false);
  const [linkNote, setLinkNote] = useState('');

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
    try {
      await Share.share({
        title: entry.prasanga,
        text: `${entry.prasanga} — ${entry.kavi} ವಿರಚಿತ`,
        url: entry.prati_link || window.location.href,
      });
    } catch {
      navigator.clipboard?.writeText(window.location.href);
      toast.success('Link copied');
    }
  };

  const handleReview = async (status: string, notes?: string) => {
    if (!entry) return;
    try {
      const r = await reviewEntry(entry.id, status, notes);
      setEntry(r.data);
      toast.success(`Entry ${status}`);
    } catch {
      toast.error('Action failed');
    }
  };

  const handleLinkReview = async () => {
    if (!entry || !linkNote.trim()) return;
    try {
      const r = await reviewEntry(entry.id, entry.status, linkNote.trim());
      setEntry(r.data);
      setLinkNote('');
      setLinkReviewOpen(false);
      toast.success('Review note saved');
    } catch {
      toast.error('Failed to save note');
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard?.writeText(text).then(() => toast.success(`${label} copied`));
  };

  const canSeeStatus = !!role;
  const canEdit = isAuthenticated && (
    role === 'admin' || role === 'editor' ||
    (role === 'volunteer' && entry?.submitted_by === user?.email)
  );
  const canReview = role === 'admin' || role === 'editor';

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
      <div className="max-w-3xl mx-auto px-4 py-16 text-center text-slate-500">
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
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '22px 22px 60px' }}>
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 7,
          fontFamily: "'Noto Sans Kannada', sans-serif", fontSize: 13.5, fontWeight: 500,
          color: 'var(--ps-muted)', cursor: 'pointer',
          background: 'none', border: 'none', padding: 0, marginBottom: 18,
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--ps-text)')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--ps-muted)')}
      >
        <ArrowLeft style={{ width: 15, height: 15 }} />
        ಕ್ಯಾಟಲಾಗ್‌ಗೆ ಹಿಂತಿರುಗಿ
      </button>

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
          {canSeeStatus && entry.status && (
            <span style={{
              display: 'inline-flex', alignItems: 'center',
              background: statusColors[entry.status]?.bg ?? 'var(--ps-surface-2)',
              color: statusColors[entry.status]?.text ?? 'var(--ps-muted)',
              borderRadius: 8, padding: '5px 11px', fontFamily: 'system-ui', fontSize: 12, fontWeight: 600,
              textTransform: 'capitalize',
            }}>{entry.status.replace('_', ' ')}</span>
          )}
          {entry.view_count > 0 && (
            <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontFamily: 'system-ui', fontSize: 12, color: 'var(--ps-faint)' }}>
              <Eye style={{ width: 13, height: 13 }} />{entry.view_count}
            </span>
          )}
          {canEdit && (
            <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${entry.id}`)}
              style={{ borderColor: 'var(--ps-border)', color: 'var(--ps-muted)', marginLeft: 4 }}>
              <Edit style={{ width: 13, height: 13, marginRight: 6 }} />
              {t('entry.edit')}
            </Button>
          )}
        </div>
      </div>

      {/* Review callout */}
      {(entry.status === 'needs_correction' || entry.status === 'rejected') && entry.review_notes && (
        <div style={{
          marginBottom: 18, padding: '14px 16px', borderRadius: 12,
          borderLeft: `4px solid ${entry.status === 'rejected' ? '#ef4444' : '#f97316'}`,
          background: entry.status === 'rejected' ? '#FEF2F2' : '#FFF7ED',
          color: entry.status === 'rejected' ? '#991B1B' : '#9A3412',
          fontFamily: 'system-ui', fontSize: 13.5,
        }}>
          <strong>{entry.status === 'rejected' ? t('my_submissions.rejection_reason') : t('my_submissions.correction_needed')}:</strong>{' '}
          {entry.review_notes}
        </div>
      )}

      {/* Metadata panels */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, marginBottom: 22 }}>
        {/* Metadata grid card */}
        <div style={{
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 18, padding: 22, boxShadow: 'var(--ps-shadow-sm)', flex: 1, minWidth: 260,
        }}>
          <div className="ps-serif" style={{ fontWeight: 600, fontSize: 15, marginBottom: 16, color: 'var(--ps-text)' }}>
            Metadata · ವಿವರ
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '16px 24px' }}>
            <MetaItem label={t('entry.publisher')} value={entry.publisher} />
            <MetaItem label={t('entry.date_kannada')} value={entry.publish_date_kannada} />
            <MetaItem label={t('entry.date_english')} value={entry.publish_date_english} />
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

      {/* Admin/Editor PDF link review */}
      {canReview && (hasPdf || hasKosha) && (
        <div style={{
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 16, boxShadow: 'var(--ps-shadow-sm)', overflow: 'hidden', marginBottom: 22,
        }}>
          <button
            onClick={() => setLinkReviewOpen((o) => !o)}
            style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%', padding: '15px 18px', cursor: 'pointer',
              background: 'none', border: 'none', textAlign: 'left',
            }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#16a34a', flexShrink: 0 }} />
              <span style={{ fontFamily: 'system-ui', fontSize: 14, fontWeight: 600, color: 'var(--ps-text)' }}>PDF Link Review</span>
              <span style={{
                fontFamily: 'system-ui', fontSize: 11, fontWeight: 600,
                color: 'var(--ps-accent-text)', background: 'var(--ps-accent-soft)',
                borderRadius: 6, padding: '2px 8px',
              }}>Editor</span>
            </div>
            <span style={{ color: 'var(--ps-muted)', fontSize: 13, transform: linkReviewOpen ? 'rotate(180deg)' : '', transition: 'transform .2s' }}>▾</span>
          </button>

          {linkReviewOpen && (
            <div style={{ padding: '0 18px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {[hasPdf && { label: 'Prasanga Prati', url: entry.prati_link }, hasKosha && { label: 'Kosha Link', url: entry.kosha_link }]
                .filter(Boolean).map((r: any) => (
                <div key={r.label} style={{
                  border: '1px solid var(--ps-border)', borderRadius: 12, padding: 14,
                  display: 'flex', flexDirection: 'column', gap: 9, background: 'var(--ps-bg)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
                    <span className="kn-sans" style={{ fontSize: 13, fontWeight: 600, color: 'var(--ps-text)' }}>{r.label}</span>
                  </div>
                  <div style={{ fontFamily: 'ui-monospace,monospace', fontSize: 11.5, color: 'var(--ps-muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {r.url}
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <button onClick={() => copyToClipboard(r.url, r.label)}
                      style={{ fontFamily: 'system-ui', fontSize: 12, fontWeight: 600, color: 'var(--ps-muted)', background: 'var(--ps-surface)', border: '1px solid var(--ps-border)', borderRadius: 8, padding: '7px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <Copy style={{ width: 12, height: 12 }} />Copy
                    </button>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button style={{ fontFamily: 'system-ui', fontSize: 12, fontWeight: 600, color: '#fff', background: 'var(--ps-grad)', border: 'none', borderRadius: 8, padding: '7px 13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 5 }}>
                          <Flag style={{ width: 12, height: 12 }} />Flag broken
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Flag Link Issue — {r.label}</AlertDialogTitle>
                          <AlertDialogDescription>Describe the issue with this link.</AlertDialogDescription>
                        </AlertDialogHeader>
                        <Textarea value={linkNote} onChange={(e) => setLinkNote(e.target.value)}
                          placeholder="e.g. broken link, wrong file, low quality scan…" rows={3} />
                        <AlertDialogFooter>
                          <AlertDialogCancel onClick={() => setLinkNote('')}>Cancel</AlertDialogCancel>
                          <AlertDialogAction className="bg-amber-600 hover:bg-amber-700" onClick={handleLinkReview}>Save Note</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Review actions (editor/admin) */}
      {canReview && entry.status === 'pending' && (
        <div style={{
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 16, padding: '18px 22px', boxShadow: 'var(--ps-shadow-sm)',
          display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 22,
        }}>
          <Button variant="default" size="sm" className="bg-emerald-600 hover:bg-emerald-700"
            onClick={() => handleReview('approved')}>
            <CheckCircle className="w-4 h-4 mr-1.5" />Approve
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="outline" size="sm" className="border-orange-300 text-orange-700 hover:bg-orange-50">
                <AlertCircle className="w-4 h-4 mr-1.5" />Send for Correction
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Send Back for Correction</AlertDialogTitle>
                <AlertDialogDescription>Describe what needs to be fixed.</AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Notes for the submitter…" rows={3} />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-orange-600 hover:bg-orange-700" onClick={() => handleReview('needs_correction', reviewNotes)}>Send</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" size="sm"><XCircle className="w-4 h-4 mr-1.5" />Reject</Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Reject Entry</AlertDialogTitle>
                <AlertDialogDescription>Please provide a reason for rejection.</AlertDialogDescription>
              </AlertDialogHeader>
              <Textarea value={reviewNotes} onChange={(e) => setReviewNotes(e.target.value)} placeholder="Reason for rejection…" rows={3} />
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction className="bg-red-600 hover:bg-red-700" onClick={() => handleReview('rejected', reviewNotes)}>Reject</AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      )}

      {canReview && entry.status === 'rejected' && (
        <div style={{ marginBottom: 22 }}>
          <Button variant="outline" size="sm" onClick={() => handleReview('pending')}
            style={{ borderColor: 'var(--ps-border)', color: 'var(--ps-muted)' }}>
            Re-open for Review
          </Button>
        </div>
      )}

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
                  {activeSource === 'kosha' ? 'ಯಕ್ಷಪ್ರಸಂಗಕೋಶ ಪ್ರಸಂಗಪ್ರತಿ' : 'ಪ್ರಸಂಗಪ್ರತಿ'}
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
