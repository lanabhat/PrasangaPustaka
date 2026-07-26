import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Entry } from '@/services/api';

interface Props {
  entry: Entry;
  onClick?: () => void;
}

// Deterministic spine colour (1–6) from the entry, so a title always keeps
// the same "cover". Colours come from the active theme's --spine-* tokens.
function spineIndex(entry: Entry): number {
  const key = `${entry.id}${entry.prasanga}`;
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return (h % 6) + 1;
}

const SpineCard: React.FC<Props> = ({ entry, onClick }) => {
  const navigate = useNavigate();
  const n = spineIndex(entry);
  const bg = `var(--spine-${n}-bg)`;
  const ink = `var(--spine-${n}-ink)`;

  const hasPdf = entry.prati_link && entry.prati_link.length > 15;
  const year = entry.publish_date_english
    ? new Date(entry.publish_date_english).getFullYear()
    : '';

  return (
    <div
      onClick={onClick ?? (() => navigate(`/entry/${entry.id}`))}
      style={{
        background: bg,
        color: ink,
        border: '1px solid var(--ps-border)',
        borderRadius: 3,
        padding: '16px 13px',
        minHeight: 190,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        cursor: 'pointer',
        position: 'relative',
        overflow: 'hidden',
        boxShadow: 'var(--ps-shadow-sm)',
        transition: 'transform .18s, box-shadow .18s',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-4px)';
        e.currentTarget.style.boxShadow = 'var(--ps-shadow-md)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = '';
        e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)';
      }}
    >
      {/* PDF dot */}
      {hasPdf && (
        <div style={{
          position: 'absolute', top: 10, right: 10,
          width: 6, height: 6, borderRadius: '50%',
          background: ink, opacity: 0.5,
        }} />
      )}

      {/* Title + kavi */}
      <div>
        <div className="kn-serif" style={{ fontSize: 15, lineHeight: 1.2, fontWeight: 600 }}>
          {entry.prasanga || '—'}
        </div>
        {entry.kavi && (
          <div className="kn-sans" style={{ fontSize: 10.5, lineHeight: 1.25, opacity: 0.8, marginTop: 6 }}>
            {entry.kavi}
          </div>
        )}
      </div>

      {/* Publisher (full) + year */}
      <div>
        {entry.publisher && (
          <div className="kn-sans" style={{ fontSize: 9.5, lineHeight: 1.3, opacity: 0.75, marginBottom: 4 }}>
            {entry.publisher}
          </div>
        )}
        {year && (
          <div style={{
            fontFamily: 'ui-monospace, monospace', fontSize: 9.5,
            letterSpacing: '.08em', opacity: 0.6,
          }}>
            {year}
          </div>
        )}
      </div>
    </div>
  );
};

export default SpineCard;
