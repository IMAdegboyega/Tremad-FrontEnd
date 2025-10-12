'use client'

import React, { useState } from 'react'
import { Bell, BookOpen, ChevronRight, Circle, FileText, Megaphone, Trophy } from 'lucide-react'
import { notifications, formatNotificationDate, getGroupedNotifications } from '@/Constants/Notification'
import Link from 'next/link'

const Notifications = () => {
  const [filter, setFilter] = useState<'all' | 'unread'>('all');
  const groupedNotifications = getGroupedNotifications();
  
  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read)
    : notifications;

  const getNotificationIcon = (type: string) => {
    switch(type) {
      case 'project':
        return (
          <div className='w-full h-full bg-blue-500 rounded-lg flex items-center justify-center'>
            <FileText className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
          </div>
        );
      case 'assignment':
        return (
          <div className='w-full h-full bg-orange-500 rounded-lg flex items-center justify-center'>
            <BookOpen className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
          </div>
        );
      case 'grade':
        return (
          <div className='w-full h-full bg-green-500 rounded-lg flex items-center justify-center'>
            <Trophy className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
          </div>
        );
      case 'announcement':
        return (
          <div className='w-full h-full bg-purple-500 rounded-lg flex items-center justify-center'>
            <Megaphone className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
          </div>
        );
      default:
        return (
          <div className='w-full h-full bg-gray-500 rounded-lg flex items-center justify-center'>
            <Bell className='w-4 h-4 lg:w-5 lg:h-5 text-white' />
          </div>
        );
    }
  };

  const NotificationItem = ({ notification }: { notification: typeof notifications[0] }) => (
    <div className='flex items-start gap-3 lg:gap-4 p-3 lg:p-4 hover:bg-gray-50 transition-colors cursor-pointer border-b border-gray-100 last:border-0'>
      {/* Icon */}
      <div className='w-10 h-10 lg:w-12 lg:h-12 flex-shrink-0'>
        {getNotificationIcon(notification.type)}
      </div>
      
      {/* Content */}
      <div className='flex-1 min-w-0'>
        <div className='flex items-start justify-between gap-2'>
          <div className='flex-1'>
            <h3 className={`text-sm lg:text-base ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 line-clamp-1`}>
              {notification.title}
            </h3>
            <p className='text-xs lg:text-sm text-gray-500 mt-0.5 line-clamp-2 lg:line-clamp-none'>
              {notification.description}
            </p>
          </div>
          {!notification.read && (
            <Circle className='w-2 h-2 fill-blue-500 text-blue-500 flex-shrink-0 mt-1.5' />
          )}
        </div>
        <p className='text-xs text-gray-400 mt-1'>
          {formatNotificationDate(notification.date)}
        </p>
      </div>
      
      {/* Arrow - Desktop only */}
      <ChevronRight className='w-4 h-4 text-gray-400 flex-shrink-0 mt-1 hidden lg:block' />
    </div>
  );

  return (
    <div className='max-w-4xl mx-auto'>
      {/* Header */}
      <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm mb-4 lg:mb-6'>
        <div className='p-4 lg:p-6'>
          <div className='flex items-center justify-between mb-4 lg:mb-6'>
            <h1 className='text-xl lg:text-2xl font-semibold text-gray-900'>Notifications</h1>
            <Link href='/notifications/settings' className='text-sm lg:text-base text-green-700 hover:text-green-800 font-medium'>
              Clear All
            </Link>
          </div>
          
          {/* Filter Tabs */}
          <div className='flex gap-4 lg:gap-6 border-b border-gray-200'>
            <button
              onClick={() => setFilter('all')}
              className={`pb-3 text-sm lg:text-base font-medium transition-colors relative ${
                filter === 'all' 
                  ? 'text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              All Notifications
              {filter === 'all' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-green-700' />
              )}
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`pb-3 text-sm lg:text-base font-medium transition-colors relative ${
                filter === 'unread' 
                  ? 'text-green-700' 
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              Unread
              {filter === 'unread' && (
                <div className='absolute bottom-0 left-0 right-0 h-0.5 bg-green-700' />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className='bg-white rounded-xl lg:rounded-2xl shadow-sm overflow-hidden'>
        {filteredNotifications.length === 0 ? (
          <div className='p-8 lg:p-12 text-center'>
            <Bell className='w-12 h-12 lg:w-16 lg:h-16 text-gray-300 mx-auto mb-4' />
            <p className='text-gray-500 text-sm lg:text-base'>No notifications to display</p>
          </div>
        ) : (
          <div>
            {/* Today's Notifications */}
            {groupedNotifications.today.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>Today</h2>
                </div>
                {groupedNotifications.today.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
            
            {/* Yesterday's Notifications */}
            {groupedNotifications.yesterday.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>Yesterday</h2>
                </div>
                {groupedNotifications.yesterday.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
            
            {/* Older Notifications */}
            {groupedNotifications.older.length > 0 && filter === 'all' && (
              <div>
                <div className='px-4 lg:px-6 py-2 lg:py-3 bg-gray-50 border-b border-gray-200'>
                  <h2 className='text-xs lg:text-sm font-medium text-gray-600'>Older</h2>
                </div>
                {groupedNotifications.older.map(notification => (
                  <NotificationItem key={notification.id} notification={notification} />
                ))}
              </div>
            )}
            
            {/* Unread filter - no grouping */}
            {filter === 'unread' && filteredNotifications.map(notification => (
              <NotificationItem key={notification.id} notification={notification} />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Notifications