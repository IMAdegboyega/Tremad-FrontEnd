'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Users, Bell } from 'lucide-react';
import Link from 'next/link';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/Constants/UserContext';
import {
  formatEventDate,
  isEventToday,
  timetableToScheduleEvents,
} from '@/Constants/schedule';
import { formatExamDate } from '@/Constants/examDates';
import {
  getTeacherTimetable,
  getStaffNotifications,
  type TeacherTimetableResponse,
  type StaffNotification,
} from '@/lib/api/teacher.service';
import type { TimetableEntry } from '@/lib/api/student.service';

const WEEKDAYS = [
  'Sunday',
  'Monday',
  'Tuesday',
  'Wednesday',
  'Thursday',
  'Friday',
  'Saturday',
];

const Home = () => {
  const user = useUser();
  const [data, setData] = useState<TeacherTimetableResponse | null>(null);
  const [alerts, setAlerts] = useState<StaffNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      // Notifications are a nice-to-have on this screen — don't let a failure
      // there blank out the schedule.
      const [tt, notes] = await Promise.allSettled([
        getTeacherTimetable(),
        getStaffNotifications({ limit: 5 }),
      ]);
      if (cancelled) return;
      if (tt.status === 'fulfilled' && tt.value?.success && tt.value.data) {
        setData(tt.value.data);
      }
      if (notes.status === 'fulfilled' && notes.value?.success && notes.value.data) {
        setAlerts(notes.value.data.notifications || []);
        setUnread(notes.value.data.unreadCount || 0);
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const lessons = useMemo(() => data?.lessons ?? [], [data]);
  const exams = useMemo(() => data?.exams ?? [], [data]);

  /** The weekly lessons, projected onto real dates for the next 7 days. */
  const events = useMemo(() => {
    const entries: TimetableEntry[] = lessons.map((e) => ({
      _id: e._id,
      day: e.day,
      startTime: e.startTime,
      endTime: e.endTime,
      subject: e.subject,
      teacher: 'You',
      room: e.room || undefined,
    }));
    return timetableToScheduleEvents(entries);
  }, [lessons]);

  const upcoming = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return events.filter((e) => e.date >= start).slice(0, 5);
  }, [events]);

  /** Only exams still ahead of us. */
  const upcomingExams = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return exams
      .filter((e) => !e.examDate || new Date(e.examDate) >= today)
      .slice(0, 4);
  }, [exams]);

  const subjectCount = useMemo(
    () => new Set(lessons.map((e) => e.subject)).size,
    [lessons]
  );

  const todayName = WEEKDAYS[new Date().getDay()];
  const todayCount = lessons.filter((e) => e.day === todayName).length;

  return (
    <div className="flex flex-col gap-4">
      {/* Welcome banner */}
      <div className="bg-green-800 text-white rounded-2xl p-5 sm:p-6">
        <h1 className="text-xl sm:text-2xl font-semibold">
          Welcome{user?.name ? `, ${user.name.split(' ')[0]}` : ''} 👋
        </h1>
        <p className="text-green-100 text-sm mt-1">
          Here&apos;s what&apos;s coming up in your teaching schedule.
        </p>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Tile icon={<CalendarDays size={16} className="text-green-600" />} label="Periods / week" value={loading ? null : String(lessons.length)} />
        <Tile icon={<BookOpen size={16} className="text-blue-600" />} label="Subjects" value={loading ? null : String(subjectCount)} />
        <Tile icon={<Users size={16} className="text-purple-600" />} label="Classes" value={loading ? null : String(data?.assignedClasses?.length ?? 0)} />
        <Tile icon={<Clock size={16} className="text-amber-600" />} label="Today" value={loading ? null : String(todayCount)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Upcoming activities */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 mb-3">
            Upcoming Activities
          </h2>
          {loading ? (
            <div className="space-y-2">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-14 w-full rounded-lg" />
              ))}
            </div>
          ) : upcoming.length === 0 ? (
            <p className="text-sm text-gray-400 py-6 text-center">
              No upcoming classes. Your timetable is empty.
            </p>
          ) : (
            <div className="space-y-2">
              {upcoming.map((event) => (
                <div key={event.id} className="flex gap-3 items-start p-2 rounded-lg hover:bg-gray-50">
                  <div className={`w-10 h-10 ${event.color.split(' ')[0]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <div className={`w-5 h-5 ${event.color.split(' ')[1]}`}>{event.icon}</div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900">{event.subject}</p>
                    <p className="text-xs text-gray-500">
                      {formatEventDate(event.date)} • {event.startTime} - {event.endTime}
                      {isEventToday(event.date) && (
                        <span className="ml-2 text-green-600 font-medium">Today</span>
                      )}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex flex-col gap-4">
          {/* Exams I'm invigilating */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <h2 className="text-base font-semibold text-gray-900 mb-3">
              Exams You&apos;re Invigilating
            </h2>
            {loading ? (
              <Skeleton className="h-14 w-full rounded-lg" />
            ) : upcomingExams.length === 0 ? (
              <p className="text-sm text-gray-400 py-4 text-center">
                Nothing scheduled.
              </p>
            ) : (
              <div className="space-y-2">
                {upcomingExams.map((e) => (
                  <div key={e._id} className="flex items-center justify-between gap-3 p-2 rounded-lg hover:bg-gray-50">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">{e.subject}</p>
                      <p className="text-xs text-gray-500">
                        {e.className}
                        {e.examDate ? ` • ${formatExamDate(e.examDate)}` : ''}
                      </p>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-600">{e.startTime}–{e.endTime}</p>
                      {e.room && <p className="text-xs text-gray-400">Hall: {e.room}</p>}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Recent notifications */}
          <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-base font-semibold text-gray-900">
                Notifications
                {unread > 0 && (
                  <span className="ml-2 text-xs bg-green-700 text-white rounded-full px-2 py-0.5 align-middle">
                    {unread}
                  </span>
                )}
              </h2>
              <Link href="/staff/notification" className="text-xs text-green-700 hover:underline">
                See all
              </Link>
            </div>
            {loading ? (
              <Skeleton className="h-14 w-full rounded-lg" />
            ) : alerts.length === 0 ? (
              <div className="py-4 text-center">
                <Bell size={22} className="mx-auto text-gray-300 mb-1" />
                <p className="text-sm text-gray-400">You&apos;re all caught up.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 4).map((n) => (
                  <div key={n.id} className="flex gap-2 items-start p-2 rounded-lg hover:bg-gray-50">
                    {!n.isRead && <span className="w-1.5 h-1.5 rounded-full bg-green-600 mt-1.5 shrink-0" />}
                    <div className="min-w-0">
                      <p className={`text-sm truncate ${n.isRead ? 'text-gray-700' : 'font-medium text-gray-900'}`}>
                        {n.title}
                      </p>
                      <p className="text-xs text-gray-500 truncate">{n.message}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Tile = ({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string | null;
}) => (
  <div className="bg-white rounded-xl p-3.5 shadow-sm">
    <div className="flex items-center gap-1.5 mb-1">
      {icon}
      <span className="text-xs text-gray-500">{label}</span>
    </div>
    {value === null ? <Skeleton className="h-6 w-10" /> : <p className="text-xl font-bold text-gray-900">{value}</p>}
  </div>
);

export default Home;
