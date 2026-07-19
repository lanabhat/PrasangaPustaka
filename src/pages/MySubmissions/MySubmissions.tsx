import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Loader2, Plus, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { fetchMySubmissions, updateEntry } from '@/services/api';
import type { Entry } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const statusColor: Record<string, string> = {
  approved: 'bg-emerald-100 text-emerald-800',
  pending: 'bg-amber-100 text-amber-800',
  draft: 'bg-slate-100 text-slate-600',
  rejected: 'bg-red-100 text-red-800',
  needs_correction: 'bg-orange-100 text-orange-800',
};

const GROUP_ORDER = ['needs_correction', 'pending', 'draft', 'approved', 'rejected'];

const MySubmissions: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [entries, setEntries] = useState<Entry[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    if (!isAuthenticated) return;
    setLoading(true);
    fetchMySubmissions()
      .then((r) => setEntries(r.data))
      .catch(console.error)
      .finally(() => setLoading(false));
  };

  useEffect(load, [isAuthenticated]);

  const handleRetract = async (id: number) => {
    try {
      await updateEntry(id, { status: 'draft' });
      toast.success('Entry retracted');
      load();
    } catch {
      toast.error('Failed to retract');
    }
  };

  const grouped = GROUP_ORDER.reduce<Record<string, Entry[]>>((acc, s) => {
    const group = entries.filter((e) => e.status === s);
    if (group.length > 0) acc[s] = group;
    return acc;
  }, {});

  const groupLabel: Record<string, string> = {
    approved: t('my_submissions.approved'),
    pending: t('my_submissions.pending'),
    draft: t('my_submissions.draft'),
    rejected: t('my_submissions.rejected'),
    needs_correction: t('my_submissions.needs_correction'),
  };

  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center">
        <p className="text-slate-500">{t('auth.sign_in_required')}</p>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-slate-800">{t('nav.my_submissions')}</h1>
        <Button size="sm" onClick={() => navigate('/add')}>
          <Plus className="w-4 h-4 mr-1.5" />
          New Entry
        </Button>
      </div>

      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="w-7 h-7 animate-spin text-indigo-500" />
        </div>
      )}

      {!loading && entries.length === 0 && (
        <div className="text-center py-16">
          <p className="text-slate-500 mb-4">No submissions yet.</p>
          <Button onClick={() => navigate('/add')}>
            <Plus className="w-4 h-4 mr-1.5" />
            Add your first entry
          </Button>
        </div>
      )}

      {!loading && Object.entries(grouped).map(([status, group]) => (
        <section key={status} className="mb-8">
          <div className="flex items-center gap-2 mb-3">
            <h2 className="text-sm font-semibold text-slate-600 uppercase tracking-wide">{groupLabel[status]}</h2>
            <span className="text-xs bg-slate-100 text-slate-500 rounded-full px-2 py-0.5">{group.length}</span>
          </div>

          <div className="space-y-3">
            {group.map((entry) => (
              <div key={entry.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-slate-900 kn truncate">{entry.prasanga || '—'}</h3>
                    <p className="text-sm text-slate-500 kn mt-0.5 truncate">{entry.kavi}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColor[entry.status] || 'bg-slate-100 text-slate-600'}`}>
                      {entry.status?.replace('_', ' ')}
                    </span>
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0" onClick={() => navigate(`/entry/${entry.id}`)}>
                      <Eye className="w-4 h-4" />
                    </Button>
                  </div>
                </div>

                {(entry.status === 'needs_correction' || entry.status === 'rejected') && entry.review_notes && (
                  <div className={`mt-3 p-3 rounded-lg border-l-4 text-sm ${
                    entry.status === 'rejected'
                      ? 'bg-red-50 border-red-400 text-red-800'
                      : 'bg-orange-50 border-orange-400 text-orange-800'
                  }`}>
                    <span className="font-medium">
                      {entry.status === 'rejected' ? t('my_submissions.rejection_reason') : t('my_submissions.correction_needed')}:
                    </span>{' '}
                    {entry.review_notes}
                  </div>
                )}

                <div className="mt-3 flex gap-2 flex-wrap">
                  {(entry.status === 'draft' || entry.status === 'needs_correction') && (
                    <Button variant="outline" size="sm" onClick={() => navigate(`/edit/${entry.id}`)}>
                      {entry.status === 'needs_correction' ? t('my_submissions.fix_resubmit') : t('my_submissions.edit')}
                    </Button>
                  )}
                  {entry.status === 'pending' && (
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="outline" size="sm" className="border-red-200 text-red-600 hover:bg-red-50">
                          {t('my_submissions.retract')}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Retract Entry</AlertDialogTitle>
                          <AlertDialogDescription>
                            This will move the entry back to Draft. You can edit and resubmit later.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction onClick={() => handleRetract(entry.id)}>Retract</AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  )}
                </div>
              </div>
            ))}
          </div>
        </section>
      ))}
    </div>
  );
};

export default MySubmissions;
