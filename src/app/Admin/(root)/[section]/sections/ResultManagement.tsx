'use client';

/**
 * ResultManagement — wired to real data.
 *
 * UI is intentionally unchanged: same header, same three stats cards, same
 * quick-actions row, same search + filters, same ResultsTable. The only
 * difference is the data source — everything comes from the new
 * /super-admin/results endpoints.
 *
 * The legacy `StudentResult` shape this page's subcomponents expect is built
 * inside the page via a small adapter (`toComponentRow`). That keeps the
 * subcomponents (Resultstable, Resultstatscard, Quickactioncard) untouched.
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, ListFilter, Plus, Search } from 'lucide-react';
import ResultStatsCard from '@/components/superadmin/Result/Resultstatscard';
import QuickActionCard from '@/components/superadmin/Result/Quickactioncard';
import ResultsTable from '@/components/superadmin/Result/Resultstable';
import AddResultModal from '@/components/superadmin/Result/AddResultModal';
import StudentResultDetail from '@/components/superadmin/Result/StudentResultDetail';
import AllResultsPage from '@/components/superadmin/Result/AllResultsPage';
import SubjectAnalysis from '@/components/superadmin/Result/SubjectAnalysis';
import PrintBroadsheet from '@/components/superadmin/Result/PrintBroadsheet';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  listSuperAdminResults,
  getResultsOverview,
  type SuperAdminResultRow,
  type ResultsOverview,
} from '@/lib/api/superAdmin.service';
import { toTitleCase } from '@/lib/utils';

// ============================================================================
// LEGACY COMPONENT SHAPE
// ============================================================================

export interface StudentResult {
  id: string;
  studentId: string;
  name: string;
  email: string;
  avatar?: string;
  class: string;
  totalScore: string;
  position: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

export interface ResultManagementprop {
  /** Kept for backwards compatibility; the page now owns search internally. */
  onSearchChange?: (query: string) => void;
}

// ============================================================================
// HELPERS
// ============================================================================

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

/** Build "First Term 2025" from the two parts the term selector tracks. */
const formatTermLabel = (term: string | null, year: string | null) => {
  if (term && year) return `${term} ${year}`;
  if (term) return term;
  if (year) return year;
  return 'All terms';
};

/** Use a debounced version of `value` so we don't refetch on every keystroke. */
function useDebouncedValue<T>(value: T, delay = 300): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);
  return debounced;
}

const toComponentRow = (r: SuperAdminResultRow): StudentResult => {
  const fullName =
    `${toTitleCase(r.student.firstName)} ${toTitleCase(
      r.student.lastName
    )}`.trim() || r.student.email;
  return {
    id: r._id,
    studentId: r.student._id,
    name: fullName,
    email: r.student.email,
    class: r.class,
    totalScore:
      typeof r.totalScore === 'number' ? `${r.totalScore.toFixed(1)}%` : '—',
    position: r.positionLabel || '—',
    status: r.student.isActive ? 'Active' : 'Inactive',
  };
};

const QUICK_ACTIONS = [
  {
    id: 'all',
    icon: '/icon/allresults.svg',
    iconBg: 'bg-green-100',
    title: 'All Results',
    subtitle: 'View all students',
  },
  {
    id: 'grade12',
    icon: '/icon/graderesult.svg',
    iconBg: 'bg-orange-100',
    title: 'Grade 12 Results',
    subtitle: 'Final year focus',
  },
  {
    id: 'subjects',
    icon: '/icon/resultsubjectanalysis.svg',
    iconBg: 'bg-purple-100',
    title: 'Subject Analysis',
    subtitle: 'Performance by subject',
  },
  {
    id: 'broadsheets',
    icon: '/icon/resultprintbroadsheets.svg',
    iconBg: 'bg-yellow-100',
    title: 'Print Broadsheets',
    subtitle: 'Class result sheets',
  },
];

const PAGE_SIZE = 8;

// ============================================================================
// COMPONENT
// ============================================================================

const ResultManagement: React.FC<ResultManagementprop> = () => {
  const currentAcademicYear = useMemo(() => {
    // Schools usually run Sep–Jul. Past August → use current year/year+1;
    // before September → use year-1/year. Best-effort default; the term
    // selector lets admins override.
    const now = new Date();
    const year = now.getFullYear();
    const isPostAugust = now.getMonth() >= 8;
    const start = isPostAugust ? year : year - 1;
    return `${start}/${start + 1}`;
  }, []);

  const [showAddModal, setShowAddModal] = useState(false);
  const [currentView, setCurrentView] = useState<'overview' | 'all-results' | 'subject-analysis' | 'broadsheet'>('overview');
  const [viewingStudent, setViewingStudent] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // --- Filters ---
  const [searchInput, setSearchInput] = useState('');
  const debouncedSearch = useDebouncedValue(searchInput, 300);
  const [term, setTerm] = useState<typeof TERMS[number]>('First Term');
  const [academicYear, setAcademicYear] = useState<string>(currentAcademicYear);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>(
    'all'
  );
  const [classFilter, setClassFilter] = useState<string>('all');
  const [currentPage, setCurrentPage] = useState(1);

  // --- Data ---
  const [rows, setRows] = useState<SuperAdminResultRow[]>([]);
  const [classOptions, setClassOptions] = useState<string[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [listLoading, setListLoading] = useState(true);
  const [listError, setListError] = useState('');

  const [overview, setOverview] = useState<ResultsOverview | null>(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Reset to page 1 whenever any filter shifts.
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch, statusFilter, classFilter, term, academicYear]);

  // ----- Fetch list -----
  const fetchList = useCallback(async () => {
    setListLoading(true);
    setListError('');
    try {
      const res = await listSuperAdminResults({
        academicYear: academicYear || undefined,
        term: term || undefined,
        className: classFilter !== 'all' ? classFilter : undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        search: debouncedSearch || undefined,
        page: currentPage,
        limit: PAGE_SIZE,
      });
      if (res?.success && res.data) {
        setRows(res.data.results || []);
        setTotalPages(res.data.pagination?.totalPages ?? 1);
        setClassOptions(res.data.facets?.classes ?? []);

        // Slide back if the current page is now past the end.
        const newTotalPages = res.data.pagination?.totalPages ?? 1;
        if (newTotalPages > 0 && currentPage > newTotalPages) {
          setCurrentPage(newTotalPages);
        }
      } else {
        setListError(res?.message || 'Failed to load results.');
      }
    } catch (err: any) {
      setListError(err?.message || 'Network error. Please try again.');
    } finally {
      setListLoading(false);
    }
  }, [
    academicYear,
    term,
    classFilter,
    statusFilter,
    debouncedSearch,
    currentPage,
  ]);

  useEffect(() => {
    fetchList();
  }, [fetchList]);

  // ----- Fetch overview (lighter cadence: only when filters change) -----
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await getResultsOverview({
        academicYear: academicYear || undefined,
        term: term || undefined,
        className: classFilter !== 'all' ? classFilter : undefined,
      });
      if (res?.success && res.data) setOverview(res.data);
    } catch {
      // Cards will fall back to dashes.
    } finally {
      setOverviewLoading(false);
    }
  }, [academicYear, term, classFilter]);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // ----- Derived display data -----
  const componentRows = rows.map(toComponentRow);
  const termLabel = formatTermLabel(term, academicYear);

  const passLabel = overview?.passRate
    ? `${overview.passRate.value}%`
    : '—';
  const failLabel = overview?.failRate
    ? `${overview.failRate.value}%`
    : '—';
  const newLabel = overview?.newThisMonth?.value?.toString() ?? '—';

  const newChange = overview?.newThisMonth?.changePercent ?? 0;
  const newChangeLabel = overview
    ? `${newChange >= 0 ? '+' : ''}${newChange}% from last month`
    : 'Loading…';

  const handleDownload = () => {
    // Simple client-side CSV export of the loaded page. Could promote to a
    // dedicated /super-admin/results/export endpoint if we ever need
    // multi-page exports.
    if (rows.length === 0) return;
    const header = [
      'Name',
      'Email',
      'Class',
      'Average Score (%)',
      'Position',
      'Status',
    ];
    const lines = componentRows.map((r) => [
      r.name,
      r.email,
      r.class,
      r.totalScore,
      r.position,
      r.status,
    ]);
    const csv = [header, ...lines]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')
      )
      .join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `results-${term.replace(/\s/g, '-').toLowerCase()}-${academicYear.replace(/\//g, '-')}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (viewingStudent) {
    return (
      <StudentResultDetail
        studentId={viewingStudent.id}
        studentName={viewingStudent.name}
        studentEmail={viewingStudent.email}
        onBack={() => setViewingStudent(null)}
      />
    );
  }

  if (currentView === 'all-results') {
    return (
      <AllResultsPage
        onBack={() => setCurrentView('overview')}
        onViewStudent={(studentId, name, email) => setViewingStudent({ id: studentId, name, email })}
      />
    );
  }

  if (currentView === 'subject-analysis') {
    return (
      <SubjectAnalysis
        defaultAcademicYear={academicYear}
        defaultTerm={term}
        defaultClass={classFilter !== 'all' ? classFilter : ''}
        classOptions={classOptions}
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  if (currentView === 'broadsheet') {
    return (
      <PrintBroadsheet
        defaultAcademicYear={academicYear}
        defaultTerm={term}
        defaultClass={classFilter !== 'all' ? classFilter : ''}
        classOptions={classOptions}
        onBack={() => setCurrentView('overview')}
      />
    );
  }

  return (
    <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6 space-y-3 sm:space-y-4'>
      {/* Header */}
      <div className='flex flex-col sm:flex-row justify-between sm:items-start gap-3'>
        <div>
          <h1 className='text-xl sm:text-2xl font-semibold text-gray-900'>
            Result management
          </h1>
          <p className='text-xs sm:text-sm text-gray-500 mt-1'>
            Manage subjects and view progress
          </p>
        </div>
        <div className='flex items-center gap-2 sm:gap-3'>
          <button
            onClick={() => setShowAddModal(true)}
            className='flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover min-h-[44px]'
          >
            <Plus className='w-4 h-4' />
            <span className='hidden sm:inline'>Add Result</span>
          </button>

          {/* Term selector — dropdown menu so admins can switch which term's
              results they see without leaving the page. */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]'>
                <ListFilter className='w-4 h-4' />
                <span className='hidden sm:inline'>{termLabel}</span>
                <span className='sm:hidden'>Term</span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              {TERMS.map((t) => (
                <DropdownMenuItem key={t} onClick={() => setTerm(t)}>
                  <span className='cursor-pointer'>
                    {t} {academicYear}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleDownload}
            disabled={listLoading || rows.length === 0}
            className='flex items-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed'
          >
            <Download className='w-4 h-4' />
            Download
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4'>
        <ResultStatsCard
          title='Student pass rate'
          trinket='/icon/message.svg'
          value={overviewLoading ? '…' : passLabel}
          change={overview ? `${overview.context.totalResults} results in scope` : 'Loading…'}
          isPositive={true}
        />
        <ResultStatsCard
          title='Student fail rate'
          trinket='/icon/activity.svg'
          value={overviewLoading ? '…' : failLabel}
          change={overview ? `Pass threshold 40%` : 'Loading…'}
          isPositive={false}
          valueColor='text-red-500'
        />
        <ResultStatsCard
          title='New this month'
          trinket='/icon/activity.svg'
          value={overviewLoading ? '…' : newLabel}
          change={newChangeLabel}
          isPositive={newChange >= 0}
        />
      </div>

      {/* Quick Actions */}
      <div className='bg-white flex flex-col p-3 sm:p-4 rounded-xl'>
        <h2 className='text-xs sm:text-sm font-medium text-gray-700 mb-2 sm:mb-3'>
          Quick actions
        </h2>
        <div className='grid grid-cols-2 md:grid-cols-4 gap-2'>
          {QUICK_ACTIONS.map((action) => (
            <QuickActionCard
              key={action.id}
              icon={action.icon}
              iconBg={action.iconBg}
              title={action.title}
              subtitle={action.subtitle}
              onClick={() => {
                if (action.id === 'all') {
                  setCurrentView('all-results');
                } else if (action.id === 'subjects') {
                  setCurrentView('subject-analysis');
                } else if (action.id === 'broadsheets') {
                  setCurrentView('broadsheet');
                }
              }}
            />
          ))}
        </div>
      </div>

      <div className='p-2 bg-white rounded-lg'>
        {/* Search and Filters */}
        <div className='p-0 flex items-center gap-4'>
          <div className='flex-1 relative'>
            <Search className='w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400' />
            <input
              type='text'
              placeholder='Search by student name, email or ID...'
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className='w-full pl-10 pr-4 py-2 text-sm rounded-lg focus:outline-none focus:border-transparent'
            />
          </div>

          {/* Status filter — wired */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-100 rounded-lg hover:bg-gray-50'>
                <ListFilter className='w-4 h-4' />
                Filter by status
                {statusFilter !== 'all' && (
                  <span className='ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs capitalize'>
                    {statusFilter}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuItem onClick={() => setStatusFilter('all')}>
                <span className='cursor-pointer'>All status</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('active')}>
                <span className='cursor-pointer'>Active</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setStatusFilter('inactive')}>
                <span className='cursor-pointer'>Inactive</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Class / grade filter — wired, options come from server facets */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className='flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-100 rounded-lg hover:bg-gray-50'>
                <ListFilter className='w-4 h-4' />
                Filter by grade
                {classFilter !== 'all' && (
                  <span className='ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs'>
                    {classFilter}
                  </span>
                )}
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end' className='max-h-64 overflow-y-auto'>
              <DropdownMenuItem onClick={() => setClassFilter('all')}>
                <span className='cursor-pointer'>All grades</span>
              </DropdownMenuItem>
              {classOptions.map((c) => (
                <DropdownMenuItem key={c} onClick={() => setClassFilter(c)}>
                  <span className='cursor-pointer'>{c}</span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Results Table */}
      {listError ? (
        <div className='bg-white rounded-lg p-12 text-center'>
          <p className='text-sm text-gray-500 mb-3'>{listError}</p>
          <button
            onClick={fetchList}
            className='text-sm font-medium text-green-700 hover:text-green-900'
          >
            Retry
          </button>
        </div>
      ) : (
        <ResultsTable
          students={componentRows}
          searchQuery={searchInput}
          onSearchChange={(query) => setSearchInput(query)}
          currentPage={currentPage}
          totalPages={Math.max(1, totalPages)}
          onPageChange={(page) => {
            if (page >= 1 && page <= totalPages) setCurrentPage(page);
          }}
          onViewDetails={(student) =>
            setViewingStudent({ id: student.studentId, name: student.name, email: student.email })
          }
        />
      )}

      {showAddModal && (
        <AddResultModal
          onClose={() => setShowAddModal(false)}
          onSuccess={(savedYear, savedTerm) => {
            setShowAddModal(false);
            // Sync the list filter to whatever was just saved so the result
            // is immediately visible regardless of what the user typed.
            setAcademicYear(savedYear);
            setTerm(savedTerm);
            // fetchList re-runs automatically because academicYear/term changed.
            fetchOverview();
          }}
          defaultAcademicYear={academicYear}
          defaultTerm={term}
        />
      )}
    </div>
  );
};

export default ResultManagement;
