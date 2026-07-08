'use client';

import React, { useRef } from 'react';
import { ChevronLeft, Printer, Download } from 'lucide-react';
import Image from 'next/image';
import type { Result } from '@/lib/api/student.service';
import { SCHOOL_INFO } from '@/Constants/SchoolInfo';
import { useUser } from '@/Constants/UserContext';

interface DownloadResultProps {
  result: Result;
  onBack: () => void;
  /** Override the student name (used when SuperAdmin previews a student's result). */
  overrideName?: string;
  /** Override the admission number (used when SuperAdmin previews a student's result). */
  overrideAdmissionNumber?: string;
}

const gradeColor = (grade: string): string => {
  const g = (grade || '').trim().toUpperCase();
  if (g.startsWith('A')) return '#16a34a';
  if (g.startsWith('B')) return '#7c3aed';
  if (g.startsWith('C')) return '#2563eb';
  if (g.startsWith('D')) return '#d97706';
  if (g.startsWith('F')) return '#dc2626';
  return '#6b7280';
};

const DownloadResult: React.FC<DownloadResultProps> = ({ result, onBack, overrideName, overrideAdmissionNumber }) => {
  const slipRef = useRef<HTMLDivElement>(null);
  const user = useUser();

  const studentName = overrideName ?? user?.name ?? 'Student';
  const admissionNumber = overrideAdmissionNumber ?? user?.id ?? '—';
  const studentClass = result.class || user?.grade || '—';

  const handlePrint = () => window.print();

  const handleDownload = async () => {
    if (!slipRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');

      const canvas = await html2canvas(slipRef.current, {
        scale: 2,
        useCORS: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: [canvas.width, canvas.height],
      });

      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
      const safeTerm = result.term.replace(/\s+/g, '_');
      const safeYear = result.academicYear.replace(/\//g, '-');
      pdf.save(`Result_${admissionNumber}_${safeTerm}_${safeYear}.pdf`);
    } catch (err) {
      console.error('PDF generation error:', err);
    }
  };

  const avg = result.summary?.averageScore;
  const position = result.summary?.position;
  const classSize = result.summary?.classSize;

  const ordinal = (n: number) => {
    const s = ['th', 'st', 'nd', 'rd'];
    const v = n % 100;
    return `${n}${s[(v - 20) % 10] || s[v] || s[0]}`;
  };

  return (
    <div className='min-h-full bg-gray-50 p-6'>
      {/* Page header (not captured in PDF) */}
      <div className='mb-6 no-print'>
        <button
          onClick={onBack}
          className='flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4'
        >
          <ChevronLeft className='w-5 h-5' />
          Back to results
        </button>
        <h1 className='text-2xl font-semibold text-gray-900'>
          Result — {result.term} {result.academicYear}
        </h1>
        <p className='text-sm text-gray-500 mt-1'>Preview and download your academic result slip</p>
      </div>

      {/* Result Slip (this is what gets captured) */}
      <div className='flex items-start justify-center mx-auto'>
        <div
          ref={slipRef}
          className='bg-white shadow-lg w-[794px] flex flex-col overflow-hidden'
          style={{ minHeight: '1000px' }}
        >
          {/* Green top bar */}
          <div className='h-3 bg-[#006437]' />

          <div className='px-12 py-8 flex flex-col flex-1 space-y-6'>
            {/* Header */}
            <div className='flex items-center justify-between border-b border-gray-200 pb-6'>
              <div className='flex items-center gap-4'>
                <Image
                  src='/icon/logo.svg'
                  alt='Tremad Schools'
                  width={72}
                  height={58}
                  className='object-contain'
                />
                <div>
                  <h2 className='text-lg font-bold text-gray-900'>{SCHOOL_INFO.name}</h2>
                  <p className='text-xs text-gray-500'>{SCHOOL_INFO.address.join(', ')}</p>
                </div>
              </div>
              <div className='text-right'>
                <p className='text-xl font-bold text-[#006437]'>Academic Report</p>
                <p className='text-sm text-gray-500 mt-1'>{result.term} · {result.academicYear}</p>
              </div>
            </div>

            {/* Student info */}
            <div className='flex items-start gap-8 py-3 px-4 bg-[#F0F9F4] rounded-lg'>
              <div className='flex-1 grid grid-cols-2 gap-x-8 gap-y-2'>
                <div>
                  <p className='text-xs text-gray-500'>Student Name</p>
                  <p className='text-sm font-semibold text-gray-900'>{studentName}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Admission Number</p>
                  <p className='text-sm font-semibold text-gray-900'>{admissionNumber}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Class</p>
                  <p className='text-sm font-semibold text-gray-900'>{studentClass}</p>
                </div>
                <div>
                  <p className='text-xs text-gray-500'>Academic Year</p>
                  <p className='text-sm font-semibold text-gray-900'>{result.academicYear}</p>
                </div>
              </div>
            </div>

            {/* Subjects table */}
            <div>
              <table className='w-full border-collapse'>
                <thead>
                  <tr style={{ borderBottom: '2px solid #006437' }}>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-left'>Subject</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-center w-16'>CA1 /20</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-center w-16'>CA2 /20</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-center w-16'>Exam /60</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-center w-20'>Total /100</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-center w-16'>Grade</th>
                    <th className='py-3 text-xs font-semibold text-gray-700 text-left'>Remark</th>
                  </tr>
                </thead>
                <tbody>
                  {(result.subjects ?? []).map((sub, i) => (
                    <tr
                      key={i}
                      className='border-b border-gray-100'
                      style={{ backgroundColor: i % 2 === 0 ? '#fff' : '#f9fafb' }}
                    >
                      <td className='py-3 text-sm font-medium text-gray-800'>{sub.name}</td>
                      <td className='py-3 text-sm text-gray-600 text-center'>{sub.scores?.firstCA ?? 0}</td>
                      <td className='py-3 text-sm text-gray-600 text-center'>{sub.scores?.secondCA ?? 0}</td>
                      <td className='py-3 text-sm text-gray-600 text-center'>{sub.scores?.exam ?? 0}</td>
                      <td className='py-3 text-sm font-bold text-gray-900 text-center'>{sub.scores?.total ?? 0}</td>
                      <td className='py-3 text-center'>
                        <span
                          className='px-2 py-0.5 rounded text-xs font-bold'
                          style={{ color: gradeColor(sub.grade), backgroundColor: `${gradeColor(sub.grade)}18` }}
                        >
                          {sub.grade || '—'}
                        </span>
                      </td>
                      <td className='py-3 text-xs text-gray-500'>{sub.remark || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Summary row */}
            <div className='flex gap-4'>
              <div className='flex-1 bg-[#F0F9F4] rounded-lg px-5 py-4 flex items-center gap-3'>
                <div>
                  <p className='text-xs text-gray-500'>Average Score</p>
                  <p className='text-2xl font-bold text-[#006437]'>
                    {avg != null ? avg.toFixed(1) : '—'}
                    <span className='text-sm font-normal text-gray-500'>%</span>
                  </p>
                </div>
              </div>
              <div className='flex-1 bg-gray-50 rounded-lg px-5 py-4 flex items-center gap-3'>
                <div>
                  <p className='text-xs text-gray-500'>Position in Class</p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {position != null ? ordinal(position) : '—'}
                    {classSize != null && (
                      <span className='text-sm font-normal text-gray-500'> / {classSize}</span>
                    )}
                  </p>
                </div>
              </div>
              {result.summary?.performance && (
                <div className='flex-1 bg-gray-50 rounded-lg px-5 py-4 flex items-center gap-3'>
                  <div>
                    <p className='text-xs text-gray-500'>Performance</p>
                    <p className='text-lg font-bold text-gray-900'>
                      {result.summary.performance.level}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Comments */}
            {(result.summary?.classTeacherComment || result.summary?.principalComment) && (
              <div className='grid grid-cols-2 gap-4'>
                {result.summary.classTeacherComment && (
                  <div className='border border-gray-100 rounded-lg p-4'>
                    <p className='text-xs font-semibold text-gray-500 mb-1'>Class Teacher&apos;s Comment</p>
                    <p className='text-sm text-gray-700'>{result.summary.classTeacherComment}</p>
                  </div>
                )}
                {result.summary.principalComment && (
                  <div className='border border-gray-100 rounded-lg p-4'>
                    <p className='text-xs font-semibold text-gray-500 mb-1'>Principal&apos;s Comment</p>
                    <p className='text-sm text-gray-700'>{result.summary.principalComment}</p>
                  </div>
                )}
              </div>
            )}

            {/* Spacer */}
            <div className='flex-1' />

            {/* Footer */}
            <div className='border-t border-gray-100 pt-4'>
              <div className='flex items-center justify-between text-xs text-gray-400'>
                <div className='flex items-center gap-2'>
                  <Image src='/icon/phone.svg' alt='phone' width={14} height={14} />
                  <span>{SCHOOL_INFO.phones[0]}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Image src='/icon/location.svg' alt='location' width={14} height={14} />
                  <span>{SCHOOL_INFO.address.join(', ')}</span>
                </div>
                <div className='flex items-center gap-2'>
                  <Image src='/icon/email.svg' alt='email' width={14} height={14} />
                  <span>{SCHOOL_INFO.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Green bottom bar */}
          <div className='h-8 bg-[#006437]' />
        </div>
      </div>

      {/* Action buttons (not captured in PDF) */}
      <div className='flex justify-center gap-4 mt-6 no-print'>
        <button
          onClick={handlePrint}
          className='flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors'
        >
          <Printer className='w-4 h-4' />
          <div className='text-left'>
            <p className='font-medium'>Print</p>
            <p className='text-xs text-gray-500'>print locally</p>
          </div>
        </button>
        <button
          onClick={handleDownload}
          className='flex items-center gap-2 px-4 py-2.5 text-sm text-white bg-primary-green rounded-lg hover:bg-primary-green-hover transition-colors'
        >
          <Download className='w-4 h-4' />
          <div className='text-left'>
            <p className='font-medium'>Download PDF</p>
            <p className='text-xs text-green-200'>save locally</p>
          </div>
        </button>
      </div>
    </div>
  );
};

export default DownloadResult;
