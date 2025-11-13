import React from 'react'
import Image from 'next/image'
import { User, Lock, AlertTriangle, UserCheck, Shield, Clock, FileText, Settings, ArrowLeft } from 'lucide-react'

// Define activity categories
type ActivityCategory = 'authentication' | 'security' | 'user-management' | 'system'

// Define specific activity types within categories
interface ActivityType {
  category: ActivityCategory
  type: string
  defaultIcon: React.ElementType
  defaultBg: string
  defaultColor: string
}

// Activity type configuration
const ACTIVITY_TYPES: Record<string, ActivityType> = {
  'student-login': {
    category: 'authentication',
    type: 'student-login',
    defaultIcon: User,
    defaultBg: 'bg-green-50',
    defaultColor: 'text-green-600'
  },
  'teacher-login': {
    category: 'authentication',
    type: 'teacher-login',
    defaultIcon: UserCheck,
    defaultBg: 'bg-green-50',
    defaultColor: 'text-green-600'
  },
  'logout': {
    category: 'authentication',
    type: 'logout',
    defaultIcon: User,
    defaultBg: 'bg-gray-50',
    defaultColor: 'text-gray-600'
  },
  'password-reset': {
    category: 'security',
    type: 'password-reset',
    defaultIcon: Lock,
    defaultBg: 'bg-purple-50',
    defaultColor: 'text-purple-600'
  },
  'failed-login': {
    category: 'security',
    type: 'failed-login',
    defaultIcon: AlertTriangle,
    defaultBg: 'bg-orange-50',
    defaultColor: 'text-orange-600'
  },
  'suspicious-activity': {
    category: 'security',
    type: 'suspicious-activity',
    defaultIcon: Shield,
    defaultBg: 'bg-red-50',
    defaultColor: 'text-red-600'
  },
  'user-created': {
    category: 'user-management',
    type: 'user-created',
    defaultIcon: UserCheck,
    defaultBg: 'bg-blue-50',
    defaultColor: 'text-blue-600'
  },
  'user-updated': {
    category: 'user-management',
    type: 'user-updated',
    defaultIcon: Settings,
    defaultBg: 'bg-blue-50',
    defaultColor: 'text-blue-600'
  },
  'approval-pending': {
    category: 'user-management',
    type: 'approval-pending',
    defaultIcon: Clock,
    defaultBg: 'bg-yellow-50',
    defaultColor: 'text-yellow-600'
  },
  'system-update': {
    category: 'system',
    type: 'system-update',
    defaultIcon: Settings,
    defaultBg: 'bg-gray-50',
    defaultColor: 'text-gray-600'
  },
  'report-generated': {
    category: 'system',
    type: 'report-generated',
    defaultIcon: FileText,
    defaultBg: 'bg-indigo-50',
    defaultColor: 'text-indigo-600'
  }
}

interface Activity {
  id: string
  type: string
  title: string
  subtitle?: string
  timestamp: string
}

interface LiveActivityProps {
  isFullView?: boolean
  onSeeAll?: () => void
  onBack?: () => void
}

const LiveActivity: React.FC<LiveActivityProps> = ({ 
  isFullView = false, 
  onSeeAll, 
  onBack 
}) => {
  // Mock data with various activity types
  const activities: Activity[] = [
    {
      id: '1',
      type: 'student-login',
      title: 'Student login: James White (SS3A)',
      subtitle: 'View your results',
      timestamp: 'a few secs ago'
    },
    {
      id: '2',
      type: 'password-reset',
      title: 'Password reset pending approval',
      subtitle: 'Prepare for your English test on 23/04/2024',
      timestamp: '23/04/2024'
    },
    {
      id: '3',
      type: 'failed-login',
      title: 'Failed login attempt detected',
      subtitle: 'Multiple attempts from IP: 192.168.1.1',
      timestamp: '2 mins ago'
    },
    {
      id: '4',
      type: 'teacher-login',
      title: 'Teacher login: Mrs. Johnson',
      subtitle: 'Mathematics Department',
      timestamp: '5 mins ago'
    },
    {
      id: '5',
      type: 'user-created',
      title: 'New student account created',
      subtitle: 'John Doe added to SS1B',
      timestamp: '10 mins ago'
    },
    {
      id: '6',
      type: 'approval-pending',
      title: 'Grade update pending approval',
      subtitle: '15 grade changes awaiting review',
      timestamp: '30 mins ago'
    },
    {
      id: '7',
      type: 'report-generated',
      title: 'Monthly attendance report ready',
      subtitle: 'October 2024 report generated',
      timestamp: '1 hour ago'
    }
  ]

  // Determine which activities to show
  const displayedActivities = isFullView ? activities : activities.slice(0, 5)

  return (
    <div className='bg-white rounded-xl shadow-sm h-full'>
      {/* Header */}
      <div className='flex items-center justify-between p-4 border-b border-gray-100'>
        <div className='flex items-center gap-3'>
          {isFullView && onBack && (
            <button 
              onClick={onBack}
              className='text-gray-600 hover:text-gray-900 transition-colors'
            >
              <ArrowLeft className='w-5 h-5' />
            </button>
          )}
          <h2 className='text-lg font-semibold text-gray-900'>
            {isFullView ? 'All Activities' : 'Live activity'}
          </h2>
        </div>
        
        {!isFullView && onSeeAll && activities.length > 5 && (
          <button 
            onClick={onSeeAll}
            className='text-sm text-blue-600 cursor-pointer hover:text-blue-700 font-medium'
          >
            See all
          </button>
        )}
      </div>

      {/* Activity List */}
      <div className={`p-4 space-y-3 overflow-y-auto no-scrollbar ${
        isFullView ? 'max-h-[calc(100vh-200px)]' : 'max-h-[400px]'
      }`}>
        {displayedActivities.map((activity) => {
          const activityType = ACTIVITY_TYPES[activity.type]
          const IconComponent = activityType.defaultIcon
          
          return (
            <div 
              key={activity.id} 
              className='flex items-start gap-3 group hover:bg-gray-50 rounded-lg p-2 transition-colors cursor-pointer'
            >
              {/* Icon with background */}
              <div className={`${activityType.defaultBg} rounded-lg p-2 flex-shrink-0`}>
                <IconComponent className={`w-4 h-4 ${activityType.defaultColor}`} />
              </div>

              {/* Content */}
              <div className='flex-1 min-w-0'>
                <div className='flex items-start justify-between gap-2'>
                  <div className='flex-1'>
                    <h4 className='text-sm font-medium text-gray-900 line-clamp-1'>
                      {activity.title}
                    </h4>
                    {activity.subtitle && (
                      <p className='text-xs text-gray-500 line-clamp-1 mt-0.5'>
                        {activity.subtitle}
                      </p>
                    )}
                  </div>
                  <p className='text-xs text-gray-400 flex-shrink-0 whitespace-nowrap'>
                    {activity.timestamp}
                  </p>
                </div>
              </div>
            </div>
          )
        })}

        {/* Empty state */}
        {activities.length === 0 && (
          <div className='text-center py-8'>
            <p className='text-sm text-gray-500'>No recent activities</p>
          </div>
        )}
      </div>
    </div>
  )
}

export default LiveActivity