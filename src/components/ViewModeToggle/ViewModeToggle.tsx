import React from 'react';
import { LayoutGrid, List } from 'lucide-react';
import type { ViewMode } from '@/hooks/useViewMode';

interface Props {
  mode: ViewMode;
  onChange: (mode: ViewMode) => void;
}

const ViewModeToggle: React.FC<Props> = ({ mode, onChange }) => {
  const btnStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    width: 34, height: 30, borderRadius: 8, border: 'none', cursor: 'pointer',
    background: active ? 'var(--ps-surface)' : 'transparent',
    color: active ? 'var(--ps-accent-text)' : 'var(--ps-muted)',
    boxShadow: active ? 'var(--ps-shadow-sm)' : 'none',
    transition: 'background .15s, color .15s',
  });

  return (
    <div style={{
      display: 'flex', gap: 2, padding: 3, borderRadius: 11,
      background: 'var(--ps-surface-2)', border: '1px solid var(--ps-border)', flexShrink: 0,
    }}>
      <button onClick={() => onChange('thumbnail')} style={btnStyle(mode === 'thumbnail')}
        aria-label="Thumbnail view" title="Thumbnail view">
        <LayoutGrid style={{ width: 15, height: 15 }} />
      </button>
      <button onClick={() => onChange('list')} style={btnStyle(mode === 'list')}
        aria-label="List view" title="List view">
        <List style={{ width: 15, height: 15 }} />
      </button>
    </div>
  );
};

export default ViewModeToggle;
