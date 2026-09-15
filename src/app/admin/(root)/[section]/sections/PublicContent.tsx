'use client';

/**
 * Admin → Public content.
 *
 * One editor for book lists, scheme of work and school fees, because all three
 * are the same shape — a titled list of rows scoped to a class and a session.
 * Only the column headings change, which `KIND` below drives.
 *
 * Draft vs published matters here: a half-finished book list must not be
 * visible to parents, so nothing reaches /apply until Publish is ticked. The
 * public endpoint filters on exactly that flag.
 */

import React, { useCallback, useEffect, useState } from 'react';
import { Loader2, Plus, Save, Trash2 } from 'lucide-react';
import { GRADE_LEVELS } from '@/Constants/classes';
import { getAcademicYearOptions, getCurrentAcademicYear } from '@/Constants/academicYears';
import { getApiErrorMessage } from '@/lib/api/client';
import {
  getAdminContent,
  saveAdminContent,
  type AdminContentItem,
} from '@/lib/api/superAdmin.service';

type Kind = 'books' | 'bills' | 'scheme';

/**
 * What each column means per kind. The backend stores one shape
 * (title / subtitle / term / amount / note) and this is the only place that
 * knows how to label it.
 */
const KIND: Record<
  Kind,
  {
    label: string;
    blurb: string;
    title: string;
    second: { field: 'subtitle' | 'term'; label: string };
    third: { field: 'amount' | 'note'; label: string };
    addLabel: string;
  }
> = {
  books: {
    label: 'Book list',
    blurb: 'Texts each class needs, with prices.',
    title: 'Book title',
    second: { field: 'subtitle', label: 'Author' },
    third: { field: 'amount', label: 'Price (₦)' },
    addLabel: 'Add a book',
  },
  bills: {
    label: 'School fees',
    blurb: 'Fees payable. Fresh and returning students are listed separately.',
    title: 'Item',
    second: { field: 'term', label: 'When due' },
    third: { field: 'amount', label: 'Amount (₦)' },
    addLabel: 'Add an item',
  },
  scheme: {
    label: 'Scheme of work',
    blurb: 'What each class covers, subject by subject.',
    title: 'Subject',
    second: { field: 'term', label: 'Term' },
    third: { field: 'note', label: 'Topics' },
    addLabel: 'Add a subject',
  },
};

const TERMS = ['First', 'Second', 'Third', 'All'];

const emptyRow = (): AdminContentItem => ({
  title: '',
  subtitle: '',
  amount: null,
  term: '',
  note: '',
  optional: false,
});

const PublicContent: React.FC = () => {
  const [kind, setKind] = useState<Kind>('books');
  const [className, setClassName] = useState<string>(GRADE_LEVELS[0]);
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [studentType, setStudentType] = useState<'fresh' | 'returning' | 'all'>('all');

  const [items, setItems] = useState<AdminContentItem[]>([]);
  const [note, setNote] = useState('');
  const [isPublished, setIsPublished] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');

  const cfg = KIND[kind];
  const yearOptions = getAcademicYearOptions({ back: 2, forward: 5 });

  /** Load whatever exists for this exact key, or start a blank sheet. */
  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    setBanner('');
    try {
      const res = await getAdminContent(kind, { className, academicYear });
      const docs = res?.data?.content || [];
      const match = docs.find(
        (d) => d.className === className && (kind !== 'bills' || d.studentType === studentType)
      );
      if (match) {
        setItems(match.items?.length ? match.items : [emptyRow()]);
        setNote(match.note || '');
        setIsPublished(!!match.isPublished);
      } else {
        setItems([emptyRow()]);
        setNote('');
        setIsPublished(false);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load this content.'));
      setItems([emptyRow()]);
    } finally {
      setLoading(false);
    }
  }, [kind, className, academicYear, studentType]);

  useEffect(() => {
    load();
  }, [load]);

  const setItem = (index: number, patch: Partial<AdminContentItem>) =>
    setItems((prev) => prev.map((r, i) => (i === index ? { ...r, ...patch } : r)));

  const removeItem = (index: number) =>
    setItems((prev) => {
      const next = prev.filter((_, i) => i !== index);
      // Never leave the table with nothing to type into.
      return next.length ? next : [emptyRow()];
    });

  const save = async (publish: boolean) => {
    setSaving(true);
    setError('');
    setBanner('');
    try {
      const filled = items.filter((i) => i.title.trim());
      if (publish && filled.length === 0) {
        setError('Add at least one row before publishing.');
        setSaving(false);
        return;
      }

      const res = await saveAdminContent(kind, {
        className,
        academicYear,
        studentType: kind === 'bills' ? studentType : 'all',
        items: filled,
        note,
        isPublished: publish,
      });

      if (res?.success) {
        setIsPublished(publish);
        setBanner(
          publish
            ? `Published — parents can now see this on the Apply page.`
            : 'Saved as a draft. It stays hidden from the public until you publish.'
        );
      } else {
        setError(res?.message || 'Could not save.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save.'));
    } finally {
      setSaving(false);
    }
  };

  const total = items.reduce(
    (sum, i) => sum + (i.optional ? 0 : Number(i.amount) || 0),
    0
  );

  return (
    <div className="min-h-screen bg-gray-50 space-y-3 p-2 sm:p-4 md:p-6">
      <header className="mb-4">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Public content</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          What parents see under &ldquo;Apply for admission&rdquo;
        </p>
      </header>

      {/* Kind switcher */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        {(Object.keys(KIND) as Kind[]).map((k) => (
          <button
            key={k}
            onClick={() => setKind(k)}
            className={`text-sm px-3.5 py-2 rounded-md ${
              kind === k ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500'
            }`}
          >
            {KIND[k].label}
          </button>
        ))}
      </div>

      <p className="text-sm text-gray-500">{cfg.blurb}</p>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">{banner}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>
      )}

      {/* Scope */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <Field label="Class">
          <select value={className} onChange={(e) => setClassName(e.target.value)} className={input}>
            {GRADE_LEVELS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </Field>
        <Field label="Academic year">
          <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={input}>
            {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </Field>
        {kind === 'bills' && (
          <Field label="Applies to">
            <select
              value={studentType}
              onChange={(e) => setStudentType(e.target.value as 'fresh' | 'returning' | 'all')}
              className={input}
            >
              <option value="all">Everyone</option>
              <option value="fresh">Fresh students</option>
              <option value="returning">Returning students</option>
            </select>
          </Field>
        )}
        <Field label="Visibility">
          <div className="flex items-center gap-2 h-[42px]">
            <span
              className={`text-xs px-2.5 py-1 rounded-full ${
                isPublished ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-600'
              }`}
            >
              {isPublished ? 'Published' : 'Draft'}
            </span>
          </div>
        </Field>
      </div>

      {/* Rows */}
      <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm min-w-[720px]">
            <thead>
              <tr className="text-left text-gray-500 bg-gray-50 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">{cfg.title}</th>
                <th className="px-4 py-3 font-medium w-44">{cfg.second.label}</th>
                <th className="px-4 py-3 font-medium w-48">{cfg.third.label}</th>
                <th className="px-4 py-3 font-medium w-24">Optional</th>
                <th className="px-4 py-3 w-12" />
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 5 }).map((__, j) => (
                      <td key={j} className="px-4 py-3">
                        <div className="h-8 bg-gray-100 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : (
                items.map((row, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    <td className="px-4 py-2">
                      <input
                        value={row.title}
                        onChange={(e) => setItem(i, { title: e.target.value })}
                        placeholder={cfg.title}
                        className={input}
                      />
                    </td>
                    <td className="px-4 py-2">
                      {cfg.second.field === 'term' ? (
                        <select
                          value={row.term || ''}
                          onChange={(e) => setItem(i, { term: e.target.value })}
                          className={input}
                        >
                          <option value="">—</option>
                          {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                        </select>
                      ) : (
                        <input
                          value={row.subtitle || ''}
                          onChange={(e) => setItem(i, { subtitle: e.target.value })}
                          placeholder={cfg.second.label}
                          className={input}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2">
                      {cfg.third.field === 'amount' ? (
                        <input
                          type="number"
                          min={0}
                          value={row.amount ?? ''}
                          onChange={(e) =>
                            setItem(i, {
                              // Blank means "no price", which is not the same
                              // as zero — keep the distinction.
                              amount: e.target.value === '' ? null : Number(e.target.value),
                            })
                          }
                          placeholder="0"
                          className={input}
                        />
                      ) : (
                        <input
                          value={row.note || ''}
                          onChange={(e) => setItem(i, { note: e.target.value })}
                          placeholder={cfg.third.label}
                          className={input}
                        />
                      )}
                    </td>
                    <td className="px-4 py-2 text-center">
                      <input
                        type="checkbox"
                        checked={!!row.optional}
                        onChange={(e) => setItem(i, { optional: e.target.checked })}
                        className="rounded border-gray-300"
                      />
                    </td>
                    <td className="px-4 py-2 text-right">
                      <button
                        onClick={() => removeItem(i)}
                        className="text-gray-400 hover:text-red-600 p-1"
                        title="Remove this row"
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="p-3 border-t border-gray-100 flex flex-wrap items-center justify-between gap-3">
          <button
            onClick={() => setItems((prev) => [...prev, emptyRow()])}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            <Plus size={15} /> {cfg.addLabel}
          </button>
          {kind !== 'scheme' && (
            <p className="text-sm text-gray-600">
              Total: <span className="font-semibold text-gray-900">₦{total.toLocaleString('en-NG')}</span>
              <span className="text-xs text-gray-400 ml-2">optional rows excluded</span>
            </p>
          )}
        </div>
      </div>

      {/* Note + actions */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 space-y-3">
        <Field label="Note shown above the list (optional)">
          <input
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="e.g. Payable before resumption."
            className={input}
          />
        </Field>

        <div className="flex flex-col sm:flex-row sm:justify-end gap-2 pt-2">
          <button
            onClick={() => save(false)}
            disabled={saving}
            className="text-sm px-4 py-2.5 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {saving && <Loader2 size={15} className="animate-spin" />} Save as draft
          </button>
          <button
            onClick={() => save(true)}
            disabled={saving}
            className="text-sm px-4 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50 flex items-center justify-center gap-2"
          >
            <Save size={15} /> {saving ? 'Saving…' : 'Save & publish'}
          </button>
        </div>
      </div>
    </div>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">{label}</span>
    {children}
  </label>
);

export default PublicContent;
