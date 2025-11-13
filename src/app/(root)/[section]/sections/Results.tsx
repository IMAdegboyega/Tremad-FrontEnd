'use client'

import React, { useState } from 'react';
import { Download, TrendingUp, TrendingDown, Award, Users, Target, BookOpen, Filter, Calendar, Check, ChevronDown, ListFilter } from 'lucide-react';
import StatsCard from '@/Components/student/Results/StatsCard';
import ResultsTable from '@/Components/student/Results/ResultsTable';
import { Button } from "@/Components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";

/**
 * SelectDropdown Component
 * 
 * A reusable dropdown component for filtering and selection purposes.
 * Features a clean design with icons, placeholder text, and visual selection indicators.
 * 
 * Props:
 * @param options - Array of dropdown options with value and label
 * @param value - Currently selected value
 * @param onChange - Callback function when selection changes
 * @param icon - Icon to display in the dropdown trigger
 * @param placeholder - Placeholder text when no option is selected
 */
const SelectDropdown = ({
  options,
  value,
  onChange,
  icon,
  placeholder
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
}) => {
  // Find the currently selected option for display
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <DropdownMenu>
      {/* Dropdown Trigger Button */}
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center shadow-none gap-0 px-3 lg:px-5 py-3 lg:py-5 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 w-full lg:w-auto"
        >
          {/* Icon Display */}
          <span className='text-gray-500'>
            {icon}
          </span>
          {/* Selected Option or Placeholder Text */}
          <span className='px-2 lg:px-3 py-2 text-sm text-gray-700 font-normal'>
            {selectedOption?.label || placeholder}
          </span>
        </Button>
      </DropdownMenuTrigger>
      {/* Dropdown Content */}
      <DropdownMenuContent align="start" className="w-full min-w-[180px]">
        <DropdownMenuGroup>
          {/* Map through options to create dropdown items */}
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{option.label}</span>
              {/* Show checkmark for currently selected option */}
              {value === option.value && (
                <Check className='w-4 h-4 text-green-600' />
              )}
            </DropdownMenuItem>
          ))}
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

/**
 * Results Page Component
 * 
 * Main results page that displays student academic performance data.
 * Features filtering capabilities, statistics overview, and detailed results table.
 * 
 * Features:
 * - Class and term filtering with dropdown selectors
 * - Statistics cards showing performance metrics
 * - Detailed results table with subject-wise breakdown
 * - Responsive design with mobile-optimized layout
 * - Download functionality for results
 */
const Results = () => {
  // State management for filter selections
  const [selectedClass, setSelectedClass] = useState('current');
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Dropdown options configuration
  const classOptions = [
    { value: 'current', label: 'Current class' },
    { value: 'previous', label: 'Previous class' }
  ];

  const termOptions = [
    { value: 'current', label: 'Current term' },
    { value: '1st', label: '1st Term' },
    { value: '2nd', label: '2nd Term' },
    { value: '3rd', label: '3rd Term' }
  ];

  return (
    <div className='space-y-4 lg:space-y-6'>
      {/* Page header with title and filter controls */}
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        {/* Title and Description */}
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Results</h1>
          <p className='text-sm text-gray-500 mt-1'>Check your results fast and easy</p>
        </div>

        {/* Filter Controls and Actions */}
        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4'>
          {/* Class selector (hidden on mobile to preserve space) */}
          <div className='hidden lg:block'>
            <SelectDropdown
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              icon={<ListFilter size={16} />}
              placeholder='Select class'
            />
          </div>

          {/* Term selector (always visible) */}
          <SelectDropdown
            options={termOptions}
            value={selectedTerm}
            onChange={setSelectedTerm}
            icon={<Calendar size={16} />}
            placeholder='Select term'
          />

          {/* Download button (hidden on mobile) */}
          <button className='hidden lg:flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium'>
            <Download size={18} />
            Download result
          </button>
        </div>
      </div>

      {/* Statistics overview cards */}
      <StatsCard/>

      {/* Detailed results table */}
      <ResultsTable/>
      
    </div>
  );
};

export default Results;