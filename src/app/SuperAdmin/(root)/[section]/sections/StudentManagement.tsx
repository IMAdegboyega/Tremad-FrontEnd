'use client';

/**
 * StudentManagement — wired to real data.
 *
 * Replaces the previous mock-array implementation with:
 *  - getStudents({ page, search, className, status }) for the paginated table
 *  - getDashboardOverview() for the header stats (totalStudents + change)
 *  - getStudent(id) for the detail view
 *  - getAuditLogs({ userId, limit }) for the per-student activity history
 *  - resetUserPassword / removeUser for the row + detail-page actions
 *
 * Loading states match the Home dashboard polish bar: Skeleton rows during
 * fetch, friendly empty states, soft error fallback.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  Search,
  ChevronLeft,
  ChevronRight,
  ListFilter,
  ArrowLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import StatsCard from '@/components/superadmin/PortalLogin/StatsCard';
import DeleteAccountModal from '@/components/modals/DeleteAcount';
import AddStudentModal from '@/components/modals/AddStudent';
import DeactivateAccountModal from '@/components/modals/Deactivate';
import ResetPasswordModal from '@/components/modals/ResetPassword';
import SendCredentialsModal from '@/components/modals/SendCredentials';
import { Skeleton } from '@/components/ui/skeleton';
import {
  getStudents,
  getStudent,
  getDashboardOverview,
  getAuditLogs,
  reactivateUser,
  type Student,
  type AuditLog,
  type DashboardOverview,
} from '@/lib/api/superAdmin.service';
import { toTitleCase, getStudentAvatarUrl } from '@/lib/utils';

// ============================================================================
// HELPERS
// ============================================================================

type StatusFilter = 'all' | 'active' | 'inactive';

const PAGE_SIZE = 10;

function fullName(s: Pick<Student, 'firstName' | 'lastName'>): string {
  return `${toTitleCase(s.firstName)} ${toTitleCase(s.lastName)}`.trim();
}

function initials(s: Pick<Student, 'firstName' | 'lastName'>): string {
  const f = (s.firstName || '').charAt(0);
  const l = (s.lastName || '').charAt(0);
  return `${f}${l}`.toUpperCase() || '?';
}

function relativeTime(iso?: string): string {
  if (!iso) return 'never';
  const t = new Date(iso).getTime();
  if (Number.isNaN(t)) return 'never';
  const diff = Math.floor((Date.now() - t) / 1000);
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)} min ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} hr ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)} day(s) ago`;
  return new Date(iso).toLocaleDateString();
}

/** Use a debounced version of `value` so we don't fetch on every keystroke. */
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

// Smart pagination row: [1, …, n-1, n, n+1, …, total]
function buildPageNumbers(current: number, total: number): (number | string)[] {
  const pages: (number | string)[] = [];
  if (total <= 7) {
    for (let i = 1; i <= total; i++) pages.push(i);
    return pages;
  }
  pages.push(1);
  if (current > 3) pages.push('…');
  const start = Math.max(2, current - 1);
  const end = Math.min(total - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);
  if (current < total - 2) pages.push('…');
  pages.push(total);
  return pages;
}

// ============================================================================
// COMPONENT
// ============================================================================

const StudentManagement: React.FC = () => {
  // --- Filters / search ---
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [classFilter, setClassFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data ---
  const [students, setStudents] = useState<Student[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  // --- Header stats ---
  const [overview, setOverview] = useState<DashboardOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // --- Modals / nav ---
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [modalAction, setModalAction] = useState<
    'reset' | 'deactivate' | 'delete' | 'send-credentials' | null
  >(null);

  // --- Detail view ---
  const [isDetailView, setIsDetailView] = useState(false);
  const [detailStudent, setDetailStudent] = useState<Student | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [activities, setActivities] = useState<AuditLog[]>([]);
  const [activityLoading, setActivityLoading] = useState(false);
  const [isHistoryView, setIsHistoryView] = useState(false);

  // Reset to page 1 when filters or search change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, classFilter]);

  // Fetch overview once
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await getDashboardOverview();
        if (!cancelled && res?.success && res.data) setOverview(res.data);
      } catch {
        // Stats card will show a dash. No need to surface an error here.
      } finally {
        if (!cancelled) setOverviewLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Fetch the student page (refetched on any filter/search/page change)
  const refetchList = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const res = await getStudents({
        page: currentPage,
        limit: PAGE_SIZE,
        search: debouncedSearch || undefined,
        className: classFilter !== 'all' ? classFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
      });
      if (res?.success && res.data) {
        // Backend may use `items` or `students` depending on the controller.
        // Probe both safely.
        const raw = res.data as any;
        const list: Student[] = raw.items ?? raw.students ?? [];
        const newTotalPages: number = raw.pagination?.totalPages ?? 1;

        setStudents(list);
        setTotalCount(raw.pagination?.totalCount ?? list.length);
        setTotalPages(newTotalPages);

        // If a deletion / deactivation just emptied the current page, slide
        // back to the last page that still has rows. This re-runs the effect
        // and refetches at the right page so the table never sits empty on a
        // page that no longer exists.
        if (newTotalPages > 0 && currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setListError(res?.message || 'Failed to load students.');
      }
    } catch (err: any) {
      setListError(err?.message || 'Network error. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [currentPage, debouncedSearch, classFilter, statusFilter]);

  useEffect(() => {
    refetchList();
  }, [refetchList]);

  // Unique class list for the filter dropdown — derived from the current page.
  // For a real product this would come from a dedicated /classes endpoint;
  // doing it client-side keeps us moving without backend work.
  const classOptions = useMemo(() => {
    const set = new Set<string>();
    students.forEach((s) => s.className && set.add(s.className));
    return Array.from(set).sort();
  }, [students]);

  // ----- Detail view loaders -----
  const openDetail = async (student: Student) => {
    setDetailStudent(student);
    setIsDetailView(true);
    setIsHistoryView(false);

    setDetailLoading(true);
    setActivityLoading(true);
    try {
      const [detailRes, logsRes] = await Promise.all([
        getStudent(student._id),
        getAuditLogs({ userId: student._id, limit: 20 }),
      ]);
      if (detailRes?.success && detailRes.data) {
        // The backend wraps the doc as `{ student, admissionInfo }` while the
        // service is typed as a flat Student. Probe both shapes so we don't
        // care if the controller is updated later.
        const raw = detailRes.data as any;
        const next: Student | null = raw.student ?? raw;
        if (next && typeof next === 'object' && next._id) {
          setDetailStudent(next);
        }
      }
      if (logsRes?.success && logsRes.data) {
        setActivities(logsRes.data.logs || []);
      } else {
        setActivities([]);
      }
    } catch {
      // Detail view falls back to the list row we already have.
    } finally {
      setDetailLoading(false);
      setActivityLoading(false);
    }
  };

  /**
   * Called by the mutation modals after the API call succeeds. We intentionally
   * do NOT close the modal here — the modal shows a "Success!" panel and the
   * user clicks Done to dismiss. Closing it programmatically would freeze the
   * modal's internal success state, which would then leak into the next open
   * (you'd see "Success!" instead of the confirmation dialog).
   *
   * Instead we just refresh the table + detail view in the background while
   * the user reads the success message.
   */
  const handleAfterMutation = async () => {
    await refetchList();
    if (isDetailView && detailStudent) {
      const refreshed = await getStudent(detailStudent._id);
      if (refreshed?.success && refreshed.data) {
        const raw = refreshed.data as any;
        const next: Student | null = raw.student ?? raw;
        if (next && typeof next === 'object' && next._id) setDetailStudent(next);
      } else {
        // Detail student was removed — bail back to the list so we're not
        // sitting on a 404'd row.
        setIsDetailView(false);
        setDetailStudent(null);
      }
    }
  };

  const openModal = (
    student: Student,
    action: 'reset' | 'deactivate' | 'delete' | 'send-credentials'
  ) => {
    setSelectedStudent(student);
    setModalAction(action);
  };

  /**
   * Reactivate — no confirmation modal; it's the inverse of Deactivate and
   * non-destructive. We just call the endpoint and refresh.
   */
  const handleReactivate = async (student: Student) => {
    try {
      const res = await reactivateUser(student._id);
      if (res?.success) {
        await handleAfterMutation();
      }
    } catch {
      // Soft fail — the row stays inactive. Could surface a toast here.
    }
  };

  const closeModal = () => {
    setModalAction(null);
    // Keep selectedStudent until the modal animation settles
    setTimeout(() => setSelectedStudent(null), 250);
  };

  // ============================================================================
  // RENDER: shared modals
  // ============================================================================
  const renderModals = () => (
    <>
      <ResetPasswordModal
        isOpen={modalAction === 'reset'}
        onClose={closeModal}
        studentId={selectedStudent?._id ?? ''}
        studentName={selectedStudent ? fullName(selectedStudent) : ''}
        studentEmail={selectedStudent?.email ?? ''}
      />
      <DeactivateAccountModal
        isOpen={modalAction === 'deactivate'}
        onClose={closeModal}
        studentId={selectedStudent?._id ?? ''}
        studentName={selectedStudent ? fullName(selectedStudent) : ''}
        onDeactivated={handleAfterMutation}
      />
      <DeleteAccountModal
        isOpen={modalAction === 'delete'}
        onClose={closeModal}
        studentId={selectedStudent?._id ?? ''}
        studentName={selectedStudent ? fullName(selectedStudent) : ''}
        onDeleted={handleAfterMutation}
      />
      <SendCredentialsModal
        isOpen={modalAction === 'send-credentials'}
        onClose={closeModal}
        studentId={selectedStudent?._id ?? ''}
        studentName={selectedStudent ? fullName(selectedStudent) : ''}
        studentEmail={selectedStudent?.email}
      />
      <AddStudentModal
        isOpen={showAddStudentModal}
        onClose={() => {
          setShowAddStudentModal(false);
          refetchList();
        }}
      />
    </>
  );

  // ============================================================================
  // RENDER: history (full activity list for a single student)
  // ============================================================================
  if (isHistoryView && detailStudent) {
    return (
      <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-8'>
        <div className='mb-4 md:mb-6'>
          <button
            onClick={() => setIsHistoryView(false)}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 min-h-[44px]'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Recent History — {fullName(detailStudent)}
          </h1>
        </div>

        <div className='bg-white rounded-lg border border-gray-200'>
          <ActivityTable
            activities={activities}
            loading={activityLoading}
            rowsShown={activities.length}
          />
        </div>
      </div>
    );
  }

  // ============================================================================
  // RENDER: per-student detail view
  // ============================================================================
  if (isDetailView && detailStudent) {
    return (
      <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-8'>
        <div className='mb-4 md:mb-6'>
          <button
            onClick={() => {
              setIsDetailView(false);
              setDetailStudent(null);
            }}
            className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 min-h-[44px]'
          >
            <ArrowLeft className='w-5 h-5' />
          </button>
        </div>

        {/* Student profile card */}
        <div className='bg-white rounded-lg border border-gray-200 p-4 sm:p-6 mb-4 md:mb-6'>
          <div className='flex flex-col sm:flex-row items-center sm:items-start gap-4 sm:gap-6'>
            <StudentAvatar student={detailStudent} size='lg' />


            <div className='flex-1 w-full text-center sm:text-left'>
              <div className='flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4'>
                <div>
                  <h2 className='text-lg sm:text-xl font-semibold text-gray-900'>
                    {fullName(detailStudent)}
                  </h2>
                  <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                    {detailStudent.admissionNumber}
                    {detailStudent.className && ` • ${detailStudent.className}`}
                    {detailStudent.email && ` • ${detailStudent.email}`}
                  </p>
                </div>
                <span
                  className={`inline-flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-full text-xs sm:text-sm font-medium ${
                    detailStudent.isActive
                      ? 'bg-green-50 text-green-700'
                      : 'bg-red-50 text-red-700'
                  }`}
                >
                  <span
                    className={`w-2 h-2 rounded-full ${
                      detailStudent.isActive ? 'bg-green-600' : 'bg-red-600'
                    }`}
                  />
                  {detailStudent.isActive ? 'Active' : 'Inactive'} Account
                </span>
              </div>

              {/* Demographics block — only renders fields that actually have data */}
              {detailLoading ? (
                <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4'>
                  {Array.from({ length: 6 }).map((_, i) => (
                    <Skeleton key={i} className='h-5 w-full' />
                  ))}
                </div>
              ) : (
                <DemographicsGrid student={detailStudent} />
              )}

              <div className='grid grid-cols-1 sm:grid-cols-2 lg:flex gap-2 sm:gap-3'>
                <ActionButton
                  color='green'
                  onClick={() => openModal(detailStudent, 'reset')}
                >
                  Reset password
                </ActionButton>
                {detailStudent.isActive ? (
                  <ActionButton
                    color='yellow'
                    onClick={() => openModal(detailStudent, 'deactivate')}
                  >
                    Deactivate
                  </ActionButton>
                ) : (
                  <ActionButton
                    color='green'
                    onClick={() => handleReactivate(detailStudent)}
                  >
                    Reactivate
                  </ActionButton>
                )}
                <ActionButton
                  color='yellow'
                  onClick={() => openModal(detailStudent, 'send-credentials')}
                >
                  Send credentials
                </ActionButton>
                <ActionButton
                  color='red'
                  onClick={() => openModal(detailStudent, 'delete')}
                >
                  Delete
                </ActionButton>
              </div>
            </div>
          </div>
        </div>

        {/* Recent activity */}
        <div className='bg-white rounded-lg border border-gray-200'>
          <div className='flex items-center justify-between p-3 sm:p-4 border-b border-gray-200'>
            <h3 className='text-base sm:text-lg font-semibold text-gray-900'>
              Recent History
            </h3>
            {activities.length > 5 && (
              <button
                onClick={() => setIsHistoryView(true)}
                className='text-xs sm:text-sm cursor-pointer text-green-700 hover:text-green-900 min-h-[44px] flex items-center'
              >
                View all ››
              </button>
            )}
          </div>

          <ActivityTable
            activities={activities.slice(0, 5)}
            loading={activityLoading}
            rowsShown={5}
          />
        </div>

        {renderModals()}
      </div>
    );
  }

  // ============================================================================
  // RENDER: main list view
  // ============================================================================
  const totalStudentsStat = overview?.totalStudents.value ?? totalCount;
  const totalStudentsChange = overview?.totalStudents.changePercent ?? 0;

  return (
    <>
      <div className='min-h-full bg-gray-50 space-y-3 p-0 sm:p-2'>
        {/* Header */}
        <header>
          <div className='flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 mb-4'>
            <div>
              <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
                Student management
              </h1>
              <p className='text-xs sm:text-sm text-gray-500 mt-1'>
                Manage students, view profiles, reset access
              </p>
            </div>
            <div className='flex items-center gap-2 sm:gap-3'>
              <button
                onClick={() => setShowAddStudentModal(true)}
                className='flex-1 sm:flex-none px-3 py-2.5 text-xs sm:text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover flex items-center justify-center gap-2 min-h-[44px]'
              >
                <span className='text-lg'>+</span>
                <span className='hidden sm:inline'>Add new student</span>
                <span className='sm:hidden'>Add</span>
              </button>
            </div>
          </div>

          <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-4 md:mb-8'>
            <StatsCard
              title='Total Students'
              count={overviewLoading ? undefined : totalStudentsStat}
              icon='/icon/message.svg'
              change={
                overviewLoading
                  ? 'Loading…'
                  : `${
                      totalStudentsChange >= 0 ? '+' : ''
                    }${totalStudentsChange}% from last month`
              }
              isPositive={totalStudentsChange >= 0}
            />
            <StatsCard
              title='Active on this page'
              count={listLoading ? undefined : students.filter((s) => s.isActive).length}
              icon='/icon/activity.svg'
              change={listLoading ? 'Loading…' : `of ${students.length} shown`}
              isPositive={true}
            />
            <StatsCard
              title='Showing'
              count={listLoading ? undefined : students.length}
              icon='/icon/activity.svg'
              change={
                listLoading
                  ? 'Loading…'
                  : `Page ${currentPage} of ${Math.max(1, totalPages)} (${totalCount} total)`
              }
              isPositive={true}
            />
          </div>
        </header>

        <main>
          {/* Search + filters */}
          <div className='bg-white rounded-lg border border-gray-100 mb-4 md:mb-6'>
            <div className='p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4'>
              <div className='flex-1 relative'>
                <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
                <input
                  type='text'
                  placeholder='Search by name, email or admission #...'
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  className='w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 sm:border-0 rounded-lg sm:rounded-none focus:outline-none focus:ring-2 focus:ring-green-500 sm:focus:ring-0 min-h-[44px]'
                />
              </div>

              <div className='flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0'>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='flex-shrink-0 flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px] whitespace-nowrap'>
                      <ListFilter size={16} />
                      <span className='hidden sm:inline'>Status</span>
                      {statusFilter !== 'all' && (
                        <span className='ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs capitalize'>
                          {statusFilter}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                      <span className='cursor-pointer'>All Status</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                      <span className='cursor-pointer'>Active</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                      <span className='cursor-pointer'>Inactive</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className='flex-shrink-0 flex items-center gap-2 px-3 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px] whitespace-nowrap'>
                      <ListFilter size={16} />
                      <span className='hidden sm:inline'>Class</span>
                      {classFilter !== 'all' && (
                        <span className='ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs'>
                          {classFilter}
                        </span>
                      )}
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align='end'>
                    <DropdownMenuItem onClick={() => setClassFilter('all')}>
                      <span className='cursor-pointer'>All classes</span>
                    </DropdownMenuItem>
                    {classOptions.map((c) => (
                      <DropdownMenuItem
                        key={c}
                        onClick={() => setClassFilter(c)}
                      >
                        <span className='cursor-pointer'>{c}</span>
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className='bg-white rounded-lg border border-gray-100 overflow-hidden'>
            <div className='overflow-x-auto'>
              <table className='w-full min-w-[600px]'>
                <thead>
                  <tr className='bg-gray-50 border-b border-gray-100'>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Name
                    </th>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Student ID
                    </th>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Class
                    </th>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Status
                    </th>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Last login
                    </th>
                    <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {listLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                      <tr key={i} className='border-b border-gray-100'>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <div className='flex items-center gap-2 sm:gap-3'>
                            <Skeleton className='w-8 h-8 sm:w-10 sm:h-10 rounded-full' />
                            <div className='space-y-2'>
                              <Skeleton className='h-3 w-24 sm:w-32' />
                              <Skeleton className='h-3 w-32 sm:w-40' />
                            </div>
                          </div>
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <Skeleton className='h-3 w-24' />
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <Skeleton className='h-3 w-16' />
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <Skeleton className='h-5 w-16 rounded-full' />
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <Skeleton className='h-3 w-20' />
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <Skeleton className='h-5 w-5' />
                        </td>
                      </tr>
                    ))
                  ) : listError ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-3 sm:px-6 py-12 text-center text-sm text-gray-500'
                      >
                        {listError}
                        <div className='mt-2'>
                          <button
                            onClick={refetchList}
                            className='text-green-600 hover:text-green-700 text-sm font-medium'
                          >
                            Retry
                          </button>
                        </div>
                      </td>
                    </tr>
                  ) : students.length === 0 ? (
                    <tr>
                      <td
                        colSpan={6}
                        className='px-3 sm:px-6 py-12 text-center text-sm text-gray-500'
                      >
                        {debouncedSearch ||
                        statusFilter !== 'all' ||
                        classFilter !== 'all'
                          ? 'No students match your filters.'
                          : 'No students yet. Click “Add new student” to create one.'}
                      </td>
                    </tr>
                  ) : (
                    students.map((student) => (
                      <tr
                        key={student._id}
                        className='border-b border-gray-100 hover:bg-gray-50'
                      >
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <button
                            onClick={() => openDetail(student)}
                            className='flex items-center gap-2 sm:gap-3 text-left w-full'
                          >
                            <StudentAvatar student={student} size='sm' />
                            <div className='min-w-0'>
                              <div className='text-xs sm:text-sm font-medium text-gray-900 truncate'>
                                {fullName(student)}
                              </div>
                              {student.email && (
                                <div className='text-xs text-gray-500 truncate max-w-[140px] sm:max-w-none'>
                                  {student.email}
                                </div>
                              )}
                            </div>
                          </button>
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 font-mono'>
                          {student.admissionNumber}
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600'>
                          {student.className || '—'}
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <span
                            className={`inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1 rounded-full text-xs font-medium ${
                              student.isActive
                                ? 'bg-green-50 text-green-700'
                                : 'bg-red-50 text-red-700'
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full ${
                                student.isActive ? 'bg-green-600' : 'bg-red-600'
                              }`}
                            />
                            {student.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-500'>
                          {relativeTime(student.lastLogin)}
                        </td>
                        <td className='px-3 sm:px-6 py-3 sm:py-4'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className='text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center'>
                                <svg
                                  className='w-5 h-5'
                                  fill='currentColor'
                                  viewBox='0 0 24 24'
                                >
                                  <path d='M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z' />
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => openDetail(student)}
                              >
                                <span className='cursor-pointer'>
                                  View details
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() => openModal(student, 'reset')}
                              >
                                <span className='cursor-pointer'>
                                  Reset password
                                </span>
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                onClick={() =>
                                  openModal(student, 'send-credentials')
                                }
                              >
                                <span className='cursor-pointer'>
                                  Send credentials
                                </span>
                              </DropdownMenuItem>
                              {student.isActive ? (
                                <DropdownMenuItem
                                  onClick={() =>
                                    openModal(student, 'deactivate')
                                  }
                                >
                                  <span className='cursor-pointer text-yellow-700'>
                                    Deactivate
                                  </span>
                                </DropdownMenuItem>
                              ) : (
                                <DropdownMenuItem
                                  onClick={() => handleReactivate(student)}
                                >
                                  <span className='cursor-pointer text-green-700'>
                                    Reactivate
                                  </span>
                                </DropdownMenuItem>
                              )}
                              <DropdownMenuItem
                                onClick={() => openModal(student, 'delete')}
                              >
                                <span className='text-red-600 cursor-pointer'>
                                  Delete user
                                </span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!listLoading && totalPages > 1 && (
              <div className='flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-4 border-t border-gray-200'>
                <button
                  className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                >
                  <ChevronLeft className='w-4 h-4' />
                  Previous
                </button>

                <div className='hidden sm:flex items-center gap-2'>
                  {buildPageNumbers(currentPage, totalPages).map((page, i) => (
                    <button
                      key={i}
                      onClick={() =>
                        typeof page === 'number' && setCurrentPage(page)
                      }
                      disabled={typeof page !== 'number'}
                      className={`min-w-[32px] h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                        page === currentPage
                          ? 'bg-green-600 text-white font-medium'
                          : typeof page === 'number'
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-default'
                      }`}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <div className='sm:hidden text-sm text-gray-600'>
                  Page {currentPage} of {totalPages}
                </div>

                <button
                  className='w-full sm:w-auto flex items-center justify-center gap-2 px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]'
                  disabled={currentPage === totalPages}
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                >
                  Next
                  <ChevronRight className='w-4 h-4' />
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
      {renderModals()}
    </>
  );
};

export default StudentManagement;

// ============================================================================
// SMALL SUBCOMPONENTS
// ============================================================================

/**
 * Avatar that prefers the student's uploaded image, falls back to a
 * DiceBear-generated cartoon (style chosen by gender, seeded by _id), and
 * finally to initials if both are missing. The fallback to initials also
 * kicks in when the external avatar 404s or DiceBear is unreachable.
 */
const StudentAvatar: React.FC<{
  student: Student;
  size?: 'sm' | 'lg';
}> = ({ student, size = 'sm' }) => {
  const url = getStudentAvatarUrl(student);
  const [errored, setErrored] = useState(false);

  const sizeClasses =
    size === 'lg' ? 'w-16 h-16 text-base' : 'w-8 h-8 sm:w-10 sm:h-10 text-xs sm:text-sm';

  if (url && !errored) {
    return (
      <div
        className={`${sizeClasses} rounded-full overflow-hidden bg-gray-100 flex-shrink-0`}
      >
        {/* DiceBear ships SVG — use a plain <img> to skip Next/Image's
            external-SVG handling. The browser caches by URL so we don't
            re-fetch on every render. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={url}
          alt={`${student.firstName} ${student.lastName}`.trim() || 'Student avatar'}
          className='w-full h-full object-cover'
          onError={() => setErrored(true)}
          loading='lazy'
        />
      </div>
    );
  }

  // Fallback: initials in the gradient circle.
  return (
    <div
      className={`${sizeClasses} rounded-full bg-gradient-to-br from-lime-400 to-green-500 flex-shrink-0 flex items-center justify-center`}
    >
      <span className='text-white font-semibold'>{initials(student)}</span>
    </div>
  );
};

const DemographicsGrid: React.FC<{ student: Student }> = ({ student }) => {
  const rows: Array<{ label: string; value?: string }> = [
    { label: 'Phone', value: student.phoneNumber },
    {
      label: 'Date of birth',
      value: student.dateOfBirth
        ? new Date(student.dateOfBirth).toLocaleDateString()
        : undefined,
    },
    { label: 'Gender', value: student.gender },
    { label: 'Address', value: student.address },
    { label: 'City', value: student.city },
    { label: 'State', value: student.state },
    { label: 'Country', value: student.country },
    { label: 'Guardian', value: student.guardianName },
    { label: 'Guardian phone', value: student.guardianPhone },
    { label: 'Emergency contact', value: student.emergencyContact },
  ].filter((r) => r.value);

  if (rows.length === 0) {
    return (
      <p className='text-xs text-gray-400 mb-4'>
        No demographic information on file. Edit the student profile to add
        details.
      </p>
    );
  }

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2 mb-4 text-xs sm:text-sm'>
      {rows.map((r) => (
        <div key={r.label} className='flex justify-between sm:block'>
          <span className='text-gray-500'>{r.label}: </span>
          <span className='text-gray-900 capitalize'>{r.value}</span>
        </div>
      ))}
    </div>
  );
};

const ActionButton: React.FC<{
  color: 'green' | 'yellow' | 'red';
  onClick: () => void;
  disabled?: boolean;
  children: React.ReactNode;
}> = ({ color, onClick, disabled, children }) => {
  const classes = {
    green: 'bg-green-50 text-green-700 hover:bg-green-100',
    yellow: 'bg-yellow-50 text-yellow-700 hover:bg-yellow-100',
    red: 'bg-red-50 text-red-700 hover:bg-red-100',
  }[color];
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center cursor-pointer gap-2 px-3 py-2.5 ${classes} rounded-lg text-xs sm:text-sm font-medium min-h-[44px] disabled:opacity-40 disabled:cursor-not-allowed`}
    >
      {children}
    </button>
  );
};

interface ActivityTableProps {
  activities: AuditLog[];
  loading: boolean;
  rowsShown: number;
}

const ActivityTable: React.FC<ActivityTableProps> = ({
  activities,
  loading,
  rowsShown,
}) => (
  <div className='overflow-x-auto'>
    <table className='w-full min-w-[640px]'>
      <thead>
        <tr className='bg-gray-50 border-b border-gray-200'>
          <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
            Date &amp; Time
          </th>
          <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
            Action
          </th>
          <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
            Status
          </th>
          <th className='text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3'>
            IP Address
          </th>
        </tr>
      </thead>
      <tbody>
        {loading ? (
          Array.from({ length: Math.max(3, rowsShown) }).map((_, i) => (
            <tr key={i} className='border-b border-gray-100'>
              <td className='px-3 sm:px-6 py-3 sm:py-4'>
                <Skeleton className='h-3 w-32' />
              </td>
              <td className='px-3 sm:px-6 py-3 sm:py-4'>
                <Skeleton className='h-3 w-40' />
              </td>
              <td className='px-3 sm:px-6 py-3 sm:py-4'>
                <Skeleton className='h-5 w-16 rounded-full' />
              </td>
              <td className='px-3 sm:px-6 py-3 sm:py-4'>
                <Skeleton className='h-3 w-24' />
              </td>
            </tr>
          ))
        ) : activities.length === 0 ? (
          <tr>
            <td
              colSpan={4}
              className='px-3 sm:px-6 py-8 text-center text-sm text-gray-500'
            >
              No activity recorded yet.
            </td>
          </tr>
        ) : (
          activities.map((a) => {
            const ts = new Date(a.timestamp);
            return (
              <tr
                key={a._id}
                className='border-b border-gray-100 hover:bg-gray-50'
              >
                <td className='px-3 sm:px-6 py-3 sm:py-4'>
                  <div className='text-xs sm:text-sm text-gray-900'>
                    {ts.toLocaleDateString()}
                  </div>
                  <div className='text-xs text-gray-500'>
                    {ts.toLocaleTimeString()}
                  </div>
                </td>
                <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 capitalize'>
                  {a.action.replace(/_/g, ' ').toLowerCase()}
                </td>
                <td className='px-3 sm:px-6 py-3 sm:py-4'>
                  <span
                    className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${
                      a.success
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {a.success ? 'Success' : 'Failed'}
                  </span>
                </td>
                <td className='px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 font-mono'>
                  {a.ip || '—'}
                </td>
              </tr>
            );
          })
        )}
      </tbody>
    </table>
  </div>
);
