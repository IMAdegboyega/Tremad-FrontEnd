'use client'

import { LayoutGrid, ListFilter, Menu, Search } from 'lucide-react'
import React, { useState } from 'react'

const SearchBar = () => {
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  return (
    <div className='flex bg-white rounded-lg px-4 py-3 items-center'>
        {/* Search Input Section */}
        <div className='flex items-center flex-1 gap-3'>
            <Search className='text-gray-400' size={20}/>
            <input 
                type="text" 
                placeholder='Search subjects and teachers' 
                className='flex-1 outline-none text-sm text-gray-700 placeholder:text-gray-400'
            />
        </div>
        
        {/* Right Controls Section */}
        <div className='flex items-center gap-3 ml-auto'>
            {/* Filter Button */}
            <button className='flex items-center gap-2 px-4 py-2 text-sm border border-gray-300 text-gray-700 hover:bg-gray-50 rounded-md transition-colors'>
                <ListFilter size={18}/>
                <span>Filter</span>
            </button>

            {/* View Toggle Buttons */}
            <div className='flex items-center pl-2 gap-1'>
                <button 
                    onClick={() => setViewMode('list')}
                    className={`p-2 rounded-md transition-colors border border-gray-300 ${
                        viewMode === 'list' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                    aria-label="List view"
                >
                    <Menu size={18}/>
                </button>

                <button 
                    onClick={() => setViewMode('grid')}
                    className={`p-2 rounded-md transition-colors border border-gray-300 ${
                        viewMode === 'grid' 
                            ? 'bg-gray-100 text-gray-700' 
                            : 'text-gray-400 hover:bg-gray-50 hover:text-gray-600'
                    }`}
                    aria-label="Grid view"
                >
                    <LayoutGrid size={18}/>
                </button>
            </div>
        </div>
    </div>
  )
}

export default SearchBar