'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, Info } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTeacherTimetable,
  type TeacherTimetableResponse,
} from '@/lib/api/teacher.service';

/**
 * Staff Result Management.
 *
 * Shows the classes/subjects the teacher is responsible for. Result uploads are
 * an approval-gated action: they're submitted to the SuperAdmin and applied on
 * approval. (Upload submission UI is a follow-up — execution for results is
 * deferred this pass.)
 */
const ResultManagement = () => {
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

  const classes = data?.assignedClasses || [];

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Result Management</h1>
        <p className="text-sm text-gray-500">Your classes and subjects.</p>
      </div>

      <div className="flex items-start gap-2 bg-blue-50 border border-blue-200 text-blue-800 text-sm rounded-lg px-4 py-3">
        <Info size={16} className="mt-0.5 shrink-0" />
        <span>Results you upload are sent to the admin for approval before they&apos;re published.</span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[0, 1, 2].map((i) => <Skeleton key={i} className="h-28 rounded-xl" />)}
        </div>
      ) : classes.length === 0 ? (
        <div className="bg-white rounded-xl p-8 text-center text-gray-400 shadow-sm">
          You aren&apos;t assigned to any classes yet.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {classes.map((c) => (
            <div key={c._id} className="bg-white rounded-xl shadow-sm p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-9 h-9 rounded-lg bg-green-100 flex items-center justify-center">
                  <BookOpen size={18} className="text-green-700" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900">{c.name}</p>
                  {c.section && <p className="text-xs text-gray-500">{c.section}</p>}
                </div>
              </div>
              {c.subjects && c.subjects.length > 0 ? (
                <div className="flex flex-wrap gap-1.5">
                  {c.subjects.map((s, i) => (
                    <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                      {s.name}
                    </span>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400">No subjects listed.</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultManagement;
