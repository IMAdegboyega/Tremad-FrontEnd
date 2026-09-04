'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { ChevronLeft, Edit2, Eye, Loader2, Plus, Save, Trash2, X } from 'lucide-react';
import type { Result } from '@/lib/api/student.service';
import DownloadResult from '@/components/student/Results/DownloadResult';
import {
  getStudentAllResults,
  updateSuperAdminResult,
  type StudentFullResult,
  type StudentResultsDetailResponse,
} from '@/lib/api/superAdmin.service';

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const gradeColor = (grade: string) => {
  const g = (grade || '').trim().toUpperCase();
  if (g.startsWith('A')) return 'bg-green-100 text-green-700';
  if (g.startsWith('B')) return 'bg-purple-100 text-purple-700';
  if (g.startsWith('C')) return 'bg-blue-100 text-blue-700';
  if (g.startsWith('D')) return 'bg-yellow-100 text-yellow-700';
  if (g.startsWith('F')) return 'bg-red-100 text-red-700';
  return 'bg-gray-100 text-gray-700';
};

const toStudentResult = (r: StudentFullResult): Result => ({
  id: r._id,
  academicYear: r.academicYear,
  term: r.term,
  class: r.class,
  status: r.status,
  subjects: r.subjects,
  summary: r.summary,
});

// ─── Inline editable result card ─────────────────────────────────────────────

interface ResultCardProps {
  result: StudentFullResult;
  onRefresh: () => void;
  onPreview: (result: StudentFullResult) => void;
  /** Lets the parent lock the year/term tabs while an edit is in progress. */
  onEditingChange?: (editing: boolean) => void;
}

const ResultCard: React.FC<ResultCardProps> = ({
  result,
  onRefresh,
  onPreview,
  onEditingChange,
}) => {
  const [editing, setEditing] = useState(false);
  const [subjects, setSubjects] = useState(() =>
    result.subjects.map((s) => ({ ...s, scores: { ...s.scores } }))
  );
  const [principalComment, setPrincipalComment] = useState(result.summary?.principalComment || '');
  const [classTeacherComment, setClassTeacherComment] = useState(
    result.summary?.classTeacherComment || ''
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Keep local state in sync when the parent refreshes with new data
  useEffect(() => {
    if (!editing) {
      setSubjects(result.subjects.map((s) => ({ ...s, scores: { ...s.scores } })));
      setPrincipalComment(result.summary?.principalComment || '');
      setClassTeacherComment(result.summary?.classTeacherComment || '');
    }
  }, [result, editing]);

  // Tell the parent so it can disable the year/term tabs mid-edit.
  useEffect(() => {
    onEditingChange?.(editing);
  }, [editing, onEditingChange]);

  // If the card unmounts while editing (e.g. the result was just wiped), make
  // sure the parent unlocks its tabs again.
  useEffect(() => () => onEditingChange?.(false), [onEditingChange]);

  const resetEdit = () => {
    setSubjects(result.subjects.map((s) => ({ ...s, scores: { ...s.scores } })));
    setPrincipalComment(result.summary?.principalComment || '');
    setClassTeacherComment(result.summary?.classTeacherComment || '');
    setError('');
    setEditing(false);
  };

  const updateScore = (idx: number, field: 'firstCA' | 'secondCA' | 'exam', raw: string) => {
    const max = field === 'exam' ? 60 : 20;
    const value = Math.min(max, Math.max(0, Number(raw) || 0));
    setSubjects((prev) =>
      prev.map((s, i) => (i === idx ? { ...s, scores: { ...s.scores, [field]: value } } : s))
    );
  };

  const updateSubjectName = (idx: number, name: string) => {
    setSubjects((prev) => prev.map((s, i) => (i === idx ? { ...s, name } : s)));
  };

  /** Append a blank subject row. Scores default to 0 so totals stay valid. */
  const addSubject = () => {
    setSubjects((prev) => [
      ...prev,
      { name: '', scores: { firstCA: 0, secondCA: 0, exam: 0 } } as typeof prev[number],
    ]);
  };

  const removeSubject = (idx: number) => {
    setSubjects((prev) => prev.filter((_, i) => i !== idx));
  };

  // Removing every subject and saving wipes the whole result for this term.
  const isWipe = subjects.length === 0;

  const handleSave = async () => {
    // Guard against blank rows — the backend keys results by subject name.
    // (Skipped on a wipe, since there are no rows left to name.)
    if (!isWipe && subjects.some((s) => !s.name.trim())) {
      setError('Every subject needs a name.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      const res = await updateSuperAdminResult(result._id, {
        subjects: subjects.map((s) => ({
          name: s.name,
          scores: {
            firstCA: s.scores.firstCA,
            secondCA: s.scores.secondCA,
            exam: s.scores.exam,
          },
        })),
        summary: { principalComment, classTeacherComment },
      });
      if (res?.success) {
        setEditing(false);
        onRefresh();
      } else {
        setError((res as any)?.message || 'Failed to save changes.');
      }
    } catch (err: any) {
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
      {/* Card header */}
      <div className='flex flex-wrap items-center justify-between gap-3 px-6 py-4 bg-gray-50 border-b border-gray-200'>
        <div className='flex flex-wrap items-center gap-3'>
          <span
            className={`px-2.5 py-1 rounded-full text-xs font-medium ${
              result.status === 'published'
                ? 'bg-green-100 text-green-700'
                : 'bg-yellow-100 text-yellow-700'
            }`}
          >
            {result.status === 'published' ? 'Published' : 'Approved'}
          </span>
          {result.summary?.averageScore != null && (
            <span className='text-sm text-gray-600'>
              Average:{' '}
              <span className='font-semibold text-gray-900'>
                {result.summary.averageScore.toFixed(1)}%
              </span>
            </span>
          )}
          {result.summary?.position != null && (
            <span className='text-sm text-gray-600'>
              Position:{' '}
              <span className='font-semibold text-gray-900'>
                {ordinal(result.summary.position)}
                {result.summary.classSize ? ` / ${result.summary.classSize}` : ''}
              </span>
            </span>
          )}
        </div>
        <div className='flex items-center gap-2'>
          {editing ? (
            <>
              <button
                onClick={resetEdit}
                disabled={saving}
                className='flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50'
              >
                <X className='w-3.5 h-3.5' />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                title={
                  isWipe
                    ? 'No subjects left — saving removes this term’s result entirely'
                    : undefined
                }
                className={`flex items-center gap-1.5 px-3 py-1.5 text-xs text-white rounded-lg transition-colors disabled:opacity-60 ${
                  isWipe
                    ? 'bg-red-600 hover:bg-red-700'
                    : 'bg-primary-green hover:bg-primary-green-hover'
                }`}
              >
                {saving ? (
                  <Loader2 className='w-3.5 h-3.5 animate-spin' />
                ) : isWipe ? (
                  <Trash2 className='w-3.5 h-3.5' />
                ) : (
                  <Save className='w-3.5 h-3.5' />
                )}
                {saving
                  ? (isWipe ? 'Deleting…' : 'Saving…')
                  : (isWipe ? 'Delete result' : 'Save Changes')}
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => onPreview(result)}
                className='flex items-center gap-1.5 px-3 py-1.5 text-xs text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Eye className='w-3.5 h-3.5' />
                Preview
              </button>
              <button
                onClick={() => setEditing(true)}
                className='flex items-center gap-1.5 px-3 py-1.5 text-xs text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors'
              >
                <Edit2 className='w-3.5 h-3.5' />
                Edit Result
              </button>
            </>
          )}
        </div>
      </div>

      {/* Subjects table */}
      <div className='overflow-x-auto'>
        <table className='w-full'>
          <thead>
            <tr className='border-b border-gray-100'>
              <th className='text-left py-3 px-6 text-xs font-medium text-gray-500'>Subject</th>
              <th className='text-center py-3 px-3 text-xs font-medium text-gray-500 w-20'>
                CA1 /20
              </th>
              <th className='text-center py-3 px-3 text-xs font-medium text-gray-500 w-20'>
                CA2 /20
              </th>
              <th className='text-center py-3 px-3 text-xs font-medium text-gray-500 w-20'>
                Exam /60
              </th>
              <th className='text-center py-3 px-3 text-xs font-medium text-gray-500 w-20'>
                Total
              </th>
              <th className='text-center py-3 px-3 text-xs font-medium text-gray-500 w-16'>
                Grade
              </th>
              <th className='text-left py-3 px-6 text-xs font-medium text-gray-500'>Remark</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((sub, i) => (
              <tr key={i} className='border-b border-gray-50 last:border-0 hover:bg-gray-50/50'>
                <td className='py-3 px-6 text-sm font-medium text-gray-800'>
                  {editing ? (
                    <div className='flex items-center gap-2'>
                      <button
                        type='button'
                        onClick={() => removeSubject(i)}
                        title='Remove subject'
                        className='text-gray-400 hover:text-red-600 shrink-0'
                      >
                        <Trash2 className='w-4 h-4' />
                      </button>
                      <input
                        type='text'
                        value={sub.name}
                        placeholder='Subject name'
                        onChange={(e) => updateSubjectName(i, e.target.value)}
                        className='w-full min-w-[9rem] px-2 py-1.5 border border-gray-200 rounded text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
                      />
                    </div>
                  ) : (
                    sub.name
                  )}
                </td>
                {editing ? (
                  <>
                    <td className='py-2 px-3 text-center'>
                      <input
                        type='number'
                        min={0}
                        max={20}
                        value={sub.scores.firstCA}
                        onChange={(e) => updateScore(i, 'firstCA', e.target.value)}
                        className='w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500'
                      />
                    </td>
                    <td className='py-2 px-3 text-center'>
                      <input
                        type='number'
                        min={0}
                        max={20}
                        value={sub.scores.secondCA}
                        onChange={(e) => updateScore(i, 'secondCA', e.target.value)}
                        className='w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500'
                      />
                    </td>
                    <td className='py-2 px-3 text-center'>
                      <input
                        type='number'
                        min={0}
                        max={60}
                        value={sub.scores.exam}
                        onChange={(e) => updateScore(i, 'exam', e.target.value)}
                        className='w-16 px-2 py-1.5 border border-gray-200 rounded text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500'
                      />
                    </td>
                    <td className='py-2 px-3 text-center'>
                      <span className='text-sm font-semibold text-gray-900'>
                        {sub.scores.firstCA + sub.scores.secondCA + sub.scores.exam}
                      </span>
                    </td>
                    <td className='py-2 px-3 text-center text-xs text-gray-400'>—</td>
                    <td className='py-2 px-6 text-xs text-gray-400'>recalculated on save</td>
                  </>
                ) : (
                  <>
                    <td className='py-3 px-3 text-sm text-gray-600 text-center'>
                      {sub.scores?.firstCA ?? 0}
                    </td>
                    <td className='py-3 px-3 text-sm text-gray-600 text-center'>
                      {sub.scores?.secondCA ?? 0}
                    </td>
                    <td className='py-3 px-3 text-sm text-gray-600 text-center'>
                      {sub.scores?.exam ?? 0}
                    </td>
                    <td className='py-3 px-3 text-center'>
                      <span className='text-sm font-bold text-gray-900'>
                        {sub.scores?.total ?? 0}
                      </span>
                    </td>
                    <td className='py-3 px-3 text-center'>
                      <span
                        className={`px-2.5 py-0.5 rounded text-xs font-medium ${gradeColor(
                          sub.grade
                        )}`}
                      >
                        {sub.grade || '—'}
                      </span>
                    </td>
                    <td className='py-3 px-6 text-xs text-gray-500'>{sub.remark || '—'}</td>
                  </>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Add a subject row — only while editing */}
      {editing && (
        <div className='px-6 py-3 border-t border-gray-100'>
          <button
            type='button'
            onClick={addSubject}
            className='inline-flex items-center gap-2 px-3 py-2 text-sm text-gray-700 border border-dashed border-gray-300 rounded-lg hover:bg-gray-50 hover:border-gray-400'
          >
            <Plus className='w-4 h-4' />
            Add subject
          </button>
        </div>
      )}

      {/* Comments */}
      {editing ? (
        <div className='px-6 pb-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100'>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Class Teacher&apos;s Comment
            </label>
            <textarea
              rows={2}
              value={classTeacherComment}
              onChange={(e) => setClassTeacherComment(e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
              placeholder='Optional…'
            />
          </div>
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1.5'>
              Principal&apos;s Comment
            </label>
            <textarea
              rows={2}
              value={principalComment}
              onChange={(e) => setPrincipalComment(e.target.value)}
              className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none'
              placeholder='Optional…'
            />
          </div>
          {error && (
            <div className='sm:col-span-2'>
              <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2'>
                {error}
              </p>
            </div>
          )}
        </div>
      ) : result.summary?.classTeacherComment || result.summary?.principalComment ? (
        <div className='px-6 pb-6 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-gray-100'>
          {result.summary.classTeacherComment && (
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-xs font-semibold text-gray-500 mb-1'>
                Class Teacher&apos;s Comment
              </p>
              <p className='text-sm text-gray-700'>{result.summary.classTeacherComment}</p>
            </div>
          )}
          {result.summary.principalComment && (
            <div className='bg-gray-50 rounded-lg p-4'>
              <p className='text-xs font-semibold text-gray-500 mb-1'>Principal&apos;s Comment</p>
              <p className='text-sm text-gray-700'>{result.summary.principalComment}</p>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

// ─── Main detail page ─────────────────────────────────────────────────────────

interface StudentResultDetailProps {
  studentId: string;
  studentName: string;
  studentEmail: string;
  onBack: () => void;
}

const StudentResultDetail: React.FC<StudentResultDetailProps> = ({
  studentId,
  studentName,
  studentEmail,
  onBack,
}) => {
  const [data, setData] = useState<StudentResultsDetailResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Which academic year tab is active
  const [activeYear, setActiveYear] = useState('');
  // Which term tab is active within that year
  const [activeTerm, setActiveTerm] = useState<(typeof TERMS)[number]>('First Term');

  // Preview overlay state
  const [previewResult, setPreviewResult] = useState<StudentFullResult | null>(null);
  // True while the result card below is in edit mode — locks the year/term tabs
  // so you can't navigate away and lose unsaved score changes.
  const [cardEditing, setCardEditing] = useState(false);

  const fetchResults = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStudentAllResults(studentId);
      if (res?.success && res.data) {
        setData(res.data);
        // Default to the most recent academic year
        const years = getUniqueYears(res.data.results);
        if (years.length > 0 && !activeYear) {
          setActiveYear(years[0]);
        }
      } else {
        setError((res as any)?.message || 'Failed to load results.');
      }
    } catch {
      setError('Failed to load results. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [studentId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    fetchResults();
  }, [fetchResults]);

  // ─── Helpers ───────────────────────────────────────────────────────────────

  /**
   * Year tabs — only proper sessions ("2026/2027"). Older records were entered
   * through a free-text box, so some hold a bare year like "2026"; those are
   * filtered out so the tab strip doesn't show both forms side by side.
   */
  const SESSION_FORMAT = /^\d{4}\/\d{4}$/;

  const getUniqueYears = (results: StudentFullResult[]) => {
    const seen = new Set<string>();
    const out: string[] = [];
    for (const r of results) {
      if (!SESSION_FORMAT.test(r.academicYear)) continue;
      if (!seen.has(r.academicYear)) {
        seen.add(r.academicYear);
        out.push(r.academicYear);
      }
    }
    return out.sort().reverse(); // newest session first
  };

  const getResultForYearTerm = (
    results: StudentFullResult[],
    year: string,
    term: string
  ): StudentFullResult | undefined =>
    results.find((r) => r.academicYear === year && r.term === term);

  // ─── Preview overlay ───────────────────────────────────────────────────────

  if (previewResult) {
    return (
      <DownloadResult
        result={toStudentResult(previewResult)}
        onBack={() => setPreviewResult(null)}
        overrideName={
          data
            ? `${data.student.firstName} ${data.student.lastName}`.trim()
            : studentName
        }
        overrideAdmissionNumber={data?.student.admissionNumber}
      />
    );
  }

  // ─── Loading / error states ────────────────────────────────────────────────

  if (loading) {
    return (
      <div className='min-h-full bg-gray-50 p-4 sm:p-6'>
        <div className='flex items-center justify-center h-64'>
          <Loader2 className='w-8 h-8 animate-spin text-gray-400' />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='min-h-full bg-gray-50 p-4 sm:p-6'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6'
        >
          <ChevronLeft className='w-5 h-5' />
          Back to results
        </button>
        <div className='bg-red-50 border border-red-200 rounded-xl px-6 py-8 text-center'>
          <p className='text-red-700 font-medium mb-2'>Failed to load results</p>
          <p className='text-sm text-red-500 mb-4'>{error}</p>
          <button
            onClick={fetchResults}
            className='px-4 py-2 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors'
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!data) return null;

  const years = getUniqueYears(data.results);

  const currentYear = activeYear || years[0] || '';
  const currentResult = currentYear
    ? getResultForYearTerm(data.results, currentYear, activeTerm)
    : undefined;

  const initials = `${data.student.firstName[0] ?? ''}${data.student.lastName[0] ?? ''}`.toUpperCase();
  const avatarColors = [
    'bg-green-100 text-green-700',
    'bg-blue-100 text-blue-700',
    'bg-purple-100 text-purple-700',
    'bg-yellow-100 text-yellow-700',
  ];
  const avatarColor = avatarColors[initials.charCodeAt(0) % avatarColors.length];

  return (
    <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4'>
      {/* Page header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
        <div className='flex items-center gap-4'>
          <button
            onClick={onBack}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
          >
            <ChevronLeft className='w-5 h-5' />
            <span className='text-sm font-medium'>Back to results</span>
          </button>

          <div className='hidden sm:flex items-center gap-3'>
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold ${avatarColor}`}
            >
              {initials}
            </div>
            <div>
              <p className='text-base font-semibold text-gray-900'>
                {data.student.firstName} {data.student.lastName}
              </p>
              <p className='text-xs text-gray-500'>
                {data.student.admissionNumber} · {data.student.email}
              </p>
            </div>
            {data.student.className && (
              <span className='px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full'>
                {data.student.className}
              </span>
            )}
          </div>
        </div>

        <p className='text-xs text-gray-500 sm:text-right'>
          {data.results.length} result{data.results.length !== 1 ? 's' : ''} on record
        </p>
      </div>

      {/* Mobile student info */}
      <div className='sm:hidden flex items-center gap-3 bg-white rounded-xl px-4 py-3 border border-gray-200'>
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shrink-0 ${avatarColor}`}
        >
          {initials}
        </div>
        <div className='min-w-0'>
          <p className='text-sm font-semibold text-gray-900 truncate'>
            {data.student.firstName} {data.student.lastName}
          </p>
          <p className='text-xs text-gray-500 truncate'>{data.student.admissionNumber}</p>
        </div>
        {data.student.className && (
          <span className='ml-auto shrink-0 px-2.5 py-1 bg-green-50 text-green-700 text-xs font-medium rounded-full'>
            {data.student.className}
          </span>
        )}
      </div>

      {years.length === 0 ? (
        <div className='bg-white rounded-xl border border-gray-200 py-16 text-center'>
          <p className='text-gray-500'>No results found for this student.</p>
        </div>
      ) : (
        <>
          {/* Academic year tabs */}
          <div className='bg-white rounded-xl border border-gray-200 overflow-hidden'>
            <div className='flex overflow-x-auto border-b border-gray-200'>
              {years.map((year) => (
                <button
                  key={year}
                  disabled={cardEditing}
                  title={cardEditing ? 'Finish or cancel your edit first' : undefined}
                  onClick={() => {
                    setActiveYear(year);
                    setActiveTerm('First Term');
                  }}
                  className={`shrink-0 px-5 py-3.5 text-sm font-medium border-b-2 transition-colors ${
                    currentYear === year
                      ? 'border-primary-green text-primary-green bg-green-50/50'
                      : 'border-transparent text-gray-500 hover:text-gray-900 hover:bg-gray-50'
                  } ${cardEditing ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                >
                  {year}
                </button>
              ))}
            </div>

            {/* Term tabs */}
            <div className='flex border-b border-gray-100 bg-gray-50/50'>
              {TERMS.map((term) => {
                const hasResult = !!getResultForYearTerm(data.results, currentYear, term);
                return (
                  <button
                    key={term}
                    disabled={cardEditing}
                    title={cardEditing ? 'Finish or cancel your edit first' : undefined}
                    onClick={() => setActiveTerm(term)}
                    className={`flex-1 px-4 py-2.5 text-xs font-medium transition-colors relative ${
                      activeTerm === term
                        ? 'text-gray-900 bg-white border-b-2 border-primary-green'
                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50 border-b-2 border-transparent'
                    } ${cardEditing ? 'opacity-40 cursor-not-allowed pointer-events-none' : ''}`}
                  >
                    {term}
                    {hasResult && (
                      <span className='ml-1.5 inline-block w-1.5 h-1.5 rounded-full bg-green-500 align-middle' />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Result card or empty state */}
          {currentResult ? (
            <ResultCard
              result={currentResult}
              onRefresh={fetchResults}
              onEditingChange={setCardEditing}
              onPreview={(r) => setPreviewResult(r)}
            />
          ) : (
            <div className='bg-white rounded-xl border border-gray-200 py-16 text-center'>
              <p className='text-gray-500 text-sm'>
                No result recorded for {activeTerm} {currentYear}.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudentResultDetail;
