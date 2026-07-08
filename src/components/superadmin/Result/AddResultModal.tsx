'use client';

import React, { useCallback, useEffect, useRef, useState } from 'react';
import { X, Plus, Trash2, ChevronDown, Loader2, Search } from 'lucide-react';
import {
  createResult,
  getStudents,
  type Student,
  type SubjectInput,
} from '@/lib/api/superAdmin.service';

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

interface SubjectRow extends SubjectInput {
  id: number;
}

interface AddResultModalProps {
  onClose: () => void;
  /** Called after a successful save. Receives the academicYear and term that were saved. */
  onSuccess: (savedAcademicYear: string, savedTerm: typeof TERMS[number]) => void;
  defaultAcademicYear?: string;
  defaultTerm?: typeof TERMS[number];
}

const emptySubject = (id: number): SubjectRow => ({
  id,
  name: '',
  scores: { firstCA: 0, secondCA: 0, exam: 0 },
});

const AddResultModal: React.FC<AddResultModalProps> = ({
  onClose,
  onSuccess,
  defaultAcademicYear = '',
  defaultTerm = 'First Term',
}) => {
  // --- Form state ---
  const [studentSearch, setStudentSearch] = useState('');
  const [studentOptions, setStudentOptions] = useState<Student[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [showStudentDropdown, setShowStudentDropdown] = useState(false);
  const [loadingStudents, setLoadingStudents] = useState(false);

  const [academicYear, setAcademicYear] = useState(defaultAcademicYear);
  const [term, setTerm] = useState<typeof TERMS[number]>(defaultTerm);
  const [className, setClassName] = useState('');
  const [subjects, setSubjects] = useState<SubjectRow[]>([emptySubject(1)]);
  const nextId = useRef(2);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const studentDropdownRef = useRef<HTMLDivElement>(null);

  // Close student dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (studentDropdownRef.current && !studentDropdownRef.current.contains(e.target as Node)) {
        setShowStudentDropdown(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch students when search changes (debounced 300ms)
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(async () => {
      setLoadingStudents(true);
      try {
        const res = await getStudents({ search: studentSearch || undefined, limit: 20 });
        if (!cancelled && res?.success && res.data) {
          // Backend returns { students: [] } — the PaginatedResponse type uses 'items'
          // but the actual /super-admin/students endpoint uses 'students'.
          const data = res.data as any;
          setStudentOptions(data.students ?? data.items ?? []);
        }
      } catch {
        // ignore
      } finally {
        if (!cancelled) setLoadingStudents(false);
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(id);
    };
  }, [studentSearch]);

  // --- Subject helpers ---
  const addSubject = () => {
    setSubjects((prev) => [...prev, emptySubject(nextId.current++)]);
  };

  const removeSubject = (id: number) => {
    setSubjects((prev) => prev.filter((s) => s.id !== id));
  };

  const updateSubjectName = (id: number, name: string) => {
    setSubjects((prev) => prev.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const updateScore = (id: number, field: keyof SubjectInput['scores'], raw: string) => {
    const max = field === 'exam' ? 60 : 20;
    const value = Math.min(max, Math.max(0, Number(raw) || 0));
    setSubjects((prev) =>
      prev.map((s) =>
        s.id === id ? { ...s, scores: { ...s.scores, [field]: value } } : s
      )
    );
  };

  const computedTotal = (s: SubjectRow) =>
    (s.scores.firstCA || 0) + (s.scores.secondCA || 0) + (s.scores.exam || 0);

  // --- Submit ---
  const handleSubmit = useCallback(async () => {
    setError('');
    console.log('[AddResult] submit clicked', { selectedStudent, academicYear, className, term, subjects });

    if (!selectedStudent) return setError('Please select a student.');
    if (!academicYear.trim()) return setError('Academic year is required (e.g. 2024/2025).');
    if (!className.trim()) return setError('Class is required.');
    if (subjects.some((s) => !s.name.trim())) return setError('Each subject must have a name.');

    console.log('[AddResult] validation passed — sending request');
    setSubmitting(true);
    try {
      const res = await createResult({
        studentId: selectedStudent._id,
        academicYear: academicYear.trim(),
        term,
        class: className.trim(),
        subjects: subjects.map(({ name, scores }) => ({ name: name.trim(), scores })),
      });
      console.log('[AddResult] response:', res);
      if (res?.success) {
        onSuccess(academicYear.trim(), term);
      } else {
        setError(res?.message || 'Failed to create result.');
      }
    } catch (err: any) {
      console.error('[AddResult] error:', err);
      setError(err?.message || 'An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  }, [selectedStudent, academicYear, term, className, subjects, onSuccess]);

  return (
    <div className='fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4'>
      <div className='bg-white rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-xl'>
        {/* Header */}
        <div className='flex items-center justify-between p-6 border-b border-gray-100'>
          <div>
            <h2 className='text-lg font-semibold text-gray-900'>Add Result</h2>
            <p className='text-xs text-gray-500 mt-0.5'>Enter subject scores for a student</p>
          </div>
          <button
            onClick={onClose}
            className='p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors'
          >
            <X className='w-5 h-5' />
          </button>
        </div>

        {/* Scrollable body */}
        <div className='overflow-y-auto flex-1 p-6 space-y-5'>
          {/* Student selector */}
          <div ref={studentDropdownRef} className='relative'>
            <label className='block text-sm font-medium text-gray-700 mb-1.5'>
              Student <span className='text-red-500'>*</span>
            </label>
            <div
              className='flex items-center gap-2 w-full px-3 py-2.5 border border-gray-200 rounded-lg bg-white cursor-text'
              onClick={() => setShowStudentDropdown(true)}
            >
              <Search className='w-4 h-4 text-gray-400 shrink-0' />
              {selectedStudent ? (
                <span className='flex-1 text-sm text-gray-900 truncate'>
                  {selectedStudent.firstName} {selectedStudent.lastName}{' '}
                  <span className='text-gray-400'>({selectedStudent.admissionNumber})</span>
                </span>
              ) : (
                <input
                  type='text'
                  className='flex-1 text-sm outline-none placeholder:text-gray-400'
                  placeholder='Search by name or admission number…'
                  value={studentSearch}
                  onChange={(e) => {
                    setStudentSearch(e.target.value);
                    setSelectedStudent(null);
                    setShowStudentDropdown(true);
                  }}
                  onFocus={() => setShowStudentDropdown(true)}
                />
              )}
              {selectedStudent && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedStudent(null);
                    setStudentSearch('');
                  }}
                  className='text-gray-400 hover:text-gray-600'
                >
                  <X className='w-3.5 h-3.5' />
                </button>
              )}
            </div>

            {showStudentDropdown && (
              <div className='absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-52 overflow-y-auto'>
                {loadingStudents ? (
                  <div className='flex items-center justify-center py-4'>
                    <Loader2 className='w-4 h-4 animate-spin text-gray-400' />
                  </div>
                ) : studentOptions.length === 0 ? (
                  <p className='py-4 text-center text-sm text-gray-400'>No students found</p>
                ) : (
                  studentOptions.map((s) => (
                    <button
                      key={s._id}
                      className='w-full text-left px-4 py-3 text-sm hover:bg-gray-50 transition-colors border-b border-gray-50 last:border-0'
                      onClick={() => {
                        setSelectedStudent(s);
                        setClassName(s.className || s.currentClass || '');
                        setShowStudentDropdown(false);
                        setStudentSearch('');
                      }}
                    >
                      <span className='font-medium text-gray-900'>
                        {s.firstName} {s.lastName}
                      </span>
                      <span className='ml-2 text-gray-400 text-xs'>{s.admissionNumber}</span>
                      {s.className && (
                        <span className='ml-2 text-gray-400 text-xs'>· {s.className}</span>
                      )}
                    </button>
                  ))
                )}
              </div>
            )}
          </div>

          {/* Academic info row */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-4'>
            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Academic Year <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                placeholder='e.g. 2024/2025'
                value={academicYear}
                onChange={(e) => setAcademicYear(e.target.value)}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Term <span className='text-red-500'>*</span>
              </label>
              <div className='relative'>
                <select
                  value={term}
                  onChange={(e) => setTerm(e.target.value as typeof TERMS[number])}
                  className='w-full appearance-none px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white pr-8'
                >
                  {TERMS.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
                <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            </div>

            <div>
              <label className='block text-sm font-medium text-gray-700 mb-1.5'>
                Class <span className='text-red-500'>*</span>
              </label>
              <input
                type='text'
                placeholder='e.g. JSS 1A'
                value={className}
                onChange={(e) => setClassName(e.target.value)}
                className='w-full px-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
              />
            </div>
          </div>

          {/* Subjects */}
          <div>
            <div className='flex items-center justify-between mb-2'>
              <label className='text-sm font-medium text-gray-700'>
                Subjects <span className='text-red-500'>*</span>
              </label>
              <button
                onClick={addSubject}
                className='flex items-center gap-1.5 text-xs text-green-700 font-medium hover:text-green-900 transition-colors'
              >
                <Plus className='w-3.5 h-3.5' />
                Add subject
              </button>
            </div>

            {/* Column header */}
            <div className='grid grid-cols-[1fr_72px_72px_72px_72px_32px] gap-2 mb-1 px-1'>
              <span className='text-xs text-gray-500'>Subject</span>
              <span className='text-xs text-gray-500 text-center'>CA1 /20</span>
              <span className='text-xs text-gray-500 text-center'>CA2 /20</span>
              <span className='text-xs text-gray-500 text-center'>Exam /60</span>
              <span className='text-xs text-gray-500 text-center'>Total</span>
              <span />
            </div>

            <div className='space-y-2'>
              {subjects.map((sub) => (
                <div key={sub.id} className='grid grid-cols-[1fr_72px_72px_72px_72px_32px] gap-2 items-center'>
                  <input
                    type='text'
                    placeholder='Subject name'
                    value={sub.name}
                    onChange={(e) => updateSubjectName(sub.id, e.target.value)}
                    className='w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    min={0}
                    max={20}
                    value={sub.scores.firstCA}
                    onChange={(e) => updateScore(sub.id, 'firstCA', e.target.value)}
                    className='w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    min={0}
                    max={20}
                    value={sub.scores.secondCA}
                    onChange={(e) => updateScore(sub.id, 'secondCA', e.target.value)}
                    className='w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                  <input
                    type='number'
                    min={0}
                    max={60}
                    value={sub.scores.exam}
                    onChange={(e) => updateScore(sub.id, 'exam', e.target.value)}
                    className='w-full px-2 py-2 border border-gray-200 rounded-lg text-sm text-center focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent'
                  />
                  <div className='flex items-center justify-center'>
                    <span className='text-sm font-semibold text-gray-800'>
                      {computedTotal(sub)}
                    </span>
                  </div>
                  <button
                    onClick={() => removeSubject(sub.id)}
                    disabled={subjects.length === 1}
                    className='flex items-center justify-center text-gray-300 hover:text-red-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed'
                  >
                    <Trash2 className='w-4 h-4' />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer — error lives here so it's always visible regardless of scroll position */}
        <div className='border-t border-gray-100'>
          {error && (
            <div className='px-6 pt-4'>
              <p className='text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-3'>
                {error}
              </p>
            </div>
          )}
          <div className='flex items-center justify-end gap-3 p-6'>
            <button
              onClick={onClose}
              className='px-5 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
            >
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting}
              className='flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors disabled:opacity-60 disabled:cursor-not-allowed'
            >
              {submitting && <Loader2 className='w-4 h-4 animate-spin' />}
              {submitting ? 'Saving…' : 'Save Result'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddResultModal;
