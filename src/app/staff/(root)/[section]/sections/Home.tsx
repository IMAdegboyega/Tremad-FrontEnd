'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { CalendarDays, Clock, BookOpen, Users } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUser } from '@/Constants/UserContext';
import {
  formatEventDate,
  isEventToday,
  timetableToScheduleEvents,
} from '@/Constants/schedule';
import {
  getTeacherTimetable,
  type TeacherTimetableResponse,
} from '@/lib/api/teacher.service';
import type { TimetableEntry } from '@/lib/api/student.service';

/** Flatten the grouped-by-day teacher timetable into a flat entry list. */
const flatten = (data: TeacherTimetableResponse | null): TimetableEntry[] => {
  if (!data?.timetableByDay) return [];
  const out: TimetableEntry[] = [];
  Object.entries(data.timetableByDay).forEach(([day, list]) => {
    (list || []).forEach((e: any) => {
      out.push({
        _id: e._id || `${day}-${e.startTime}-${e.subject}`,
        day,
        startTime: e.startTime,
        endTime: e.endTime,
        subject: e.subject,
        teacher: e.teacherName || 'You',
        room: e.room,
      });
    });
  });
  return out;
};

const Home = () => {
  const user = useUser();
  const [data, setData] = useState<TeacherTimetableResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getTeacherTimetable();
        if (!cancelled && res?.success && res.data) setData(res.data);
      } catch {
        /* soft */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const entries = useMemo(() => flatten(data), [data]);
  const events = useMemo(
    () => timetableToScheduleEvents(entries),
    [entries]
  );

  const upcoming = useMemo(() => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    return events.filter((e) => e.date >= start).slice(0, 5);
  }, [events]);

  const subjectCount = useMemo(
    () => new Set(entries.map((e) => e.subject)).size,
    [entries]
  );

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
        <Tile icon={<CalendarDays size={16} className="text-green-600" />} label="Periods / week" value={loading ? null : String(entries.length)} />
        <Tile icon={<BookOpen size={16} className="text-blue-600" />} label="Subjects" value={loading ? null : String(subjectCount)} />
        <Tile icon={<Users size={16} className="text-purple-600" />} label="Classes" value={loading ? null : String(data?.assignedClasses?.length ?? 0)} />
        <Tile icon={<Clock size={16} className="text-amber-600" />} label="Today" value={loading ? null : String(entries.filter((e) => e.day.toLowerCase() === new Date().toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase()).length)} />
      </div>

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
