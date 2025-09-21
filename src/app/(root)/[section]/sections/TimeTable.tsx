'use client'

import React, { useState } from 'react'
import {
  ToggleGroup,
  ToggleGroupItem,
} from "@/Components/ui/toggle-group"

const TimeTable = () => {
  const [viewMode, setViewMode] = useState<'Week view' | 'Day view'>('Day view');

  return (
    <div>
      <div className='flex items-center'>

        <div className='flex ml-auto'>
          <h1>
            Timestable
          </h1>

          <div>
            <ToggleGroup type="multiple" variant="outline">
              <ToggleGroupItem value="Week view" aria-label="Week view" className={`items-center p-4 text-white ${viewMode === 'Week view' 
                            ? 'bg-green-700 text-white hover:bg-green-900 hover:text-green-100' 
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                Week view
              </ToggleGroupItem>
              <ToggleGroupItem value="Day view" aria-label="Day view" className={`items-center p-4 text-white ${viewMode === 'Day view' 
                            ? 'bg-green-700 text-white hover:bg-green-900 hover:text-green-100' 
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'}`}>
                Day view
              </ToggleGroupItem>
            </ToggleGroup>
          </div>
        </div>
        
      </div>
    </div>
  )
}

export default TimeTable