'use client';

import React, { useEffect, useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getTeacherProfile,
  updateTeacherProfile,
  type TeacherProfile,
} from '@/lib/api/teacher.service';

type Editable = Pick<
  TeacherProfile,
  'phoneNumber' | 'address' | 'bio' | 'qualifications' | 'specializations'
>;

const EDITABLE_FIELDS: Array<{ key: keyof Editable; label: string; textarea?: boolean }> = [
  { key: 'phoneNumber', label: 'Phone number' },
  { key: 'address', label: 'Address' },
  { key: 'qualifications', label: 'Qualifications' },
  { key: 'specializations', label: 'Specializations' },
  { key: 'bio', label: 'Bio', textarea: true },
];

const Profile = () => {
  const [profile, setProfile] = useState<TeacherProfile | null>(null);
  const [form, setForm] = useState<Editable>({});
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [banner, setBanner] = useState('');

  const load = async () => {
    setLoading(true);
    try {
      const res = await getTeacherProfile();
      if (res?.success && res.data) {
        setProfile(res.data);
        setForm({
          phoneNumber: res.data.phoneNumber,
          address: res.data.address,
          qualifications: res.data.qualifications,
          specializations: res.data.specializations,
          bio: res.data.bio,
        });
      }
    } catch {
      /* soft */
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const save = async () => {
    setSaving(true);
    setBanner('');
    try {
      const res = await updateTeacherProfile(form);
      if (res?.success) {
        setEditing(false);
        setBanner('Profile updated.');
        await load();
      }
    } catch {
      setBanner('Could not update profile.');
    } finally {
      setSaving(false);
    }
  };

  const fullName = `${profile?.firstName || ''} ${profile?.lastName || ''}`.trim();

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Profile</h1>
        {!loading && (
          editing ? (
            <div className="flex gap-2">
              <button onClick={() => { setEditing(false); load(); }} className="text-sm px-3 py-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50">Cancel</button>
              <button onClick={save} disabled={saving} className="text-sm px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800 disabled:opacity-50">{saving ? 'Saving…' : 'Save'}</button>
            </div>
          ) : (
            <button onClick={() => setEditing(true)} className="text-sm px-3 py-2 rounded-lg bg-green-700 text-white hover:bg-green-800">Edit</button>
          )
        )}
      </div>

      {banner && <div className="bg-green-50 border border-green-200 text-green-800 text-sm rounded-lg px-4 py-2.5">{banner}</div>}

      <div className="bg-white rounded-2xl shadow-sm p-5">
        {loading ? (
          <div className="space-y-3">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : (
          <>
            {/* Identity (read-only) */}
            <div className="flex items-center gap-4 pb-4 border-b border-gray-100 mb-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center text-green-700 text-lg font-semibold">
                {fullName.charAt(0).toUpperCase() || 'T'}
              </div>
              <div>
                <p className="font-semibold text-gray-900">{fullName || '—'}</p>
                <p className="text-sm text-gray-500">{profile?.email}</p>
                <p className="text-xs text-gray-400">Teacher ID: {profile?.teacherId || '—'}</p>
              </div>
            </div>

            {/* Editable fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {EDITABLE_FIELDS.map((f) => (
                <div key={f.key} className={f.textarea ? 'sm:col-span-2' : ''}>
                  <label className="text-xs text-gray-500 mb-1 block">{f.label}</label>
                  {editing ? (
                    f.textarea ? (
                      <textarea
                        value={(form[f.key] as string) || ''}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        rows={3}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      />
                    ) : (
                      <input
                        value={(form[f.key] as string) || ''}
                        onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                        className="w-full text-sm border border-gray-200 rounded-lg px-2.5 py-2 focus:outline-none focus:ring-2 focus:ring-green-500/30"
                      />
                    )
                  ) : (
                    <p className="text-sm text-gray-800">{(profile?.[f.key] as string) || '—'}</p>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Profile;
