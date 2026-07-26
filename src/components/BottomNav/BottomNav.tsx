import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Library, Search } from 'lucide-react';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  const items = [
    { label: t('nav.home'), href: '/', icon: Home },
    { label: t('nav.library'), href: '/library', icon: Library },
    { label: t('nav.search'), href: '/search', icon: Search },
  ];

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-50 flex items-stretch h-16"
      style={{
        background: 'var(--ps-surface)',
        borderTop: '1px solid var(--ps-border)',
        boxShadow: '0 -2px 12px rgba(0,0,0,0.06)',
      }}
    >
      {items.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          end={href === '/'}
          className="flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors"
          style={({ isActive }) => ({
            color: isActive ? 'var(--ps-accent-text)' : 'var(--ps-faint)',
          })}
        >
          {({ isActive }) => (
            <>
              <Icon className="w-5 h-5" style={{ color: isActive ? 'var(--ps-accent-text)' : 'var(--ps-faint)' }} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
