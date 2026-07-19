import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Globe, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

const Navbar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { user, isAuthenticated } = useAuth();
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
        {/* Logo lockup */}
        <Link to="/" className="flex items-center gap-2.5 shrink-0">
          <div style={{
            width: 38, height: 38, borderRadius: 11,
            background: 'var(--ps-grad)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: 'var(--ps-shadow-sm)', flexShrink: 0,
          }}>
            <span className="kn-serif" style={{ color: '#fff', fontSize: 22, fontWeight: 700, lineHeight: 1 }}>ಯ</span>
          </div>
          <div style={{ lineHeight: 1.1 }}>
            <div className="ps-serif" style={{ fontWeight: 600, fontSize: 17, letterSpacing: '-0.01em', color: 'var(--ps-text)' }}>
              Pratisangraha
            </div>
            <div className="kn-sans" style={{ fontSize: 11, color: 'var(--ps-muted)' }}>ಪ್ರತಿಸಂಗ್ರಹ</div>
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

        <div className="flex-1" />

        {/* Language toggle */}
        <Button variant="ghost" size="sm" onClick={toggleLang}
          className="text-xs font-medium gap-1"
          style={{ color: 'var(--ps-muted)' }}>
          <Globe className="w-3.5 h-3.5" />
          {t('lang.toggle')}
        </Button>

        {/* Avatar — only shown when authenticated, links to admin panel */}
        {isAuthenticated && (
          <Link to="/profile" style={{ display: 'flex', alignItems: 'center', textDecoration: 'none' }}>
            {user?.picture ? (
              <img src={user.picture} alt={user.name}
                style={{ width: 34, height: 34, borderRadius: '50%', border: '2px solid var(--ps-accent-soft)' }} />
            ) : (
              <div style={{
                width: 34, height: 34, borderRadius: '50%',
                background: 'var(--ps-surface-2)', border: '1px solid var(--ps-border)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontFamily: 'system-ui', fontSize: 13, fontWeight: 700, color: 'var(--ps-accent-text)',
              }}>
                {user?.name?.charAt(0)?.toUpperCase() ?? '?'}
              </div>
            )}
          </Link>
        )}
      </div>
    </header>
  );
};

export default Navbar;
