import ClassManagement from '@/Components/student/SubjectManagement/ClassManagement'
import SearchBar from '@/Components/student/SubjectManagement/SearchBar'
import StatManagement from '@/Components/student/SubjectManagement/StatManagement'
import { Download, ListFilter } from 'lucide-react'
import React from 'react'

const SubjectManagement = () => {
  return (
    <div className='flex flex-col space-y-2'>
      <div className='flex'>
        <div className='flex flex-col space-y-2'>
          <h1 className='text-2xl'>My Subjects</h1>
          <p className='text-sm text-gray-400'>Mange subjects and view progress</p>
        </div>
        <div className='flex ml-auto gap-2 items-center'>

          <span>
            <ListFilter/>
          </span>

          <p>
            Current term
          </p>

          <div>
            <div className='flex bg-green-800 text-white px-4 py-2 rounded-lg ml-4 items-center gap-2 cursor-pointer hover:bg-green-900'>
              <span>
                <Download size={17}/>
              </span>
              Download Report
            </div>
          </div>
        </div>
      </div>
      <div className='flex flex-col space-y-4'>
        <StatManagement/>
        <SearchBar/>
        <ClassManagement/>
      </div>
    </div>
  )
}

export default SubjectManagement