'use client';

import React, { useRef, useState } from 'react';
import { ChevronLeft, ChevronDown, Download, Printer, Loader2 } from 'lucide-react';
import Image from 'next/image';
import { SCHOOL_INFO } from '@/Constants/SchoolInfo';
import {
  getBroadsheet,
  type BroadsheetResponse,
  type BroadsheetScores,
} from '@/lib/api/superAdmin.service';

const TERMS = ['First Term', 'Second Term', 'Third Term'] as const;

const ordinal = (n: number) => {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
};

const gradeStyle = (grade: string): string => {
  const g = (grade || '').trim().toUpperCase();
  if (g.startsWith('A')) return '#16a34a';
  if (g.startsWith('B')) return '#7c3aed';
  if (g.startsWith('C')) return '#2563eb';
  if (g.startsWith('D') || g === 'E8') return '#d97706';
  if (g.startsWith('F')) return '#dc2626';
  return '#6b7280';
};

interface PrintBroadsheetProps {
  defaultClass?: string;
  defaultAcademicYear?: string;
  defaultTerm?: string;
  classOptions?: string[];
  onBack: () => void;
}

const PrintBroadsheet: React.FC<PrintBroadsheetProps> = ({
  defaultClass = '',
  defaultAcademicYear = '',
  defaultTerm = 'First Term',
  classOptions = [],
  onBack,
}) => {
  const [selectedClass, setSelectedClass] = useState(defaultClass);
  const [academicYear, setAcademicYear] = useState(defaultAcademicYear);
  const [term, setTerm] = useState<(typeof TERMS)[number] | ''>(
    TERMS.includes(defaultTerm as (typeof TERMS)[number]) ? (defaultTerm as (typeof TERMS)[number]) : 'First Term'
  );

  const [data, setData] = useState<BroadsheetResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloading, setDownloading] = useState(false);

  const tableRef = useRef<HTMLDivElement>(null);

  const canGenerate = !!selectedClass && !!academicYear.trim() && !!term;

  const handleGenerate = async () => {
    if (!canGenerate) return;
    setLoading(true);
    setError('');
    setData(null);
    try {
      const res = await getBroadsheet({
        academicYear: academicYear.trim(),
        term,
        class: selectedClass,
      });
      if (res?.success && res.data) {
        setData(res.data);
      } else {
        setError((res as any)?.message || 'Failed to generate broadsheet.');
      }
    } catch {
      setError('Failed to generate broadsheet. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => window.print();

  const handleDownloadPDF = async () => {
    if (!tableRef.current || !data) return;
    setDownloading(true);
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(tableRef.current, {
        scale: 1.5,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        scrollX: 0,
        scrollY: 0,
        width: tableRef.current.scrollWidth,
        height: tableRef.current.scrollHeight,
      });

      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(canvas.toDataURL('image/png'), 'PNG', 0, 0, canvas.width, canvas.height);
      const safeTerm = data.term.replace(/\s+/g, '_');
      const safeYear = data.academicYear.replace(/\//g, '-');
      const safeClass = data.class.replace(/\s+/g, '_');
      pdf.save(`Broadsheet_${safeClass}_${safeTerm}_${safeYear}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className='min-h-full bg-gray-50 p-2 sm:p-4 md:p-6 space-y-4'>
      {/* Print styles */}
      <style>{`
        @media print {
          .no-print { display: none !important; }
          .print-container { overflow: visible !important; }
          @page { size: A3 landscape; margin: 8mm; }
          body { background: white; }
        }
      `}</style>

      {/* Header */}
      <div className='no-print flex items-center gap-3'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors'
        >
          <ChevronLeft className='w-5 h-5' />
          <span className='text-sm font-medium'>Back</span>
        </button>
        <div>
          <h1 className='text-xl font-semibold text-gray-900'>Print Broadsheet</h1>
          <p className='text-xs text-gray-500'>Class result sheet for a specific term</p>
        </div>
      </div>

      {/* Filter picker */}
      <div className='no-print bg-white rounded-xl border border-gray-200 p-4'>
        <div className='flex flex-wrap gap-4 items-end'>
          {/* Class */}
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Class <span className='text-red-500'>*</span>
            </label>
            {classOptions.length > 0 ? (
              <div className='relative'>
                <select
                  value={selectedClass}
                  onChange={(e) => setSelectedClass(e.target.value)}
                  className='w-40 appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500'
                >
                  <option value=''>Select class…</option>
                  {classOptions.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
                <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
              </div>
            ) : (
              <input
                type='text'
                placeholder='e.g. JSS 1A'
                value={selectedClass}
                onChange={(e) => setSelectedClass(e.target.value)}
                className='w-40 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
              />
            )}
          </div>

          {/* Academic Year */}
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Academic Year <span className='text-red-500'>*</span>
            </label>
            <input
              type='text'
              placeholder='e.g. 2025/2026'
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              className='w-36 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500'
            />
          </div>

          {/* Term */}
          <div>
            <label className='block text-xs font-medium text-gray-600 mb-1'>
              Term <span className='text-red-500'>*</span>
            </label>
            <div className='relative'>
              <select
                value={term}
                onChange={(e) => setTerm(e.target.value as (typeof TERMS)[number])}
                className='w-40 appearance-none px-3 py-2 border border-gray-200 rounded-lg text-sm bg-white pr-8 focus:outline-none focus:ring-2 focus:ring-green-500'
              >
                {TERMS.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <ChevronDown className='absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none' />
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={!canGenerate || loading}
            className='flex items-center gap-2 px-5 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          >
            {loading && <Loader2 className='w-4 h-4 animate-spin' />}
            {loading ? 'Generating…' : 'Generate Broadsheet'}
          </button>
        </div>

        {error && (
          <p className='mt-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-4 py-2'>
            {error}
          </p>
        )}
      </div>

      {/* Broadsheet */}
      {data && (
        <>
          {/* Action buttons */}
          <div className='no-print flex items-center justify-between'>
            <p className='text-sm text-gray-500'>
              {data.classSize} student{data.classSize !== 1 ? 's' : ''} · {data.subjects.length} subject{data.subjects.length !== 1 ? 's' : ''}
            </p>
            <div className='flex items-center gap-3'>
              <button
                onClick={handlePrint}
                className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
              >
                <Printer className='w-4 h-4' />
                Print
              </button>
              <button
                onClick={handleDownloadPDF}
                disabled={downloading}
                className='flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors disabled:opacity-60'
              >
                {downloading ? (
                  <Loader2 className='w-4 h-4 animate-spin' />
                ) : (
                  <Download className='w-4 h-4' />
                )}
                {downloading ? 'Generating PDF…' : 'Download PDF'}
              </button>
            </div>
          </div>

          {/* Printable broadsheet */}
          <div className='overflow-x-auto print-container'>
            <div ref={tableRef} className='bg-white min-w-max'>
              {/* School header */}
              <div className='px-6 pt-6 pb-4 border-b-2 border-[#006437] flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <Image src='/icon/logo.svg' alt='Logo' width={48} height={38} className='object-contain' />
                  <div>
                    <p className='text-base font-bold text-gray-900'>{SCHOOL_INFO.name}</p>
                    <p className='text-xs text-gray-500'>{SCHOOL_INFO.address.join(', ')}</p>
                  </div>
                </div>
                <div className='text-right'>
                  <p className='text-sm font-bold text-[#006437]'>Class Broadsheet</p>
                  <p className='text-xs text-gray-500'>
                    {data.class} · {data.term} · {data.academicYear}
                  </p>
                  <p className='text-xs text-gray-400 mt-0.5'>
                    {data.classSize} student{data.classSize !== 1 ? 's' : ''} registered
                  </p>
                </div>
              </div>

              {/* Table */}
              {data.students.length === 0 ? (
                <div className='py-16 text-center'>
                  <p className='text-gray-500 text-sm'>No results found for {data.class} — {data.term} {data.academicYear}.</p>
                </div>
              ) : (
                <table className='w-full border-collapse text-xs'>
                  <thead>
                    <tr className='bg-[#006437] text-white'>
                      <th className='py-2.5 px-3 text-left font-semibold whitespace-nowrap sticky left-0 bg-[#006437] z-10'>#</th>
                      <th className='py-2.5 px-3 text-left font-semibold whitespace-nowrap sticky left-10 bg-[#006437] z-10 min-w-[140px]'>Student Name</th>
                      <th className='py-2.5 px-3 text-left font-semibold whitespace-nowrap min-w-[90px]'>Adm. No.</th>
                      {data.subjects.map((s) => (
                        <th key={s} className='py-2.5 px-2 text-center font-semibold whitespace-nowrap min-w-[72px]'>
                          {s}
                        </th>
                      ))}
                      <th className='py-2.5 px-3 text-center font-semibold whitespace-nowrap'>Avg %</th>
                      <th className='py-2.5 px-3 text-center font-semibold whitespace-nowrap'>Position</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.students.map((student, idx) => {
                      const rowBg = idx % 2 === 0 ? '#ffffff' : '#f9fafb';
                      return (
                        <tr key={student._id} style={{ backgroundColor: rowBg }}>
                          <td className='py-2.5 px-3 text-gray-500 font-medium' style={{ backgroundColor: rowBg }}>
                            {idx + 1}
                          </td>
                          <td className='py-2.5 px-3 font-semibold text-gray-900 whitespace-nowrap' style={{ backgroundColor: rowBg }}>
                            {student.firstName} {student.lastName}
                          </td>
                          <td className='py-2.5 px-3 text-gray-500 whitespace-nowrap'>
                            {student.admissionNumber || '—'}
                          </td>
                          {data.subjects.map((subjectName) => {
                            const sc: BroadsheetScores | undefined = student.scores[subjectName];
                            if (!sc) {
                              return (
                                <td key={subjectName} className='py-2.5 px-2 text-center text-gray-300'>
                                  —
                                </td>
                              );
                            }
                            return (
                              <td key={subjectName} className='py-2.5 px-2 text-center'>
                                <span className='font-semibold text-gray-900'>{sc.total}</span>
                                <br />
                                <span
                                  className='text-xs font-bold'
                                  style={{ color: gradeStyle(sc.grade) }}
                                >
                                  {sc.grade}
                                </span>
                              </td>
                            );
                          })}
                          <td className='py-2.5 px-3 text-center font-bold text-[#006437]'>
                            {student.averageScore.toFixed(1)}
                          </td>
                          <td className='py-2.5 px-3 text-center font-bold text-gray-900'>
                            {ordinal(student.position)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}

              {/* Footer */}
              <div className='px-6 py-3 border-t border-gray-200 flex justify-between items-center'>
                <p className='text-xs text-gray-400'>{SCHOOL_INFO.email}</p>
                <p className='text-xs text-gray-400'>{SCHOOL_INFO.phones[0]}</p>
                <p className='text-xs text-gray-400'>{SCHOOL_INFO.address.join(', ')}</p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default PrintBroadsheet;
