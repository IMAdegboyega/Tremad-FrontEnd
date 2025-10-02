import { subjectResults } from '@/Constants/Results'
import React from 'react'

const ResultsTable = () => {
  return (
    <div>
        {/* Results Table */}
      <div className='bg-white rounded-2xl shadow-sm overflow-hidden'>
        <div className='overflow-x-auto'>
          <table className='w-full'>
            <thead>
              <tr className='border-b border-gray-200 bg-white'>
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
              {subjectResults.map((result, index) => (
                <tr 
                  key={result.id}
                  className={`${
                    index !== subjectResults.length - 1 ? 'border-b border-gray-200' : ''
                  } hover:bg-gray-50 transition-colors`}
                >
                  <td className='py-6 px-6'>
                    <p className='text-sm font-medium text-gray-900'>
                      {result.subject}
                    </p>
                  </td>
                  <td className='py-6 px-6'>
                    <p className='text-sm text-gray-700'>
                      {result.teacher}
                    </p>
                  </td>
                  <td className='py-6 px-6 text-center'>
                    <p className='text-sm font-medium text-gray-900'>
                      {result.score}%
                    </p>
                  </td>
                  <td className='py-6 px-6'>
                    <div className='flex justify-center'>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${result.gradeColor}`}>
                        {result.grade}
                      </span>
                    </div>
                  </td>
                  <td className='py-6 px-6 text-center'>
                    <span className={`text-sm font-medium ${result.positionColor}`}>
                      {result.position}
                    </span>
                  </td>
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
    </div>
  )
}

export default ResultsTable