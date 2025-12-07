'use client'

import React, { useState } from 'react';
import { Download, ListFilter } from 'lucide-react';
import ResultStatsCard from '@/components/superadmin/Result/Resultstatscard';
import QuickActionCard from '@/components/superadmin/Result/Quickactioncard';
import ResultsTable from '@/components/superadmin/Result/Resultstable';
export interface StudentResult {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  class: string;
  totalScore: string;
  position: string;
  status: 'Active' | 'Inactive' | 'Suspended';
}

const ResultManagement: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedTerm, setSelectedTerm] = useState('First Term 2025');

  const itemsPerPage = 8;

  // Sample data
  const studentResults: StudentResult[] = [
    {
      id: '1',
      name: 'Daniel Anderson',
      email: 'dan.anderson@hotmail.com',
      class: 'Primary 4',
      totalScore: '87.5%',
      position: '5th',
      status: 'Active',
    },
    {
      id: '2',
      name: 'Jessica Taylor',
      email: 'jessica.t@live.com',
      class: 'Primary 4',
      totalScore: '87.5%',
      position: '1st',
      status: 'Active',
    },
    {
      id: '3',
      name: 'Emily Davis',
      email: 'e.davis@me.com',
      class: 'Primary 4',
      totalScore: '79.2%',
      position: '12th',
      status: 'Suspended',
    },
    {
      id: '4',
      name: 'David Wilson',
      email: 'david.wilson@yahoo.com',
      class: 'Primary 4',
      totalScore: '87.5%',
      position: '12th',
      status: 'Suspended',
    },
    {
      id: '5',
      name: 'David Wilson',
      email: 'david.wilson@yahoo.com',
      class: 'Primary 4',
      totalScore: '45.2%',
      position: '1st',
      status: 'Inactive',
    },
    {
      id: '6',
      name: 'Laura Jackson',
      email: 'laura.j@icloud.com',
      class: 'Primary 4',
      totalScore: '87.5%',
      position: '25th',
      status: 'Suspended',
    },
    {
      id: '7',
      name: 'Michael Brown',
      email: 'michael.b@gmail.com',
      class: 'Primary 4',
      totalScore: '92.3%',
      position: '2nd',
      status: 'Active',
    },
    {
      id: '8',
      name: 'Sarah Connor',
      email: 'sarah.c@outlook.com',
      class: 'Primary 4',
      totalScore: '88.1%',
      position: '3rd',
      status: 'Active',
    },
  ];

  // Filter students
  const filteredStudents = studentResults.filter(student =>
    student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    student.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Pagination
  const totalPages = Math.ceil(filteredStudents.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const currentStudents = filteredStudents.slice(startIndex, startIndex + itemsPerPage);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  const handleDownload = () => {
    console.log('Downloading results...');
  };

  // Quick actions data
  const quickActions = [
    {
      id: '1',
      icon: '/icon/allresults.svg',
      iconBg: 'bg-green-100',
      title: 'All Results',
      subtitle: 'View all students',
    },
    {
      id: '2',
      icon: '/icon/graderesult.svg',
      iconBg: 'bg-orange-100',
      title: 'Grade 12 Results',
      subtitle: 'Final year focus',
    },
    {
      id: '3',
      icon: '/icon/resultsubjectanalysis.svg',
      iconBg: 'bg-purple-100',
      title: 'Subject Analysis',
      subtitle: 'Performance by subject',
    },
    {
      id: '4',
      icon: '/icon/resultprintbroadsheets.svg',
      iconBg: 'bg-yellow-100',
      title: 'Print Broadsheets',
      subtitle: 'Class result sheets',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-2xl font-semibold text-gray-900">Result management</h1>
          <p className="text-sm text-gray-500 mt-1">Manage subjects and view progress</p>
        </div>
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50">
            <ListFilter className="w-4 h-4" />
            {selectedTerm}
          </button>
          <button 
            onClick={handleDownload}
            className="flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-green-600 rounded-lg hover:bg-green-700"
          >
            <Download className="w-4 h-4" />
            Download
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <ResultStatsCard
          title="Student pass rate"
          trinket= "/icon/message.svg"
          value="87.2%"
          change="+20.1% from last term"
          isPositive={true}
        />
        <ResultStatsCard
          title="Student fail rate"
          trinket= "/icon/activity.svg"
          value="12.8%"
          change="-20.1% from last term"
          isPositive={false}
          valueColor="text-red-500"
        />
        <ResultStatsCard
          title="New this month"
          trinket= "/icon/activity.svg"
          value="12"
          change="+20.1% from last term"
          isPositive={true}
        />
      </div>

      {/* Quick Actions */}
      <div className="mb-6 bg-white flex flex-col p-4 rounded-xl">
        <h2 className="text-sm font-medium text-gray-700 mb-3">Quick actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-2">
          {quickActions.map((action) => (
            <QuickActionCard
              key={action.id}
              icon={action.icon}
              iconBg={action.iconBg}
              title={action.title}
              subtitle={action.subtitle}
              onClick={() => console.log(`Clicked: ${action.title}`)}
            />
          ))}
        </div>
      </div>

      {/* Results Table */}
      <ResultsTable
        students={currentStudents}
        searchQuery={searchQuery}
        onSearchChange={(query) => {
          setSearchQuery(query);
          setCurrentPage(1);
        }}
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
    </div>
  );
};

export default ResultManagement;