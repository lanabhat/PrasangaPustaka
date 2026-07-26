import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { Entry } from '@/services/api';

interface Props {
  entry: Entry;
  onClick?: () => void;
}

const EntryListRow: React.FC<Props> = ({ entry, onClick }) => {
  const navigate = useNavigate();
  const year = entry.publish_date_english ? new Date(entry.publish_date_english).getFullYear() : '';

  return (
    <div
      onClick={onClick ?? (() => navigate(`/entry/${entry.id}`))}
      style={{
        display: 'flex', flexDirection: 'column', gap: 4,
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 12, padding: '11px 14px', cursor: 'pointer',
        transition: 'border-color .15s, box-shadow .15s',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--ps-accent)'; e.currentTarget.style.boxShadow = 'var(--ps-shadow-sm)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--ps-border)'; e.currentTarget.style.boxShadow = ''; }}
    >
      <div className="kn-serif" style={{
        fontSize: 14.5, fontWeight: 600, color: 'var(--ps-text)', lineHeight: 1.3,
        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {entry.prasanga || '—'}
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '4px 10px' }}>
        {entry.kavi && (
          <span className="kn-sans" style={{ fontSize: 12.5, color: 'var(--ps-accent-text)', fontWeight: 600 }}>
            {entry.kavi}
          </span>
        )}
        {entry.publisher && (
          <span className="kn-sans" style={{ fontSize: 12, color: 'var(--ps-muted)' }}>
            {entry.publisher}
          </span>
        )}
        {year && (
          <span style={{ fontFamily: 'ui-monospace, monospace', fontSize: 11.5, color: 'var(--ps-faint)' }}>
            {year}
          </span>
        )}
      </div>
    </div>
  );
};

export default EntryListRow;
