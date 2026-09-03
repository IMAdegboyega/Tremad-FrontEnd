'use client';

import React, { useEffect, useState } from 'react';
import { Plus, Search } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getAssignedStudents,
  submitStudentCreationRequest,
  type AssignedStudent,
} from '@/lib/api/teacher.service';
import type { CreateStudentData } from '@/lib/api/superAdmin.service';

const StudentManagement = () => {
  const [students, setStudents] = useState<AssignedStudent[]>([]);
  const [loading, setLoading] = useState(true);
  const [errored, setErrored] = useState(false);
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState<CreateStudentData>({
    email: '',
    firstName: '',
    lastName: '',
    className: '',
  });

  useEffect(() => {
    const id = setTimeout(() => setSearch(searchInput.trim()), 400);
    return () => clearTimeout(id);
  }, [searchInput]);

  const load = async () => {
    setLoading(true);
    try {
      const res = await getAssignedStudents({ search: search || undefined, limit: 50 });
      if (res?.success && res.data) {
        setStudents((res.data as any).students || []);
        setErrored(false);
      } else {
        setErrored(true);
      }
    } catch {
      setErrored(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [search]);

  const submit = async () => {
    setFormError('');
    if (!form.email.trim() || !form.firstName.trim() || !form.lastName.trim() || !form.className.trim()) {
      setFormError('Email, first name, last name and class are required.');
      return;
    }
    setSaving(true);
    try {
      const res = await submitStudentCreationRequest(form);
      if (res?.success) {
        setOpen(false);
        setForm({ email: '', firstName: '', lastName: '', className: '' });
        setBanner('Student creation request sent to the admin for approval.');
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
          <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Students</h1>
          <p className="text-sm text-gray-500">Students in your classes.</p>
        </div>
        <button
          onClick={() => { setFormError(''); setOpen(true); }}
          className="flex items-center gap-1.5 text-sm font-medium bg-green-700 text-white px-3 py-2 rounded-lg hover:bg-green-800"
        >
          <Plus size={16} /> Request new student
        </button>
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">{banner}</div>
      )}

      <div className="bg-white rounded-xl shadow-sm">
        <div className="p-4 border-b border-gray-100">
          <div className="relative max-w-xs">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search students"
              className="pl-9 pr-3 py-2 text-sm border border-gray-200 rounded-lg w-full focus:outline-none focus:ring-2 focus:ring-green-500/30"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-gray-500 border-b border-gray-100">
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Admission No.</th>
                <th className="px-4 py-3 font-medium">Class</th>
                <th className="px-4 py-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-gray-50">
                    {Array.from({ length: 4 }).map((_, j) => (
                      <td key={j} className="px-4 py-3"><Skeleton className="h-4 w-24" /></td>
                    ))}
                  </tr>
                ))
              ) : errored ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">Couldn&apos;t load students.</td></tr>
              ) : students.length === 0 ? (
                <tr><td colSpan={4} className="px-4 py-10 text-center text-gray-400">No students found.</td></tr>
              ) : (
                students.map((s) => (
                  <tr key={s._id} className="border-b border-gray-50 hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <p className="font-medium text-gray-900">{`${s.firstName || ''} ${s.lastName || ''}`.trim() || s.email || '—'}</p>
                      <p className="text-xs text-gray-500">{s.email}</p>
                    </td>
                    <td className="px-4 py-3 text-gray-600">{s.admissionNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{s.className || '—'}</td>
                    <td className="px-4 py-3">
                      {s.isActive === false ? (
                        <span className="text-xs text-gray-400">Inactive</span>
                      ) : (
                        <span className="text-xs font-medium text-green-700">Active</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Request new student modal */}
      <Dialog open={open} onOpenChange={(o) => !o && setOpen(false)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Request a new student</DialogTitle>
          </DialogHeader>
          <div className="space-y-3 py-1">
            <div className="grid grid-cols-2 gap-2">
              <Field label="First name">
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} className={inputCls} />
              </Field>
              <Field label="Last name">
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} className={inputCls} />
              </Field>
            </div>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
            </Field>
            <Field label="Class">
              <input value={form.className} onChange={(e) => setForm({ ...form, className: e.target.value })} placeholder="e.g. JSS1A" className={inputCls} />
            </Field>
            <p className="text-xs text-gray-400">
              This is submitted to the admin for approval — the student is created once approved.
            </p>
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

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Field = ({ label, children }: { label: string; children: React.ReactNode }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">{label}</span>
    {children}
  </label>
);

export default StudentManagement;
