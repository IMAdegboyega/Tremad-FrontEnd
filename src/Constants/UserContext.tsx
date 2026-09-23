// context/UserContext.tsx
'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  ReactNode,
} from 'react';
import { getUser as getStoredUser } from '@/lib/api/client';
import { getProfile, StudentProfile } from '@/lib/api/student.service';
import { getTeacherProfile } from '@/lib/api/teacher.service';
import { divisionOf, DIVISION_LABELS, type Division } from '@/Constants/classes';

//
// 1. Types
//
type TermData = {
  attendance: {
    value: number;
    maxValue: number;
    label: string;
  };
  position: {
    rank: string;
    percentage: number;
  };
};

export interface Course {
  id: number | string;
  subject: string;
  department: string;
  teacher: string;
  icon: string;
  iconBg?: string;
}

// types/notification.ts (kept for downstream imports; not populated with mock data anymore)
export type Notification = {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  icon?: string;
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
};

export type User = {
  firstName: string;
  lastName: string;
  name: string;
  id: string;
  email: string;
  role?: string;
  grade?: string;
  term: string;
  avatarUrl: string;

  /**
   * Which half of the school this student belongs to — 'college' for JSS 1
   * through SS 3, 'school' for everything below.
   *
   * Undefined for staff and super-admins, deliberately: they aren't in a class,
   * and a default of 'school' would quietly rebrand the admin portal. Anything
   * reading this must treat undefined as "not a student" rather than as a
   * missing value to fill in.
   *
   * Replaces `classCategory`, which was declared, rendered by WelcomeBanner,
   * and hardcoded to undefined — so it never displayed anything.
   */
  division?: Division;

  /** What that division is called in the UI: TREMAD COLLEGE / TREMAD SCHOOL. */
  divisionLabel?: string;
  courses: Course[];
  terms: Record<string, TermData>;
  profile: StudentProfile | null;
  loading: boolean;
  refresh: () => Promise<void>;
  setTerm: (term: string) => void;
};

//
// 2. Department Images (for dynamic department → image mapping)
//
export const departmentImages: Record<string, string> = {
  'Science Department': '/img/Algebra.svg',
  'Math Department': '/img/calculus.svg',
  'English Department': '/img/english.svg',
  'Arts Department': '/img/arts.svg',
};

export const fallbackDepartmentImage = '/img/default-department.png';

// Empty scaffolding — real per-term stats should come from backend endpoints once they exist.
const emptyTermData: TermData = {
  attendance: { value: 0, maxValue: 0, label: 'Attendance' },
  position: { rank: '-', percentage: 0 },
};

const emptyTerms: Record<string, TermData> = {
  '1st Term': emptyTermData,
  '2nd Term': emptyTermData,
  '3rd Term': emptyTermData,
};

//
// 3. Context Setup
//
const UserContext = createContext<User | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [term, setTerm] = useState('1st Term');
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  // Teacher (role 'admin') profile — kept in a loose separate slot so it doesn't
  // clash with the StudentProfile type on `profile`.
  const [teacherProfile, setTeacherProfile] = useState<any>(null);
  const [storedUser, setStoredUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    const stored = getStoredUser();
    setStoredUser(stored);

    // Students fetch /student/profile; teachers fetch /admin/profile. SuperAdmin
    // has no profile endpoint — it renders straight from the login payload.
    if (stored?.role === 'student') {
      setLoading(true);
      try {
        const res = await getProfile();
        if (res?.success && res.data) setProfile(res.data);
      } catch {
        // Swallow — UI falls back to whatever is in localStorage.
      } finally {
        setLoading(false);
      }
      return;
    }

    if (stored?.role === 'admin') {
      setLoading(true);
      try {
        const res = await getTeacherProfile();
        if (res?.success && res.data) setTeacherProfile(res.data);
      } catch {
        // Swallow — fall back to the cached login payload.
      } finally {
        setLoading(false);
      }
      return;
    }

    setLoading(false);
  }, []);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const value = useMemo<User>(() => {
    const firstName =
      profile?.firstName ?? teacherProfile?.firstName ?? storedUser?.firstName ?? '';
    const lastName =
      profile?.lastName ?? teacherProfile?.lastName ?? storedUser?.lastName ?? '';
    const fullName =
      `${firstName} ${lastName}`.trim() ||
      storedUser?.name ||
      storedUser?.email ||
      '';
    const admissionNumber =
      profile?.admissionNumber ??
      teacherProfile?.teacherId ??
      storedUser?.admissionNumber ??
      '';
    const email =
      profile?.email ?? teacherProfile?.email ?? storedUser?.email ?? '';
    // Source of truth for the avatar: student profile (Cloudinary) first,
    // then the login payload cached in localStorage — that's where the
    // Google `picture` URL lands for super admins. `/img/avatar.jpg` stays
    // as the last-resort fallback so old consumers don't crash.
    const avatarUrl =
      profile?.profileImage ||
      profile?.profilePicture ||
      teacherProfile?.profileImage ||
      teacherProfile?.profilePicture ||
      storedUser?.profileImage ||
      storedUser?.profilePicture ||
      '/img/avatar.jpg';
    // Falls back to the login payload, which already carries `className`.
    // Without that fallback the sidebar paints TREMAD SCHOOL, then flips to
    // TREMAD COLLEGE once /student/profile resolves — a visible flicker on
    // every page load for exactly the students the label matters to.
    const grade = profile?.className ?? storedUser?.className ?? undefined;
    const role = storedUser?.role;

    // Only students have a division. Staff and super-admins keep undefined so
    // their shells fall back to the neutral brand — see the type above.
    const division = role === 'student' ? divisionOf(grade) : undefined;

    return {
      firstName,
      lastName,
      name: fullName,
      id: admissionNumber,
      email,
      role,
      grade,
      division,
      divisionLabel: division ? DIVISION_LABELS[division] : undefined,
      avatarUrl,
      term,
      setTerm,
      terms: emptyTerms,
      courses: [],
      profile,
      loading,
      refresh,
    };
  }, [profile, teacherProfile, storedUser, term, loading, refresh]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

//
// 4. Hook for consuming user context
//
export const useUser = () => useContext(UserContext);
