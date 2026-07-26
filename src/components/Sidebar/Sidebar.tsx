import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
  Home, Library, Search,
  Feather, Building2, BookText, Mail, ChevronLeft, ChevronRight, X, BookMarked,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { collapsed, toggleCollapsed, mobileOpen, setMobileOpen } = useSidebar();

  const items: NavItem[] = [
    { label: t('nav.home'), href: '/', icon: <Home className="w-4 h-4 shrink-0" /> },
    { label: t('nav.library'), href: '/library', icon: <Library className="w-4 h-4 shrink-0" /> },
    { label: t('nav.prasangas'), href: '/prasangas', icon: <BookText className="w-4 h-4 shrink-0" /> },
    { label: t('nav.kosha'), href: '/kosha', icon: <BookMarked className="w-4 h-4 shrink-0" /> },
    { label: t('nav.kavis'), href: '/kavis', icon: <Feather className="w-4 h-4 shrink-0" /> },
    { label: t('nav.publishers'), href: '/publishers', icon: <Building2 className="w-4 h-4 shrink-0" /> },
    { label: t('nav.search'), href: '/search', icon: <Search className="w-4 h-4 shrink-0" /> },
    { label: t('nav.contact'), href: '/contact', icon: <Mail className="w-4 h-4 shrink-0" /> },
  ];

  return (
    <>
      {/* Backdrop — mobile drawer only */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-30"
          style={{ background: 'rgba(0,0,0,0.4)' }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'flex-col h-[calc(100vh-3.5rem)] fixed md:sticky inset-y-0 md:inset-auto left-0 top-14 md:top-14 z-40 transition-[width] duration-200',
          mobileOpen ? 'flex md:flex' : 'hidden md:flex',
          collapsed ? 'md:w-16' : 'md:w-56',
          'w-64',
        )}
        style={{ background: 'var(--ps-bg)', borderRight: '1px solid var(--ps-border)' }}
      >
        {/* Mobile drawer header — close button only */}
        <div className="md:hidden flex items-center justify-end p-2" style={{ borderBottom: '1px solid var(--ps-border)' }}>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-2 rounded-lg"
            style={{ color: 'var(--ps-muted)' }}
            aria-label="Close menu"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-1 p-3 pt-4 flex-1 overflow-y-auto">
          {items.map((item) => (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={() => setMobileOpen(false)}
              title={collapsed ? item.label : undefined}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                collapsed && 'md:justify-center md:px-0',
              )}
              style={({ isActive }) => ({
                background: isActive ? 'var(--ps-accent-soft)' : 'transparent',
                color: isActive ? 'var(--ps-accent-text)' : 'var(--ps-muted)',
              })}
            >
              {item.icon}
              <span className={collapsed ? 'md:hidden' : undefined}>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* Collapse toggle — desktop only */}
        <button
          onClick={toggleCollapsed}
          className="hidden md:flex items-center justify-center gap-2 p-3 text-xs font-medium"
          style={{ borderTop: '1px solid var(--ps-border)', color: 'var(--ps-muted)' }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <><ChevronLeft className="w-4 h-4" />Collapse</>}
        </button>

        <div className={cn('p-4', collapsed && 'md:hidden')} style={{ borderTop: '1px solid var(--ps-border)' }}>
          <a href="https://www.yakshavahini.com" target="_blank" rel="noopener">
            <img src="/yakshavahini.jpg" alt="ಯಕ್ಷವಾಹಿನಿ" className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity" />
          </a>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
