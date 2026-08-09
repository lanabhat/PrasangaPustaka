import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Search, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTheme, type Theme } from '@/contexts/ThemeContext';
import { useSidebar } from '@/contexts/SidebarContext';

const THEMES: { id: Theme; label: string }[] = [
  { id: 'simple', label: 'Simple' },
  { id: 'library', label: 'Library' },
  { id: 'dark', label: 'Dark' },
];

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { theme, setTheme } = useTheme();
  const { mobileOpen, setMobileOpen } = useSidebar();
  const navigate = useNavigate();
  const [query, setQuery] = React.useState('');

  const toggleLang = () => i18n.changeLanguage(i18n.language === 'en' ? 'kn' : 'en');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && query.trim()) {
      navigate(`/library?q=${encodeURIComponent(query.trim())}`);
      setQuery('');
    }
  };

  return (
    <header style={{ background: 'var(--ps-bg)', borderBottom: '1px solid var(--ps-border)' }}
      className="sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-5 h-14 flex items-center gap-5">
        {/* Hamburger — mobile only, toggles the slide-in menu open/closed */}
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="md:hidden p-1.5 -ml-1.5 rounded-lg shrink-0"
          style={{ color: 'var(--ps-muted)' }}
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Logo lockup */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <img src={theme === 'dark' ? '/yakshavahini-dark.svg' : '/yakshavahini.svg'} alt="Yakshavahini"
            style={{ height: 38, width: 'auto', flexShrink: 0 }} />
          <div style={{ lineHeight: 1.1 }} className="hidden sm:block">
            <div className="kn-sans" style={{ fontWeight: 600, fontSize: 17, color: 'var(--ps-text)' }}>ಪ್ರತಿಸಂಗ್ರಹ</div>
            <div className="ps-serif" style={{ fontSize: 11, letterSpacing: '-0.01em', color: 'var(--ps-muted)' }}>
              Pratisangraha
            </div>
          </div>
        </Link>

        {/* Search pill — desktop */}
        <div className="hidden sm:flex flex-1 max-w-xs items-center gap-2"
          style={{
            background: 'var(--ps-surface)',
            border: '1px solid var(--ps-border)',
            borderRadius: 999,
            padding: '8px 14px',
            boxShadow: 'var(--ps-shadow-sm)',
          }}>
          <Search style={{ width: 14, height: 14, color: 'var(--ps-faint)', flexShrink: 0 }} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleSearch}
            placeholder="Search prasanga, kavi…"
            style={{
              border: 'none', background: 'transparent', outline: 'none',
              fontFamily: 'system-ui', fontSize: 13.5, color: 'var(--ps-text)', width: '100%',
            }}
          />
        </div>

        {/* Search icon — mobile only, links to the Search page */}
        <button
          onClick={() => navigate('/search')}
          className="sm:hidden p-1.5 rounded-lg shrink-0"
          style={{ color: 'var(--ps-muted)' }}
          aria-label={t('nav.search')}
        >
          <Search className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Theme switcher — pill group on larger screens */}
        <div style={{
          alignItems: 'center', gap: 2,
          background: 'var(--ps-surface-2)', borderRadius: 8,
          padding: 3, border: '1px solid var(--ps-border)',
        }} className="hidden sm:flex">
          {THEMES.map(({ id, label }) => (
            <button key={id} onClick={() => setTheme(id)}
              style={{
                fontFamily: 'system-ui', fontSize: 11.5, fontWeight: theme === id ? 600 : 400,
                padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer',
                background: theme === id ? 'var(--ps-surface)' : 'transparent',
                color: theme === id ? 'var(--ps-accent-text)' : 'var(--ps-muted)',
                boxShadow: theme === id ? 'var(--ps-shadow-sm)' : 'none',
                transition: 'all 0.15s',
              }}>
              {label}
            </button>
          ))}
        </div>

        {/* Theme switcher — compact dropdown on small screens */}
        <select
          value={theme}
          onChange={(e) => setTheme(e.target.value as Theme)}
          className="sm:hidden"
          style={{
            fontFamily: 'system-ui', fontSize: 11.5, fontWeight: 600,
            padding: '5px 6px', borderRadius: 6, maxWidth: 78,
            background: 'var(--ps-surface-2)', color: 'var(--ps-accent-text)',
            border: '1px solid var(--ps-border)', outline: 'none',
          }}
          aria-label="Theme"
        >
          {THEMES.map(({ id, label }) => (
            <option key={id} value={id}>{label}</option>
          ))}
        </select>

        {/* Language toggle — icon only on mobile, icon + label from sm up */}
        <Button variant="ghost" size="sm" onClick={toggleLang}
          className="text-xs font-medium gap-1 px-2 sm:px-3 shrink-0"
          style={{ color: 'var(--ps-muted)' }}>
          <Globe className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">{t('lang.toggle')}</span>
        </Button>
      </div>
    </header>
  );
};

export default Navbar;
