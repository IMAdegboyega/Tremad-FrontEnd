import React from 'react'
import { TrendingUp, TrendingDown, MoveRight } from 'lucide-react'
import Image from 'next/image'

interface StatData {
  value: string | number
  change: string
  changeValue: number
  isPositive: boolean
}

interface StatCardConfig {
  title: string
  icon: string // Path to icon
  dotColor: string
}

// Constant configuration for each stat card
const STAT_CARDS_CONFIG: StatCardConfig[] = [
  {
    title: 'Total student',
    icon: '/icon/TotalStudent.svg',
    dotColor: 'bg-purple-500'
  },
  {
    title: 'Active teachers',
    icon: '/icon/ActiveTeachers.svg',
    dotColor: 'bg-green-500'
  },
  {
    title: 'Monthly revenue',
    icon: '/icon/MonthlyRevenue.svg',
    dotColor: 'bg-blue-500'
  },
  {
    title: 'Pending approvals',
    icon: '/icon/PendingApprovals.svg',
    dotColor: 'bg-orange-500'
  }
]

const StatsCards = () => {
  // This would come from your API/props - only the dynamic data
  const statsData: StatData[] = [
    {
      value: '1,247',
      change: 'from last term',
      changeValue: 12,
      isPositive: true
    },
    {
      value: '89',
      change: 'from last term',
      changeValue: 5,
      isPositive: true
    },
    {
      value: '#847,200',
      change: 'from last term',
      changeValue: 8,
      isPositive: true
    },
    {
      value: '20',
      change: 'from last term',
      changeValue: 3,
      isPositive: false
    }
  ]

  return (
    <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
      {STAT_CARDS_CONFIG.map((config, index) => {
        const data = statsData[index]
        
        return (
          <div 
            key={config.title} 
            className='bg-white rounded-xl p-4 lg:p-5 shadow-sm hover:shadow-md transition-all duration-200 group'
          >
            {/* Header with icon and title */}
            <div className='flex items-center justify-between mb-3'>
              {/* Title */}
              <p className='text-sm text-gray-600'>{config.title}</p>
              <div className='flex items-center gap-3'>
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center`}>
                  <Image 
                    src={config.icon}
                    alt={config.title}
                    width={30}
                    height={30}
                    className='w-8 h-8'
                  />
                </div>
              </div>
            </div>

            {/* Value */}
            <p className='text-2xl font-bold text-gray-900 mb-2'>{data.value}</p>

            {/* Change indicator */}
            <div className='flex items-center gap-1.5'>
              {data.isPositive ? (
                <TrendingUp className='w-4 h-4 text-green-500' />
              ) : (
                <TrendingDown className='w-4 h-4 text-red-500' />
              )}
              <span className={`text-sm font-medium ${data.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {data.isPositive ? '+' : '-'}{data.changeValue}%
              </span>
              <span className='text-sm text-gray-500'>{data.change}</span>
            <span className='ml-auto'>
                <MoveRight size={20} className='text-green-800 cursor-pointer' />
            </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

export default StatsCards