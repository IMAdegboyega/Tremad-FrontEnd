'use client'

// StaffManagement
// Live data — backed by GET /super-admin/staff (users with role "admin").
//
// Search, status filtering and pagination are all done SERVER-side: the backend
// endpoint accepts { page, limit, search, status } so we never hold the full
// staff list in memory. Search is debounced so typing doesn't fire a request per
// keystroke.
//
// Note on statuses: the backend models staff state as a single `isActive`
// boolean, so only Active/Inactive exist. (The old mock data had a third
// "Suspended" state that the API cannot express, so it's gone.)

import React, { useCallback, useEffect, useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ListFilter, RefreshCw } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import StatsCard from '@/components/superadmin/PortalLogin/StatsCard';
import AddStaffModal from '@/components/modals/AddStaff';
import { getAllStaff, type Staff } from '@/lib/api/superAdmin.service';
import { getApiErrorMessage } from '@/lib/api/client';

type StatusFilter = 'all' | 'active' | 'inactive';

const ITEMS_PER_PAGE = 8;

/** Display helpers — the API returns raw User docs, so shape them for the table. */
const displayName = (s: Staff) =>
  `${s.firstName ?? ''} ${s.lastName ?? ''}`.trim() || s.email || 'Unnamed staff';
const displayId = (s: Staff) => s.teacherId || s.staffId || '—';
const displayDept = (s: Staff) => s.department || s.position || '—';
const initialsOf = (name: string) =>
  name.split(' ').filter(Boolean).map((n) => n[0]).join('').slice(0, 2).toUpperCase();

const StaffManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [currentPage, setCurrentPage] = useState(1);

  const [staff, setStaff] = useState<Staff[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Global counts for the stat cards. Fetched with limit=1 so we only pay for
  // the pagination totals, not the rows themselves.
  const [totalStaff, setTotalStaff] = useState(0);
  const [activeCount, setActiveCount] = useState(0);

  const [showAddStaffModal, setShowAddStaffModal] = useState(false);

  // Debounce the search box (350ms) and reset to page 1 on a new term.
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(searchQuery.trim());
      setCurrentPage(1);
    }, 350);
    return () => clearTimeout(t);
  }, [searchQuery]);

  const fetchStaff = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await getAllStaff({
        page: currentPage,
        limit: ITEMS_PER_PAGE,
        search: debouncedSearch || undefined,
        status: statusFilter === 'all' ? undefined : statusFilter,
      });

      if (res.success && res.data) {
        // Backend responds with { staff, pagination }; tolerate an `items` key too.
        const payload = res.data as unknown as {
          staff?: Staff[];
          items?: Staff[];
          pagination?: { totalPages: number; totalCount: number };
        };
        setStaff(payload.staff ?? payload.items ?? []);
        setTotalPages(payload.pagination?.totalPages || 1);
      } else {
        setError(res.message || 'Could not load staff.');
        setStaff([]);
      }
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not load staff.'));
      setStaff([]);
    } finally {
      setLoading(false);
    }
  }, [currentPage, debouncedSearch, statusFilter]);

  const fetchCounts = useCallback(async () => {
    try {
      const [all, active] = await Promise.all([
        getAllStaff({ limit: 1 }),
        getAllStaff({ limit: 1, status: 'active' }),
      ]);
      const totalOf = (r: typeof all) =>
        (r.data as unknown as { pagination?: { totalCount: number } })?.pagination?.totalCount ?? 0;
      setTotalStaff(totalOf(all));
      setActiveCount(totalOf(active));
    } catch {
      /* stat cards are non-critical — leave them at their last known values */
    }
  }, []);

  useEffect(() => { fetchStaff(); }, [fetchStaff]);
  useEffect(() => { fetchCounts(); }, [fetchCounts]);

  const refreshAll = useCallback(() => {
    fetchStaff();
    fetchCounts();
  }, [fetchStaff, fetchCounts]);

  const inactiveCount = Math.max(0, totalStaff - activeCount);
  const activePct = totalStaff > 0 ? Math.round((activeCount / totalStaff) * 100) : 0;

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else {
      pages.push(1);
      if (currentPage > 3) pages.push('...');
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      for (let i = start; i <= end; i++) pages.push(i);
      if (currentPage < totalPages - 2) pages.push('...');
      pages.push(totalPages);
    }
    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) setCurrentPage(page);
  };

  const statusLabel =
    statusFilter === 'all' ? null : statusFilter === 'active' ? 'Active' : 'Inactive';

  return (
    <div className="min-h-screen bg-gray-50 space-y-3 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <header>
        <div className="flex flex-col sm:flex-row justify-between sm:items-start gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Staff management</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage staff accounts and access</p>
          </div>
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2 min-h-[44px] disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
            <button
              onClick={() => setShowAddStaffModal(true)}
              className="px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover flex items-center gap-2 min-h-[44px]"
            >
              <span className="text-lg">+</span>
              <span className="hidden sm:inline">Add new staff</span>
              <span className="sm:hidden">Add staff</span>
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 md:mb-8'>
          <StatsCard
            title="Total staff"
            count={totalStaff}
            icon='/icon/message.svg'
            change="All staff on record"
            isPositive={true}
          />
          <StatsCard
            title="Active staff"
            count={activeCount}
            icon='/icon/activity.svg'
            change={totalStaff > 0 ? `${activePct}% of all staff` : 'No staff yet'}
            isPositive={true}
          />
          <StatsCard
            title="Inactive staff"
            count={inactiveCount}
            icon='/icon/activity.svg'
            change={inactiveCount === 0 ? 'None inactive' : 'Deactivated accounts'}
            isPositive={inactiveCount === 0}
          />
        </div>
      </header>

      <main>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-100 mb-4 md:mb-6">
          <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by name, email or staff ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 sm:border-0 rounded-lg sm:rounded-none focus:outline-none focus:ring-2 sm:focus:ring-0 focus:ring-green-500 min-h-[44px]"
              />
            </div>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 min-h-[44px]">
                  <ListFilter size={18} />
                  <span className="hidden sm:inline">Filter by status</span>
                  <span className="sm:hidden">Status</span>
                  {statusLabel && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {statusLabel}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>All status</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('active'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>Active ({activeCount})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('inactive'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>Inactive ({inactiveCount})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Staff Table */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[600px]">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Name</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Staff ID</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Dept</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Status</th>
                  <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  // Skeleton rows keep the table height stable while fetching
                  Array.from({ length: 5 }).map((_, i) => (
                    <tr key={`sk-${i}`} className="border-b border-gray-100 animate-pulse">
                      <td className="px-3 sm:px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200" />
                          <div className="space-y-2">
                            <div className="h-3 w-28 bg-gray-200 rounded" />
                            <div className="h-2 w-36 bg-gray-100 rounded" />
                          </div>
                        </div>
                      </td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-3 w-20 bg-gray-200 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-3 w-24 bg-gray-200 rounded" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-5 w-16 bg-gray-200 rounded-full" /></td>
                      <td className="px-3 sm:px-6 py-4"><div className="h-3 w-6 bg-gray-200 rounded" /></td>
                    </tr>
                  ))
                ) : error ? (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-12 text-center">
                      <p className="text-sm text-red-600 mb-3">{error}</p>
                      <button
                        onClick={refreshAll}
                        className="px-4 py-2 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover"
                      >
                        Try again
                      </button>
                    </td>
                  </tr>
                ) : staff.length > 0 ? (
                  staff.map((member) => {
                    const name = displayName(member);
                    return (
                      <tr key={member._id} className="border-b border-gray-100 hover:bg-gray-50">
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <div className="flex items-center gap-2 sm:gap-3">
                            <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                              <span className="text-xs sm:text-sm font-medium text-gray-600">
                                {initialsOf(name)}
                              </span>
                            </div>
                            <div className="min-w-0">
                              <div className="text-xs sm:text-sm font-medium text-gray-900 truncate max-w-[100px] sm:max-w-none">{name}</div>
                              {member.email && (
                                <div className="text-[10px] sm:text-xs text-gray-500 truncate max-w-[100px] sm:max-w-none">{member.email}</div>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{displayId(member)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{displayDept(member)}</td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <span className={`inline-flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-full text-[10px] sm:text-xs font-medium ${
                            member.isActive ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              member.isActive ? 'bg-green-600' : 'bg-red-600'
                            }`} />
                            {member.isActive ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="px-3 sm:px-6 py-3 sm:py-4">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <button className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
                                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                                </svg>
                              </button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem>
                                <span className='cursor-pointer'>View Details</span>
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <span className='cursor-pointer'>Edit Profile</span>
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-3 sm:px-6 py-12 text-center text-sm text-gray-500">
                      {debouncedSearch || statusFilter !== 'all'
                        ? 'No staff match your search or filter.'
                        : 'No staff yet — add your first staff member.'}
                    </td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* Pagination — driven by the server's totalPages */}
            {!loading && !error && staff.length > 0 && totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-3 sm:px-6 py-3 sm:py-4 border-t border-gray-200">
                <div className="flex items-center justify-between w-full sm:w-auto gap-2">
                  <button
                    className="flex items-center gap-1 sm:gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    disabled={currentPage === 1}
                    onClick={() => handlePageChange(currentPage - 1)}
                  >
                    <ChevronLeft className="w-4 h-4" />
                    <span className="hidden sm:inline">Previous</span>
                    <span className="sm:hidden">Prev</span>
                  </button>

                  <span className="text-xs sm:hidden text-gray-500">
                    {currentPage} / {totalPages}
                  </span>

                  <button
                    className="flex sm:hidden items-center gap-1 px-3 py-2.5 text-xs text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                    disabled={currentPage === totalPages}
                    onClick={() => handlePageChange(currentPage + 1)}
                  >
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="hidden sm:flex items-center gap-2">
                  {generatePageNumbers().map((page, index) => (
                    <button
                      key={index}
                      onClick={() => typeof page === 'number' && handlePageChange(page)}
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

                <button
                  className="hidden sm:flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed min-h-[44px]"
                  disabled={currentPage === totalPages}
                  onClick={() => handlePageChange(currentPage + 1)}
                >
                  Next
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AddStaffModal
        isOpen={showAddStaffModal}
        onClose={() => setShowAddStaffModal(false)}
        onSuccess={refreshAll}
      />
    </div>
  );
};

export default StaffManagement;
