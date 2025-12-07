'use client'

import React from 'react';
import { Search, ListFilter, ChevronLeft, ChevronRight, MoreVertical } from 'lucide-react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StudentResult } from '@/app/SuperAdmin/(root)/[section]/sections/ResultManagement';

interface ResultsTableProps {
  students: StudentResult[];
  searchQuery: string;
  onSearchChange: (query: string) => void;
  currentPage: number;
  totalPages: number;
  statusBg: string;
  onPageChange: (page: number) => void;
}

const ResultsTable: React.FC<ResultsTableProps> = ({
  students,
  searchQuery,
  onSearchChange,
  currentPage,
  totalPages,
  statusBg,
  onPageChange,
}) => {
  const getStatusStyles = (status: StudentResult['status']) => {
    switch (status) {
      case 'Active':
        return 'text-green-600 bg-green-600';
      case 'Inactive':
        return 'text-gray-500';
      case 'Suspended':
        return 'text-red-500';
      default:
        return 'text-gray-600';
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .slice(0, 2)
      .toUpperCase();
  };

  const getAvatarColor = (name: string) => {
    const colors = [
      'bg-blue-100 text-blue-600',
      'bg-green-100 text-green-600',
      'bg-purple-100 text-purple-600',
      'bg-yellow-100 text-yellow-600',
      'bg-pink-100 text-pink-600',
      'bg-indigo-100 text-indigo-600',
    ];
    const index = name.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Generate page numbers
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];

    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      pages.push(1);

      if (currentPage > 3) {
        pages.push('...');
      }

      const start = Math.max(2, currentPage - 1);
      const end = Math.min(totalPages - 1, currentPage + 1);

      for (let i = start; i <= end; i++) {
        pages.push(i);
      }

      if (currentPage < totalPages - 2) {
        pages.push('...');
      }

      pages.push(totalPages);
    }

    return pages;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200">
      {/* Search and Filters */}
      <div className="p-4 flex items-center gap-4 border-b border-gray-200">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name, email or ID..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>

        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
          <ListFilter className="w-4 h-4" />
          Filter by status
        </button>

        <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
          <ListFilter className="w-4 h-4" />
          Filter by grade
        </button>
      </div>

      {/* Table */}
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Class</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Total Score</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Position</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
            <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map((student) => (
              <tr key={student.id} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium ${getAvatarColor(
                        student.name
                      )}`}
                    >
                      {getInitials(student.name)}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{student.name}</p>
                      <p className="text-xs text-gray-500">{student.email}</p>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 text-xs font-medium rounded">
                    {student.class}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-900">{student.totalScore}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{student.position}</td>
                <td className="px-6 py-4">
                  <span className={`text-sm font-medium  ${getStatusStyles(student.status)}`}>
                    • {student.status}
                  </span>
                </td>
                <td className="px-6 py-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="text-gray-400 hover:text-gray-600">
                        <MoreVertical className="w-5 h-5" />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>
                        <span className="cursor-pointer">View Details</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="cursor-pointer">Download Result</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span className="cursor-pointer">Print Result</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                No students found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
          <button
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === 1}
            onClick={() => onPageChange(currentPage - 1)}
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </button>

          <div className="flex items-center gap-2">
            {generatePageNumbers().map((page, index) => (
              <button
                key={index}
                onClick={() => typeof page === 'number' && onPageChange(page)}
                disabled={typeof page !== 'number'}
                className={`min-w-[32px] h-8 flex items-center justify-center text-sm rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-gray-900 text-white font-medium'
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
            className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={currentPage === totalPages}
            onClick={() => onPageChange(currentPage + 1)}
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
};

export default ResultsTable;