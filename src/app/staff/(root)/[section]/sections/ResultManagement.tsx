'use client';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Info, Send, RotateCcw } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { gradeOf } from '@/Constants/classes';
import {
  getAcademicYearOptions,
  getCurrentAcademicYear,
} from '@/Constants/academicYears';
import {
  getAssignedStudents,
  getClassResults,
  submitResultUpload,
  SCORE_LIMITS,
  type AssignedStudent,
  type ResultEntry,
} from '@/lib/api/teacher.service';
import { getApiErrorMessage } from '@/lib/api/client';

const TERMS = ['First', 'Second', 'Third'] as const;
type Term = (typeof TERMS)[number];

/** What the teacher has typed for one student, before submission. */
type Row = {
  student: AssignedStudent;
  firstCA: string;
  secondCA: string;
  exam: string;
  remark: string;
  /** True when these scores came back from the server rather than being typed. */
  existing: boolean;
};

const toNum = (v: string): number | null => {
  if (v.trim() === '') return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
};

const total = (r: Row) =>
  (toNum(r.firstCA) ?? 0) + (toNum(r.secondCA) ?? 0) + (toNum(r.exam) ?? 0);

/**
 * Staff Result Management.
 *
 * A teacher enters ONE subject for a whole class at a time. Submitting doesn't
 * publish anything — it raises an approval request, and the admin's approval is
 * what writes the scores onto each student's result.
 */
const ResultManagement = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);

  const [className, setClassName] = useState('');
  const [subject, setSubject] = useState('');
  const [academicYear, setAcademicYear] = useState(getCurrentAcademicYear());
  const [term, setTerm] = useState<Term>('First');

  const [rows, setRows] = useState<Row[]>([]);
  const [fetchingScores, setFetchingScores] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');

  const yearOptions = useMemo(() => getAcademicYearOptions(), []);

  // Students come back for every assigned class at once; we filter by grade
  // below rather than re-fetching per class.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getAssignedStudents({ limit: 500 });
        if (cancelled) return;
        if (res?.success && res.data) {
          setStudents(res.data.students || []);
          const list = res.data.classes || [];
          setClasses(list);
          if (list.length > 0) setClassName(list[0]);
        } else {
          setError(res?.message || 'Could not load your classes.');
        }
      } catch (err) {
        if (!cancelled) setError(getApiErrorMessage(err, 'Could not load your classes.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  /** Students in the selected grade — "JSS 1" covers JSS 1 A…E. */
  const classStudents = useMemo(() => {
    if (!className) return [];
    return students
      .filter((s) => gradeOf(s.currentClass || s.className || '') === className)
      .sort((a, b) =>
        `${a.lastName || ''}${a.firstName || ''}`.localeCompare(
          `${b.lastName || ''}${b.firstName || ''}`
        )
      );
  }, [students, className]);

  /**
   * Build the sheet, prefilling anything already recorded for this
   * class + subject + year + term so an edit doesn't start from blank.
   */
  const buildRows = useCallback(async () => {
    if (!className) {
      setRows([]);
      return;
    }

    const blank: Row[] = classStudents.map((student) => ({
      student,
      firstCA: '',
      secondCA: '',
      exam: '',
      remark: '',
      existing: false,
    }));

    if (!subject.trim()) {
      setRows(blank);
      return;
    }

    setFetchingScores(true);
    try {
      const res = await getClassResults({
        className,
        subject: subject.trim(),
        academicYear,
        term,
      });

      if (res?.success && res.data) {
        const byStudent = new Map<string, { firstCA?: number; secondCA?: number; exam?: number; remark?: string }>();
        (res.data.results || []).forEach((r) => {
          const id = r.student?._id;
          const line = (r.subjects || [])[0];
          if (!id || !line) return;
          byStudent.set(id, {
            firstCA: line.scores?.firstCA,
            secondCA: line.scores?.secondCA,
            exam: line.scores?.exam,
            remark: line.remark,
          });
        });

        setRows(
          blank.map((row) => {
            const hit = byStudent.get(row.student._id);
            if (!hit) return row;
            return {
              ...row,
              firstCA: hit.firstCA != null ? String(hit.firstCA) : '',
              secondCA: hit.secondCA != null ? String(hit.secondCA) : '',
              exam: hit.exam != null ? String(hit.exam) : '',
              remark: hit.remark || '',
              existing: true,
            };
          })
        );
      } else {
        setRows(blank);
      }
    } catch {
      // A 403/404 here just means nothing's recorded yet — start blank.
      setRows(blank);
    } finally {
      setFetchingScores(false);
    }
  }, [className, classStudents, subject, academicYear, term]);

  useEffect(() => {
    buildRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [className, classStudents.length, academicYear, term]);

  const setField = (studentId: string, field: keyof Row, value: string) => {
    setRows((prev) =>
      prev.map((r) => (r.student._id === studentId ? { ...r, [field]: value } : r))
    );
  };

  /** Only rows the teacher actually filled in get submitted. */
  const filled = useMemo(
    () => rows.filter((r) => r.firstCA || r.secondCA || r.exam),
    [rows]
  );

  const overLimit = useMemo(
    () =>
      rows.some(
        (r) =>
          (toNum(r.firstCA) ?? 0) > SCORE_LIMITS.firstCA ||
          (toNum(r.secondCA) ?? 0) > SCORE_LIMITS.secondCA ||
          (toNum(r.exam) ?? 0) > SCORE_LIMITS.exam
      ),
    [rows]
  );

  const submit = async () => {
    setError('');
    setBanner('');

    if (!className || !subject.trim()) {
      setError('Pick a class and type the subject first.');
      return;
    }
    if (filled.length === 0) {
      setError('Enter at least one score before submitting.');
      return;
    }
    if (overLimit) {
      setError(
        `Scores are capped at ${SCORE_LIMITS.firstCA}/${SCORE_LIMITS.secondCA}/${SCORE_LIMITS.exam}.`
      );
      return;
    }

    setSubmitting(true);
    try {
      const entries: ResultEntry[] = filled.map((r) => ({
        studentId: r.student._id,
        firstCA: toNum(r.firstCA),
        secondCA: toNum(r.secondCA),
        exam: toNum(r.exam),
        remark: r.remark.trim() || undefined,
      }));

      const res = await submitResultUpload({
        className,
        subject: subject.trim(),
        academicYear,
        term,
        entries,
      });

      if (res?.success) {
        setBanner(
          res.message ||
            `${subject.trim()} results for ${className} were sent to the admin for approval.`
        );
      } else {
        setError(res?.message || 'Could not submit the results.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not submit the results.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Result Management</h1>
        <p className="text-sm text-gray-500">Enter your subject&apos;s scores for a class.</p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>
          Results you submit are sent to the admin for approval before they&apos;re published.
          Scores are out of {SCORE_LIMITS.firstCA} / {SCORE_LIMITS.secondCA} / {SCORE_LIMITS.exam}.
        </span>
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
          {banner}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      {loading ? (
        <Skeleton className="h-24 rounded-xl" />
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
          You aren&apos;t assigned to any classes yet. Ask an admin to assign your classes.
        </div>
      ) : (
        <>
          {/* Selection bar */}
          <div className="bg-white rounded-xl shadow-sm p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <Field label="Class">
              <select value={className} onChange={(e) => setClassName(e.target.value)} className={inputCls}>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <input
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                onBlur={buildRows}
                placeholder="e.g. Mathematics"
                className={inputCls}
              />
            </Field>
            <Field label="Academic year">
              <select value={academicYear} onChange={(e) => setAcademicYear(e.target.value)} className={inputCls}>
                {yearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </Field>
            <Field label="Term">
              <select value={term} onChange={(e) => setTerm(e.target.value as Term)} className={inputCls}>
                {TERMS.map((t) => (
                  <option key={t} value={t}>{t} Term</option>
                ))}
              </select>
            </Field>
          </div>

          {/* Entry sheet */}
          <div className="bg-white rounded-xl shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {className}
                  {subject.trim() ? ` · ${subject.trim()}` : ''}
                </p>
                <p className="text-xs text-gray-500">
                  {rows.length} student{rows.length === 1 ? '' : 's'} · {filled.length} filled in
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={buildRows}
                  disabled={fetchingScores}
                  className="flex items-center gap-1.5 text-sm text-gray-600 border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50 disabled:opacity-50"
                >
                  <RotateCcw size={15} /> Reload
                </button>
                <button
                  onClick={submit}
                  disabled={submitting || fetchingScores || filled.length === 0}
                  className="flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50"
                >
                  <Send size={15} /> {submitting ? 'Sending…' : 'Submit for approval'}
                </button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b border-gray-100">
                    <th className="px-4 py-3 font-medium">Student</th>
                    <th className="px-3 py-3 font-medium w-20">1st CA</th>
                    <th className="px-3 py-3 font-medium w-20">2nd CA</th>
                    <th className="px-3 py-3 font-medium w-20">Exam</th>
                    <th className="px-3 py-3 font-medium w-16">Total</th>
                    <th className="px-4 py-3 font-medium">Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {fetchingScores ? (
                    Array.from({ length: 4 }).map((_, i) => (
                      <tr key={i} className="border-b border-gray-50">
                        {Array.from({ length: 6 }).map((__, j) => (
                          <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-20" /></td>
                        ))}
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-10 text-center text-gray-400">
                        No students in {className || 'this class'} yet.
                      </td>
                    </tr>
                  ) : (
                    rows.map((r) => {
                      const t = total(r);
                      return (
                        <tr key={r.student._id} className="border-b border-gray-50 hover:bg-gray-50/60">
                          <td className="px-4 py-2.5">
                            <p className="font-medium text-gray-900">
                              {`${r.student.firstName || ''} ${r.student.lastName || ''}`.trim() ||
                                r.student.email ||
                                '—'}
                            </p>
                            <p className="text-xs text-gray-500">
                              {r.student.admissionNumber || '—'}
                              {r.student.currentClass ? ` · ${r.student.currentClass}` : ''}
                              {r.existing && (
                                <span className="ml-1.5 text-green-700">· recorded</span>
                              )}
                            </p>
                          </td>
                          <ScoreCell value={r.firstCA} max={SCORE_LIMITS.firstCA} onChange={(v) => setField(r.student._id, 'firstCA', v)} />
                          <ScoreCell value={r.secondCA} max={SCORE_LIMITS.secondCA} onChange={(v) => setField(r.student._id, 'secondCA', v)} />
                          <ScoreCell value={r.exam} max={SCORE_LIMITS.exam} onChange={(v) => setField(r.student._id, 'exam', v)} />
                          <td className="px-3 py-2.5 font-medium text-gray-700">
                            {r.firstCA || r.secondCA || r.exam ? t : '—'}
                          </td>
                          <td className="px-4 py-2.5">
                            <input
                              value={r.remark}
                              onChange={(e) => setField(r.student._id, 'remark', e.target.value)}
                              placeholder="Optional"
                              className={`${inputCls} min-w-[140px]`}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const ScoreCell = ({
  value,
  max,
  onChange,
}: {
  value: string;
  max: number;
  onChange: (v: string) => void;
}) => {
  const n = toNum(value);
  const bad = n !== null && (n < 0 || n > max);
  return (
    <td className="px-3 py-2.5">
      <input
        type="number"
        min={0}
        max={max}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={`/${max}`}
        className={`w-full text-sm border rounded-lg px-2 py-1.5 focus:outline-none focus:ring-2 ${
          bad
            ? 'border-red-300 ring-red-200 text-red-700'
            : 'border-gray-200 focus:ring-green-500/30 focus:border-green-500'
        }`}
      />
    </td>
  );
};

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">{label}</span>
    {children}
  </label>
);

export default ResultManagement;
