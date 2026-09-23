'use client';

/**
 * Upload one exam paper.
 *
 * The class, subject and year come from where the browser is standing, so they
 * are shown as fixed context rather than re-asked. Only the term, type, title
 * and file are actually chosen — and the term is pre-filled when you opened
 * the dialog from inside one.
 *
 * Nothing here decides whether the upload is allowed. The server checks the
 * coordinates against the uploader's own classes and subjects and answers 403
 * with a sentence, which is what gets shown.
 */

import React, { useState } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  uploadExamPaper,
  type PaperType,
  type Term,
} from '@/lib/api/examPaper.service';
import { getApiErrorMessage } from '@/lib/api/client';

const TERMS: Term[] = ['First', 'Second', 'Third'];
const TYPES: PaperType[] = ['Mid-term', 'Exam', 'Mock', 'Assignment', 'Other'];

interface Props {
  as: 'admin' | 'staff';
  academicYear: string;
  grade: string;
  subject: string;
  subjectLabel: string;
  term?: Term;
  onClose: () => void;
  onUploaded: () => void | Promise<void>;
}

const UploadPaperDialog: React.FC<Props> = ({
  as,
  academicYear,
  grade,
  subject,
  subjectLabel,
  term: initialTerm,
  onClose,
  onUploaded,
}) => {
  const [term, setTerm] = useState<Term>(initialTerm ?? 'First');
  const [paperType, setPaperType] = useState<PaperType>('Exam');
  const [title, setTitle] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!file) {
      setError('Choose a file to upload.');
      return;
    }
    setBusy(true);
    try {
      const res = await uploadExamPaper(
        file,
        {
          academicYear,
          grade,
          subject,
          term,
          paperType,
          // Falls back to the filename server-side, so an untitled upload is
          // still findable.
          title: title.trim() || undefined,
        },
        as
      );
      if (res?.success) await onUploaded();
      else setError(res?.message || 'Upload failed.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Upload failed.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Upload a paper</DialogTitle>
          <DialogDescription>
            {grade} · {subjectLabel} · {academicYear}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Term</span>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as Term)}
                className={input}
              >
                {TERMS.map((t) => (
                  <option key={t} value={t}>
                    {t} Term
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Type</span>
              <select
                value={paperType}
                onChange={(e) => setPaperType(e.target.value as PaperType)}
                className={input}
              >
                {TYPES.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">
              Title <span className="text-gray-400">(optional)</span>
            </span>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Defaults to the file name"
              className={input}
            />
          </label>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">File</span>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              className="w-full text-sm file:mr-3 file:px-3 file:py-2 file:rounded-lg file:border-0 file:bg-gray-100 file:text-gray-700 hover:file:bg-gray-200"
            />
            {file && (
              <span className="text-xs text-gray-400 mt-1 block">
                {file.name} · {(file.size / 1024 / 1024).toFixed(1)} MB
              </span>
            )}
          </label>

          <DialogFooter>
            <button
              type="button"
              onClick={onClose}
              disabled={busy}
              className="text-sm px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
            >
              <X size={15} className="inline mr-1" /> Cancel
            </button>
            <button
              type="submit"
              disabled={busy}
              className="text-sm px-4 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50 flex items-center gap-2"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Upload size={15} />
              )}
              {busy ? 'Uploading…' : 'Upload'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

export default UploadPaperDialog;
