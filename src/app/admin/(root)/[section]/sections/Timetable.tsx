'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  Plus,
  Pencil,
  Trash2,
  Clock,
  CalendarDays,
  Coffee,
  Eye,
  EyeOff,
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  listTimetable,
  createTimetableEntry,
  updateTimetableEntry,
  deleteTimetableEntry,
  getTimetableTeachers,
  setTimetablePublished,
  type ExamSummary,
  type SATimetableEntry,
  type TimetableSummary,
  type TimetableEntryInput,
  type TimetableEntryType,
  type TeacherOption,
} from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';
import { formatExamDate, toDateInputValue } from '@/Constants/examDates';
import { GRADE_LEVELS } from '@/Constants/classes';

const DAYS: SATimetableEntry['day'][] = [
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
];
const TERMS: SATimetableEntry['term'][] = ['First', 'Second', 'Third'];

// Sensible default so the SA isn't forced to type the session every time.
const defaultSession = () => {
  const now = new Date();
  const y = now.getFullYear();
  // School years typically span two calendar years; Aug+ rolls to next year.
  return now.getMonth() >= 7 ? `${y}/${y + 1}` : `${y - 1}/${y}`;
};

type FormState = TimetableEntryInput & { _id?: string };

const emptyForm = (
  className: string,
  type: TimetableEntryType = 'class'
): FormState => ({
  className,
  subject: '',
  teacherId: '',
  day: 'Monday',
  startTime: '08:00',
  endTime: '09:00',
  room: '',
  academicSession: defaultSession(),
  term: 'First',
  type,
  examDate: '',
});

/**
 * Wording differs between the two modes — an exam's "teacher" is its
 * invigilator, and its "room" is the exam hall. Everything else is identical,
 * so the same builder drives both.
 */
const COPY = {
  class: {
    tab: 'Class timetable',
    subtitle: 'Build a weekly timetable per class. Students see it on their portal.',
    addButton: 'Add period',
    addTitle: 'Add period',
    editTitle: 'Edit period',
    person: 'Teacher',
    personPlaceholder: 'Select a teacher',
    place: 'Room',
    placePlaceholder: 'e.g. Lab 2',
    emptyDay: 'No classes',
    peopleTile: 'Teachers assigned',
    unassigned: 'No teacher yet',
  },
  exam: {
    tab: 'Exam timetable',
    subtitle: 'Set the exam schedule per class. Students see it alongside their timetable.',
    addButton: 'Add exam',
    addTitle: 'Add exam',
    editTitle: 'Edit exam',
    person: 'Invigilator',
    personPlaceholder: 'Select an invigilator',
    place: 'Exam Hall',
    placePlaceholder: 'e.g. Main Hall',
    emptyDay: 'No exams',
    peopleTile: 'Invigilators assigned',
    unassigned: 'No invigilator yet',
  },
} as const;

/**
 * SuperAdmin Timetable builder.
 *
 * Pick a class, then add/edit/delete periods (subject, teacher, day, time). A
 * summary strip shows total hours, free periods and hours-per-teacher. Students
 * in the class see the result on their own Time Table page.
 */
const Timetable = () => {
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');
  // Which timetable we're building: weekly lessons, or the exam schedule.
  const [mode, setMode] = useState<TimetableEntryType>('class');
  const copy = COPY[mode];

  const [entries, setEntries] = useState<SATimetableEntry[]>([]);
  const [summary, setSummary] = useState<TimetableSummary | null>(null);
  const [examSummary, setExamSummary] = useState<ExamSummary | null>(null);
  // Whether students can currently see this class's timetable.
  const [published, setPublished] = useState(true);
  const [togglingPublish, setTogglingPublish] = useState(false);
  /**
   * Timetables are grade-level: one JSS 1 timetable is shared by JSS 1 A–E, so
   * only grades are selectable. Always available, whether or not the grade has
   * any students yet.
   */
  const classOptions = GRADE_LEVELS;
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm(''));
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const cancelled = useRef(false);

  // Load class + teacher option lists once.
  useEffect(() => {
    cancelled.current = false;
    (async () => {
      try {
        // Classes no longer come from the API — the grade list is fixed.
        const teachRes = await getTimetableTeachers();
        if (cancelled.current) return;
        setTeachers(teachRes?.data?.teachers ?? []);
        setSelectedClass((c) => c || GRADE_LEVELS[0]);
      } catch {
        if (!cancelled.current) {
          setErrored(true);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled.current = true;
    };
  }, []);

  const loadTimetable = useCallback(async (className: string, type: TimetableEntryType) => {
    if (!className) return;
    setLoading(true);
    try {
      const res = await listTimetable({ className, type });
      if (cancelled.current) return;
      if (res?.success && res.data) {
        setEntries(res.data.entries);
        setSummary(res.data.summary);
        setExamSummary(res.data.examSummary ?? null);
        setPublished(res.data.isPublished !== false);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      if (!cancelled.current) setErrored(true);
    } finally {
      if (!cancelled.current) setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (selectedClass) loadTimetable(selectedClass, mode);
  }, [selectedClass, mode, loadTimetable]);

  const openAdd = () => {
    setForm(emptyForm(selectedClass, mode));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (e: SATimetableEntry) => {
    setForm({
      _id: e._id,
      className: e.className,
      subject: e.subject,
      teacherId: e.teacherId ?? '',
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      room: e.room ?? '',
      academicSession: e.academicSession,
      term: e.term,
      type: e.type ?? mode,
      examDate: toDateInputValue(e.examDate),
    });
    setFormError('');
    setModalOpen(true);
  };

  const submitForm = async () => {
    setFormError('');
    // Teacher / invigilator is optional — it can be assigned later.
    if (!form.subject.trim()) {
      setFormError('Subject is required.');
      return;
    }
    if ((form.type ?? 'class') === 'exam' && !form.examDate) {
      setFormError('Pick the exam date.');
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError('End time must be after start time.');
      return;
    }
    setSaving(true);
    try {
      const payload: TimetableEntryInput = {
        className: form.className,
        subject: form.subject.trim(),
        teacherId: form.teacherId || undefined,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room?.trim() || undefined,
        academicSession: form.academicSession.trim(),
        term: form.term,
        type: form.type ?? mode,
        // Server derives `day` from this for exams.
        examDate:
          (form.type ?? 'class') === 'exam' ? form.examDate : undefined,
      };
      const res = form._id
        ? await updateTimetableEntry(form._id, payload)
        : await createTimetableEntry(payload);
      if (res?.success) {
        setModalOpen(false);
        await loadTimetable(selectedClass, mode);
      } else {
        setFormError(res?.message || 'Could not save the entry.');
      }
    } catch (err: unknown) {
      // The backend returns 409 with a helpful message on double-booking.
      setFormError(
        getApiErrorMessage(err, 'Could not save the entry. Please try again.')
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTimetableEntry(id);
      await loadTimetable(selectedClass, mode);
    } catch {
      // Non-fatal — leave the row; the list reload above would reflect reality.
    } finally {
      setDeletingId(null);
    }
  };

  const togglePublished = async () => {
    if (!selectedClass || togglingPublish) return;
    setTogglingPublish(true);
    try {
      const next = !published;
      const res = await setTimetablePublished(selectedClass, mode, next);
      if (res?.success) setPublished(next);
    } catch {
      // Non-fatal — the next load reflects the true state.
    } finally {
      setTogglingPublish(false);
    }
  };

  const entriesByDay = (day: string) =>
    entries.filter((e) => e.day === day);

  return (
    <div className='flex flex-col gap-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-3'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Timetable
          </h1>
          <p className='text-sm text-gray-500'>{copy.subtitle}</p>

          {/* Mode switch — lessons vs exams, same builder underneath */}
          <div className='mt-3 inline-flex rounded-lg border border-gray-200 bg-white p-0.5'>
            {(['class', 'exam'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`px-3 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors ${
                  mode === m
                    ? 'bg-green-700 text-white'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                {COPY[m].tab}
              </button>
            ))}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          {/* Every grade is always selectable, whether or not it has students —
              build the timetable now and it's waiting when they're added. */}
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30'
          >
            {classOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          {/* Offline switch — deliberately understated; it's a maintenance tool,
              not an everyday action. */}
          <button
            onClick={togglePublished}
            disabled={!selectedClass || togglingPublish}
            title={
              published
                ? 'Visible to students — click to take offline for maintenance'
                : 'Offline: hidden from students. Click to put back online'
            }
            className={`p-2 rounded-lg border transition-colors disabled:opacity-40 ${
              published
                ? 'border-gray-200 text-gray-400 hover:text-gray-600'
                : 'border-amber-300 bg-amber-50 text-amber-600'
            }`}
            aria-label={published ? 'Take timetable offline' : 'Put timetable online'}
          >
            {published ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
          <button
            onClick={openAdd}
            disabled={!selectedClass}
            className='flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50'
          >
            <Plus size={16} /> {copy.addButton}
          </button>
        </div>
      </div>

      {/* Offline notice — students can't see this timetable right now */}
      {!published && (
        <div className='flex items-center gap-2 px-4 py-2.5 rounded-lg bg-amber-50 border border-amber-200'>
          <EyeOff size={16} className='text-amber-600 shrink-0' />
          <p className='text-xs text-amber-800'>
            This {mode === 'exam' ? 'exam timetable' : 'timetable'} is{' '}
            <strong>offline</strong> — students can&apos;t see it. You can still
            edit it; use the eye button to put it back online.
          </p>
        </div>
      )}

      {/* Summary strip — exams report different things from lessons */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
        {mode === 'exam' ? (
          <>
            <SummaryTile
              icon={<CalendarDays size={16} className='text-blue-600' />}
              label='Exams scheduled'
              value={loading ? null : String(examSummary?.totalExams ?? 0)}
            />
            <SummaryTile
              icon={<CalendarDays size={16} className='text-green-600' />}
              label='Exam days'
              value={loading ? null : String(examSummary?.examDays ?? 0)}
            />
            <SummaryTile
              icon={<Clock size={16} className='text-purple-600' />}
              label='Needs invigilator'
              value={
                loading ? null : String(examSummary?.missingInvigilator ?? 0)
              }
            />
            <SummaryTile
              icon={<Coffee size={16} className='text-amber-600' />}
              label='Needs a hall'
              value={loading ? null : String(examSummary?.missingHall ?? 0)}
            />
          </>
        ) : (
          <>
            <SummaryTile
              icon={<Clock size={16} className='text-green-600' />}
              label='Total hours / week'
              value={loading ? null : `${summary?.totalHours ?? 0}h`}
            />
            <SummaryTile
              icon={<CalendarDays size={16} className='text-blue-600' />}
              label='Total periods'
              value={loading ? null : String(summary?.totalPeriods ?? 0)}
            />
            <SummaryTile
              icon={<Coffee size={16} className='text-amber-600' />}
              label='Free periods'
              value={loading ? null : String(summary?.totalFreePeriods ?? 0)}
            />
            <SummaryTile
              icon={<Clock size={16} className='text-purple-600' />}
              label={copy.peopleTile}
              value={
                loading
                  ? null
                  : String(
                      summary?.hoursPerTeacher.filter(
                        (t) => t.teacher !== 'Unassigned'
                      ).length ?? 0
                    )
              }
            />
          </>
        )}
      </div>

      {/* Exam date range — only meaningful once dates exist */}
      {mode === 'exam' && !loading && examSummary?.firstDate && (
        <p className='text-xs text-gray-500 -mt-1'>
          {formatExamDate(examSummary.firstDate)}
          {examSummary.lastDate && examSummary.lastDate !== examSummary.firstDate
            ? ` – ${formatExamDate(examSummary.lastDate)}`
            : ''}
          {' · '}
          {examSummary.subjects} subject{examSummary.subjects === 1 ? '' : 's'}
        </p>
      )}

      {/* Week grid */}
      {loading ? (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
          {DAYS.map((d) => (
            <Skeleton key={d} className='h-40 rounded-xl' />
          ))}
        </div>
      ) : errored ? (
        <div className='bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm'>
          Couldn&apos;t load the timetable.
        </div>
      ) : mode === 'exam' ? (
        /* Exams are dated sittings, so they read as a chronological list rather
           than a repeating Mon–Fri grid (and weekend exams still show). */
        entries.length === 0 ? (
          <div className='bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm'>
            No exams scheduled for {selectedClass} yet.
          </div>
        ) : (
          <div className='bg-white rounded-xl shadow-sm divide-y divide-gray-100'>
            {entries.map((e) => (
              <div
                key={e._id}
                className='group flex items-center gap-3 px-4 py-3 hover:bg-gray-50'
              >
                <div className='w-40 shrink-0'>
                  <p className='text-sm font-medium text-gray-900'>
                    {formatExamDate(e.examDate) || e.day}
                  </p>
                  <p className='text-xs text-gray-500'>
                    {e.startTime}–{e.endTime}
                  </p>
                </div>
                <div className='flex-1 min-w-0'>
                  <p className='text-sm font-medium text-gray-900 truncate'>
                    {e.subject}
                  </p>
                  <p className='text-xs text-gray-500 truncate'>
                    <span className={e.teacherName ? '' : 'italic text-gray-400'}>
                      {e.teacherName || copy.unassigned}
                    </span>
                    {e.room ? ` · ${e.room}` : ''}
                  </p>
                </div>
                <div className='flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity'>
                  <button
                    onClick={() => openEdit(e)}
                    className='text-gray-400 hover:text-blue-600'
                    aria-label='Edit'
                  >
                    <Pencil size={14} />
                  </button>
                  <button
                    onClick={() => handleDelete(e._id)}
                    disabled={deletingId === e._id}
                    className='text-gray-400 hover:text-red-600 disabled:opacity-40'
                    aria-label='Delete'
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-5 gap-3'>
          {DAYS.map((day) => {
            const dayEntries = entriesByDay(day);
            return (
              <div key={day} className='bg-white rounded-xl shadow-sm flex flex-col'>
                <div className='px-3 py-2.5 border-b border-gray-100 flex items-center justify-between'>
                  <span className='font-semibold text-gray-800 text-sm'>
                    {day}
                  </span>
                  <span className='text-xs text-gray-400'>
                    {dayEntries.length}
                  </span>
                </div>
                <div className='p-2 space-y-2 min-h-[80px]'>
                  {dayEntries.length === 0 ? (
                    <p className='text-xs text-gray-300 text-center py-4'>
                      {copy.emptyDay}
                    </p>
                  ) : (
                    dayEntries.map((e) => (
                      <div
                        key={e._id}
                        className='group rounded-lg border border-gray-100 bg-gray-50 p-2.5 hover:border-green-200'
                      >
                        <div className='flex items-start justify-between gap-1'>
                          <p className='text-sm font-medium text-gray-900 leading-tight'>
                            {e.subject}
                          </p>
                          <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                            <button
                              onClick={() => openEdit(e)}
                              className='text-gray-400 hover:text-blue-600'
                              aria-label='Edit'
                            >
                              <Pencil size={13} />
                            </button>
                            <button
                              onClick={() => handleDelete(e._id)}
                              disabled={deletingId === e._id}
                              className='text-gray-400 hover:text-red-600 disabled:opacity-40'
                              aria-label='Delete'
                            >
                              <Trash2 size={13} />
                            </button>
                          </div>
                        </div>
                        <p className='text-xs text-gray-500 mt-0.5'>
                          {e.startTime}–{e.endTime}
                        </p>
                        <p className='text-xs text-gray-500 truncate'>
                          <span className={e.teacherName ? '' : 'italic text-gray-400'}>
                            {e.teacherName || copy.unassigned}
                          </span>
                          {e.room ? ` · ${e.room}` : ''}
                        </p>
                      </div>
                    ))
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add/Edit modal */}
      <Dialog open={modalOpen} onOpenChange={(o) => !o && setModalOpen(false)}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>
              {form._id
                ? COPY[form.type ?? 'class'].editTitle
                : COPY[form.type ?? 'class'].addTitle}{' '}
              — {selectedClass}
            </DialogTitle>
          </DialogHeader>

          {/* Class / Exam switch inside the modal. Only when adding — an
              existing entry keeps its kind so it can't silently change type. */}
          {!form._id && (
            <div className='inline-flex rounded-lg border border-gray-200 bg-gray-50 p-0.5 w-full'>
              {(['class', 'exam'] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setForm({ ...form, type: m })}
                  className={`flex-1 px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                    (form.type ?? 'class') === m
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-800'
                  }`}
                >
                  {COPY[m].tab}
                </button>
              ))}
            </div>
          )}

          <div className='space-y-3 py-1'>
            <Field label='Subject'>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder='e.g. Mathematics'
                className={inputCls}
              />
            </Field>

            <Field label={`${COPY[form.type ?? 'class'].person} (optional)`}>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className={inputCls}
              >
                <option value=''>
                  {COPY[form.type ?? 'class'].personPlaceholder}
                </option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className='grid grid-cols-3 gap-2'>
              {(form.type ?? 'class') === 'exam' ? (
                // Exams are dated sittings — pick the date and the weekday
                // follows automatically ("Monday 12 June").
                <Field label='Exam date'>
                  <input
                    type='date'
                    value={form.examDate ?? ''}
                    onChange={(e) =>
                      setForm({ ...form, examDate: e.target.value })
                    }
                    className={inputCls}
                  />
                  {form.examDate && (
                    <p className='text-[11px] text-gray-500 mt-1'>
                      {formatExamDate(form.examDate)}
                    </p>
                  )}
                </Field>
              ) : (
                <Field label='Day'>
                  <select
                    value={form.day}
                    onChange={(e) =>
                      setForm({ ...form, day: e.target.value as FormState['day'] })
                    }
                    className={inputCls}
                  >
                    {DAYS.map((d) => (
                      <option key={d} value={d}>
                        {d}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              <Field label='Start'>
                <input
                  type='time'
                  value={form.startTime}
                  onChange={(e) =>
                    setForm({ ...form, startTime: e.target.value })
                  }
                  className={inputCls}
                />
              </Field>
              <Field label='End'>
                <input
                  type='time'
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className={inputCls}
                />
              </Field>
            </div>

            <div className='grid grid-cols-2 gap-2'>
              <Field label={`${COPY[form.type ?? 'class'].place} (optional)`}>
                <input
                  value={form.room ?? ''}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder={COPY[form.type ?? 'class'].placePlaceholder}
                  className={inputCls}
                />
              </Field>
              <Field label='Term'>
                <select
                  value={form.term}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      term: e.target.value as FormState['term'],
                    })
                  }
                  className={inputCls}
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </Field>
            </div>

            <Field label='Academic session'>
              <input
                value={form.academicSession}
                onChange={(e) =>
                  setForm({ ...form, academicSession: e.target.value })
                }
                placeholder='2024/2025'
                className={inputCls}
              />
            </Field>

            {formError && (
              <p className='text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2'>
                {formError}
              </p>
            )}
          </div>

          <DialogFooter>
            <button
              onClick={() => setModalOpen(false)}
              className='text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50'
            >
              Cancel
            </button>
            <button
              onClick={submitForm}
              disabled={saving}
              className='text-sm px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50'
            >
              {saving ? 'Saving…' : form._id ? 'Save changes' : 'Add period'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Field = ({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) => (
  <label className='block'>
    <span className='text-xs text-gray-500 mb-1 block'>{label}</span>
    {children}
  </label>
);

const SummaryTile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) => (
  <div className='bg-white rounded-xl p-3.5 shadow-sm'>
    <div className='flex items-center gap-1.5 mb-1'>
      {icon}
      <span className='text-xs text-gray-500'>{label}</span>
    </div>
    {value === null ? (
      <Skeleton className='h-6 w-12' />
    ) : (
      <p className='text-xl font-bold text-gray-900'>{value}</p>
    )}
  </div>
);

export default Timetable;
