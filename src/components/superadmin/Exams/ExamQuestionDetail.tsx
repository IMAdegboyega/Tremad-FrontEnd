'use client'

import React, { useState } from 'react';
import { ChevronLeft, Search, ListFilter, EllipsisVertical, Plus } from 'lucide-react';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import Image from 'next/image';
import { ExamQuestion } from '@/app/SuperAdmin/(root)/[section]/sections/ExamQuestions';
import StatsCard from '../PortalLogin/StatsCard';

interface ExamQuestionDetailProps {
  subject: ExamQuestion;
  onBack: () => void;
  onCreateNewFolder: () => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onRenameFolder: (folderId: string, folderName: string) => void;
}

const ExamQuestionDetail: React.FC<ExamQuestionDetailProps> = ({ 
  subject, 
  onBack, 
  onCreateNewFolder,
  onDeleteFolder,
  onRenameFolder,
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
    <div className="min-h-full bg-gray-50 p-2 sm:p-4 md:p-6">
      {/* Header with Back Button */}
      <div className="mb-4 md:mb-6">
        <button 
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-3 md:mb-4 min-h-[44px]"
        >
          <ChevronLeft className="w-5 h-5" />
          <span className="text-sm font-medium">Back</span>
        </button>

        <div className="flex flex-col sm:flex-row sm:items-center gap-3 mb-2">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">{subject.subject}</h1>
            <p className="text-xs sm:text-sm text-gray-500">Manage subjects and view progress</p>
          </div>
          <div className='sm:ml-auto'>
            <button
              onClick={onCreateNewFolder}
              className="w-full sm:w-auto px-3 sm:px-4 py-2.5 sm:py-3 bg-green-700 text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center gap-2 min-h-[44px]">
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create new folder</span>
              <span className="sm:hidden">New folder</span>
            </button>
          </div>
        </div>
      </div>

        {/* Stats Cards */}
        <div className='grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-6 mb-4 md:mb-8'>
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
      <div className="bg-white rounded-lg border border-gray-200 mb-4 md:mb-6">
        <div className="p-3 sm:p-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
          <div className="flex-1 relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 sm:border-0 rounded-lg sm:rounded-none focus:outline-none focus:ring-2 sm:focus:ring-0 focus:ring-green-500 min-h-[44px]"
            />
          </div>

          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1 sm:pb-0">
            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap min-h-[44px]">
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter by status</span>
              <span className="sm:hidden">Status</span>
            </button>

            <button className="flex items-center justify-center gap-2 px-3 sm:px-4 py-2.5 text-xs sm:text-sm text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-50 whitespace-nowrap min-h-[44px]">
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter by class</span>
              <span className="sm:hidden">Class</span>
            </button>
          </div>
        </div>
      </div>

      {/* Files Table */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px]">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">File name</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Type</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Source</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Uploaded by</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Date</th>
                <th className="text-left text-xs font-medium text-gray-500 px-3 sm:px-6 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredFiles.length > 0 ? (
                filteredFiles.map((file) => (
                  <tr key={file.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-900">
                      <span className="truncate max-w-[150px] sm:max-w-none block">{file.fileName}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">{file.fileType}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-blue-600">
                      <span className="truncate max-w-[100px] sm:max-w-[150px] block">{file.source}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600">
                      <span className="truncate max-w-[100px] sm:max-w-none block">{file.uploadedBy}</span>
                    </td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4 text-xs sm:text-sm text-gray-600 whitespace-nowrap">{file.uploadDate}</td>
                    <td className="px-3 sm:px-6 py-3 sm:py-4">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <button className="text-gray-400 hover:text-gray-600 min-w-[44px] min-h-[44px] flex items-center justify-center">
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
                        <DropdownMenuItem onClick={() => onRenameFolder(file.id, file.fileName)}>
                          <span className='cursor-pointer'>Rename</span>
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => onDeleteFolder(file.id, file.fileName)}
                        >
                          <span 
                            className="text-red-600 cursor-pointer"
                          >Delete</span>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className="px-3 sm:px-6 py-12 text-center text-sm text-gray-500">
                  No files found
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </div>

        {/* Pagination would go here */}
      </div>
    </div>
  );
};

export default ExamQuestionDetail;