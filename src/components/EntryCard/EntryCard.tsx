import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Entry } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';

interface Props {
  entry: Entry;
  compact?: boolean;
}

const statusColor: Record<string, string> = {
  pending: '#d97706',
  draft: '#6F665A',
  rejected: '#dc2626',
  needs_correction: '#ea580c',
};

const EntryCard: React.FC<Props> = ({ entry, compact = false }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const canSeeStatus = !!role;

  const hasPdf = entry.prati_link && entry.prati_link.length > 15;
  const showStatus = canSeeStatus && entry.status && entry.status !== 'approved';

  const cardStyle: React.CSSProperties = {
    background: 'var(--ps-surface)',
    border: '1px solid var(--ps-border)',
    borderRadius: 18,
    boxShadow: 'var(--ps-shadow-sm)',
    cursor: 'pointer',
    display: 'flex',
    flexDirection: 'column',
    gap: 9,
    transition: 'box-shadow .18s, transform .18s, border-color .18s',
  };

  const handleMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.boxShadow = 'var(--ps-shadow-md)';
    el.style.transform = 'translateY(-3px)';
    el.style.borderColor = 'var(--ps-accent)';
  };
  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    el.style.boxShadow = 'var(--ps-shadow-sm)';
    el.style.transform = '';
    el.style.borderColor = 'var(--ps-border)';
  };

  if (compact) {
    return (
      <div
        style={{ ...cardStyle, padding: 14 }}
        onClick={() => navigate(`/entry/${entry.id}`)}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
          <div className="kn-serif" style={{ fontWeight: 700, fontSize: 15, lineHeight: 1.4, color: 'var(--ps-text)' }}>
            {entry.prasanga || '—'}
          </div>
          {hasPdf && (
            <div style={{
              flexShrink: 0, width: 30, height: 22, borderRadius: 7,
              background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9.5, fontWeight: 800, letterSpacing: '.04em',
            }}>PDF</div>
          )}
        </div>
        {entry.kavi && (
          <div className="kn-sans" style={{ fontSize: 12.5, color: 'var(--ps-accent-text)', fontWeight: 600 }}>
            {entry.kavi}
          </div>
        )}
      </div>
    );
  }

  return (
    <div
      style={{ ...cardStyle, padding: 18 }}
      onClick={() => navigate(`/entry/${entry.id}`)}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {/* Title + PDF badge */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div className="kn-serif" style={{ fontWeight: 700, fontSize: 17.5, lineHeight: 1.4, color: 'var(--ps-text)' }}>
          {entry.prasanga || '—'}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4, flexShrink: 0 }}>
          {hasPdf && (
            <div style={{
              width: 30, height: 22, borderRadius: 7,
              background: 'var(--ps-accent-soft)', color: 'var(--ps-accent-text)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 9.5, fontWeight: 800, letterSpacing: '.04em',
            }}>PDF</div>
          )}
          {showStatus && (
            <span style={{
              fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 6,
              background: 'var(--ps-surface-2)', color: statusColor[entry.status] || 'var(--ps-muted)',
              textTransform: 'capitalize',
            }}>
              {entry.status.replace('_', ' ')}
            </span>
          )}
        </div>
      </div>

      {/* Kavi */}
      {entry.kavi && (
        <div className="kn-sans" style={{ fontSize: 13.5, color: 'var(--ps-accent-text)', fontWeight: 600 }}>
          {entry.kavi}
        </div>
      )}

      {/* Publisher · Year */}
      {entry.publisher && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span className="kn-sans" style={{ fontSize: 12.5, color: 'var(--ps-muted)' }}>{entry.publisher}</span>
          {entry.publish_date_english && (
            <>
              <span style={{ width: 3, height: 3, borderRadius: '50%', background: 'var(--ps-faint)', flexShrink: 0 }} />
              <span style={{ fontSize: 12.5, color: 'var(--ps-muted)' }}>
                {new Date(entry.publish_date_english).getFullYear()}
              </span>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default EntryCard;
