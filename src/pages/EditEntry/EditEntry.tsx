import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ArrowLeft, Upload, Loader2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Skeleton } from '@/components/ui/skeleton';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import AutocompleteInput from '@/components/AutocompleteInput/AutocompleteInput';
import { fetchEntry, updateEntry, uploadPdf } from '@/services/api';
import type { Entry } from '@/services/api';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

const FieldLabel: React.FC<{ children: React.ReactNode; required?: boolean }> = ({ children, required }) => (
  <label className="block text-sm font-medium text-slate-700 mb-1">
    {children}{required && <span className="text-red-500 ml-0.5">*</span>}
  </label>
);

const EditEntry: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { role } = useAuth();

  const [entry, setEntry] = useState<Entry | null>(null);
  const [loading, setLoading] = useState(true);
  const [prasanga, setPrasanga] = useState('');
  const [kavi, setKavi] = useState('');
  const [publisher, setPublisher] = useState('');
  const [contributors, setContributors] = useState<string[]>([]);
  const [contributorInput, setContributorInput] = useState('');
  const [pratiLink, setPratiLink] = useState('');
  const [koshaSource, setKoshaSource] = useState<'blank' | 'manual'>('blank');
  const [koshaLink, setKoshaLink] = useState('');
  const [dateKannada, setDateKannada] = useState('');
  const [dateEnglish, setDateEnglish] = useState('');
  const [notes, setNotes] = useState('');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [pdfWarning, setPdfWarning] = useState<{ file: File; sizeMb: number } | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const isEditorOrAdmin = role === 'admin' || role === 'editor';

  useEffect(() => {
    fetchEntry(parseInt(id!))
      .then((res) => {
        const e = res.data;
        setEntry(e);
        setPrasanga(e.prasanga);
        setKavi(e.kavi);
        setPublisher(e.publisher);
        setContributors(e.contributors);
        setPratiLink(e.prati_link);
        const hasKosha = e.kosha_link && e.kosha_link !== 'ನಿರೀಕ್ಷಿಸಿ';
        setKoshaSource(hasKosha ? 'manual' : 'blank');
        setKoshaLink(hasKosha ? e.kosha_link : '');
        setDateKannada(e.publish_date_kannada);
        setDateEnglish(e.publish_date_english);
        setNotes(e.notes);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [id]);

  const addContributor = () => {
    const name = contributorInput.trim();
    if (name && !contributors.includes(name)) setContributors([...contributors, name]);
    setContributorInput('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const sizeMb = file.size / (1024 * 1024);
    if (sizeMb > 100) setPdfWarning({ file, sizeMb: Math.round(sizeMb) });
    else doUpload(file);
  };

  const doUpload = async (file: File) => {
    setUploading(true);
    try {
      const res = await uploadPdf(parseInt(id!), file);
      setPratiLink(res.data.url);
      toast.success('PDF uploaded');
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      toast.error(msg || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (action: 'draft' | 'submit') => {
    setSaving(true);
    try {
      await updateEntry(parseInt(id!), {
        prasanga_name: prasanga,
        kavi_name: kavi,
        publisher_name: publisher,
        contributor_names: contributors,
        prati_link: pratiLink || null,
        kosha_link: koshaSource === 'manual' ? koshaLink : null,
        publish_date_kannada: dateKannada || null,
        publish_date_english: dateEnglish || null,
        notes: notes || null,
        action,
      });
      navigate('/my-submissions');
    } catch {
      toast.error('Error saving entry');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-8 space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center text-slate-500">
        {t('error.not_found')}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-6">
      <button onClick={() => navigate(-1)} className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-indigo-600 mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <h1 className="text-2xl font-bold text-slate-800 mb-2">{t('entry.edit')}</h1>
      <p className="text-sm text-slate-400 mb-6">{entry.entry_id}</p>

      {/* Status callouts */}
      {entry.status === 'needs_correction' && entry.review_notes && (
        <div className="mb-4 p-4 rounded-lg border-l-4 bg-orange-50 border-orange-500 text-orange-800 text-sm">
          <strong>{t('my_submissions.correction_needed')}:</strong> {entry.review_notes}
        </div>
      )}
      {entry.status === 'pending' && (
        <div className="mb-4 p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm">
          This entry is awaiting review. You can still edit it.
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
        <AutocompleteInput model="prasanga" value={prasanga} onValueChange={setPrasanga}
          label={`${t('entry.prasanga')} *`} />

        <AutocompleteInput model="kavi" value={kavi} onValueChange={setKavi}
          label={t('entry.kavi')} />

        <AutocompleteInput model="publisher" value={publisher} onValueChange={setPublisher}
          label={t('entry.publisher')} />

        {/* Contributors */}
        <div>
          <FieldLabel>{t('entry.contributors')}</FieldLabel>
          <div className="flex gap-2">
            <AutocompleteInput model="contributor" value={contributorInput} onValueChange={setContributorInput}
              placeholder={t('form.contributor_hint')} className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={addContributor}>
              {t('form.contributor_add')}
            </Button>
          </div>
          {contributors.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {contributors.map((c) => (
                <span key={c}
                  className="flex items-center gap-1 bg-indigo-50 text-indigo-700 text-sm px-3 py-1 rounded-full cursor-pointer hover:bg-indigo-100"
                  onClick={() => setContributors(contributors.filter((x) => x !== c))}
                >
                  <span className="kn">{c}</span>
                  <X className="w-3 h-3" />
                </span>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* PDF */}
        <div>
          <FieldLabel>{t('entry.prati_link')}</FieldLabel>
          <div className="flex gap-2">
            <Input value={pratiLink} onChange={(e) => setPratiLink(e.target.value)} placeholder="https://..." className="flex-1" />
            <Button type="button" variant="outline" size="sm" onClick={() => fileRef.current?.click()} disabled={uploading}>
              {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4 mr-1.5" />}
              {uploading ? t('form.uploading') : t('form.upload_pdf')}
            </Button>
            <input ref={fileRef} type="file" accept="application/pdf" hidden onChange={handleFileChange} />
          </div>
        </div>

        {/* Kosha */}
        <div>
          <FieldLabel>{t('entry.kosha_link')}</FieldLabel>
          <div className="flex gap-4 mb-2">
            {(['blank', 'manual'] as const).map((v) => (
              <label key={v} className="flex items-center gap-2 cursor-pointer text-sm text-slate-700">
                <input type="radio" name="koshaSource" value={v} checked={koshaSource === v}
                  onChange={() => setKoshaSource(v)} className="accent-indigo-600" />
                {t(`form.kosha.${v}`)}
              </label>
            ))}
          </div>
          {koshaSource === 'manual' && (
            <Input value={koshaLink} onChange={(e) => setKoshaLink(e.target.value)} placeholder="https://..." />
          )}
        </div>

        <Separator />

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel>{t('entry.date_kannada')}</FieldLabel>
            <Input value={dateKannada} onChange={(e) => setDateKannada(e.target.value)} />
          </div>
          <div>
            <FieldLabel>{t('entry.date_english')}</FieldLabel>
            <Input type="date" value={dateEnglish} onChange={(e) => setDateEnglish(e.target.value)} />
          </div>
        </div>

        <div>
          <FieldLabel>{t('entry.notes')}</FieldLabel>
          <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={3} />
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          {!isEditorOrAdmin && (
            <Button variant="outline" onClick={() => handleSave('draft')} disabled={saving}>
              {t('form.save_draft')}
            </Button>
          )}
          <Button onClick={() => handleSave('submit')} disabled={saving}>
            {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            {isEditorOrAdmin ? t('form.save') : t('form.submit')}
          </Button>
          <Button variant="ghost" onClick={() => navigate(-1)} disabled={saving}>
            {t('form.cancel')}
          </Button>
        </div>
      </div>

      <AlertDialog open={!!pdfWarning} onOpenChange={(open) => { if (!open) { setPdfWarning(null); if (fileRef.current) fileRef.current.value = ''; } }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Large File</AlertDialogTitle>
            <AlertDialogDescription>
              File is {pdfWarning?.sizeMb} MB. Continue with upload?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => { setPdfWarning(null); if (fileRef.current) fileRef.current.value = ''; }}>
              {t('form.pdf_warning_cancel')}
            </AlertDialogCancel>
            <AlertDialogAction onClick={() => { if (pdfWarning) doUpload(pdfWarning.file); setPdfWarning(null); }}>
              {t('form.pdf_warning_confirm')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default EditEntry;
