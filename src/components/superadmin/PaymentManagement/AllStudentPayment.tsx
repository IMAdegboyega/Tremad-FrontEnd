'use client'

import React, { useState } from 'react';
import { Search, ListFilter, Download, EllipsisVertical, ArrowLeft } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { StudentPayment } from '@/app/SuperAdmin/(root)/[section]/sections/PaymentManagement';

interface AllStudentsPaymentProps {
  students: StudentPayment[];
  onBack: () => void;
  onViewDetails: (studentId: string) => void;
}

const AllStudentsPayment: React.FC<AllStudentsPaymentProps> = ({
  students,
  onBack,
  onViewDetails
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Filter students
  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          student.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'All Paid':
        return 'text-green-600';
      case 'Due Today':
        return 'text-yellow-600';
      case '2 Over due':
      case '3 Over due':
        return 'text-red-600';
      default:
        return 'text-gray-600';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">All Students Payment Status</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively.</p>
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700">
            <Download className="w-4 h-4" />
            Download report
          </button>
        </div>
      </div>

      {/* Search and Filter */}
      <div className="flex items-center gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by student name , email or ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
          />
        </div>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 bg-white">
              <ListFilter className="w-4 h-4" />
              Filter by status
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => setStatusFilter('all')}>
              <span className="cursor-pointer">All Status</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('All Paid')}>
              <span className="cursor-pointer">All Paid</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('Due Today')}>
              <span className="cursor-pointer">Due Today</span>
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setStatusFilter('2 Over due')}>
              <span className="cursor-pointer">Over Due</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* Students Table */}
      <div className="bg-white rounded-xl border border-gray-100 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Name</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Balance</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Status</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Reference number</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Payment method</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? (
              filteredStudents.map((student) => (
                <tr key={student.id} className="border-b border-gray-50 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{student.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{student.balance}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium ${getStatusStyle(student.status)}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${
                        student.status === 'All Paid' ? 'bg-green-600' :
                        student.status === 'Due Today' ? 'bg-yellow-600' :
                        'bg-red-600'
                      }`} />
                      {student.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{student.referenceNumber}</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onViewDetails(student.id)}>
                          <span className="cursor-pointer">View Details</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Send Reminder</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="cursor-pointer">Download Receipt</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="px-6 py-12 text-center text-sm text-gray-500">
                  No students found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default AllStudentsPayment;