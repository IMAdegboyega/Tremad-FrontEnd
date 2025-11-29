'use client'

// StudentManagement
// High-level overview:
// - Provides search, filter, and paginated listing of students using client-side state
// - Shows quick stats (totals and activity) and per-student actions via a dropdown menu
// - Implements a smart pagination component with ellipses for large page counts

import React, { useState } from 'react';
import { Search, ChevronLeft, ChevronRight, ListFilter } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { allStudentData } from '@/Constants/PortalLoginData';
import StatsCard from '@/components/superadmin/PortalLogin/StatsCard';
import DeleteAccountModal from '@/components/modals/DeleteAcount';
import AddStudentModal from '@/components/modals/AddStudent';
// Expected shape of each student in allStudentData:
// {
//   id: string | number,         // Stable unique key for React list rendering
//   fullName: string,            // Used for display and search (case-insensitive)
//   email?: string,              // Optional; used for display and search
//   studentId: string,           // Searched; may differ from admissionNo
//   admissionNo: string,         // Displayed in the table as Student ID
//   grade: string,               // e.g., 'Grade 7' or 'SS2'; used for grade filter
//   status: 'Active' | 'Inactive' | 'Suspended' // Drives badge styles and status filter
// }

const StudentManagement: React.FC = () => {
  // Search string entered by the user; used to match name, email, studentId, or admissionNo
  const [searchQuery, setSearchQuery] = useState('');
  // Current page for pagination (1-indexed)
  const [currentPage, setCurrentPage] = useState(1);
  // Status filter; 'all' means include every status
  const [statusFilter, setStatusFilter] = useState<'all' | 'Active' | 'Inactive' | 'Suspended'>('all');
  // Grade/class filter; 'all' means include every grade
  const [gradeFilter, setGradeFilter] = useState<string>('all');
  const [selectedStudentForModal, setSelectedStudentForModal] = useState<typeof allStudentData[0] | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string | null>(null);
  const [showAddStudentModal, setShowAddStudentModal] = useState(false);

  const renderModals = () => {
    
    return (
      <>
        {selectedStudentForModal && (
          <DeleteAccountModal
            isOpen={showDeleteModal}
            onClose={() => setShowDeleteModal(false)}
            studentName={selectedStudentForModal.fullName}
          />
        )}
        <AddStudentModal
          isOpen={showAddStudentModal}
          onClose={() => setShowAddStudentModal(false)}
        />
      </>
    );
  };

  // Number of student rows displayed per page in the table.
  // Note: If you expose this as a user setting, ensure currentPage is clamped when it changes.
  const itemsPerPage = 8;

  // Derive the visible students by applying search + status + grade filters
  // Complexity: O(n) per render where n = allStudentData.length.
  // For very large lists, consider memoization with useMemo and/or server-side filtering.
  // Also consider debouncing search input to reduce re-renders while typing.
  const filteredStudents = allStudentData.filter(student => {
    // Case-insensitive search across multiple fields for a forgiving UX
    const matchesSearch = student.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         student.studentId.includes(searchQuery) ||
                         student.admissionNo.includes(searchQuery);
    
    // Apply selected status and grade filters (or allow all when set to 'all').
    // Status match is exact; adjust if backend uses different casing.
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesGrade = gradeFilter === 'all' || student.grade === gradeFilter;
    
    return matchesSearch && matchesStatus && matchesGrade;
  });

  // Pagination calculations
  // totalPages: number of pages needed to show all filtered results.
  // startIndex/endIndex: slice boundaries for the current page window.
  // Guard: If filters change and shrink results, currentPage may exceed totalPages. The UI
  // resets currentPage to 1 on filter/search changes to avoid empty views.
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, endIndex);

  // Top-level stats used by header cards.
  // Note: These are derived from the FULL dataset (not filtered) to reflect global counts.
  // If you need stats for the filtered subset, compute from filteredStudents instead.
  const activeStudents = allStudentData.filter(s => s.status === 'Active').length;
  const inactiveStudents = allStudentData.filter(s => s.status === 'Inactive').length;
  const suspendedStudents = allStudentData.filter(s => s.status === 'Suspended').length;
  // Example figure for demo purposes; wire to backend analytics when available
  const newThisMonth = 12;

  // Generate page numbers for pagination display
  // Strategy:
  // - If there are 7 pages or fewer, show them all: [1 2 3 4 5 6 7]
  // - Otherwise show compact form with ellipses: [1 … (current-1) current (current+1) … total]
  //   Examples:
  //   - current=1, total=10 -> [1 2 … 10]
  //   - current=5, total=10 -> [1 … 4 5 6 … 10]
  //   - current=9, total=10 -> [1 … 8 9 10]
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    if (totalPages <= 7) {
      // Show all pages if 7 or fewer
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Show smart pagination with ellipsis for large page counts
      pages.push(1); // Always show first page
      
      if (currentPage > 3) {
        pages.push('...');
      }
      
      // Show current page and its immediate neighbors within [2, totalPages-1]
      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);
      
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
      
      if (currentPage < totalPages - 2) {
        pages.push('...');
      }
      
      pages.push(totalPages); // Always show last page
    }
    
    return pages;
  };

  // Update the current page while guarding against out-of-range values.
  // This does not clamp beyond [1, totalPages]; callers should disable buttons accordingly.
  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDeleteAccount = () => {
    const student = allStudentData.find(s => s.id === selectedStudentId);
    if (student) {
      setSelectedStudentForModal(student);
      setShowDeleteModal(true);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 space-y-3 p-2">
      {/* Header */}
      <header>
        <div className="flex justify-between items-start mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Student management</h1>
            <p className="text-sm text-gray-500 mt-1">Manage subjects and view progress</p>
          </div>
          <div className="flex items-center gap-3">
            {/* Could be connected to a term/semester selector in future */}
            <button className="px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 flex items-center gap-2">
              <ListFilter size={20} />
              Current term
            </button>
            {/* Trigger a create-student modal or navigate to a creation form */}
            <button onClick={() => setShowAddStudentModal(true)} className="px-4 py-2 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700 flex items-center gap-2">
              <span className="text-lg">+</span>
              Add new student
            </button>
          </div>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <StatsCard
            title="Total Students" 
            count={10} 
            icon='/icon/message.svg'
            change="+20.1% from last term" 
            isPositive={true}
          />
          <StatsCard
            title="Active Students" 
            count={0} 
            icon='/icon/activity.svg'
            change="-20.1% from last term" 
            isPositive={false}
          />
          <StatsCard
            title="New this month" 
            count={12} 
            icon='/icon/activity.svg'
            change="+20.1% from last term" 
            isPositive={true}
          />
        </div>

        
      </header>

      {/* Main Content
          Layout/spacing is intentionally minimal here; parent container adds global padding.
          The card below hosts search and filters; table handles overflow inside a bordered box.
      */}
      <main>
        {/* Search and Filters */}
        <div className="bg-white rounded-lg border border-gray-100 mb-6">
          <div className="p-4 flex items-center gap-4">
            <div className="flex-1 relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search by student name, email or ID..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  // Reset to first page whenever the search query changes
                  setCurrentPage(1);
                }}
                className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:outline-none"
              />
            </div>

            {/* Status filter menu: exact match on status string.
                UX: Chip next to label shows active selection when not 'all'. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <ListFilter size={20} />
                  Filter by status
                  {statusFilter !== 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {statusFilter}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Reset pagination when filters change to avoid landing on empty pages */}
                <DropdownMenuItem onClick={() => { setStatusFilter('all'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>All Status</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('Active'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>Active ({activeStudents})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('Inactive'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>Inactive ({inactiveStudents})</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => { setStatusFilter('Suspended'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>Suspended ({suspendedStudents})</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Grade filter menu: unique grade values derived from dataset at runtime.
                Consider normalizing grade labels or loading from a schema to ensure consistent options. */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <ListFilter size={20} />
                  Filter by grade
                  {gradeFilter !== 'all' && (
                    <span className="ml-1 px-2 py-0.5 bg-green-100 text-green-700 rounded text-xs">
                      {gradeFilter}
                    </span>
                  )}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {/* Same pagination reset logic applies to grade changes */}
                <DropdownMenuItem onClick={() => { setGradeFilter('all'); setCurrentPage(1); }}>
                  <span className='cursor-pointer'>All Grades</span>
                </DropdownMenuItem>
                {Array.from(new Set(allStudentData.map(s => s.grade))).map(grade => (
                  <DropdownMenuItem key={grade} onClick={() => { setGradeFilter(grade); setCurrentPage(1); }}>
                    <span className='cursor-pointer'>{grade}</span>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Students Table
            Accessibility: Table uses semantic <table>/<thead>/<tbody>.
            Consider adding scope="col" to <th> for improved screen reader support.
            For very large datasets, consider virtualization (e.g., react-window). */}
        <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Student ID</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Class</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
                <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {currentStudents.length > 0 ? (
                currentStudents.map((student) => (
                  <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden flex items-center justify-center">
                          <span className="text-sm font-medium text-gray-600">
                            {/* Render up to two-letter initials (first letters of name parts).
                               Edge cases: single-word names -> first letter only; names with punctuation are taken literally. */}
                            {student.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{student.fullName}</div>
                          {student.email && (
                            <div className="text-xs text-gray-500">{student.email}</div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.admissionNo}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{student.grade}</td>
                    <td className="px-6 py-4">
                      {/* Status badge with color coding per status */}
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                        student.status === 'Active' 
                          ? 'bg-green-50 text-green-700' 
                          : student.status === 'Suspended'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          student.status === 'Active' 
                            ? 'bg-green-600' 
                            : student.status === 'Suspended'
                            ? 'bg-yellow-600'
                            : 'bg-red-600'
                        }`} />
                        {student.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600">
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                              <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                            </svg>
                          </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          {/* Wire these to route navigations or modals as required */}
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
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                    No students found matching your criteria
                  </td>
                </tr>
              )}
            </tbody>
          </table>

          {/* Custom Pagination - Fully Functional
              Behavior:
              - Prev/Next buttons are disabled at the bounds [1, totalPages]
              - Page number list collapses with ellipses when totalPages > 7
              - Non-numeric ellipsis elements are non-interactive */}
          {filteredStudents.length > 0 && totalPages > 1 && (
            <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
              {/* Previous Button */}
              <button 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === 1}
                onClick={() => handlePageChange(currentPage - 1)}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </button>

              {/* Page Numbers */}
              <div className="flex items-center gap-2">
                {generatePageNumbers().map((page, index) => (
                  <button
                    key={index}
                    // Only numeric pages are interactive; ellipses act as visual separators
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

              {/* Next Button */}
              <button 
                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={currentPage === totalPages}
                onClick={() => handlePageChange(currentPage + 1)}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </main>
      {renderModals()}
    </div>
  );
};

export default StudentManagement;