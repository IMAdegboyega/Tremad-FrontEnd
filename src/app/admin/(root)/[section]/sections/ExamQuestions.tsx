'use client';

/**
 * Admin > Exam Questions.
 *
 * A browser over Year > Class > Subject > Term, all of it delegated to
 * ExamPaperBrowser — the staff portal renders the same component with
 * `as="staff"`, and the difference between them is scope, which the server
 * decides.
 *
 * This replaced a flat grid of folders whose only key was a free-text subject
 * name. See the ExamPaper model for why there is no folder model behind this.
 */

import React from 'react';
import ExamPaperBrowser from '@/components/superadmin/Exams/ExamPaperBrowser';

const ExamQuestions: React.FC = () => (
  <div className="min-h-screen bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4">
    <header>
      <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
        Exam Questions
      </h1>
      <p className="text-sm text-gray-500 mt-1">
        Papers by session, class, subject and term. Subjects come from each
        class&apos;s curriculum, so one with nothing uploaded still shows.
      </p>
    </header>

    <ExamPaperBrowser as="admin" />
  </div>
);

export default ExamQuestions;
