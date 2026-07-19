import React, { useEffect, useState } from 'react';
import { SlidersHorizontal, ArrowUpAZ, ArrowDownAZ, ChevronDown, X } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import AutocompleteInput from '@/components/AutocompleteInput/AutocompleteInput';
import type { SortField, SortOrder } from '@/services/api';
import { fetchPublishYears } from '@/services/api';

interface FilterPanelProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  kavi: string;
  publisher: string;
  prasanga: string;
  hasPdf: boolean;
  yearFrom: string;
  yearTo: string;
  sortField: SortField;
  sortOrder: SortOrder;
  onKaviChange: (v: string) => void;
  onPublisherChange: (v: string) => void;
  onPrasangaChange: (v: string) => void;
  onHasPdfChange: (v: boolean) => void;
  onYearFromChange: (v: string) => void;
  onYearToChange: (v: string) => void;
  onSortFieldChange: (v: SortField) => void;
  onSortOrderChange: (v: SortOrder) => void;
  onClear: () => void;
  /** When true: no toggle button, content always visible (desktop sidebar mode) */
  alwaysOpen?: boolean;
}

const ANY = '__any__';

const FilterPanel: React.FC<FilterPanelProps> = ({
  open, onOpenChange,
  kavi, publisher, prasanga, hasPdf, yearFrom, yearTo, sortField, sortOrder,
  onKaviChange, onPublisherChange, onPrasangaChange, onHasPdfChange,
  onYearFromChange, onYearToChange, onSortFieldChange, onSortOrderChange,
  onClear, alwaysOpen = false,
}) => {
  const [availableYears, setAvailableYears] = useState<number[]>([]);

  useEffect(() => {
    fetchPublishYears()
      .then((res) => setAvailableYears(res.data))
      .catch(() => {});
  }, []);

  const activeCount = [
    !!kavi, !!publisher, !!prasanga, hasPdf,
    !!yearFrom || !!yearTo,
    sortField !== 'entry_id' || sortOrder !== 'asc',
  ].filter(Boolean).length;

  const showContent = alwaysOpen || open;

  const labelStyle: React.CSSProperties = {
    fontFamily: "'Noto Sans Kannada', sans-serif",
    fontSize: 12, fontWeight: 600, color: 'var(--ps-muted)',
    marginBottom: 8, display: 'block',
  };

  const inputStyle: React.CSSProperties = {
    border: '1px solid var(--ps-border)', borderRadius: 10,
    background: 'var(--ps-surface)', color: 'var(--ps-text)',
    fontFamily: 'system-ui', fontSize: 13, padding: '9px 12px',
    width: '100%', outline: 'none',
  };

  const panelContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>

      {/* Kavi */}
      <div>
        <span style={labelStyle}>ಕವಿ · Kavi</span>
        <AutocompleteInput model="kavi" value={kavi} onValueChange={onKaviChange}
          placeholder="ಕವಿ ಹೆಸರು…" />
      </div>

      {/* Publisher */}
      <div>
        <span style={labelStyle}>ಪ್ರಕಾಶಕ · Publisher</span>
        <AutocompleteInput model="publisher" value={publisher} onValueChange={onPublisherChange}
          placeholder="ಪ್ರಕಾಶಕ ಹೆಸರು…" />
      </div>

      {/* Prasanga */}
      <div>
        <span style={labelStyle}>ಪ್ರಸಂಗ · Prasanga</span>
        <AutocompleteInput model="prasanga" value={prasanga} onValueChange={onPrasangaChange}
          placeholder="ಪ್ರಸಂಗ ಹೆಸರು…" />
      </div>

      {/* Year from */}
      <div>
        <span style={labelStyle}>ವರ್ಷ · Year from</span>
        <Select value={yearFrom || ANY} onValueChange={(v) => onYearFromChange(v === ANY ? '' : v)}>
          <SelectTrigger style={inputStyle as any}>
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any year</SelectItem>
            {availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Year to */}
      <div>
        <span style={labelStyle}>ವರ್ಷ · Year to</span>
        <Select value={yearTo || ANY} onValueChange={(v) => onYearToChange(v === ANY ? '' : v)}>
          <SelectTrigger style={inputStyle as any}>
            <SelectValue placeholder="Any year" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={ANY}>Any year</SelectItem>
            {[...availableYears].reverse().map((y) => (
              <SelectItem key={y} value={String(y)}>{y}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Has PDF toggle */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer' }}
        onClick={() => onHasPdfChange(!hasPdf)}>
        <span className="kn-sans" style={{ fontSize: 13, color: 'var(--ps-text)' }}>PDF ಲಭ್ಯ · Has PDF</span>
        {/* Toggle switch */}
        <div style={{
          width: 42, height: 24, borderRadius: 12,
          background: hasPdf ? 'var(--ps-accent)' : 'var(--ps-border)',
          position: 'relative', transition: 'background .18s', flexShrink: 0,
        }}>
          <div style={{
            position: 'absolute', top: 3, left: hasPdf ? 21 : 3,
            width: 18, height: 18, borderRadius: '50%',
            background: '#fff', transition: 'left .18s',
            boxShadow: '0 1px 3px rgba(0,0,0,.2)',
          }} />
        </div>
      </div>

      <div style={{ height: 1, background: 'var(--ps-border)' }} />

      {/* Sort by */}
      <div>
        <span style={labelStyle}>Sort by</span>
        <Select value={sortField} onValueChange={(v) => onSortFieldChange(v as SortField)}>
          <SelectTrigger style={inputStyle as any}>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="entry_id">Default order</SelectItem>
            <SelectItem value="prasanga">Prasanga name</SelectItem>
            <SelectItem value="kavi">Kavi name</SelectItem>
            <SelectItem value="publisher">Publisher</SelectItem>
            <SelectItem value="date">Publish date</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Order */}
      <div>
        <span style={labelStyle}>Order</span>
        <div style={{ display: 'flex', gap: 8 }}>
          {(['asc', 'desc'] as SortOrder[]).map((o) => (
            <button key={o} onClick={() => onSortOrderChange(o)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '8px 0', borderRadius: 10, border: '1px solid var(--ps-border)',
                background: sortOrder === o ? 'var(--ps-accent)' : 'var(--ps-surface)',
                color: sortOrder === o ? '#fff' : 'var(--ps-muted)',
                fontFamily: 'system-ui', fontSize: 13, fontWeight: 600, cursor: 'pointer',
                transition: 'background .15s, color .15s',
              }}>
              {o === 'asc' ? <ArrowUpAZ style={{ width: 14, height: 14 }} /> : <ArrowDownAZ style={{ width: 14, height: 14 }} />}
              {o === 'asc' ? 'A–Z' : 'Z–A'}
            </button>
          ))}
        </div>
      </div>

      {/* Clear all */}
      {activeCount > 0 && (
        <button onClick={onClear}
          style={{
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '9px 0', borderRadius: 10, border: '1px solid var(--ps-border)',
            background: 'var(--ps-surface-2)', color: 'var(--ps-muted)',
            fontFamily: 'system-ui', fontSize: 13, fontWeight: 500, cursor: 'pointer',
            width: '100%',
          }}>
          <X style={{ width: 13, height: 13 }} />
          Clear all filters
        </button>
      )}
    </div>
  );

  if (alwaysOpen) {
    return (
      <div style={{
        background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
        borderRadius: 18, padding: 18, boxShadow: 'var(--ps-shadow-sm)',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 }}>
          <span className="ps-serif" style={{ fontWeight: 600, fontSize: 15, color: 'var(--ps-text)' }}>Filters</span>
          {activeCount > 0 && (
            <span style={{
              background: 'var(--ps-accent)', color: '#fff',
              borderRadius: 999, padding: '2px 8px',
              fontFamily: 'system-ui', fontSize: 11, fontWeight: 700,
            }}>{activeCount}</span>
          )}
        </div>
        {panelContent}
      </div>
    );
  }

  // Mobile collapsible mode
  return (
    <div style={{ marginBottom: 12 }}>
      <button
        onClick={() => onOpenChange(!open)}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 8,
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 11, padding: '10px 15px',
          fontFamily: 'system-ui', fontSize: 13.5, fontWeight: 600, color: 'var(--ps-text)',
          cursor: 'pointer', boxShadow: 'var(--ps-shadow-sm)',
        }}>
        <SlidersHorizontal style={{ width: 14, height: 14 }} />
        Filters & sort
        {activeCount > 0 && (
          <span style={{
            background: 'var(--ps-accent)', color: '#fff',
            borderRadius: 999, padding: '1px 7px',
            fontSize: 11, fontWeight: 700,
          }}>{activeCount}</span>
        )}
        <ChevronDown style={{ width: 14, height: 14, transform: open ? 'rotate(180deg)' : '', transition: 'transform .2s' }} />
      </button>

      {showContent && (
        <div style={{
          marginTop: 8,
          background: 'var(--ps-surface)', border: '1px solid var(--ps-border)',
          borderRadius: 18, padding: 18, boxShadow: 'var(--ps-shadow-sm)',
        }}>
          {panelContent}
        </div>
      )}
    </div>
  );
};

export default FilterPanel;
