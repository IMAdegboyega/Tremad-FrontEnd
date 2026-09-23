'use client';

/**
 * Move a misfiled paper. Admin only.
 *
 * This is the case the whole design exists for: a teacher uploads Physics into
 * Mathematics and somebody has to put it right. Because the hierarchy is
 * fields on the paper rather than folders, "moving" it is a PATCH of up to
 * four values — no reparenting, nothing to orphan, and no empty folder left
 * behind where it used to be.
 *
 * Every field is pre-filled with where the paper currently sits, so a move is
 * whatever you change and nothing else.
 */

import React, { useEffect, useState } from 'react';
import { Loader2, Move, X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { GRADE_LEVELS } from '@/Constants/classes';
import { getAcademicYearOptions } from '@/Constants/academicYears';
import { getSubjects, type Subject } from '@/lib/api/curriculum.service';
import {
  updateExamPaper,
  type ExamPaper,
  type Term,
} from '@/lib/api/examPaper.service';
import { getApiErrorMessage } from '@/lib/api/client';

const TERMS: Term[] = ['First', 'Second', 'Third'];

const MovePaperDialog: React.FC<{
  paper: ExamPaper;
  onClose: () => void;
  onMoved: () => void | Promise<void>;
}> = ({ paper, onClose, onMoved }) => {
  const years = getAcademicYearOptions({ back: 3, forward: 1 });
  const currentSubjectId =
    typeof paper.subject === 'string' ? paper.subject : paper.subject._id;

  const [academicYear, setAcademicYear] = useState(paper.academicYear);
  const [grade, setGrade] = useState(paper.grade);
  const [subject, setSubject] = useState(currentSubjectId);
  const [term, setTerm] = useState<Term>(paper.term);
  const [catalogue, setCatalogue] = useState<Subject[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    getSubjects()
      .then((res) => {
        if (!cancelled && res?.success && res.data) {
          setCatalogue(res.data.subjects || []);
        }
      })
      .catch(() => {
        /* the selects still work with what's already chosen */
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const unchanged =
    academicYear === paper.academicYear &&
    grade === paper.grade &&
    subject === currentSubjectId &&
    term === paper.term;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (unchanged) {
      onClose();
      return;
    }
    setBusy(true);
    setError('');
    try {
      // Only what actually changed — the server stamps movedBy/movedAt and
      // writes an audit entry when any coordinate differs.
      const res = await updateExamPaper(paper._id, {
        ...(academicYear !== paper.academicYear ? { academicYear } : {}),
        ...(grade !== paper.grade ? { grade } : {}),
        ...(subject !== currentSubjectId ? { subject } : {}),
        ...(term !== paper.term ? { term } : {}),
      });
      if (res?.success) await onMoved();
      else setError(res?.message || 'Could not move that paper.');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not move that paper.'));
    } finally {
      setBusy(false);
    }
  };

  return (
    <Dialog open onOpenChange={(next) => !next && !busy && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Move paper</DialogTitle>
          <DialogDescription className="truncate">
            {paper.title}
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
              <span className="text-xs text-gray-500 mb-1 block">Session</span>
              <select
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className={input}
              >
                {[...new Set([paper.academicYear, ...years])].map((y) => (
                  <option key={y} value={y}>
                    {y}
                  </option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="text-xs text-gray-500 mb-1 block">Class</span>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className={input}
              >
                {GRADE_LEVELS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </label>
          </div>

          <label className="block">
            <span className="text-xs text-gray-500 mb-1 block">Subject</span>
            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className={input}
            >
              {/* The current subject is listed even if it's since been archived,
                  so the select can never open blank on an existing paper. */}
              {!catalogue.some((c) => c._id === currentSubjectId) && (
                <option value={currentSubjectId}>
                  {typeof paper.subject === 'string'
                    ? 'Current subject'
                    : paper.subject.name}
                </option>
              )}
              {catalogue.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.name}
                </option>
              ))}
            </select>
          </label>

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
              disabled={busy || unchanged}
              title={unchanged ? 'Nothing has changed' : undefined}
              className="text-sm px-4 py-2.5 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50 flex items-center gap-2"
            >
              {busy ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Move size={15} />
              )}
              {busy ? 'Moving…' : 'Move'}
            </button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

export default MovePaperDialog;
