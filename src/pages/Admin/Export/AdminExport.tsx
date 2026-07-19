import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Download, Loader2, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { triggerExport } from '@/services/api';

const AdminExport: React.FC = () => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleExport = async () => {
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      await triggerExport();
      setResult(t('admin.export.success'));
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-slate-800 mb-6">{t('admin.export.title')}</h1>

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <p className="text-slate-600 mb-6">
          Generate a CSV export of all approved catalog entries. The file will be saved to Google Drive.
        </p>

        <Button onClick={handleExport} disabled={loading} className="w-full sm:w-auto">
          {loading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Download className="w-4 h-4 mr-2" />
          )}
          {loading ? 'Exporting…' : t('admin.export.button')}
        </Button>

        {result && (
          <div className="mt-4 flex items-center gap-2 text-emerald-700 bg-emerald-50 border border-emerald-200 rounded-lg p-3 text-sm">
            <CheckCircle className="w-4 h-4 shrink-0" />
            {result}
          </div>
        )}

        {error && (
          <div className="mt-4 flex items-center gap-2 text-red-700 bg-red-50 border border-red-200 rounded-lg p-3 text-sm">
            <XCircle className="w-4 h-4 shrink-0" />
            {error}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminExport;
