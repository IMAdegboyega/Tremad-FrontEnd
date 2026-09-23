'use client';

/**
 * "Are you sure?" with actual numbers behind it.
 *
 * Shown before anything that edits a curriculum or a catalogue subject. It
 * fetches what the change would touch — students, teachers, exam papers,
 * timetable periods — and states them, because "34 students, 2 teachers, 6
 * exam papers" is a sentence someone can act on and a row of zeros is
 * permission to stop worrying. A generic "this may affect other records" gets
 * clicked through without being read.
 *
 * FRICTION IS PROPORTIONATE. Nothing affected is a plain confirm. Anything
 * affected requires typing the name, so the destructive case can't be
 * dismissed by muscle memory — but tidying an unused subject stays one click.
 *
 * NOTE what it does NOT say: removing a subject from a class never strips it
 * from students already taking it. They carry their own snapshot from the day
 * they were created. The dialog says so explicitly, because an admin who
 * believes otherwise will avoid a safe action.
 */

import React, { useEffect, useState } from 'react';
import { AlertTriangle, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  getCurriculumImpact,
  type CurriculumImpact,
} from '@/lib/api/curriculum.service';

interface Props {
  /** The subject being removed, archived or renamed. */
  subjectId: string;
  subjectName: string;
  /** Present when removing from ONE class; omit for a catalogue-wide change. */
  grade?: string;
  title: string;
  /** What the confirm button says. */
  action: string;
  /** Extra sentence describing what will actually happen. */
  detail?: string;
  onCancel: () => void;
  onConfirm: () => void | Promise<void>;
}

const ImpactWarningDialog: React.FC<Props> = ({
  subjectId,
  subjectName,
  grade,
  title,
  action,
  detail,
  onCancel,
  onConfirm,
}) => {
  const [impact, setImpact] = useState<CurriculumImpact | null>(null);
  const [loading, setLoading] = useState(true);
  const [typed, setTyped] = useState('');
  const [busy, setBusy] = useState(false);

  /** What must be typed when the change actually bites. */
  const phrase = grade || subjectName;

  useEffect(() => {
    let cancelled = false;
    getCurriculumImpact(subjectId, grade)
      .then((res) => {
        if (!cancelled && res?.success && res.data) setImpact(res.data.impact);
      })
      .catch(() => {
        /* fall through to the cautious path below */
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [subjectId, grade]);

  // If the count couldn't be fetched, assume the worst and demand the typed
  // confirm. Failing open here would be the one place a silent error turns
  // into a silent data change.
  const needsTyping = impact ? impact.any : true;
  const ready = !loading && (!needsTyping || typed.trim() === phrase);

  const rows = impact
    ? ([
        ['Students taking it', impact.students],
        ['Teachers assigned', impact.teachers],
        ['Exam papers filed', impact.papers],
        ['Timetable periods', impact.periods],
      ] as Array<[string, number]>)
    : [];

  return (
    <Dialog open onOpenChange={(next) => !next && !busy && onCancel()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0">
              <AlertTriangle size={16} className="text-amber-700" />
            </span>
            {title}
          </DialogTitle>
          <DialogDescription>
            {grade ? `${subjectName} in ${grade}` : subjectName}
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <p className="text-sm text-gray-500 flex items-center gap-2">
            <Loader2 size={15} className="animate-spin" />
            Checking what this would affect…
          </p>
        ) : (
          <div className="space-y-4">
            <div className="rounded-lg border border-gray-200 divide-y divide-gray-100">
              {rows.map(([label, n]) => (
                <div
                  key={label}
                  className="flex items-center justify-between px-3 py-2 text-sm"
                >
                  <span className="text-gray-600">{label}</span>
                  <span
                    className={
                      n > 0 ? 'font-medium text-gray-900' : 'text-gray-400'
                    }
                  >
                    {n}
                  </span>
                </div>
              ))}
              {!impact && (
                <p className="px-3 py-2 text-sm text-amber-700">
                  Couldn&apos;t check what this affects. Treating it as though
                  it does.
                </p>
              )}
            </div>

            {detail && <p className="text-sm text-gray-600">{detail}</p>}

            {impact && impact.any && grade && (
              <p className="text-xs text-gray-500">
                The {impact.students} student
                {impact.students === 1 ? '' : 's'} already taking it{' '}
                <strong>keep it</strong> — each carries their own subject list
                from the day they were created. This only changes what new{' '}
                {grade} students are given.
              </p>
            )}

            {needsTyping && (
              <label className="block">
                <span className="text-xs text-gray-500 mb-1 block">
                  Type <strong>{phrase}</strong> to confirm
                </span>
                <input
                  value={typed}
                  onChange={(e) => setTyped(e.target.value)}
                  autoFocus
                  className="w-full text-sm border border-gray-200 rounded-lg px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500"
                />
              </label>
            )}
          </div>
        )}

        <DialogFooter>
          <button
            type="button"
            onClick={onCancel}
            disabled={busy}
            className="text-sm px-4 py-2.5 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!ready || busy}
            onClick={async () => {
              setBusy(true);
              try {
                await onConfirm();
              } finally {
                setBusy(false);
              }
            }}
            className="text-sm px-4 py-2.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-40 flex items-center gap-2"
          >
            {busy && <Loader2 size={15} className="animate-spin" />}
            {action}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default ImpactWarningDialog;
