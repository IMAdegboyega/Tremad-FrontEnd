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
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">Exam questions</h1>
            <p className="text-sm text-gray-500 mt-1">Manage your exam questions effectively</p>
          </div>
          <button 
            onClick={onCreateNewFolder} 
            className="px-4 py-3 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Create new folder
          </button>
        </div>

        {/* Search and Filter */}
        <div className="flex gap-4 mt-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by subject name, grade or ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white"
            />
          </div>

          <button 
            onClick={() => setFilterBy('status')}
            className={`px-4 py-2.5 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
              filterBy === 'status' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Filter by status
          </button>
          <button 
            onClick={() => setFilterBy('grade')}
            className={`px-4 py-2.5 text-sm border rounded-lg flex items-center gap-2 transition-colors ${
              filterBy === 'grade' 
                ? 'bg-green-50 border-green-200 text-green-700' 
                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
            }`}
          >
            <ListFilter className="w-4 h-4" />
            Filter by grade
          </button>
        </div>
      </div>

      {/* Questions Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredQuestions.length > 0 ? (
          filteredQuestions.map((question) => (
            <div 
              key={question.id} 
              className="bg-white rounded-lg border border-gray-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className='flex'>
                <div 
                  className="w-12 h-12 rounded-lg mb-4 flex items-center justify-center cursor-pointer"
                  onClick={() => onViewDetails(question.id)}
                >
                  <Image
                    src="/icon/folder.svg"
                    alt='folder'
                    width={50}
                    height={50}
                  />
                </div>
                <div className='ml-auto'>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <button className="cursor-pointer">
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