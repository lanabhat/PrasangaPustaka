import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Library, Search, PlusCircle, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

const BottomNav: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();

  const items = [
    { label: t('nav.home'), href: '/', icon: Home },
    { label: t('nav.library'), href: '/library', icon: Library },
    { label: t('nav.search'), href: '/search', icon: Search },
    ...(isAuthenticated ? [{ label: t('nav.add'), href: '/add', icon: PlusCircle }] : []),
    ...(isAuthenticated ? [{ label: t('nav.admin'), href: '/profile', icon: User }] : []),
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 flex items-stretch h-16 shadow-[0_-2px_12px_rgba(0,0,0,0.06)]">
      {items.map(({ label, href, icon: Icon }) => (
        <NavLink
          key={href}
          to={href}
          end={href === '/'}
          className={({ isActive }) =>
            cn(
              'flex-1 flex flex-col items-center justify-center gap-0.5 text-[10px] font-medium transition-colors',
              isActive ? 'text-indigo-700' : 'text-slate-400'
            )
          }
        >
          {({ isActive }) => (
            <>
              <Icon className={cn('w-5 h-5', isActive ? 'text-indigo-700' : 'text-slate-400')} />
              <span>{label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  );
};

export default BottomNav;
