import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loader2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { fetchUsers, updateUser } from '@/services/api';
import type { User } from '@/services/api';
import { toast } from 'sonner';

interface UserRow {
  user: User;
  role: string;
  dirty: boolean;
}

const ROLES = ['volunteer', 'editor', 'admin'] as const;

const AdminUsers: React.FC = () => {
  const { t } = useTranslation();
  const [rows, setRows] = useState<UserRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUsers()
      .then((res) => setRows(res.data.map((u) => ({ user: u, role: u.role || 'volunteer', dirty: false }))))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleRoleChange = (userId: number, newRole: string) => {
    setRows((prev) => prev.map((r) => r.user.id === userId ? { ...r, role: newRole, dirty: true } : r));
  };

  const handleSave = async (userId: number, role: string) => {
    try {
      await updateUser(userId, { role });
      setRows((prev) => prev.map((r) => r.user.id === userId ? { ...r, dirty: false } : r));
      toast.success('User updated');
    } catch {
      toast.error('Update failed');
    }
  };

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.users.title')}</h1>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden divide-y divide-slate-50">
          {rows.map(({ user, role, dirty }) => (
            <div key={user.id} className="flex items-center justify-between gap-4 px-5 py-4">
              <div className="flex items-center gap-3 min-w-0">
                {user.picture ? (
                  <img src={user.picture} alt={user.name} className="w-9 h-9 rounded-full shrink-0" />
                ) : (
                  <div className="w-9 h-9 rounded-full bg-indigo-100 flex items-center justify-center shrink-0 text-indigo-600 font-bold text-sm">
                    {(user.name || user.email).charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="min-w-0">
                  <div className="font-medium text-slate-800 truncate">{user.name || user.email}</div>
                  <div className="text-xs text-slate-400 truncate">{user.email}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <div className="flex rounded-lg overflow-hidden border border-slate-200">
                  {ROLES.map((r) => (
                    <button
                      key={r}
                      onClick={() => handleRoleChange(user.id, r)}
                      className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                        role === r
                          ? 'bg-indigo-600 text-white'
                          : 'text-slate-600 hover:bg-slate-50'
                      }`}
                    >
                      {r.charAt(0).toUpperCase() + r.slice(1)}
                    </button>
                  ))}
                </div>
                {dirty && (
                  <Button size="sm" className="h-8" onClick={() => handleSave(user.id, role)}>
                    <Check className="w-3.5 h-3.5 mr-1" />
                    {t('admin.users.save')}
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
