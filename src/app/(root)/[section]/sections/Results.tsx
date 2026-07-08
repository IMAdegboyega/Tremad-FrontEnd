'use client';

import React, { useEffect, useMemo, useState } from 'react';
import {
  Download,
  Calendar,
  Check,
  ListFilter,
} from 'lucide-react';
import StatsCard from '@/components/student/Results/StatsCard';
import ResultsTable from '@/components/student/Results/ResultsTable';
import DownloadResult from '@/components/student/Results/DownloadResult';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { getResults, type Result } from '@/lib/api/student.service';

const SelectDropdown = ({
  options,
  value,
  onChange,
  icon,
  placeholder,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
  icon: React.ReactNode;
  placeholder?: string;
}) => {
  const selectedOption = options.find((opt) => opt.value === value);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant='outline'
          className='flex items-center shadow-none gap-0 px-3 lg:px-5 py-3 lg:py-5 bg-gray-50 border-gray-200 focus:ring-2 focus:ring-green-500 w-full lg:w-auto'
        >
          <span className='text-gray-500'>{icon}</span>
          <span className='px-2 lg:px-3 py-2 text-sm text-gray-700 font-normal'>
            {selectedOption?.label || placeholder}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align='start' className='w-full min-w-[180px]'>
        <DropdownMenuGroup>
          {options.map((option) => (
            <DropdownMenuItem
              key={option.value}
              onClick={() => onChange(option.value)}
              className='flex items-center justify-between cursor-pointer'
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

  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);

  // Download slip state
  const [downloadResult, setDownloadResult] = useState<Result | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getResults()
      .then((res) => {
        if (cancelled) return;
        if (res?.success && Array.isArray(res.data)) {
          setResults(res.data as Result[]);
        } else {
          setResults([]);
        }
      })
      .catch(() => {
        if (!cancelled) setResults([]);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredResults = useMemo(() => {
    if (selectedTerm === 'current') return results;
    // Term values: '1st', '2nd', '3rd' → match against 'First Term', 'Second Term', 'Third Term'
    const termMap: Record<string, string> = {
      '1st': 'first',
      '2nd': 'second',
      '3rd': 'third',
    };
    const needle = termMap[selectedTerm] || selectedTerm.toLowerCase();
    return results.filter((r) => {
      const t = (r.term || '').toLowerCase();
      return t.startsWith(needle);
    });
  }, [results, selectedTerm]);

  // A specific term is selected and we have exactly one result document for it.
  const canDownload = selectedTerm !== 'current' && filteredResults.length === 1 && !loading;

  const classOptions = [
    { value: 'current', label: 'Current class' },
    { value: 'previous', label: 'Previous class' },
  ];

  const termOptions = [
    { value: 'current', label: 'Current term' },
    { value: '1st', label: '1st Term' },
    { value: '2nd', label: '2nd Term' },
    { value: '3rd', label: '3rd Term' },
  ];

  // Show the download slip view when a result is selected
  if (downloadResult) {
    return (
      <DownloadResult
        result={downloadResult}
        onBack={() => setDownloadResult(null)}
      />
    );
  }

  return (
    <div className='space-y-4 lg:space-y-6'>
      <div className='flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4'>
        <div>
          <h1 className='text-2xl font-semibold text-gray-900'>Results</h1>
          <p className='text-sm text-gray-500 mt-1'>
            Check your results fast and easy
          </p>
        </div>

        <div className='flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-4'>
          <div className='hidden lg:block'>
            <SelectDropdown
              options={classOptions}
              value={selectedClass}
              onChange={setSelectedClass}
              icon={<ListFilter size={16} />}
              placeholder='Select class'
            />
          </div>

          <div className='flex flex-col gap-1'>
            <SelectDropdown
              options={termOptions}
              value={selectedTerm}
              onChange={setSelectedTerm}
              icon={<Calendar size={16} />}
              placeholder='Select term'
            />
            {selectedTerm === 'current' && (
              <p className='text-xs text-gray-400 text-center'>
                Select a specific term to download
              </p>
            )}
            {selectedTerm !== 'current' && filteredResults.length === 0 && !loading && (
              <p className='text-xs text-amber-600 text-center'>No result for this term</p>
            )}
          </div>

          <button
            className='flex items-center justify-center gap-2 px-5 py-2.5 bg-primary-green text-white rounded-lg hover:bg-primary-green-hover transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed'
            disabled={!canDownload}
            onClick={() => {
              if (canDownload) setDownloadResult(filteredResults[0]);
            }}
          >
            <Download size={18} />
            Download result
          </button>
        </div>
      </div>

      <StatsCard results={filteredResults} isLoading={loading} />

      <ResultsTable results={filteredResults} isLoading={loading} />
    </div>
  );
};

export default Results;
