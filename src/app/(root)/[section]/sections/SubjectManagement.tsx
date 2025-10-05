"use client";

import ClassManagement from "@/Components/student/SubjectManagement/ClassManagement";
import SearchBar from "@/Components/student/SubjectManagement/SearchBar";
import StatManagement from "@/Components/student/SubjectManagement/StatManagement";
import { Download, ListFilter } from "lucide-react";
import React from "react";

const SubjectManagement = () => {
  return (
    <div className="flex flex-col space-y-6">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold">My Subjects</h1>
          <p className="text-sm text-gray-500">
            Manage subjects and view progress
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          <button className="flex sm:w-1/2 items-center gap-1 text-gray-600 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
            <ListFilter size={16} />
            Current term
          </button>
          <button className="flex sm:w-1/2 items-center gap-2 bg-green-700 text-white px-4 py-2 rounded-lg hover:bg-green-800">
            <Download size={16} />
            Download report
          </button>
        </div>
      </div>

      {/* Stats Section */}
      <StatManagement />

      {/* Search + Filter */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <SearchBar />
        <button className="flex items-center gap-1 text-sm border border-gray-200 px-3 py-2 rounded-lg hover:bg-gray-50">
          <ListFilter size={16} />
          Filter
        </button>
      </div>

      {/* Subject List */}
      <ClassManagement />
    </div>
  );
};

export default SubjectManagement;
