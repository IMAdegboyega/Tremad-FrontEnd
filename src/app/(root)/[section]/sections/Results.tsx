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

// Select Dropdown Component
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
  const selectedOption = options.find(opt => opt.value === value);
  
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          className="flex items-center gap-0 px-5 py-5 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500"
        >
          <span className='text-gray-500'>
            {icon}
          </span>
          <span className='px-3 py-2 text-sm text-gray-700 font-normal'>
            {selectedOption?.label || placeholder}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-full min-w-[180px]">
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className="flex items-center justify-between cursor-pointer"
            >
              <span>{option.label}</span>
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

const Results = () => {
  const [selectedClass, setSelectedClass] = useState('current');
  const [selectedTerm, setSelectedTerm] = useState('current');

  // Define options for dropdowns
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
    <div className='space-y-6'>
      {/* Header */}
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Results</h1>
          <p className='text-sm text-gray-500 mt-1'>Check your results fast and easy</p>
        </div>

        <div className='flex items-center gap-4'>
          {/* Class Selector with Dropdown */}
          <SelectDropdown
            options={classOptions}
            value={selectedClass}
            onChange={setSelectedClass}
            icon={<ListFilter size={16} />}
            placeholder='Select class'
          />

          {/* Term Selector with Dropdown */}
          <SelectDropdown
            options={termOptions}
            value={selectedTerm}
            onChange={setSelectedTerm}
            icon={<Calendar size={16} />}
            placeholder='Select term'
          />

          {/* Download Button */}
          <button className='flex items-center gap-2 px-5 py-2.5 bg-green-700 text-white rounded-lg hover:bg-green-800 transition-colors text-sm font-medium'>
            <Download size={18} />
            Download result
          </button>
        </div>
      </div>

      <StatsCard/>

      <ResultsTable/>
      
    </div>
  );
};

export default Results;