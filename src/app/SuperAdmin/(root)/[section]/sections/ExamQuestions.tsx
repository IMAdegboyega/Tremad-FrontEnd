'use client'

import React, { useState } from 'react';
import ExamQuestionsGrid from '@/components/superadmin/Exams/ExamQuestionsGrid';
import ExamQuestionDetail from '@/components/superadmin/Exams/ExamQuestionDetail';

export interface ExamQuestion {
  id: string;
  subject: string;
  questionCount: number;
  duration: string;
  lastModified: string;
  files?: ExamFile[]; // Files belonging to this subject
}

export interface ExamFile {
  id: string;
  fileName: string;
  fileType: 'PDF' | 'Google docs' | 'Word' | 'Excel';
  source: string;
  uploadedBy: string;
  uploadDate: string;
}

const ExamQuestions: React.FC = () => {
  const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);

  // Sample data
  const examQuestions: ExamQuestion[] = [
    {
      id: '1',
      subject: 'Mathematics',
      questionCount: 27,
      duration: '30 mins',
      lastModified: '13 Nov, 24 08PM',
      files: [
        {
          id: '1',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Mr. James Anderson',
          uploadDate: 'Aug 29, 2025'
        },
        {
          id: '2',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Ms. Emily Carter',
          uploadDate: 'Aug 30, 2025'
        },
        {
          id: '3',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'Google docs',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Dr. Michael Thompson',
          uploadDate: 'Aug 31, 2025'
        },
        {
          id: '4',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Mrs. Lisa Green',
          uploadDate: 'Sep 4, 2025'
        },
        {
          id: '5',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Mr. David Brown',
          uploadDate: 'Sep 3, 2025'
        },
        {
          id: '6',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Dr. Robert Taylor',
          uploadDate: 'Sep 1, 2025'
        },
        {
          id: '7',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Mrs. Patricia Martinez',
          uploadDate: 'Sep 5, 2025'
        },
        {
          id: '8',
          fileName: 'Mathematics_Final_Exam_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?abc...',
          uploadedBy: 'Ms. Jessica Miller',
          uploadDate: 'Sep 2, 2025'
        },
      ]
    },
    {
      id: '2',
      subject: 'Science',
      questionCount: 13,
      duration: '15 mins',
      lastModified: '13 Nov, 24 08PM',
      files: [
        {
          id: '9',
          fileName: 'Science_Midterm_2024.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?xyz...',
          uploadedBy: 'Dr. Sarah Wilson',
          uploadDate: 'Sep 10, 2025'
        },
        {
          id: '10',
          fileName: 'Science_Lab_Report.pdf',
          fileType: 'PDF',
          source: 'drive.google.com/doc/d/?xyz...',
          uploadedBy: 'Mr. John Davis',
          uploadDate: 'Sep 12, 2025'
        },
      ]
    },
    {
      id: '3',
      subject: 'English',
      questionCount: 13,
      duration: '15 mins',
      lastModified: '13 Nov, 24 08PM',
      files: []
    },
    {
      id: '4',
      subject: 'Business studies',
      questionCount: 13,
      duration: '15 mins',
      lastModified: '13 Nov, 24 08PM',
      files: []
    },
    {
      id: '5',
      subject: 'Mathematics',
      questionCount: 11,
      duration: '13 mins',
      lastModified: '13 Nov, 24 08PM',
      files: []
    },
    {
      id: '6',
      subject: 'Science',
      questionCount: 11,
      duration: '13 mins',
      lastModified: '13 Nov, 24 08PM',
      files: []
    },
  ];

  // Handlers
  const handleViewDetails = (subjectId: string) => {
    setSelectedSubjectId(subjectId);
  };

  const handleBackToGrid = () => {
    setSelectedSubjectId(null);
  };

  // Find selected subject
  const selectedSubject = examQuestions.find(q => q.id === selectedSubjectId);

  // Render detail view if a subject is selected
  if (selectedSubject) {
    return (
      <ExamQuestionDetail 
        subject={selectedSubject}
        onBack={handleBackToGrid}
      />
    );
  }

  // Render grid view
  return (
    <ExamQuestionsGrid 
      examQuestions={examQuestions}
      onViewDetails={handleViewDetails}
    />
  );
};

export default ExamQuestions;