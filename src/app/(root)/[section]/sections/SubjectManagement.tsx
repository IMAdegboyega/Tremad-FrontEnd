"use client";

import ClassManagement from "@/components/student/SubjectManagement/ClassManagement";
import SearchBar from "@/components/student/SubjectManagement/SearchBar";
import StatManagement from "@/components/student/SubjectManagement/StatManagement";
import { Download, ListFilter } from "lucide-react";
import React from "react";

/**
 * SubjectManagement section
 *
 * Manage enrolled subjects: quick stats, search/filter, and class list.
 */
const SubjectManagement = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* Header: title and quick actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Subjects</h1>
          <p className="text-sm text-gray-500">
            Manage subjects and view progress
          </p>
        </div>

        {/* Actions: term filter and report download */}
        <div className="flex items-center gap-3">
          <button className="flex items-center gap-1 text-gray-600 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <ListFilter size={16} />
            Current term
          </button>
          <button className="flex items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
            <Download size={16} /> Download report
          </button>
        </div>
      </div>

      {/* Stats: overview cards */}
      <StatManagement />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchBar />
        <button className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <ListFilter size={16} />
          Filter
        </button>
      </div>

      {/* Subject list */}
      <ClassManagement />
    </div>
  );
};

export default SubjectManagement;
