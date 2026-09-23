'use client';

/**
 * Inline edit for a student, shown in place of the demographics grid on the
 * student detail panel (Admin → Student management → View details → Edit).
 *
 * The staff side has had this since 1.7; students never did, which is why the
 * demographics grid's empty state read "Edit the student profile to add
 * details" while offering no way to do it. This is that missing half.
 *
 * A separate component rather than more state inside StudentManagement.tsx —
 * that file is already past a thousand lines and carries the table, the
 * filters, four modals and the history view.
 *
 * ---------------------------------------------------------------------------
 * ONE NAMING TRAP, WORTH READING BEFORE EDITING THIS FILE
 * ---------------------------------------------------------------------------
 * The class is stored on the User model as `currentClass`, but travels to
 * clients as `className`. So this form READS `student.className` and WRITES
 * `currentClass`. Sending `className` back would be accepted, ignored, and
 * report success — the class simply wouldn't change.
 *
 * Every field this sends must appear in EDITABLE_STUDENT_FIELDS in
 * superAdmin/student.management.controller.js. Anything else is dropped in
 * silence by the allowlist, which looks identical to a save that worked.
 */

import React, { useMemo, useState } from 'react';
import { Loader2, Save, X } from 'lucide-react';
import {
  GRADE_LEVELS,
  CLASS_SECTIONS,
  gradeOf,
  normaliseClassName,
} from '@/Constants/classes';
import { updateStudent, type Student } from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';

interface Props {
  student: Student;
  onCancel: () => void;
  /** Called after a successful save so the panel and list behind can refresh. */
  onSaved: () => void | Promise<void>;
}

/** `<input type="date">` wants yyyy-mm-dd; the API sends an ISO timestamp. */
const toDateInput = (value?: string): string => {
  if (!value) return '';
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

/**
 * Split a stored class into its grade and section.
 * "JSS 1 A" -> { grade: 'JSS 1', section: 'A' }
 *
 * Normalise BEFORE slicing. gradeOf() rewrites legacy names on the way through
 * ("Primary 4 B" -> "Basic 4"), so slicing the raw input by the length of the
 * returned grade takes the wrong number of characters whenever the rewrite
 * changed the length — 'Primary 4 B'.slice(7) is ' 4 B', not ' B', and the
 * section is silently lost. An unmigrated student would have opened in this
 * form showing no section and saved as "Basic 4", quietly dropping it.
 */
const splitClass = (className?: string) => {
  const value = normaliseClassName(className);
  const grade = gradeOf(value);
  const rest = value.slice(grade.length).trim();
  return {
    grade: GRADE_LEVELS.includes(grade as (typeof GRADE_LEVELS)[number])
      ? grade
      : '',
    section: CLASS_SECTIONS.includes(rest as (typeof CLASS_SECTIONS)[number])
      ? rest
      : '',
  };
};

const StudentEditForm: React.FC<Props> = ({ student, onCancel, onSaved }) => {
  const initial = useMemo(() => {
    const { grade, section } = splitClass(student.className || student.currentClass);
    return {
      firstName: student.firstName || '',
      lastName: student.lastName || '',
      grade,
      section,
      lin: student.lin || '',
      phoneNumber: student.phoneNumber || '',
      dateOfBirth: toDateInput(student.dateOfBirth),
      gender: (student.gender || '').toLowerCase(),
      address: student.address || '',
      city: student.city || '',
      state: student.state || '',
      country: student.country || '',
      guardianName: student.guardianName || '',
      guardianRelationship: student.guardianRelationship || '',
      guardianPhone: student.guardianPhone || '',
      guardianEmail: student.guardianEmail || '',
      emergencyContact: student.emergencyContact || '',
    };
  }, [student]);

  const [form, setForm] = useState(initial);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const set = (key: keyof typeof form, value: string) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!form.firstName.trim() || !form.lastName.trim()) {
      setError('First and last name are both required.');
      return;
    }
    // A section without a grade would save as " A", which matches no timetable.
    if (form.section && !form.grade) {
      setError('Pick a grade before choosing a section.');
      return;
    }

    setSaving(true);
    try {
      const res = await updateStudent(student._id, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        // `currentClass` — see the note at the top of this file.
        currentClass: [form.grade, form.section].filter(Boolean).join(' '),
        // Sent even when blank: '' is how an admin clears a LIN, and the
        // backend $unsets it rather than writing an empty string (the unique
        // index is sparse, which skips absent fields but not empty ones).
        lin: form.lin.trim(),
        phoneNumber: form.phoneNumber.trim(),
        dateOfBirth: form.dateOfBirth || undefined,
        gender: form.gender || undefined,
        address: form.address.trim(),
        city: form.city.trim(),
        state: form.state.trim(),
        country: form.country.trim(),
        guardianName: form.guardianName.trim(),
        guardianRelationship: form.guardianRelationship.trim(),
        guardianPhone: form.guardianPhone.trim(),
        guardianEmail: form.guardianEmail.trim(),
        emergencyContact: form.emergencyContact.trim(),
      });

      if (res?.success) {
        await onSaved();
      } else {
        setError(res?.message || 'Could not save the changes.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the changes.'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={save} className="mb-4 space-y-4">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">
          {error}
        </div>
      )}

      <Section title="Identity">
        <Field label="First name" required>
          <input
            value={form.firstName}
            onChange={(e) => set('firstName', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Last name" required>
          <input
            value={form.lastName}
            onChange={(e) => set('lastName', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Grade">
          <select
            value={form.grade}
            onChange={(e) => set('grade', e.target.value)}
            className={input}
          >
            <option value="">—</option>
            {GRADE_LEVELS.map((g) => (
              <option key={g} value={g}>
                {g}
              </option>
            ))}
          </select>
        </Field>
        <Field label="Section">
          <select
            value={form.section}
            onChange={(e) => set('section', e.target.value)}
            className={input}
          >
            <option value="">—</option>
            {CLASS_SECTIONS.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </Field>
        <Field label="LIN" hint="Government-issued; blank until received">
          <input
            value={form.lin}
            onChange={(e) => set('lin', e.target.value)}
            className={input}
          />
        </Field>
      </Section>

      <Section title="Demographics">
        <Field label="Phone number">
          <input
            value={form.phoneNumber}
            onChange={(e) => set('phoneNumber', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Date of birth">
          <input
            type="date"
            value={form.dateOfBirth}
            onChange={(e) => set('dateOfBirth', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Gender">
          <select
            value={form.gender}
            onChange={(e) => set('gender', e.target.value)}
            className={input}
          >
            <option value="">—</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
          </select>
        </Field>
        <Field label="Address">
          <input
            value={form.address}
            onChange={(e) => set('address', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="City">
          <input
            value={form.city}
            onChange={(e) => set('city', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="State">
          <input
            value={form.state}
            onChange={(e) => set('state', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Country">
          <input
            value={form.country}
            onChange={(e) => set('country', e.target.value)}
            className={input}
          />
        </Field>
      </Section>

      <Section title="Guardian">
        <Field label="Guardian name">
          <input
            value={form.guardianName}
            onChange={(e) => set('guardianName', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Relationship">
          <input
            value={form.guardianRelationship}
            onChange={(e) => set('guardianRelationship', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Guardian phone">
          <input
            value={form.guardianPhone}
            onChange={(e) => set('guardianPhone', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Guardian email">
          <input
            type="email"
            value={form.guardianEmail}
            onChange={(e) => set('guardianEmail', e.target.value)}
            className={input}
          />
        </Field>
        <Field label="Emergency contact">
          <input
            value={form.emergencyContact}
            onChange={(e) => set('emergencyContact', e.target.value)}
            className={input}
          />
        </Field>
      </Section>

      <div className="flex items-center gap-2">
        <button
          type="submit"
          disabled={saving}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50"
        >
          {saving ? (
            <Loader2 size={15} className="animate-spin" />
          ) : (
            <Save size={15} />
          )}
          {saving ? 'Saving…' : 'Save changes'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <X size={15} /> Cancel
        </button>
      </div>
    </form>
  );
};

const input =
  'w-full text-sm border border-gray-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <fieldset>
    <legend className="text-xs font-medium text-gray-500 uppercase tracking-wide mb-2">
      {title}
    </legend>
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>
  </fieldset>
);

const Field: React.FC<{
  label: string;
  required?: boolean;
  hint?: string;
  children: React.ReactNode;
}> = ({ label, required, hint, children }) => (
  <label className="block">
    <span className="text-xs text-gray-500 mb-1 block">
      {label}
      {required && <span className="text-red-500"> *</span>}
      {hint && <span className="text-gray-400"> — {hint}</span>}
    </span>
    {children}
  </label>
);

export default StudentEditForm;
