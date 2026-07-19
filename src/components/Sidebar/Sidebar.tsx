import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Home, Library, Search, PlusCircle, FileText, User, Users, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface NavItem {
  label: string;
  href: string;
  icon: React.ReactNode;
}

const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { isAuthenticated, role } = useAuth();

  const items: NavItem[] = [
    { label: t('nav.home'), href: '/', icon: <Home className="w-4 h-4" /> },
    { label: t('nav.library'), href: '/library', icon: <Library className="w-4 h-4" /> },
    { label: t('nav.search'), href: '/search', icon: <Search className="w-4 h-4" /> },
    ...(isAuthenticated ? [
      { label: t('nav.add'), href: '/add', icon: <PlusCircle className="w-4 h-4" /> },
      { label: t('nav.my_submissions'), href: '/my-submissions', icon: <FileText className="w-4 h-4" /> },
    ] : []),
    ...(role === 'admin' || role === 'editor' ? [
      { label: t('admin.export.title'), href: '/admin/export', icon: <Download className="w-4 h-4" /> },
    ] : []),
    ...(role === 'admin' ? [
      { label: t('admin.users.title'), href: '/admin/users', icon: <Users className="w-4 h-4" /> },
    ] : []),
    ...(isAuthenticated ? [
      { label: t('nav.admin'), href: '/profile', icon: <User className="w-4 h-4" /> },
    ] : []),
  ];

  return (
    <aside className="hidden md:flex w-56 shrink-0 flex-col border-r border-slate-200 bg-white min-h-[calc(100vh-3.5rem)] sticky top-14 self-start">
      <nav className="flex flex-col gap-1 p-3 pt-4 flex-1">
        {items.map((item) => (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                isActive
                  ? 'bg-indigo-50 text-indigo-700'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            {item.icon}
            {item.label}
          </NavLink>
        ))}
      </nav>
      <div className="p-4 border-t border-slate-100">
        <a href="https://www.yakshavahini.com" target="_blank" rel="noopener">
          <img src="/yakshavahini.jpg" alt="ಯಕ್ಷವಾಹಿನಿ" className="h-7 w-auto opacity-80 hover:opacity-100 transition-opacity" />
        </a>
      </div>
    </aside>
  );
};

export default Sidebar;
