'use client';

import React, { useEffect, useState } from 'react';
import { BookOpen, GraduationCap, Lock, Mail, Phone, ShieldCheck } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { NIGERIAN_STATES, getLGAsForState } from '@/Constants/NigeriaStates';
import {
  getTeacherProfile,
  updateTeacherProfile,
  type TeacherProfile,
  type EditableTeacherProfile,
} from '@/lib/api/teacher.service';
import { getApiErrorMessage } from '@/lib/api/client';
import UserAvatar from '@/components/shared/UserAvatar';

const GENDERS = ['Male', 'Female'];
const RELATIONSHIPS = ['Spouse', 'Parent', 'Sibling', 'Child', 'Relative', 'Friend', 'Other'];

type Form = EditableTeacherProfile;

const toDateInput = (v?: string | null) => {
  if (!v) return '';
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10);
};

const Profile = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [form, setForm] = useState<Form>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await getTeacherProfile();
      if (res?.success && res.data) {
        const p = res.data;
        setProfile(p);
        setForm({
          phoneNumber: p.phoneNumber,
          address: p.address,
          city: p.city,
          state: p.state,
          country: p.country,
          dateOfBirth: toDateInput(p.dateOfBirth),
          gender: p.gender,
          emergencyContact: p.emergencyContact,
          qualifications: p.qualifications,
          specializations: p.specializations,
          bio: p.bio,
          nextOfKin: p.nextOfKin ?? {},
        });
      } else {
        setError(res?.message || 'Could not load your profile.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load your profile.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const setKin = (key: string, value: string) =>
    setForm((f) => ({ ...f, nextOfKin: { ...(f.nextOfKin ?? {}), [key]: value } }));

  const save = async () => {
    setSaving(true);
    setBanner('');
    setError('');
    try {
      const res = await updateTeacherProfile(form);
      if (res?.success) {
        setEditing(false);
        setBanner('Profile updated.');
        await load();
      } else {
        setError(res?.message || 'Could not update your profile.');
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not update your profile.'));
    } finally {
      setSaving(false);
    }
  };

  const fullName =
    `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim() || profile?.name || '';

  if (loading) {
    return (
      <div className="flex flex-col gap-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-32 rounded-2xl" />
        <Skeleton className="h-28 rounded-2xl" />
        <Skeleton className="h-64 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between gap-3">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile</h1>
        {editing ? (
          <div className="flex gap-2">
            <button
              onClick={() => { setEditing(false); load(); }}
              className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={save}
              disabled={saving}
              className="text-sm px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        ) : (
          <button
            onClick={() => { setEditing(true); setBanner(''); }}
            className="text-sm px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800"
          >
            Edit
          </button>
        )}
      </div>

      {banner && (
        <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">{banner}</div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-2.5">{error}</div>
      )}

      {/* Identity — read-only, set by the school */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <UserAvatar
            user={profile}
            className="w-16 h-16"
            fallbackClassName="bg-green-100"
            textClassName="text-green-700 text-xl font-semibold"
          />
          <div className="min-w-0 flex-1">
            <p className="text-lg font-semibold text-gray-900">{fullName || '—'}</p>
            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-gray-500 mt-1">
              <span className="flex items-center gap-1.5 truncate">
                <Mail size={14} /> {profile?.email || '—'}
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck size={14} /> Staff ID: {profile?.teacherId || '—'}
              </span>
              {profile?.phoneNumber && (
                <span className="flex items-center gap-1.5">
                  <Phone size={14} /> {profile.phoneNumber}
                </span>
              )}
            </div>
            {profile?.department && (
              <p className="text-xs text-gray-400 mt-1">{profile.department}</p>
            )}
          </div>
        </div>
        <p className="text-xs text-gray-400 mt-4 flex items-center gap-1.5">
          <Lock size={12} /> Your name, staff ID and email are set by the school. Ask an admin to change them.
        </p>
      </div>

      {/* Teaching assignment — read-only here; only an admin can change it */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-3">Teaching assignment</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
              <GraduationCap size={13} /> Classes
            </p>
            {(profile?.assignedClasses?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile!.assignedClasses!.map((c) => (
                  <span key={c} className="text-xs bg-green-50 text-green-700 px-2.5 py-1 rounded-full">{c}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                No classes assigned yet — ask an admin to assign yours. Until then your
                students, results and timetable will be empty.
              </p>
            )}
          </div>
          <div>
            <p className="text-xs text-gray-500 mb-2 flex items-center gap-1.5">
              <BookOpen size={13} /> Subjects
            </p>
            {(profile?.subjects?.length ?? 0) > 0 ? (
              <div className="flex flex-wrap gap-1.5">
                {profile!.subjects!.map((s) => (
                  <span key={s} className="text-xs bg-gray-100 text-gray-600 px-2.5 py-1 rounded-full">{s}</span>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-400">No subjects listed.</p>
            )}
          </div>
        </div>
      </div>

      {/* Personal details — editable */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Personal details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <Row label="Phone number" editing={editing} value={profile?.phoneNumber}>
            <input value={form.phoneNumber || ''} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} className={inputCls} />
          </Row>
          <Row
            label="Date of birth"
            editing={editing}
            value={profile?.dateOfBirth ? new Date(profile.dateOfBirth).toLocaleDateString('en-GB') : ''}
          >
            <input type="date" value={form.dateOfBirth || ''} onChange={(e) => setForm({ ...form, dateOfBirth: e.target.value })} className={inputCls} />
          </Row>
          <Row label="Gender" editing={editing} value={profile?.gender}>
            <select value={form.gender || ''} onChange={(e) => setForm({ ...form, gender: e.target.value })} className={inputCls}>
              <option value="">Select</option>
              {GENDERS.map((g) => <option key={g} value={g}>{g}</option>)}
            </select>
          </Row>
          <Row label="State of origin" editing={editing} value={profile?.state}>
            <select value={form.state || ''} onChange={(e) => setForm({ ...form, state: e.target.value })} className={inputCls}>
              <option value="">Select a state</option>
              {NIGERIAN_STATES.map((s) => <option key={s} value={s}>{s}</option>)}
            </select>
          </Row>
          <Row label="Local government" editing={editing} value={profile?.city}>
            <select value={form.city || ''} onChange={(e) => setForm({ ...form, city: e.target.value })} className={inputCls} disabled={!form.state}>
              <option value="">{form.state ? 'Select an LGA' : 'Pick a state first'}</option>
              {getLGAsForState(form.state).map((l) => (
                <option key={l} value={l}>{l}</option>
              ))}
            </select>
          </Row>
          <Row label="Address" editing={editing} value={profile?.address}>
            <input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} className={inputCls} />
          </Row>
          <Row label="Qualifications" editing={editing} value={profile?.qualifications}>
            <input value={form.qualifications || ''} onChange={(e) => setForm({ ...form, qualifications: e.target.value })} className={inputCls} />
          </Row>
          <Row label="Specializations" editing={editing} value={profile?.specializations}>
            <input value={form.specializations || ''} onChange={(e) => setForm({ ...form, specializations: e.target.value })} className={inputCls} />
          </Row>
          <Row label="Emergency contact" editing={editing} value={profile?.emergencyContact}>
            <input value={form.emergencyContact || ''} onChange={(e) => setForm({ ...form, emergencyContact: e.target.value })} className={inputCls} />
          </Row>
          <div className="sm:col-span-2 lg:col-span-3">
            <p className="text-xs text-gray-500 mb-1">Bio</p>
            {editing ? (
              <textarea value={form.bio || ''} onChange={(e) => setForm({ ...form, bio: e.target.value })} rows={3} className={inputCls} />
            ) : (
              <p className="text-sm text-gray-800">{profile?.bio || '—'}</p>
            )}
          </div>
        </div>
      </div>

      {/* Next of kin — editable */}
      <div className="bg-white rounded-2xl shadow-sm p-5">
        <h2 className="text-base font-semibold text-gray-900 mb-4">Next of kin</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Row label="Name" editing={editing} value={profile?.nextOfKin?.name}>
            <input value={form.nextOfKin?.name || ''} onChange={(e) => setKin('name', e.target.value)} className={inputCls} />
          </Row>
          <Row label="Relationship" editing={editing} value={profile?.nextOfKin?.relationship}>
            <select value={form.nextOfKin?.relationship || ''} onChange={(e) => setKin('relationship', e.target.value)} className={inputCls}>
              <option value="">Select</option>
              {RELATIONSHIPS.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </Row>
          <Row label="Phone" editing={editing} value={profile?.nextOfKin?.phone}>
            <input value={form.nextOfKin?.phone || ''} onChange={(e) => setKin('phone', e.target.value)} className={inputCls} />
          </Row>
          <Row label="Email" editing={editing} value={profile?.nextOfKin?.email}>
            <input value={form.nextOfKin?.email || ''} onChange={(e) => setKin('email', e.target.value)} className={inputCls} />
          </Row>
        </div>
      </div>
    </div>
  );
};

const Row = ({
  label,
  value,
  editing,
  children,
}: {
  label: string;
  value?: string | null;
  editing: boolean;
  children: React.ReactNode;
}) => (
  <div>
    <p className="text-xs text-gray-500 mb-1">{label}</p>
    {editing ? children : <p className="text-sm text-gray-800">{value || '—'}</p>}
  </div>
);

const inputCls =
  'w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30 focus:border-green-500 disabled:bg-gray-50 disabled:text-gray-400';

export default Profile;
