'use client'

import React, { useState } from 'react';
import { Search, Plus, ListFilter, EllipsisVertical } from 'lucide-react';
import Image from 'next/image';
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { ExamQuestion } from '@/app/SuperAdmin/(root)/[section]/sections/ExamQuestions';

interface ExamQuestionsGridProps {
  examQuestions: ExamQuestion[];
  onViewDetails: (subjectId: string) => void;
  onCreateNewFolder: () => void;
  onDeleteFolder: (folderId: string, folderName: string) => void;
  onRenameFolder: (folderId: string, folderName: string) => void;
}

const ExamQuestionsGrid: React.FC<ExamQuestionsGridProps> = ({ 
  examQuestions, 
  onViewDetails,
  onCreateNewFolder,
  onDeleteFolder, 
  onRenameFolder,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterBy, setFilterBy] = useState<'status' | 'grade' | null>(null);

  const filteredQuestions = examQuestions.filter(question =>
    question.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-full bg-gray-50 p-2 sm:p-4 md:p-6">
      {/* Header */}
      <div className="mb-4 md:mb-8">
        <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">Exam questions</h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">Manage your exam questions effectively</p>
          </div>
          <button 
            onClick={onCreateNewFolder} 
            className="px-3 sm:px-4 py-2.5 sm:py-3 bg-primary-green text-white text-xs sm:text-sm font-medium rounded-lg hover:bg-primary-green-hover transition-colors flex items-center justify-center gap-2 min-h-[44px]"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Create new folder</span>
            <span className="sm:hidden">New folder</span>
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4 sm:mt-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject, grade or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white min-h-[44px]"
            />
          </div>

          <div className="flex gap-2 sm:gap-4 overflow-x-auto pb-1">
            <button 
              onClick={() => setFilterBy('status')}
              className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap min-h-[44px] ${
                filterBy === 'status' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter by status</span>
              <span className="sm:hidden">Status</span>
            </button>
            <button 
              onClick={() => setFilterBy('grade')}
              className={`px-3 sm:px-4 py-2.5 text-xs sm:text-sm border rounded-lg flex items-center gap-2 transition-colors whitespace-nowrap min-h-[44px] ${
                filterBy === 'grade' 
                  ? 'bg-green-50 border-green-200 text-green-700' 
                  : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
              }`}
            >
              <ListFilter className="w-4 h-4" />
              <span className="hidden sm:inline">Filter by grade</span>
              <span className="sm:hidden">Grade</span>
            </button>
          </div>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 sm:gap-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div 
              key={question.id} 
              className="bg-white rounded-lg border border-gray-100 p-3 sm:p-4 hover:shadow-md transition-shadow"
            >
              <div className='flex'>
                <div 
                  className="w-10 h-10 sm:w-12 sm:h-12 rounded-lg mb-3 sm:mb-4 flex items-center justify-center cursor-pointer"
                  onClick={() => onViewDetails(question.id)}
                >
                  <Image
                    src="/icon/folder.svg"
                    alt='folder'
                    width={50}
                    height={50}
                    className="w-10 h-10 sm:w-[50px] sm:h-[50px]"
                  />
                </div>
                <div className='ml-auto'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="cursor-pointer min-w-[44px] min-h-[44px] flex items-center justify-center -mt-2 -mr-2">
                        <EllipsisVertical size={20} />
                      </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="start">
                      <DropdownMenuGroup>
                        <DropdownMenuItem onClick={() => onViewDetails(question.id)}>
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          Upload File
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onRenameFolder(question.id, question.subject)}>
                          Rename Folder
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDeleteFolder(question.id, question.subject)} 
                          className='text-red-600'
                        >
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <div 
                className="cursor-pointer"
                onClick={() => onViewDetails(question.id)}
              >
                <h3 className="text-sm font-medium text-gray-900 mb-1">
                  {question.subject}
                </h3>
                <p className="text-xs text-gray-500 mb-4">
                  {question.questionCount} Ques · {question.duration}
                </p>
                <p className="text-xs text-gray-400">
                  {question.lastModified}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500 py-12">
            No exam questions found matching your criteria
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamQuestionsGrid;