import React, { useEffect, useState } from 'react';
import { ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { fetchStats, fetchBrowseList, fetchPublishYears } from '@/services/api';
import type { StatsData, BrowseItem } from '@/services/api';

interface ShelfSidebarProps {
  activeKavi: string;
  activePublisher: string;
  activePrasangaLetter: string;
  activeYear: string;
  activeMonth: string;
  totalCount: number;
  onAll: () => void;
  onKavi: (kavi: string) => void;
  onPublisher: (publisher: string) => void;
  onPrasangaLetter: (letter: string) => void;
  onYear: (year: string) => void;
  onMonth: (month: string) => void;
}

interface LetterGroup {
  letter: string;
  count: number;
}

// Groups prasanga names by their first character (the base akshara — dependent
// vowel signs are separate codepoints that follow it, so charAt(0) is enough)
// and sorts by codepoint, which matches Kannada's traditional letter order.
function groupByFirstLetter(items: { name: string; count: number }[]): LetterGroup[] {
  const counts = new Map<string, number>();
  for (const { name, count } of items) {
    const letter = name.trim().charAt(0);
    if (!letter) continue;
    counts.set(letter, (counts.get(letter) ?? 0) + count);
  }
  return Array.from(counts.entries())
    .map(([letter, count]) => ({ letter, count }))
    .sort((a, b) => a.letter.localeCompare(b.letter, 'kn'));
}

const sectionHeaderStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  width: '100%', border: 'none', cursor: 'pointer', background: 'transparent',
  fontFamily: 'ui-monospace, monospace', fontSize: 10.5,
  letterSpacing: '0.08em', textTransform: 'uppercase',
  color: 'var(--ps-faint)', padding: '10px 10px 6px',
};

function Section({
  label, count, open, onToggle, children,
}: { label: string; count: number; open: boolean; onToggle: () => void; children: React.ReactNode }) {
  return (
    <div>
      <button style={sectionHeaderStyle} onClick={onToggle}>
        <span className="kn-sans" style={{ textTransform: 'none', letterSpacing: 0, fontSize: 12 }}>{label}</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span>{count}</span>
          <ChevronDown style={{ width: 12, height: 12, transform: open ? 'rotate(180deg)' : '', transition: 'transform .15s' }} />
        </span>
      </button>
      {open && <div style={{ paddingBottom: 6 }}>{children}</div>}
    </div>
  );
}

const ShelfSidebar: React.FC<ShelfSidebarProps> = ({
  activeKavi, activePublisher, activePrasangaLetter, activeYear, activeMonth, totalCount,
  onAll, onKavi, onPublisher, onPrasangaLetter, onYear, onMonth,
}) => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [letters, setLetters] = useState<LetterGroup[]>([]);
  const [years, setYears] = useState<number[]>([]);
  const [months, setMonths] = useState<BrowseItem[]>([]);
  const [alphabetOpen, setAlphabetOpen] = useState(false);
  const [kavisOpen, setKavisOpen] = useState(false);
  const [publishersOpen, setPublishersOpen] = useState(false);
  const [yearsOpen, setYearsOpen] = useState(false);
  const [monthsOpen, setMonthsOpen] = useState(false);

  useEffect(() => {
    fetchStats().then((r) => setStats(r.data)).catch(console.error);
    fetchBrowseList('prasanga').then((r) => setLetters(groupByFirstLetter(r.data))).catch(console.error);
    fetchPublishYears().then((r) => setYears(r.data)).catch(console.error);
    fetchBrowseList('month').then((r) => setMonths(r.data)).catch(console.error);
  }, []);

  const isAllActive = !activeKavi && !activePublisher && !activePrasangaLetter && !activeYear && !activeMonth;

  const itemStyle = (active: boolean): React.CSSProperties => ({
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    gap: 6, width: '100%', textAlign: 'left', border: 'none', cursor: 'pointer',
    fontFamily: 'system-ui', fontSize: 13, padding: '6px 10px', borderRadius: 7,
    background: active ? 'var(--ps-accent-soft)' : 'transparent',
    color: active ? 'var(--ps-accent-text)' : 'var(--ps-text)',
    fontWeight: active ? 600 : 400,
    transition: 'background 0.12s, color 0.12s',
  });

  const countStyle: React.CSSProperties = {
    fontSize: 11, fontFamily: 'ui-monospace, monospace',
    color: 'var(--ps-faint)', flexShrink: 0,
  };

  return (
    <div style={{ padding: '8px' }}>
      {/* All */}
      <button style={itemStyle(isAllActive)} onClick={onAll}>
        <span className="kn-sans">✦ {t('library.all')}</span>
        <span style={countStyle}>{totalCount || stats?.total || ''}</span>
      </button>

      {/* Dictionary-style browse — Kannada starting letter of each prasanga */}
      {letters.length > 0 && (
        <Section label={t('library.alphabet_section')} count={letters.length}
          open={alphabetOpen} onToggle={() => setAlphabetOpen((o) => !o)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 10px 2px' }}>
            {letters.map(({ letter, count }) => (
              <button key={letter} onClick={() => onPrasangaLetter(letter)} title={`${count}`}
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  width: 32, height: 32, borderRadius: 8,
                  border: '1px solid var(--ps-border)',
                  background: activePrasangaLetter === letter ? 'var(--ps-accent)' : 'var(--ps-surface)',
                  color: activePrasangaLetter === letter ? '#fff' : 'var(--ps-text)',
                  cursor: 'pointer',
                }}>
                <span className="kn-serif" style={{ fontSize: 15, lineHeight: 1 }}>{letter}</span>
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Kavis section — collapsed by default, shows the count until expanded */}
      {stats && stats.by_kavi.length > 0 && (
        <Section label={t('library.kavis_section')} count={stats.by_kavi.length}
          open={kavisOpen} onToggle={() => setKavisOpen((o) => !o)}>
          {stats.by_kavi.map(({ name, count }) => (
            <button key={name} style={itemStyle(activeKavi === name)} onClick={() => onKavi(name)}>
              <span className="kn-sans" style={{ fontSize: 12.5, lineHeight: 1.3 }}>{name}</span>
              <span style={countStyle}>{count}</span>
            </button>
          ))}
        </Section>
      )}

      {/* Publishers section — collapsed by default, shows the count until expanded */}
      {stats && stats.by_publisher.length > 0 && (
        <Section label={t('library.publishers_section')} count={stats.by_publisher.length}
          open={publishersOpen} onToggle={() => setPublishersOpen((o) => !o)}>
          {stats.by_publisher.map(({ name, count }) => (
            <button key={name} style={itemStyle(activePublisher === name)} onClick={() => onPublisher(name)}>
              <span className="kn-sans" style={{ fontSize: 12.5, lineHeight: 1.3 }}>{name}</span>
              <span style={countStyle}>{count}</span>
            </button>
          ))}
        </Section>
      )}

      {/* Year browse — added year, no per-year count available from the API */}
      {years.length > 0 && (
        <Section label={t('library.year_section')} count={years.length}
          open={yearsOpen} onToggle={() => setYearsOpen((o) => !o)}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, padding: '4px 10px 2px' }}>
            {[...years].reverse().map((year) => (
              <button key={year} onClick={() => onYear(String(year))}
                style={{
                  padding: '6px 11px', borderRadius: 8,
                  border: '1px solid var(--ps-border)',
                  background: activeYear === String(year) ? 'var(--ps-accent)' : 'var(--ps-surface)',
                  color: activeYear === String(year) ? '#fff' : 'var(--ps-text)',
                  cursor: 'pointer', fontFamily: 'ui-monospace, monospace', fontSize: 12.5,
                }}>
                {year}
              </button>
            ))}
          </div>
        </Section>
      )}

      {/* Month browse — added month, irrespective of year; last option */}
      {months.length > 0 && (
        <Section label={t('library.month_section')} count={months.length}
          open={monthsOpen} onToggle={() => setMonthsOpen((o) => !o)}>
          {months.map(({ id, name, count }) => (
            <button key={id} style={itemStyle(activeMonth === String(id))} onClick={() => onMonth(String(id))}>
              <span className="kn-sans" style={{ fontSize: 12.5, lineHeight: 1.3 }}>{name}</span>
              <span style={countStyle}>{count}</span>
            </button>
          ))}
        </Section>
      )}
    </div>
  );
};

export default ShelfSidebar;
