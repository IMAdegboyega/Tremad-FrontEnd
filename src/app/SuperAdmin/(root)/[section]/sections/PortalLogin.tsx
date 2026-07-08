'use client';

/**
 * PortalLogin — wired to real data.
 *
 * The page is kept structurally identical to its mock-driven version so the
 * existing subcomponents (StudentLogin, StaffLogin, RecentActivity) don't
 * need any prop-shape changes. Adapters map API → the mock data shapes those
 * components were built around.
 *
 * Data sources:
 *   - getStudents() → student preview rows + full-list rows
 *   - getAllStaff() → staff preview rows + full-list rows
 *   - getAuditLogs() filtered to login actions → RecentActivity feed
 *   - getAuditLogs({ userId }) → per-student / per-staff history
 *   - getDashboardOverview() → header stats
 *   - getStudent / getStaff → demographics for the detail views
 */

import React, { useCallback, useEffect, useState } from 'react';
import RecentActivity from '@/components/superadmin/PortalLogin/RecentActivity';
import StaffLogin from '@/components/superadmin/PortalLogin/StaffLogin';
import StatsCard from '@/components/superadmin/PortalLogin/StatsCard';
import StudentLogin from '@/components/superadmin/PortalLogin/StudentLogin';
import DeactivateAccountModal from '@/components/modals/Deactivate';
import DeleteAccountModal from '@/components/modals/DeleteAcount';
import ResetPasswordModal from '@/components/modals/ResetPassword';
import SendCredentialsModal from '@/components/modals/SendCredentials';
import {
  getStudents,
  getStudent,
  getAllStaff,
  getStaff,
  getAuditLogs,
  getDashboardOverview,
  type Student as ApiStudent,
  type Staff as ApiStaff,
  type AuditLog as ApiAuditLog,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// COMPONENT-SHAPE TYPES
// These match the shapes StudentLogin / StaffLogin / RecentActivity expect.
// ============================================================================

interface StudentPreview {
  fullName: string;
  studentId: string;
  username: string;
}

interface AllStudent {
  id: string;
  fullName: string;
  admissionNo: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  studentId: string;
  grade: string;
  course: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  guardianName: string;
  guardianPhone: string;
  admissionDate: string;
}

interface StaffPreview {
  fullName: string;
  staffId: string;
  username: string;
}

interface AllStaff {
  id: string;
  fullName: string;
  staffId: string;
  email: string;
  status: 'Active' | 'Inactive' | 'Suspended';
  lastLogin: string;
  department: string;
  role: string;
  phone: string;
  address: string;
  dateOfBirth: string;
  gender: string;
  emergencyContact: string;
  emergencyPhone: string;
  hireDate: string;
}

interface PersonActivity {
  id: string;
  date: string;
  time: string;
  deviceBrowser: string;
  actionType: string;
  status: 'Success' | 'Failed';
  ipAddress: string;
}

interface FeedActivity {
  name: string;
  date: string;
  time: string;
  actionType: string;
  outcome: 'Success' | 'Failed' | 'Error';
}

// ============================================================================
// SHARED HELPERS
// ============================================================================

const fullNameOf = (s: { firstName?: string; lastName?: string }) =>
  `${toTitleCase(s.firstName)} ${toTitleCase(s.lastName)}`.trim();

const formatDate = (iso?: string) =>
  iso ? new Date(iso).toLocaleDateString() : '';

const formatTime = (iso?: string) =>
  iso ? new Date(iso).toLocaleTimeString() : '';

const formatLastLogin = (iso?: string) => {
  if (!iso) return 'Never';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return 'Never';
  return `${d.toLocaleDateString()} ${d.toLocaleTimeString()}`;
};

/** Friendly action label for table rows. STUDENT_LOGIN_SUCCESS → "Login". */
const humanizeAction = (action: string): string => {
  if (!action) return '—';
  if (/LOGIN_SUCCESS$/.test(action)) return 'Login';
  if (/LOGIN_FAILED$/.test(action)) return 'Failed login';
  if (/LOGOUT$/.test(action)) return 'Logout';
  if (/PASSWORD_RESET/.test(action)) return 'Password reset';
  if (/PASSWORD_CHANGE/.test(action)) return 'Password change';
  if (/ACCOUNT_LOCKED/.test(action)) return 'Account locked';
  return action.replace(/_/g, ' ').toLowerCase();
};

/** Very rough UA parser — good enough for a table row. */
const parseUA = (ua?: string): string => {
  if (!ua) return 'Unknown';
  if (/iPhone|iPad/.test(ua)) return 'iOS · Safari';
  if (/Android/.test(ua)) {
    return /Chrome/.test(ua) ? 'Android · Chrome' : 'Android';
  }
  if (/Edg\//.test(ua)) return 'Desktop · Edge';
  if (/Chrome/.test(ua)) return 'Desktop · Chrome';
  if (/Firefox/.test(ua)) return 'Desktop · Firefox';
  if (/Safari/.test(ua)) return 'Desktop · Safari';
  return 'Unknown browser';
};

// ============================================================================
// ADAPTERS: API → component-shape
// ============================================================================

const toStudentPreview = (s: ApiStudent): StudentPreview => ({
  fullName: fullNameOf(s) || s.email,
  studentId: s.admissionNumber || s._id,
  username: s.email,
});

const toAllStudent = (s: ApiStudent): AllStudent => ({
  id: s._id,
  fullName: fullNameOf(s) || s.email,
  admissionNo: s.admissionNumber,
  email: s.email,
  status: s.isActive ? 'Active' : 'Inactive',
  lastLogin: formatLastLogin(s.lastLogin),
  studentId: s.admissionNumber || s._id,
  grade: s.className || s.currentClass || '—',
  course: s.className || '—',
  phone: s.phoneNumber || '—',
  address: s.address || '—',
  dateOfBirth: s.dateOfBirth
    ? new Date(s.dateOfBirth).toLocaleDateString()
    : '—',
  gender: s.gender || '—',
  guardianName: s.guardianName || '—',
  guardianPhone: s.guardianPhone || '—',
  admissionDate: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—',
});

const toStaffPreview = (s: ApiStaff): StaffPreview => ({
  fullName: fullNameOf(s) || s.email,
  staffId: s.teacherId || s.staffId || s._id,
  username: s.email,
});

const toAllStaff = (s: ApiStaff): AllStaff => ({
  id: s._id,
  fullName: fullNameOf(s) || s.email,
  staffId: s.teacherId || s.staffId || s._id,
  email: s.email,
  status: s.isActive ? 'Active' : 'Inactive',
  lastLogin: formatLastLogin(s.lastLogin),
  department: s.department || '—',
  role: s.position || (s.role === 'admin' ? 'Teacher / Admin' : s.role),
  phone: s.phoneNumber || s.phone || '—',
  address: s.address || '—',
  dateOfBirth: s.dateOfBirth
    ? new Date(s.dateOfBirth).toLocaleDateString()
    : '—',
  gender: s.gender || '—',
  emergencyContact: s.emergencyContact || '—',
  emergencyPhone: s.emergencyPhone || s.emergencyContact || '—',
  hireDate: s.hireDate
    ? new Date(s.hireDate).toLocaleDateString()
    : s.createdAt
    ? new Date(s.createdAt).toLocaleDateString()
    : '—',
});

const toPersonActivity = (log: ApiAuditLog): PersonActivity => ({
  id: log._id,
  date: formatDate(log.timestamp),
  time: formatTime(log.timestamp),
  deviceBrowser: parseUA(log.userAgent),
  actionType: humanizeAction(log.action),
  status: log.success ? 'Success' : 'Failed',
  ipAddress: log.ip || '—',
});

const toFeedActivity = (log: ApiAuditLog): FeedActivity => {
  // Pull the actor's name out of the populated userId reference when present.
  const actor =
    typeof log.userId === 'object' && log.userId
      ? fullNameOf(log.userId as any) ||
        (log.userId as any).email ||
        log.role
      : log.role;
  return {
    name: actor || 'Unknown',
    date: formatDate(log.timestamp),
    time: formatTime(log.timestamp),
    actionType: humanizeAction(log.action),
    outcome: log.success ? 'Success' : 'Failed',
  };
};

// ============================================================================
// PAGE
// ============================================================================

const STUDENT_LOGIN_ACTIONS = ['STUDENT_LOGIN_SUCCESS', 'STUDENT_LOGIN_FAILED'];
const STAFF_LOGIN_ACTIONS = [
  'TEACHER_LOGIN_SUCCESS',
  'TEACHER_LOGIN_FAILED',
  'SUPER_ADMIN_LOGIN_SUCCESS',
  'SUPER_ADMIN_LOGIN_FAILED',
  'SUPER_ADMIN_GOOGLE_LOGIN_SUCCESS',
];

const PortalLogin: React.FC = () => {
  // --- View state ---
  const [showAllStudents, setShowAllStudents] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAllHistory, setShowAllHistory] = useState(false);

  const [showAllStaff, setShowAllStaff] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<string | null>(null);
  const [showAllStaffHistory, setShowAllStaffHistory] = useState(false);

  const [showAllActivity, setShowAllActivity] = useState(false);

  // --- Modals ---
  const [modalAction, setModalAction] = useState<
    'reset' | 'deactivate' | 'delete' | 'send-credentials' | null
  >(null);
  // Reuse one selectedPerson because the modals only need id+name+email.
  const [selectedPerson, setSelectedPerson] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // --- Fetched data ---
  const [students, setStudents] = useState<ApiStudent[]>([]);
  const [staff, setStaff] = useState<ApiStaff[]>([]);
  const [activityLogs, setActivityLogs] = useState<ApiAuditLog[]>([]);

  const [detailStudent, setDetailStudent] = useState<ApiStudent | null>(null);
  const [detailStaff, setDetailStaff] = useState<ApiStaff | null>(null);
  const [personHistory, setPersonHistory] = useState<ApiAuditLog[]>([]);

  // --- Overview stats ---
  const [overview, setOverview] = useState<{
    totalStudents: number;
    totalStaff: number;
    totalUsers: number;
  }>({ totalStudents: 0, totalStaff: 0, totalUsers: 0 });

  // ----- Initial load -----
  const fetchLists = useCallback(async () => {
    try {
      const [studentsRes, staffRes, logsRes, overviewRes] = await Promise.all([
        getStudents({ page: 1, limit: 50 }),
        getAllStaff({ page: 1, limit: 50 }),
        getAuditLogs({ limit: 20 }),
        getDashboardOverview(),
      ]);

      if (studentsRes?.success && studentsRes.data) {
        const raw = studentsRes.data as any;
        setStudents(raw.items ?? raw.students ?? []);
      }
      if (staffRes?.success && staffRes.data) {
        const raw = staffRes.data as any;
        setStaff(raw.items ?? raw.staff ?? []);
      }
      if (logsRes?.success && logsRes.data) {
        // Filter to login-shaped actions for the activity feed. Backend
        // returns broader audit logs by default.
        const allLogs = logsRes.data.logs || [];
        const loginOnly = allLogs.filter(
          (l) =>
            /LOGIN|LOGOUT/.test(l.action) ||
            /PASSWORD_RESET|PASSWORD_CHANGE/.test(l.action)
        );
        setActivityLogs(loginOnly);
      }
      if (overviewRes?.success && overviewRes.data) {
        const totalStudents = overviewRes.data.totalStudents.value;
        const totalStaff = overviewRes.data.activeTeachers.value;
        setOverview({
          totalStudents,
          totalStaff,
          totalUsers: totalStudents + totalStaff,
        });
      }
    } catch {
      // Stays on whatever last loaded; lists will be empty if first load failed.
    }
  }, []);

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  // ----- Detail loaders -----
  useEffect(() => {
    if (!selectedStudentId) {
      setDetailStudent(null);
      setPersonHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [detail, logs] = await Promise.all([
          getStudent(selectedStudentId),
          getAuditLogs({ userId: selectedStudentId, limit: 50 }),
        ]);
        if (cancelled) return;
        if (detail?.success && detail.data) {
          const raw = detail.data as any;
          setDetailStudent(raw.student ?? raw);
        }
        if (logs?.success && logs.data) setPersonHistory(logs.data.logs || []);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedStudentId]);

  useEffect(() => {
    if (!selectedStaffId) {
      setDetailStaff(null);
      setPersonHistory([]);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const [detail, logs] = await Promise.all([
          getStaff(selectedStaffId),
          getAuditLogs({ userId: selectedStaffId, limit: 50 }),
        ]);
        if (cancelled) return;
        if (detail?.success && detail.data) {
          const raw = detail.data as any;
          setDetailStaff(raw.staff ?? raw);
        }
        if (logs?.success && logs.data) setPersonHistory(logs.data.logs || []);
      } catch {
        /* silent */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedStaffId]);

  // ----- Mapped data for components -----
  const studentPreviews = students.slice(0, 5).map(toStudentPreview);
  const allStudentsMapped = students.map(toAllStudent);
  const staffPreviews = staff.slice(0, 5).map(toStaffPreview);
  const allStaffMapped = staff.map(toAllStaff);
  const activityFeed = activityLogs.map(toFeedActivity);
  const personActivityMapped = personHistory.map(toPersonActivity);

  const selectedStudentMapped = detailStudent
    ? toAllStudent(detailStudent)
    : undefined;
  const selectedStaffMapped = detailStaff ? toAllStaff(detailStaff) : undefined;

  // ----- Modal helpers -----
  const openStudentModal = (
    studentId: string,
    action: 'reset' | 'deactivate' | 'delete' | 'send-credentials'
  ) => {
    const s = students.find((x) => x._id === studentId);
    if (!s) return;
    setSelectedPerson({ id: s._id, name: fullNameOf(s), email: s.email });
    setModalAction(action);
  };

  const openStaffModal = (
    staffId: string,
    action: 'reset' | 'deactivate' | 'delete' | 'send-credentials'
  ) => {
    const s = staff.find((x) => x._id === staffId);
    if (!s) return;
    setSelectedPerson({ id: s._id, name: fullNameOf(s), email: s.email });
    setModalAction(action);
  };

  const closeModal = () => setModalAction(null);

  const handleAfterMutation = async () => {
    // Refresh data behind the success modal so the table is current when the
    // user clicks Done.
    await fetchLists();
    // Also refresh the detail view if we're on one.
    if (selectedStudentId) {
      const refreshed = await getStudent(selectedStudentId);
      if (refreshed?.success && refreshed.data) {
        const raw = refreshed.data as any;
        setDetailStudent(raw.student ?? raw);
      } else {
        // Student was deleted — bail out of the detail view.
        setSelectedStudentId(null);
        setShowAllHistory(false);
      }
    }
    if (selectedStaffId) {
      const refreshed = await getStaff(selectedStaffId);
      if (refreshed?.success && refreshed.data) {
        const raw = refreshed.data as any;
        setDetailStaff(raw.staff ?? raw);
      } else {
        setSelectedStaffId(null);
        setShowAllStaffHistory(false);
      }
    }
  };

  // ============================================================================
  // RENDER: shared modals
  // ============================================================================
  const renderModals = () => (
    <>
      <DeactivateAccountModal
        isOpen={modalAction === 'deactivate'}
        onClose={closeModal}
        studentId={selectedPerson?.id ?? ''}
        studentName={selectedPerson?.name ?? ''}
        onDeactivated={handleAfterMutation}
      />
      <DeleteAccountModal
        isOpen={modalAction === 'delete'}
        onClose={closeModal}
        studentId={selectedPerson?.id ?? ''}
        studentName={selectedPerson?.name ?? ''}
        onDeleted={handleAfterMutation}
      />
      <ResetPasswordModal
        isOpen={modalAction === 'reset'}
        onClose={closeModal}
        studentId={selectedPerson?.id ?? ''}
        studentName={selectedPerson?.name ?? ''}
        studentEmail={selectedPerson?.email ?? ''}
      />
      <SendCredentialsModal
        isOpen={modalAction === 'send-credentials'}
        onClose={closeModal}
        studentId={selectedPerson?.id ?? ''}
        studentName={selectedPerson?.name ?? ''}
        studentEmail={selectedPerson?.email}
      />
    </>
  );

  // ============================================================================
  // RENDER: handlers required by detail views
  // ============================================================================
  const studentDetailHandlers = {
    onResetPassword: () =>
      selectedStudentId && openStudentModal(selectedStudentId, 'reset'),
    onDeactivateAccount: () =>
      selectedStudentId && openStudentModal(selectedStudentId, 'deactivate'),
    onSendCredentials: () =>
      selectedStudentId &&
      openStudentModal(selectedStudentId, 'send-credentials'),
    onDeleteAccount: () =>
      selectedStudentId && openStudentModal(selectedStudentId, 'delete'),
  };

  const staffDetailHandlers = {
    onResetPassword: () =>
      selectedStaffId && openStaffModal(selectedStaffId, 'reset'),
    onDeactivateAccount: () =>
      selectedStaffId && openStaffModal(selectedStaffId, 'deactivate'),
    onSendCredentials: () =>
      selectedStaffId && openStaffModal(selectedStaffId, 'send-credentials'),
    onDeleteAccount: () =>
      selectedStaffId && openStaffModal(selectedStaffId, 'delete'),
  };

  // ============================================================================
  // VIEW MODES (unchanged structure from the mock-driven version)
  // ============================================================================

  // Recent Activity — full view
  if (showAllActivity) {
    return (
      <>
        <RecentActivity
          activities={activityFeed}
          isFullView={true}
          onBack={() => setShowAllActivity(false)}
        />
        {renderModals()}
      </>
    );
  }

  // Staff history view
  if (showAllStaffHistory && selectedStaffMapped) {
    return (
      <>
        <StaffLogin
          staff={staffPreviews}
          allStaff={allStaffMapped}
          selectedStaff={selectedStaffMapped}
          staffActivities={personActivityMapped}
          isHistoryView={true}
          onBack={() => setShowAllStaffHistory(false)}
          {...staffDetailHandlers}
        />
        {renderModals()}
      </>
    );
  }

  // Staff detail view
  if (selectedStaffId && selectedStaffMapped) {
    return (
      <>
        <StaffLogin
          staff={staffPreviews}
          allStaff={allStaffMapped}
          selectedStaff={selectedStaffMapped}
          staffActivities={personActivityMapped}
          isDetailView={true}
          onBack={() => {
            setSelectedStaffId(null);
            setShowAllStaffHistory(false);
          }}
          onViewAllHistory={() => setShowAllStaffHistory(true)}
          {...staffDetailHandlers}
        />
        {renderModals()}
      </>
    );
  }

  // Staff full list view
  if (showAllStaff) {
    return (
      <>
        <StaffLogin
          staff={staffPreviews}
          allStaff={allStaffMapped}
          isFullView={true}
          onBack={() => {
            setShowAllStaff(false);
            setSelectedStaffId(null);
            setShowAllStaffHistory(false);
          }}
          onViewDetails={(staffId) => setSelectedStaffId(staffId)}
          onQuickAction={openStaffModal}
        />
        {renderModals()}
      </>
    );
  }

  // Student history view
  if (showAllHistory && selectedStudentMapped) {
    return (
      <>
        <StudentLogin
          students={studentPreviews}
          allStudents={allStudentsMapped}
          selectedStudent={selectedStudentMapped}
          studentActivities={personActivityMapped}
          isHistoryView={true}
          onBack={() => setShowAllHistory(false)}
          {...studentDetailHandlers}
        />
        {renderModals()}
      </>
    );
  }

  // Student detail view
  if (selectedStudentId && selectedStudentMapped) {
    return (
      <>
        <StudentLogin
          students={studentPreviews}
          allStudents={allStudentsMapped}
          selectedStudent={selectedStudentMapped}
          studentActivities={personActivityMapped}
          isDetailView={true}
          onBack={() => {
            setSelectedStudentId(null);
            setShowAllHistory(false);
          }}
          onViewAllHistory={() => setShowAllHistory(true)}
          {...studentDetailHandlers}
        />
        {renderModals()}
      </>
    );
  }

  // Student full list view
  if (showAllStudents) {
    return (
      <>
        <StudentLogin
          students={studentPreviews}
          allStudents={allStudentsMapped}
          isFullView={true}
          onBack={() => {
            setShowAllStudents(false);
            setSelectedStudentId(null);
            setShowAllHistory(false);
          }}
          onViewDetails={(studentId) => setSelectedStudentId(studentId)}
          onQuickAction={openStudentModal}
        />
        {renderModals()}
      </>
    );
  }

  // Normal portal login home view
  return (
    <>
      <div className='min-h-full bg-gray-50'>
        <header className='border-b border-gray-200 px-3 sm:px-6 md:px-8 py-3 sm:py-4'>
          <div className='flex flex-col sm:flex-row justify-between sm:items-center gap-3'>
            <div>
              <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
                Portal login
              </h1>
              <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                Manage students and staff login details here
              </p>
            </div>
            <button className='bg-primary-green hover:bg-primary-green-hover text-white px-3 sm:px-4 py-2.5 rounded-lg text-xs sm:text-sm font-medium flex items-center justify-center gap-2 min-h-[44px]'>
              <svg
                className='w-4 h-4'
                fill='none'
                stroke='currentColor'
                viewBox='0 0 24 24'
              >
                <path
                  strokeLinecap='round'
                  strokeLinejoin='round'
                  strokeWidth={2}
                  d='M12 4v16m8-8H4'
                />
              </svg>
              <span className='hidden sm:inline'>Create new user login</span>
              <span className='sm:hidden'>New user</span>
            </button>
          </div>
        </header>

        <main className='px-2 sm:px-4 md:px-8 py-4 sm:py-6'>
          {/* Stats Cards */}
          <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 md:mb-8'>
            <StatsCard
              title='Total users'
              count={overview.totalUsers}
              icon='/icon/message.svg'
              change={`${students.length + staff.length} loaded on this page`}
              isPositive={true}
            />
            <StatsCard
              title='Total students'
              count={overview.totalStudents}
              icon='/icon/message.svg'
              change={`${students.length} loaded on this page`}
              isPositive={true}
            />
            <StatsCard
              title='Total staff'
              count={overview.totalStaff}
              icon='/icon/activity.svg'
              change={`${staff.length} loaded on this page`}
              isPositive={true}
            />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6 mb-4 md:mb-8'>
            <StudentLogin
              students={studentPreviews}
              allStudents={allStudentsMapped}
              isFullView={false}
              onViewAll={() => setShowAllStudents(true)}
            />
            <StaffLogin
              staff={staffPreviews}
              allStaff={allStaffMapped}
              isFullView={false}
              onViewAll={() => setShowAllStaff(true)}
            />
          </div>

          <RecentActivity
            activities={activityFeed}
            isFullView={false}
            onViewAll={() => setShowAllActivity(true)}
          />
        </main>
      </div>
      {renderModals()}
    </>
  );
};

export default PortalLogin;
