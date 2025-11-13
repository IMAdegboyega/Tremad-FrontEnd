'use client'

import React, { useState } from 'react';
import { ChevronLeft, Search, ListFilter, EllipsisVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/Components/ui/dropdown-menu';
import Image from 'next/image';
import { ExamQuestion } from '@/app/SuperAdmin/(root)/[section]/sections/ExamQuestions';
import StatsCard from '../PortalLogin/StatsCard';

interface ExamQuestionDetailProps {
  subject: ExamQuestion;
  onBack: () => void;
}

const ExamQuestionDetail: React.FC<ExamQuestionDetailProps> = ({ 
  subject, 
  onBack 
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  const files = subject.files || [];
  const totalFiles = files.length;
  const totalStorage = '24.8 MB'; // Calculate from actual file sizes
  const lastUpdated = 'Aug 28';

  // Filter files based on search
  const filteredFiles = files.filter(file =>
    file.fileName.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.uploadedBy.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header with Back Button */}
      <div className="mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex items-center gap-3 mb-2">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{subject.subject}</h1>
            <p className="text-sm text-gray-500">Manage subjects and view progress</p>
          </div>
          <div className='ml-auto'>
            <button className="px-4 py-3 bg-green-700 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
              <Plus className="w-4 h-4" />
              Create new folder
            </button>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 md:grid-cols-3 gap-6 mb-8'>
          <StatsCard
            title="Total Files" 
            count={10} 
            icon='/icon/message.svg'
            change="+20.1% from last term" 
            isPositive={true}
          />
          <StatsCard
            title="Total Storage" 
            storage={24} 
            icon='/icon/activity.svg'
            change="-20.1% from last term" 
            isPositive={false}
          />
          <StatsCard
            title="Last Updated" 
            date="Aug 28" 
            icon='/icon/activity.svg'
            change="+20.1% from last term" 
            isPositive={true}
          />
        </div>

      {/* Search and Filters */}
      <div className="bg-white rounded-lg border border-gray-200 mb-6">
        <div className="p-4 flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by student name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 text-sm border-0 focus:outline-none"
            />
          </div>

          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ListFilter className="w-4 h-4" />
            Filter by status
          </button>

          <button className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50">
            <ListFilter className="w-4 h-4" />
            Filter by class
          </button>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-200">
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">File name</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">File type</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Source</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Uploaded by</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Upload date</th>
              <th className="text-left text-xs font-medium text-gray-500 px-6 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredFiles.length > 0 ? (
              filteredFiles.map((file) => (
                <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{file.fileName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{file.fileType}</td>
                  <td className="px-6 py-4 text-sm text-blue-600 truncate max-w-xs">
                    {file.source}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{file.uploadedBy}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{file.uploadDate}</td>
                  <td className="px-6 py-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="text-gray-400 hover:text-gray-600">
                          <EllipsisVertical size={20} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <span className='cursor-pointer'>View File</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className='cursor-pointer'>Download</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className='cursor-pointer'>Share</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <span className="text-red-600 cursor-pointer">Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-sm text-gray-500">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>

        {/* Pagination would go here */}
      </div>
    </div>
  );
};

export default ExamQuestionDetail;