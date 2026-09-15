'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { Plus, CalendarDays, ClipboardList } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { formatExamDate } from '@/Constants/examDates';
import {
  getAcademicYearOptions,
  getCurrentAcademicYear,
} from '@/Constants/academicYears';
import {
  getTeacherTimetable,
  getTeacherProfile,
  submitTimetableEntryRequest,
  type TeacherTimetableResponse,
  type TeacherScheduleEntry,
  type TimetableEntryRequest,
} from '@/lib/api/teacher.service';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] as const;
const TERMS = ['First', 'Second', 'Third'] as const;

type Tab = 'lessons' | 'exams';

const Timetable = () => {
  const [data, setData] = useState<TeacherTimetableResponse | null>(null);
  const [teacherId, setTeacherId] = useState('');
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>('lessons');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');
  const [formError, setFormError] = useState('');

  const [form, setForm] = useState({
    className: '',
    subject: '',
    day: 'Monday' as (typeof DAYS)[number],
    startTime: '08:00',
    endTime: '09:00',
    room: '',
    academicSession: getCurrentAcademicYear(),
    term: 'First' as (typeof TERMS)[number],
  });

  const load = async () => {
    setLoading(true);
    try {
      const [tt, prof] = await Promise.all([
        getTeacherTimetable(),
        getTeacherProfile(),
      ]);
      if (tt?.success && tt.data) setData(tt.data);
      if (prof?.success && prof.data?._id) setTeacherId(prof.data._id);
    } catch {
      /* soft */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // The API already separates the two — a teacher can be a subject teacher on
  // one row and an invigilator on another.
  const lessons = useMemo(() => data?.lessons ?? [], [data]);
  const exams = useMemo(() => data?.exams ?? [], [data]);
  const classes = useMemo(() => data?.assignedClasses ?? [], [data]);

  const yearOptions = useMemo(() => getAcademicYearOptions(), []);

  const submit = async () => {
    setFormError('');
    if (!form.className || !form.subject.trim()) {
      setFormError('Class and subject are required.');
      return;
    }
    if (form.endTime <= form.startTime) {
      setFormError('End time must be after start time.');
      return;
    }
    setSaving(true);
    try {
      const payload: TimetableEntryRequest = {
        action: 'create',
        entry: {
          className: form.className,
          subject: form.subject.trim(),
          teacherId,
          day: form.day,
          startTime: form.startTime,
          endTime: form.endTime,
          room: form.room.trim() || undefined,
          academicSession: form.academicSession,
          term: form.term,
        },
      };
      const res = await submitTimetableEntryRequest(payload);
      if (res?.success) {
        setOpen(false);
        setBanner('Your timetable change was sent to the admin for approval.');
      } else {
        setFormError(res?.message || 'Could not submit the request.');
      }
    } catch (err: any) {
      setFormError(err?.message || 'Could not submit the request.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">My Timetable</h1>
          <p className="text-sm text-gray-500">
            Your teaching schedule and the exams you&apos;re invigilating.
          </p>
        </div>
        <button
          onClick={() => {
            setForm((f) => ({ ...f, className: classes[0] || '' }));
            setFormError('');
            setOpen(true);
          }}
          className="flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800"
        >
          <Plus size={16} /> Request change
        </button>
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">
          {banner}
        </div>
      )}

      {/* Lessons / Exams */}
      <div className="flex gap-1 bg-gray-100 p-1 rounded-lg w-fit">
        <TabButton
          active={tab === 'lessons'}
          onClick={() => setTab('lessons')}
          icon={<ClipboardList size={15} />}
          label="Lessons"
          count={loading ? undefined : lessons.length}
        />
        <TabButton
          active={tab === 'exams'}
          onClick={() => setTab('exams')}
          icon={<CalendarDays size={15} />}
          label="Exams"
          count={loading ? undefined : exams.length}
        />
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {DAYS.map((d) => (
            <Skeleton key={d} className="h-40 rounded-xl" />
          ))}
        </div>
      ) : tab === 'lessons' ? (
        <LessonGrid lessons={lessons} />
      ) : (
        <ExamList exams={exams} />
      )}

      {/* Request-change modal */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a timetable change</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <Field label="Class">
              <select value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} className={inputCls}>
                <option value="">Select a class</option>
                {classes.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </Field>
            <Field label="Subject">
              <input value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} placeholder="e.g. Mathematics" className={inputCls} />
            </Field>
            <div className="grid grid-cols-3 gap-2">
              <Field label="Day">
                <select value={form.day} onChange={(e) => setForm({ ...form, day: e.target.value as any })} className={inputCls}>
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </Field>
              <Field label="Start">
                <input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} className={inputCls} />
              </Field>
              <Field label="End">
                <input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Field label="Room (optional)">
                <input value={form.room} onChange={(e) => setForm({ ...form, room: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Term">
                <select value={form.term} onChange={(e) => setForm({ ...form, term: e.target.value as any })} className={inputCls}>
                  {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </Field>
            </div>
            <Field label="Academic session">
              <select value={form.academicSession} onChange={(e) => setForm({ ...form, academicSession: e.target.value })} className={inputCls}>
                {yearOptions.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </Field>
            {formError && <p className="text-sm text-red-600 bg-red-50 rounded-lg px-3 py-2">{formError}</p>}
          </div>
          <DialogFooter>
            <button onClick={() => setOpen(false)} className="text-sm px-4 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
            <button onClick={submit} disabled={saving} className="text-sm px-4 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">
              {saving ? 'Sending…' : 'Send request'}
            </button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

/** Weekly grid of the lessons this teacher takes. */
const LessonGrid = ({ lessons }: { lessons: TeacherScheduleEntry[] }) => {
  if (lessons.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
        You have no scheduled periods yet.
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
      {DAYS.map((day) => {
        const dayPeriods = lessons
          .filter((p) => p.day === day)
          .sort((a, b) => a.startTime.localeCompare(b.startTime));
        return (
          <div key={day} className="bg-white rounded-xl shadow-sm flex flex-col">
            <div className="px-3 py-2.5 border-b border-gray-100 flex items-center justify-between">
              <span className="font-semibold text-gray-800 text-sm">{day}</span>
              <span className="text-xs text-gray-400">{dayPeriods.length}</span>
            </div>
            <div className="p-2 space-y-2 min-h-[80px]">
              {dayPeriods.length === 0 ? (
                <p className="text-xs text-gray-300 text-center py-4">No classes</p>
              ) : (
                dayPeriods.map((p) => (
                  <div key={p._id} className="rounded-lg border border-gray-100 bg-gray-50 p-2.5">
                    <p className="text-sm font-medium text-gray-900 leading-tight">{p.subject}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{p.startTime}–{p.endTime}</p>
                    <p className="text-xs text-gray-500 truncate">
                      {p.className}{p.room ? ` · ${p.room}` : ''}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/**
 * Exams are sittings on real calendar dates, not a repeating weekly grid, so
 * they're listed in date order with the weekday derived from the date
 * ("Monday 12 June"). `room` is the exam hall here, not a classroom.
 */
const ExamList = ({ exams }: { exams: TeacherScheduleEntry[] }) => {
  if (exams.length === 0) {
    return (
      <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
        You aren&apos;t invigilating any exams.
      </div>
    );
  }

  // Group by sitting date so a day's papers read together.
  const byDate = new Map<string, TeacherScheduleEntry[]>();
  exams.forEach((e) => {
    const key = e.examDate ? formatExamDate(e.examDate) : e.day;
    if (!byDate.has(key)) byDate.set(key, []);
    byDate.get(key)!.push(e);
  });

  return (
    <div className="flex flex-col gap-3">
      {Array.from(byDate.entries()).map(([label, list]) => (
        <div key={label} className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="px-4 py-2.5 border-b border-gray-100 flex items-center gap-2">
            <CalendarDays size={15} className="text-amber-600" />
            <span className="font-semibold text-gray-800 text-sm">{label}</span>
            <span className="text-xs text-gray-400">
              {list.length} paper{list.length === 1 ? '' : 's'}
            </span>
          </div>
          <div className="divide-y divide-gray-50">
            {list.map((e) => (
              <div key={e._id} className="px-4 py-3 flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{e.subject}</p>
                  <p className="text-xs text-gray-500">{e.className}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-sm text-gray-700">{e.startTime}–{e.endTime}</p>
                  <p className="text-xs text-gray-500">
                    {e.room ? `Hall: ${e.room}` : 'Hall not set'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

const TabButton = ({
  active,
  onClick,
  icon,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ReactNode;
  label: string;
  count?: number;
}) => (
  <button
    onClick={onClick}
    className={`flex items-center gap-1.5 text-sm px-3 py-1.5 rounded-md transition-colors ${
      active ? 'bg-white text-gray-900 shadow-sm font-medium' : 'text-gray-500 hover:text-gray-700'
    }`}
  >
    {icon}
    {label}
    {count !== undefined && (
      <span className={`text-xs ${active ? 'text-gray-400' : 'text-gray-400'}`}>({count})</span>
    )}
  </button>
);

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">{label}</span>
    {children}
  </label>
);

export default Timetable;
