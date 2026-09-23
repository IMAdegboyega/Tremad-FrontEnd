'use client';

/**
 * Staff detail panel (Admin → Staff management → View details).
 *
 * Mirrors the student detail flow: profile, assignments, next of kin, and a
 * gated temporary-password reveal. Editing matters more than it looks —
 * `assignedClasses` is what scopes a teacher's whole portal (their students,
 * their result entry, their timetable), and staff created before that field
 * existed have an empty array, so this is the only way to fix them.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  ArrowLeft,
  Check,
  Copy,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  MapPin,
  Pencil,
  Phone,
  RotateCcw,
  Save,
  Trash2,
  UserCheck,
  UserX,
  X,
} from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { GRADE_LEVELS } from '@/Constants/classes';
import { getSubjects } from '@/lib/api/curriculum.service';
import DeactivateAccountModal from '@/components/modals/Deactivate';
import DeleteAccountModal from '@/components/modals/DeleteAcount';
import ResetPasswordModal from '@/components/modals/ResetPassword';
import {
  getStaff,
  getStaffTempPassword,
  reactivateUser,
  setClassTeacher,
  updateStaff,
  type ClassTeacherConflict,
  type Staff,
} from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';
import UserAvatar from '@/components/shared/UserAvatar';
import ClassTeacherBadge from '@/components/shared/ClassTeacherBadge';

interface Props {
  staffId: string;
  onBack: () => void;
  /** Called after a successful save so the list behind can refresh. */
  onSaved?: () => void;
}

const fullName = (s: Staff) =>
  `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email || 'Unnamed staff';

const StaffDetail: React.FC<Props> = ({ staffId, onBack, onSaved }) => {
  const [staff, setStaff] = useState<Staff | null>(null);
  // From the catalogue rather than a hardcoded array — see AddStaff.tsx, which
  // held an identical copy of the same 21 names.
  const [subjectOptions, setSubjectOptions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState('');

  // Danger-zone / credential actions, each confirmed in its own modal.
  const [action, setAction] = useState<'deactivate' | 'delete' | 'reset' | null>(null);
  const [busy, setBusy] = useState(false);
  // Bumped after a reset so the reveal below remounts and re-fetches — it
  // caches the fetched password, so otherwise it would show the stale one.
  const [credentialNonce, setCredentialNonce] = useState(0);

  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    phoneNumber: '',
    department: '',
    address: '',
    city: '',
    state: '',
    subjects: [] as string[],
    assignedClasses: [] as string[],
    isActive: true,
  });

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getStaff(staffId);
      if (res?.success && res.data) {
        // The backend wraps it as { staff } — tolerate either shape.
        const doc = ((res.data as unknown as { staff?: Staff }).staff ??
          res.data) as Staff;
        setStaff(doc);
        setForm({
          firstName: doc.firstName || '',
          lastName: doc.lastName || '',
          phoneNumber: doc.phoneNumber || doc.phone || '',
          department: doc.department || '',
          address: doc.address || '',
          city: doc.city || '',
          state: doc.state || '',
          subjects: doc.subjects || [],
          assignedClasses: doc.assignedClasses || [],
          isActive: doc.isActive !== false,
        });
      } else {
        setError(res?.message || 'Could not load this staff member.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load this staff member.'));
    } finally {
      setLoading(false);
    }
  }, [staffId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    let cancelled = false;
    getSubjects({ kind: 'subject' })
      .then((res) => {
        if (!cancelled && res?.success && res.data) {
          setSubjectOptions(res.data.subjects.map((x) => x.name));
        }
      })
      .catch(() => {
        // Non-fatal: the picker is empty, the rest of the panel still works.
      });
    return () => {
      cancelled = true;
    };
  }, []);

  // Restoring access isn't destructive, so it doesn't get a confirmation step.
  const reactivate = async () => {
    setBusy(true);
    setError('');
    try {
      const res = await reactivateUser(staffId);
      if (res?.success) {
        setSaved('Account reactivated.');
        await load();
        onSaved?.();
      } else {
        setError(res?.message || 'Could not reactivate the account.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reactivate the account.'));
    } finally {
      setBusy(false);
    }
  };

  const toggleIn = (key: 'subjects' | 'assignedClasses', value: string) => {
    setForm((f) => ({
      ...f,
      [key]: f[key].includes(value)
        ? f[key].filter((v) => v !== value)
        : [...f[key], value],
    }));
  };

  const save = async () => {
    setSaving(true);
    setError('');
    setSaved('');
    try {
      const res = await updateStaff(staffId, {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        phoneNumber: form.phoneNumber.trim() || undefined,
        department: form.department.trim() || undefined,
        address: form.address.trim() || undefined,
        city: form.city.trim() || undefined,
        state: form.state.trim() || undefined,
        subjects: form.subjects,
        assignedClasses: form.assignedClasses,
        isActive: form.isActive,
      });
      if (res?.success) {
        setEditing(false);
        setSaved('Changes saved.');
        await load();
        onSaved?.();
      } else {
        setError(res?.message || 'Could not save the changes.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not save the changes.'));
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4">
        <Skeleton className="h-9 w-40" />
        <Skeleton className="h-40 rounded-xl" />
        <Skeleton className="h-56 rounded-xl" />
      </div>
    );
  }

  if (!staff) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 mb-4 hover:text-gray-900">
          <ArrowLeft size={16} /> Back to staff
        </button>
        <div className="bg-white rounded-xl p-10 text-center text-gray-500 border border-gray-100">
          {error || 'Staff member not found.'}
        </div>
      </div>
    );
  }

  const name = fullName(staff);

  return (
    <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button onClick={onBack} className="flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 w-fit">
          <ArrowLeft size={16} /> Back to staff
        </button>
        {editing ? (
          <div className="flex items-center gap-2">
            <button
              onClick={() => { setEditing(false); load(); }}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              <X size={15} /> Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-primary-green text-white hover:bg-primary-green-hover disabled:opacity-50"
            >
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setSaved(''); }}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-fit"
          >
            <Pencil size={15} /> Edit profile
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>
      )}
      {saved && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">{saved}</div>
      )}

      {/* Identity card */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <div className="flex items-start gap-4">
          <UserAvatar
            user={staff}
            className="w-14 h-14 sm:w-16 sm:h-16"
            textClassName="text-lg font-semibold text-gray-600"
          />
          <div className="min-w-0 flex-1">
            {editing ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-2">
                <input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} placeholder="First name" className={inputCls} />
                <input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} placeholder="Last name" className={inputCls} />
              </div>
            ) : (
              <h1 className="text-lg sm:text-xl font-semibold text-gray-900 flex items-center gap-1.5 min-w-0">
                <span className="truncate">{name}</span>
                {staff.classTeacherOf && (
                  <ClassTeacherBadge
                    grade={staff.classTeacherOf}
                    size={18}
                    className="text-primary-green"
                  />
                )}
              </h1>
            )}
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1.5">
                <KeyRound size={14} /> {staff.teacherId || staff.staffId || '—'}
              </span>
              <span className="flex items-center gap-1.5 truncate">
                <Mail size={14} /> {staff.email}
              </span>
              {(staff.phoneNumber || staff.phone) && !editing && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {staff.phoneNumber || staff.phone}
                </span>
              )}
            </div>
            <div className="mt-3 flex items-center gap-2">
              {editing ? (
                <label className="flex items-center gap-2 text-sm text-gray-600">
                  <input
                    type="checkbox"
                    checked={form.isActive}
                    onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                    className="rounded border-gray-300"
                  />
                  Account active
                </label>
              ) : (
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                  staff.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                }`}>
                  <span className={`w-1.5 h-1.5 rounded-full ${staff.isActive ? 'bg-green-600' : 'bg-red-600'}`} />
                  {staff.isActive ? 'Active' : 'Inactive'}
                </span>
              )}
            </div>

            {!editing && (
              <ClassTeacherControl
                staff={staff}
                onChanged={async () => {
                  await load();
                  onSaved?.();
                }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Teaching assignment — the field that actually gates their portal */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900">Teaching assignment</h2>
        <p className="text-xs text-gray-500 mb-4">
          A grade covers all of its sections — assigning &ldquo;JSS 1&rdquo; gives them JSS 1 A through E.
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Classes</p>
            {editing ? (
              <div className="flex flex-wrap gap-1.5">
                {GRADE_LEVELS.map((g) => (
                  <Chip key={g} label={g} active={form.assignedClasses.includes(g)} onClick={() => toggleIn('assignedClasses', g)} />
                ))}
              </div>
            ) : (staff.assignedClasses?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {staff.assignedClasses!.map((c) => (
                  <span key={c} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No classes assigned — this teacher sees an empty portal until you assign some.
              </p>
            )}
          </div>

          <div>
            <p className="text-xs font-medium text-gray-500 mb-2">Subjects</p>
            {editing ? (
              <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto">
                {subjectOptions.map((s) => (
                  <Chip key={s} label={s} active={form.subjects.includes(s)} onClick={() => toggleIn('subjects', s)} />
                ))}
              </div>
            ) : (staff.subjects?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {staff.subjects!.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No subjects listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal details */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Detail label="Department" editing={editing} value={staff.department} onChange={(v) => setForm({ ...form, department: v })} formValue={form.department} />
          <Detail label="Phone" editing={editing} value={staff.phoneNumber || staff.phone} onChange={(v) => setForm({ ...form, phoneNumber: v })} formValue={form.phoneNumber} />
          <Detail label="State of origin" editing={editing} value={staff.state} onChange={(v) => setForm({ ...form, state: v })} formValue={form.state} />
          <Detail label="Local government" editing={editing} value={staff.city} onChange={(v) => setForm({ ...form, city: v })} formValue={form.city} />
          <Detail label="Address" editing={editing} value={staff.address} onChange={(v) => setForm({ ...form, address: v })} formValue={form.address} />
          <Static label="Gender" value={staff.gender} />
          <Static label="Date of birth" value={staff.dateOfBirth ? new Date(staff.dateOfBirth).toLocaleDateString('en-GB') : undefined} />
          <Static label="Joined" value={staff.createdAt ? new Date(staff.createdAt).toLocaleDateString('en-GB') : undefined} />
          <Static label="Last login" value={staff.lastLogin ? new Date(staff.lastLogin).toLocaleString('en-GB') : 'Never'} />
        </div>

        {staff.nextOfKin && (staff.nextOfKin.name || staff.nextOfKin.phone) && (
          <div className="mt-5 pt-5 border-t border-gray-100">
            <h3 className="text-sm font-semibold text-gray-900 mb-3 flex items-center gap-1.5">
              <MapPin size={14} className="text-gray-400" /> Next of kin
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Static label="Name" value={staff.nextOfKin.name} />
              <Static label="Relationship" value={staff.nextOfKin.relationship} />
              <Static label="Phone" value={staff.nextOfKin.phone} />
              <Static label="Email" value={staff.nextOfKin.email} />
            </div>
          </div>
        )}
      </div>

      {/* Credentials */}
      <div className="bg-white rounded-xl border border-gray-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-gray-900">Login credentials</h2>
        <p className="text-xs text-gray-500 mb-4">
          They can sign in with either their email or their staff ID. Every reveal below is logged.
        </p>
        <div className="flex flex-col sm:flex-row sm:items-end gap-4">
          <div className="flex-1">
            <TempPasswordReveal key={credentialNonce} staffId={staffId} />
          </div>
          <button
            onClick={() => setAction('reset')}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 w-fit"
          >
            <RotateCcw size={15} /> Reset password
          </button>
        </div>
        <p className="text-xs text-gray-400 mt-3">
          Resetting issues a brand-new temporary password and forces a change at their next sign-in.
        </p>
      </div>

      {/* Danger zone */}
      <div className="bg-white rounded-xl border border-red-100 p-4 sm:p-6">
        <h2 className="text-base font-semibold text-red-700">Danger zone</h2>
        <p className="text-xs text-gray-500 mb-4">
          Deactivating is reversible. Deleting is not offered as a hard delete — the record is
          kept so results, payments and audit logs still resolve.
        </p>

        <div className="flex flex-col sm:flex-row gap-3">
          {staff.isActive ? (
            <ZoneRow
              title="Deactivate this account"
              body="They stay in the list but can't sign in until reactivated."
              button={
                <button
                  onClick={() => setAction('deactivate')}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-red-200 text-red-700 hover:bg-red-50 shrink-0"
                >
                  <UserX size={15} /> Deactivate
                </button>
              }
            />
          ) : (
            <ZoneRow
              title="This account is deactivated"
              body="They currently can't sign in. Reactivating restores access immediately."
              button={
                <button
                  onClick={reactivate}
                  disabled={busy}
                  className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 shrink-0 disabled:opacity-50"
                >
                  <UserCheck size={15} /> {busy ? 'Reactivating…' : 'Reactivate'}
                </button>
              }
            />
          )}

          <ZoneRow
            title="Delete this account"
            body="Removes them from the staff list and ends every active session."
            button={
              <button
                onClick={() => setAction('delete')}
                className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 shrink-0"
              >
                <Trash2 size={15} /> Delete
              </button>
            }
          />
        </div>
      </div>

      <ResetPasswordModal
        isOpen={action === 'reset'}
        onClose={() => { setAction(null); setCredentialNonce((n) => n + 1); }}
        studentId={staffId}
        studentName={name}
        studentEmail={staff.email}
        subjectNoun="staff member"
      />

      <DeactivateAccountModal
        isOpen={action === 'deactivate'}
        onClose={() => setAction(null)}
        studentId={staffId}
        studentName={name}
        subjectNoun="staff member"
        onDeactivated={() => { load(); onSaved?.(); }}
      />

      <DeleteAccountModal
        isOpen={action === 'delete'}
        onClose={() => setAction(null)}
        studentId={staffId}
        studentName={name}
        subjectNoun="staff member"
        // The record is gone from the list — there's nothing left to show here.
        onDeleted={() => { onSaved?.(); onBack(); }}
      />
    </div>
  );
};

const ZoneRow = ({
  title,
  body,
  button,
}: {
  title: string;
  body: string;
  button: React.ReactNode;
}) => (
  <div className="flex-1 flex items-center justify-between gap-3 border border-gray-100 rounded-lg px-4 py-3">
    <div className="min-w-0">
      <p className="text-sm font-medium text-gray-900">{title}</p>
      <p className="text-xs text-gray-500">{body}</p>
    </div>
    {button}
  </div>
);

/** Reveal the auto-generated password — fetched on demand, never with the list. */
const TempPasswordReveal: React.FC<{ staffId: string }> = ({ staffId }) => {
  const [revealed, setRevealed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fetched, setFetched] = useState(false);
  const [password, setPassword] = useState<string | null>(null);
  const [unavailable, setUnavailable] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setRevealed(false);
    setFetched(false);
    setPassword(null);
    setUnavailable(null);
    setError('');
    setCopied(false);
  }, [staffId]);

  const toggle = async () => {
    if (revealed) {
      setRevealed(false);
      return;
    }

    // Already fetched once — just show it again, no second round trip.
    if (fetched) {
      setRevealed(true);
      return;
    }

    setLoading(true);
    setError('');
    try {
      const res = await getStaffTempPassword(staffId);
      if (res?.success && res.data) {
        if (res.data.available && res.data.tempPassword) {
          setPassword(res.data.tempPassword);
        } else {
          setUnavailable(res.data.message || 'This staff member has set their own password.');
        }
        setFetched(true);
        setRevealed(true);
      } else {
        setError(res?.message || 'Could not fetch the password.');
      }
    } catch (err: any) {
      // A 401 here means the admin's own session lapsed, not that anything is
      // wrong with this staff member. The client wipes the token on any 401,
      // so a second click would otherwise report the confusing "No token
      // provided" — say what actually happened instead.
      setError(
        err?.status === 401
          ? 'Your session expired. Sign in again to reveal this.'
          : getApiErrorMessage(err, 'Could not fetch the password.')
      );
    } finally {
      setLoading(false);
    }
    // NOTE: `revealed` is deliberately NOT set on failure — flipping the button
    // to "Hide" over an empty field made a failed fetch look like a blank
    // password.
  };

  const copy = async () => {
    if (!password) return;
    try {
      await navigator.clipboard.writeText(password);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      /* clipboard can be blocked — the value is on screen anyway */
    }
  };

  return (
    <div>
      <p className="text-xs font-medium text-gray-500 mb-1.5">Temporary password</p>
      <div className="flex items-center gap-2 flex-wrap">
        <code className="text-sm bg-gray-50 border border-gray-200 rounded-lg px-3 py-2 min-w-[180px] text-gray-800">
          {loading
            ? 'Loading…'
            : revealed
              ? password ?? '—'
              : '••••••••••'}
        </code>
        <button
          onClick={toggle}
          disabled={loading}
          className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          {revealed ? <EyeOff size={15} /> : <Eye size={15} />}
          {revealed ? 'Hide' : 'Reveal'}
        </button>
        {revealed && password && (
          <button
            onClick={copy}
            className="flex items-center gap-1.5 text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50"
          >
            {copied ? <Check size={15} className="text-green-600" /> : <Copy size={15} />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        )}
      </div>
      {revealed && unavailable && (
        <p className="text-sm text-gray-500 mt-2">{unavailable}</p>
      )}
      {error && <p className="text-sm text-red-600 mt-2">{error}</p>}
    </div>
  );
};

const Chip = ({ label, active, onClick }: { label: string; active: boolean; onClick: () => void }) => (
  <button
    type="button"
    onClick={onClick}
    className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
      active
        ? 'bg-primary-green text-white border-primary-green'
        : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
    }`}
  >
    {label}
  </button>
);

const Static = ({ label, value }: { label: string; value?: string | null }) => (
  <div>
    <p className="text-xs text-gray-500">{label}</p>
    <p className="text-sm text-gray-900 mt-0.5">{value || '—'}</p>
  </div>
);

const Detail = ({
  label,
  value,
  editing,
  formValue,
  onChange,
}: {
  label: string;
  value?: string | null;
  editing: boolean;
  formValue: string;
  onChange: (v: string) => void;
}) => (
  <div>
    <p className="text-xs text-gray-500 mb-0.5">{label}</p>
    {editing ? (
      <input value={formValue} onChange={(e) => onChange(e.target.value)} className={inputCls} />
    ) : (
      <p className="text-sm text-gray-900">{value || '—'}</p>
    )}
  </div>
);

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500';

/**
 * "Class teacher" toggle for one staff member.
 *
 * Reads as a switch plus, when on, which grade. Only grades they're actually
 * assigned to are offered — being form teacher of a class you don't teach is
 * a data-entry mistake every time, and the backend rejects it anyway.
 *
 * THE CONFIRMATION IS NOT DECORATIVE. A grade has exactly one class teacher,
 * so taking one takes it FROM somebody. The server answers 409 with the
 * current holder's name rather than just refusing, and that name is what the
 * dialog shows — a generic "are you sure?" would hide the only fact that
 * matters. Releasing gets a confirmation too, since it leaves the grade with
 * nobody to sign its report cards.
 */
const ClassTeacherControl: React.FC<{
  staff: Staff;
  onChanged: () => Promise<void> | void;
}> = ({ staff, onChanged }) => {
  const held = staff.classTeacherOf || '';
  const classes = staff.assignedClasses || [];

  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  /** What we're about to do, pending confirmation. */
  const [pending, setPending] = useState<
    | { kind: 'assign'; grade: string; conflict?: ClassTeacherConflict }
    | { kind: 'release' }
    | null
  >(null);

  const apply = async (grade: string | null, force: boolean) => {
    setBusy(true);
    setError('');
    try {
      const res = await setClassTeacher(staff._id, grade, force);
      if (res?.success) {
        setPending(null);
        await onChanged();
        return;
      }
      setError(res?.message || 'Could not change that.');
    } catch (err: any) {
      // 409 carries the current holder, which turns the warning from "are you
      // sure" into "this is whose class you are taking".
      const conflict: ClassTeacherConflict | undefined =
        err?.data?.conflict ?? err?.response?.data?.data?.conflict;
      if (err?.status === 409 && conflict) {
        setPending({ kind: 'assign', grade: conflict.grade, conflict });
      } else {
        setError(getApiErrorMessage(err, 'Could not change that.'));
      }
    } finally {
      setBusy(false);
    }
  };

  const start = (grade: string) => {
    if (!grade) {
      setPending({ kind: 'release' });
      return;
    }
    // Ask the server first: it knows whether anyone holds this grade, and its
    // 409 is what fills in the dialog.
    apply(grade, false);
  };

  if (!classes.length && !held) {
    return (
      <p className="mt-3 text-xs text-gray-400">
        Assign a class before making them a class teacher.
      </p>
    );
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          role="switch"
          aria-checked={Boolean(held)}
          disabled={busy}
          onClick={() => (held ? start('') : start(classes[0]))}
          className={`relative inline-flex h-6 w-11 shrink-0 rounded-full transition-colors disabled:opacity-50 ${
            held ? 'bg-primary-green' : 'bg-gray-200'
          }`}
        >
          <span
            className={`inline-block h-5 w-5 mt-0.5 rounded-full bg-white transition-transform ${
              held ? 'translate-x-[22px]' : 'translate-x-0.5'
            }`}
          />
        </button>

        <span className="text-sm text-gray-700">
          {held ? 'Class teacher' : 'Not a class teacher'}
        </span>

        {held && (
          <select
            value={held}
            disabled={busy}
            onChange={(e) => start(e.target.value)}
            className="text-sm border border-gray-200 rounded-lg px-2 py-1.5 bg-white focus:outline-none focus:ring-2 focus:ring-green-500/30 disabled:opacity-50"
          >
            {/* The held grade is listed even if it somehow isn't in their
                assigned classes, so the select can never show a blank. */}
            {[...new Set([held, ...classes])].map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        )}

        {busy && <Loader2 size={15} className="animate-spin text-gray-400" />}
      </div>

      {error && <p className="mt-2 text-xs text-red-600">{error}</p>}

      {pending && (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 p-3">
          {pending.kind === 'release' ? (
            <p className="text-sm text-amber-900">
              Remove {staff.firstName || 'this staff member'} as class teacher
              of <strong>{held}</strong>? That grade will have no class teacher
              until someone else is assigned, and nobody to sign its report
              cards.
            </p>
          ) : (
            <p className="text-sm text-amber-900">
              <strong>{pending.conflict?.grade}</strong> is currently held by{' '}
              <strong>{pending.conflict?.holderName}</strong>. Confirming moves
              it to {staff.firstName || 'this staff member'} and removes it from
              them.
            </p>
          )}
          <div className="mt-2 flex gap-2">
            <button
              onClick={() =>
                pending.kind === 'release'
                  ? apply(null, false)
                  : apply(pending.grade, true)
              }
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-lg bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
            >
              {pending.kind === 'release' ? 'Remove' : 'Reassign'}
            </button>
            <button
              onClick={() => setPending(null)}
              disabled={busy}
              className="text-xs px-3 py-1.5 rounded-lg border border-amber-300 text-amber-900 hover:bg-amber-100 disabled:opacity-50"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffDetail;
