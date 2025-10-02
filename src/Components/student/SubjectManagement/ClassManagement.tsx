import { subjects } from '@/Constants/ClassManagement'
import React from 'react'

const ClassManagement = () => {
  return (
    <div className="bg-white rounded-2xl shadow-sm">
      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Subject name</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Teacher</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Subject type</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Assignment</th>
              <th className="text-left py-4 px-6 text-sm font-medium text-gray-600">Time and Date</th>
            </tr>
          </thead>
          <tbody>
            {subjects.map((subject, index) => (
              <tr
                key={subject.id}
                className={`${index !== subjects.length - 1 ? 'border-b border-gray-100' : ''} hover:bg-gray-50 transition-colors`}
              >
                {/* Subject name */}
                <td className="py-4 px-6">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 ${subject.iconBg} rounded-lg flex items-center justify-center`}>
                      <div className="text-gray-700">{subject.icon}</div>
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                      <p className="text-xs text-gray-500">{subject.department || subject.room}</p>
                    </div>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-700">{subject.teacher}</td>
                <td className="py-4 px-6 text-sm text-gray-700">{subject.type}</td>
                <td className="py-4 px-6">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        subject.assignment === 'Submitted' ? 'bg-green-500' : 'bg-yellow-500'
                      }`}
                    />
                    <span
                      className={`text-sm ${
                        subject.assignment === 'Submitted' ? 'text-green-600' : 'text-yellow-600'
                      }`}
                    >
                      {subject.assignment}
                    </span>
                  </div>
                </td>
                <td className="py-4 px-6 text-sm text-gray-700">{subject.schedule}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden flex flex-col divide-y divide-gray-200">
        {subjects.map((subject) => (
          <div key={subject.id} className="p-4 flex flex-col space-y-3">
            {/* Subject Info */}
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 ${subject.iconBg} rounded-lg flex items-center justify-center`}>
                <div className="text-gray-700">{subject.icon}</div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{subject.name}</p>
                <p className="text-xs text-gray-500">{subject.department || subject.room}</p>
              </div>
            </div>

            {/* Assignment */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Assignment</span>
              <span
                className={`flex items-center gap-2 ${
                  subject.assignment === 'Submitted' ? 'text-green-600' : 'text-yellow-600'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full ${
                    subject.assignment === 'Submitted' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}
                />
                {subject.assignment}
              </span>
            </div>

            {/* Teacher */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Teacher</span>
              <span className="text-gray-700">{subject.teacher}</span>
            </div>

            {/* Subject Type */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Type</span>
              <span className="text-gray-700">{subject.type}</span>
            </div>

            {/* Schedule */}
            <div className="flex items-center justify-between text-sm">
              <span className="text-gray-500">Schedule</span>
              <span className="text-gray-700">{subject.schedule}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default ClassManagement
