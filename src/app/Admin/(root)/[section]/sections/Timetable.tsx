'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Plus, Pencil, Trash2, Clock, CalendarDays, Coffee } from 'lucide-react';
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
  getTimetableClassOptions,
  getTimetableTeachers,
  type SATimetableEntry,
  type TimetableSummary,
  type TimetableEntryInput,
  type TeacherOption,
} from '@/lib/api/superAdmin.service';

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

const emptyForm = (className: string): FormState => ({
  className,
  subject: '',
  teacherId: '',
  day: 'Monday',
  startTime: '08:00',
  endTime: '09:00',
  room: '',
  academicSession: defaultSession(),
  term: 'First',
});

/**
 * SuperAdmin Timetable builder.
 *
 * Pick a class, then add/edit/delete periods (subject, teacher, day, time). A
 * summary strip shows total hours, free periods and hours-per-teacher. Students
 * in the class see the result on their own Time Table page.
 */
const Timetable = () => {
  const [classes, setClasses] = useState<string[]>([]);
  const [teachers, setTeachers] = useState<TeacherOption[]>([]);
  const [selectedClass, setSelectedClass] = useState('');

  const [entries, setEntries] = useState<SATimetableEntry[]>([]);
  const [summary, setSummary] = useState<TimetableSummary | null>(null);
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
        const [clsRes, teachRes] = await Promise.all([
          getTimetableClassOptions(),
          getTimetableTeachers(),
        ]);
        if (cancelled.current) return;
        const cls = clsRes?.data?.classes ?? [];
        setClasses(cls);
        setTeachers(teachRes?.data?.teachers ?? []);
        if (cls.length > 0) setSelectedClass((c) => c || cls[0]);
        else setLoading(false);
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

  const loadTimetable = useCallback(async (className: string) => {
    if (!className) return;
    setLoading(true);
    try {
      const res = await listTimetable({ className });
      if (cancelled.current) return;
      if (res?.success && res.data) {
        setEntries(res.data.entries);
        setSummary(res.data.summary);
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
    if (selectedClass) loadTimetable(selectedClass);
  }, [selectedClass, loadTimetable]);

  const openAdd = () => {
    setForm(emptyForm(selectedClass));
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (e: SATimetableEntry) => {
    setForm({
      _id: e._id,
      className: e.className,
      subject: e.subject,
      teacherId: e.teacherId,
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      room: e.room ?? '',
      academicSession: e.academicSession,
      term: e.term,
    });
    setFormError('');
    setModalOpen(true);
  };

  const submitForm = async () => {
    setFormError('');
    if (!form.subject.trim() || !form.teacherId) {
      setFormError('Subject and teacher are required.');
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
        teacherId: form.teacherId,
        day: form.day,
        startTime: form.startTime,
        endTime: form.endTime,
        room: form.room?.trim() || undefined,
        academicSession: form.academicSession.trim(),
        term: form.term,
      };
      const res = form._id
        ? await updateTimetableEntry(form._id, payload)
        : await createTimetableEntry(payload);
      if (res?.success) {
        setModalOpen(false);
        await loadTimetable(selectedClass);
      } else {
        setFormError(res?.message || 'Could not save the entry.');
      }
    } catch (err: unknown) {
      // The backend returns 409 with a helpful message on teacher clashes.
      const msg =
        (err as { message?: string })?.message ||
        'Could not save the entry. Please try again.';
      setFormError(msg);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await deleteTimetableEntry(id);
      await loadTimetable(selectedClass);
    } catch {
      // Non-fatal — leave the row; the list reload above would reflect reality.
    } finally {
      setDeletingId(null);
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
          <p className='text-sm text-gray-500'>
            Build a weekly timetable per class. Students see it on their portal.
          </p>
        </div>
        <div className='flex items-center gap-2'>
          <select
            value={selectedClass}
            onChange={(e) => setSelectedClass(e.target.value)}
            disabled={classes.length === 0}
            className='text-sm border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30'
          >
            {classes.length === 0 ? (
              <option value=''>No classes found</option>
            ) : (
              classes.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
          <button
            onClick={openAdd}
            disabled={!selectedClass}
            className='flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800 disabled:opacity-50'
          >
            <Plus size={16} /> Add period
          </button>
        </div>
      </div>

      {/* Summary strip */}
      <div className='grid grid-cols-2 sm:grid-cols-4 gap-3'>
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
          label='Teachers assigned'
          value={loading ? null : String(summary?.hoursPerTeacher.length ?? 0)}
        />
      </div>

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
      ) : classes.length === 0 ? (
        <div className='bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm'>
          No classes with students yet. Add students to a class first, then build
          their timetable here.
        </div>
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
                      No classes
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
                          {e.teacherName}
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
              {form._id ? 'Edit period' : 'Add period'} — {selectedClass}
            </DialogTitle>
          </DialogHeader>

          <div className='space-y-3 py-1'>
            <Field label='Subject'>
              <input
                value={form.subject}
                onChange={(e) => setForm({ ...form, subject: e.target.value })}
                placeholder='e.g. Mathematics'
                className={inputCls}
              />
            </Field>

            <Field label='Teacher'>
              <select
                value={form.teacherId}
                onChange={(e) => setForm({ ...form, teacherId: e.target.value })}
                className={inputCls}
              >
                <option value=''>Select a teacher</option>
                {teachers.map((t) => (
                  <option key={t._id} value={t._id}>
                    {t.name}
                  </option>
                ))}
              </select>
            </Field>

            <div className='grid grid-cols-3 gap-2'>
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
              <Field label='Room (optional)'>
                <input
                  value={form.room ?? ''}
                  onChange={(e) => setForm({ ...form, room: e.target.value })}
                  placeholder='e.g. Lab 2'
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
