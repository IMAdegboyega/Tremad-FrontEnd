import { departmentImages, fallbackDepartmentImage, useUser } from '@/Constants/UserContext';
import Image from 'next/image'
import React from 'react'

const CurrentSubjects = () => {

    const user = useUser();
    if (!user) return null;

    const courses = user.courses;

  return (
    <div>
        {/* Desktop View */}
        <div className='hidden sm:flex flex-col bg-white p-6 rounded-2xl w-full space-y-2'>
          <div className='flex justify-between'>
            <h2>Current Subjects</h2>
            <div className='text-green-700 ml-auto cursor-pointer'>
              View all
            </div>
          </div>

          <div className="w-full bg-white border border-gray-200 rounded-2xl">
            <table className="w-full border-seperate border-spacing-0 rounded-2xl">
              <thead className='bg-gray-50'>
                <tr className="border-b border-gray-200">
                  <th className="rounded-tl-2xl text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Subject name
                  </th>
                  <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Teacher
                  </th>
                  <th className="rounded-tr-2xl text-left py-4 px-6 text-sm font-medium text-gray-600">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody>
                {courses.map((course, index) => (
                  <tr 
                    key={course.id} 
                    className={index !== courses.length - 1 ? 'border-b border-gray-200' : ''}
                  >
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`w-12 h-12 ${course.iconBg || 'bg-gray-100'} rounded-full flex items-center justify-center text-xl`}>
                          {departmentImages[course.department] ? (
                            <Image
                              src={departmentImages[course.department] || fallbackDepartmentImage}
                              alt={course.department}
                              width={48}
                              height={48}
                              className="object-cover rounded-full"
                            />
                          ) : (
                            <span>{course.icon || '📚'}</span>
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {course.subject}
                          </div>
                          <div className="text-xs text-gray-500">
                            {course.department}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="text-sm text-gray-700">
                        {course.teacher}
                      </div>
                    </td>
                    <td className="py-4 px-6">
                      <div className='bg-gray-50 text-green-700 text-sm hover:text-green-900 items-center justify-center w-max px-4 py-2 rounded-lg cursor-pointer'>
                        View course
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Mobile View */}
        <div className='sm:hidden bg-white rounded-xl p-4'>
          <div className='flex justify-between items-center mb-3'>
            <h2 className='text-base font-semibold text-gray-900'>Current subjects</h2>
            <span className='text-xs text-green-700 font-medium'>View all</span>
          </div>

          <div className='space-y-3'>
            {courses.slice(0, 4).map((course) => (
              <div key={course.id} className='flex items-center justify-between'>
                <div className='flex items-center gap-3'>
                  <div className={`w-10 h-10 ${course.iconBg || 'bg-gray-100'} rounded-lg flex items-center justify-center text-lg`}>
                    {departmentImages[course.department] ? (
                      <Image
                        src={departmentImages[course.department] || fallbackDepartmentImage}
                        alt={course.department}
                        width={40}
                        height={40}
                        className="object-cover rounded-lg"
                      />
                    ) : (
                      <span>{course.icon || '📚'}</span>
                    )}
                  </div>
                  <div>
                    <p className='text-sm font-medium text-gray-900'>{course.subject}</p>
                    <p className='text-xs text-gray-500'>{course.teacher}</p>
                  </div>
                </div>
                <button className='text-xs text-green-700 font-medium'>
                  View
                </button>
              </div>
            ))}
          </div>
        </div>
    </div>
  )
}

export default CurrentSubjects