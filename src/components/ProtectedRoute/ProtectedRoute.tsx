import React from 'react';
import { Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const ROLE_LEVEL: Record<string, number> = { volunteer: 1, editor: 2, admin: 3 };

interface Props {
  children: React.ReactNode;
  role?: 'volunteer' | 'editor' | 'admin';
}

const ProtectedRoute: React.FC<Props> = ({ children, role }) => {
  const { isAuthenticated, role: userRole, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/" replace />;

  if (role && (!userRole || ROLE_LEVEL[userRole] < ROLE_LEVEL[role])) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
