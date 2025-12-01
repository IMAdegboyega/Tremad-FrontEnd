import { subjectResults } from '@/Constants/Results'
import React from 'react'

/**
 * ResultsTable Component
 * 
 * A responsive table component that displays student academic results across different subjects.
 * Features both desktop table view and mobile card layout for optimal user experience.
 * 
 * Features:
 * - Responsive design with desktop table and mobile card layouts
 * - Displays subject information, scores, grades, positions, and teacher details
 * - Color-coded grades and position indicators
 * - Hover effects and smooth transitions
 * - Clean, accessible design with proper spacing
 */
const ResultsTable = () => {
  return (
    <div>
      {/* Desktop Table View - Hidden on mobile screens (sm:hidden) */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden hidden sm:block'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-white'>
                {/* Table Headers */}
                <th className='text-left py-6 px-6 text-sm font-medium text-gray-600'>
                  Subject name
                </th>
                <th className='text-left py-6 px-6 text-sm font-medium text-gray-600'>
                  Teacher
                </th>
                <th className='text-center py-6 px-6 text-sm font-medium text-gray-600'>
                  Current score
                </th>
                <th className='text-center py-6 px-6 text-sm font-medium text-gray-600'>
                  Grade
                </th>
                <th className='text-center py-6 px-6 text-sm font-medium text-gray-600'>
                  Position
                </th>
                <th className='text-left py-6 px-6 text-sm font-medium text-gray-600'>
                  Remark
                </th>
              </tr>
            </thead>
            <tbody>
              {/* Table Body: Map through subject results to create table rows */}
              {subjectResults.map((result, index) => (
                <tr 
                  key={result.id}
                  className={`${
                    index !== subjectResults.length - 1 ? 'border-b border-gray-200' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  {/* Subject Name Column */}
                  <td className='py-6 px-6'>
                    <p className='text-sm font-medium text-gray-900'>
                      {result.subject}
                    </p>
                  </td>
                  {/* Teacher Name Column */}
                  <td className='py-6 px-6'>
                    <p className='text-sm text-gray-700'>
                      {result.teacher}
                    </p>
                  </td>
                  {/* Current Score Column */}
                  <td className='py-6 px-6 text-center'>
                    <p className='text-sm font-medium text-gray-900'>
                      {result.score}%
                    </p>
                  </td>
                  {/* Grade Column with colored badge */}
                  <td className='py-6 px-6'>
                    <div className='flex justify-center'>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.gradeColor}`}>
                        {result.grade}
                      </span>
                    </div>
                  </td>
                  {/* Position Column with color-coded text */}
                  <td className='py-6 px-6 text-center'>
                    <span className={`text-sm font-medium ${result.positionColor}`}>
                      {result.position}
                    </span>
                  </td>
                  {/* Remark Column */}
                  <td className='py-6 px-6'>
                    <p className='text-sm text-gray-700'>
                      {result.remark}
                    </p>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mobile Card View - Only visible on mobile screens (sm:hidden) */}
      <div className='sm:hidden space-y-3'>
        {/* Map through subject results to create mobile cards */}
        {subjectResults.map((result) => (
          <div key={result.id} className='bg-white rounded-xl p-5 space-y-4'>
            <div className='space-y-3'>
              {/* Subject Name Field */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Subject name:</span>
                <span className='text-sm font-medium text-gray-900'>{result.subject}</span>
              </div>
              
              {/* Current Score Field */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Current score:</span>
                <span className='text-sm font-semibold text-gray-900'>{result.score}%</span>
              </div>
              
              {/* Grade Field with colored badge */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Grade:</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${result.gradeColor}`}>
                  {result.grade}
                </span>
              </div>
              
              {/* Position Field with color-coded text */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Position:</span>
                <span className={`text-sm font-medium ${result.positionColor}`}>
                  {result.position}
                </span>
              </div>
              
              {/* Teacher Name Field */}
              <div className='flex justify-between items-center'>
                <span className='text-sm text-gray-600'>Teacher:</span>
                <span className='text-sm text-gray-700'>{result.teacher}</span>
              </div>
              
              {/* Remark Field - Uses items-start for proper alignment with longer text */}
              <div className='flex justify-between items-start'>
                <span className='text-sm text-gray-600'>Remark:</span>
                <span className='text-sm text-gray-700 text-right max-w-[200px]'>{result.remark}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ResultsTable